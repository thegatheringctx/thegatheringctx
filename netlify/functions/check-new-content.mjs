// check-new-content.mjs

// Confirmed MailerLite group IDs (May 2026)
const ML_GROUP_SERMON = '186005510465521606';
const ML_GROUP_DEVOTIONAL = '186005699107489474';
const ML_GROUP_NEW_HERE = '187839987092292840';
// Runs daily at 10 AM UTC — checks for new sermons + devotionals and emails subscribers

export default async (req) => {
  const ML_KEY = Netlify.env.get('MAILERLITE_API_KEY');
  const SITE = 'https://gatheringctx.org';
  const FROM_EMAIL = 'info@gatheringctx.org';
  const FROM_NAME = 'The Gathering CTX';
  const results = { sermonSent: false, devoSent: false, errors: [] };

  // ── HELPER: Send MailerLite campaign ─────────────────────────────
  async function sendEmail(subject, html, groupName) {
    if (!ML_KEY) { results.errors.push('No ML key'); return false; }
    try {
      // 1. Get or create subscriber group
      const groupsRes = await fetch('https://connect.mailerlite.com/api/groups?limit=100', {
        headers: { 'Authorization': 'Bearer ' + ML_KEY, 'Content-Type': 'application/json' }
      });
      const groupsData = await groupsRes.json();
      const group = groupsData?.data?.find(g => g.name === groupName);
      if (!group) { results.errors.push('Group not found: ' + groupName); return false; }

      // 2. Create campaign
      const campRes = await fetch('https://connect.mailerlite.com/api/campaigns', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + ML_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subject + ' — ' + new Date().toLocaleDateString(),
          type: 'regular',
          emails: [{
            subject,
            from_name: FROM_NAME,
            from: FROM_EMAIL,
            content: html
          }],
          groups: [group.id]
        })
      });
      const campData = await campRes.json();
      const campId = campData?.data?.id;
      if (!campId) { results.errors.push('Campaign create failed: ' + JSON.stringify(campData).substring(0,200)); return false; }

      // 3. Schedule immediately
      const schedRes = await fetch('https://connect.mailerlite.com/api/campaigns/' + campId + '/schedule', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + ML_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery: 'instant' })
      });
      const schedData = await schedRes.json();
      if (!schedData?.data?.id) { results.errors.push('Schedule failed: ' + JSON.stringify(schedData).substring(0,200)); return false; }
      return true;
    } catch(err) {
      results.errors.push('Email error: ' + err.message);
      return false;
    }
  }

  // ── CHECK BUZZSPROUT FOR NEW SERMON ──────────────────────────────
  try {
    const rss = await fetch('https://feeds.buzzsprout.com/2608288.rss').then(r => r.text());
    const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

    if (items.length > 0) {
      const latest = items[0];
      const title = (latest.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || latest.match(/<title>(.*?)<\/title>/))?.[1] || '';
      const pubDate = latest.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const audioUrl = latest.match(/url="([^"]+)"/)?.[1] || '';
      const episodeId = audioUrl.match(/\/([0-9]+)-/)?.[1];

      const pubMs = new Date(pubDate).getTime();
      const ageHours = (Date.now() - pubMs) / 3600000;

      // Send if published within last 26 hours (gives buffer for timing)
      if (ageHours < 26 && ageHours > 0 && title && episodeId) {
        const listenUrl = SITE + '/sermons';
        const playerUrl = 'https://www.buzzsprout.com/2608288/' + episodeId;

        const html = `<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#000;color:#fff;padding:2.5rem;">
<p style="font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:#c8a96e;margin-bottom:1rem;">New Message &middot; The Gathering CTX</p>
<h1 style="font-family:Georgia,serif;font-size:1.8rem;font-weight:300;line-height:1.2;margin-bottom:1.5rem;">${title}</h1>
<p style="font-size:.92rem;line-height:1.9;color:rgba(255,255,255,.65);margin-bottom:2rem;">A new message is ready. The Word goes with you this week.</p>
<a href="${playerUrl}" style="display:inline-block;background:#c8a96e;color:#000;text-decoration:none;font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;font-weight:700;padding:1rem 2.5rem;margin-bottom:2rem;">Listen Now &rarr;</a>
<p style="margin-top:2rem;"><a href="${listenUrl}" style="color:#c8a96e;font-size:.8rem;">Browse all messages &rarr;</a></p>
<hr style="border:none;border-top:1px solid rgba(255,255,255,.1);margin:2rem 0;"/>
<p style="font-size:.72rem;color:rgba(255,255,255,.3);">The Gathering CTX &middot; Cleburne, TX &middot; Sundays at 5 PM<br/>
<a href="${SITE}/devotionals" style="color:rgba(255,255,255,.4);">Devotionals</a> &nbsp;&middot;&nbsp; <a href="${SITE}" style="color:rgba(255,255,255,.4);">gatheringctx.org</a></p>
</div>`;

        const sent = await sendEmail('New Message: ' + title, html, 'Sermon Subscribers');
        results.sermonSent = sent;
      }
    }
  } catch(err) {
    results.errors.push('Sermon check: ' + err.message);
  }

  // ── CHECK DEVOTIONALS.JSON FOR NEW ENTRY ─────────────────────────
  try {
    const devoRes = await fetch(SITE + '/devotionals.json');
    if (devoRes.ok) {
      const devos = await devoRes.json();
      if (devos?.length) {
        const newest = devos.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
        const ageHours = (Date.now() - new Date(newest.date).getTime()) / 3600000;

        if (ageHours < 26 && ageHours > 0 && newest.title) {
          const devoUrl = SITE + '/devotionals/' + (newest.slug || '');
          const html = `<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#f5f0e8;color:#000;padding:2.5rem;">
<p style="font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:#5c4b2a;margin-bottom:1rem;">Devotional &middot; The Gathering CTX</p>
<h1 style="font-family:Georgia,serif;font-size:1.6rem;font-weight:300;line-height:1.2;margin-bottom:.5rem;">${newest.title}</h1>
<p style="font-size:.85rem;color:#5c4b2a;margin-bottom:1.5rem;">${newest.passage || ''}</p>
<p style="font-size:.92rem;line-height:1.9;color:rgba(0,0,0,.7);margin-bottom:2rem;">${(newest.content || '').substring(0, 350)}...</p>
<a href="${devoUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;font-weight:700;padding:1rem 2.5rem;">Read Full Devotional &rarr;</a>
<hr style="border:none;border-top:1px solid rgba(0,0,0,.1);margin:2rem 0;"/>
<p style="font-size:.72rem;color:rgba(0,0,0,.4);">The Gathering CTX &middot; Walk with victory every day</p>
</div>`;

          const sent = await sendEmail(newest.title, html, 'Devotional Subscribers');
          results.devoSent = sent;
        }
      }
    }
  } catch(err) {
    results.errors.push('Devo check: ' + err.message);
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const config = { schedule: '0 10 * * *' };
