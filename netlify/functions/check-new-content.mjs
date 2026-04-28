// netlify/functions/check-new-content.mjs
// Scheduled function — runs daily at 9:00 AM CT (14:00 UTC)
// Checks for new sermons and devotionals, fires MailerLite campaigns if found

import { getStore } from "@netlify/blobs";

const MAILERLITE_API = "https://connect.mailerlite.com/api";
const SITE_URL = "https://gatheringctx.org";
const FROM_NAME = "The Gathering CTX";
const FROM_EMAIL = "info@gatheringctx.org";

// ── HELPERS ──────────────────────────────────────────────────────────────────

async function mlGet(apiKey, path) {
  const r = await fetch(MAILERLITE_API + path, {
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" }
  });
  return r.json();
}

async function mlPost(apiKey, path, body) {
  const r = await fetch(MAILERLITE_API + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function mlPut(apiKey, path, body) {
  const r = await fetch(MAILERLITE_API + path, {
    method: "PUT",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function getGroupId(apiKey, name) {
  const data = await mlGet(apiKey, "/groups?limit=100");
  return (data.data || []).find(g => g.name === name)?.id || null;
}

// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────

function sermonEmailHtml({ title, description, mp3Url, episodeUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif}
  .wrap{max-width:600px;margin:0 auto;background:#0a0a0a}
  .header{padding:40px 40px 32px;border-bottom:1px solid rgba(255,255,255,.1)}
  .logo{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.4);font-family:Helvetica,sans-serif}
  .logo span{color:#c9a84c}
  .body{padding:40px}
  .label{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:#c9a84c;font-family:Helvetica,sans-serif;margin-bottom:12px}
  h1{font-size:28px;font-weight:300;color:#fff;line-height:1.2;letter-spacing:-.01em;margin:0 0 20px}
  p{font-size:15px;line-height:1.8;color:rgba(255,255,255,.6);margin:0 0 28px}
  .btn{display:inline-block;padding:14px 32px;background:#c9a84c;color:#000;font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;font-family:Helvetica,sans-serif;font-weight:700}
  .divider{border:none;border-top:1px solid rgba(255,255,255,.08);margin:32px 0}
  .footer{padding:24px 40px;border-top:1px solid rgba(255,255,255,.08)}
  .footer p{font-size:11px;color:rgba(255,255,255,.25);line-height:1.8;margin:0;font-family:Helvetica,sans-serif}
  .footer a{color:rgba(255,255,255,.35);text-decoration:none}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo"><span>The Gathering</span> &nbsp;|&nbsp; Cleburne, TX</div>
  </div>
  <div class="body">
    <div class="label">New Message</div>
    <h1>${title}</h1>
    <p>${description || "A new message from Pastor Billy Philips is ready to listen."}</p>
    <a href="${episodeUrl || SITE_URL + "/sermons"}" class="btn">Listen Now &rarr;</a>
    <hr class="divider">
    <p style="font-size:13px">You can also <a href="${mp3Url}" style="color:#c9a84c;text-decoration:none">download the MP3</a> to listen offline.</p>
  </div>
  <div class="footer">
    <p>You&rsquo;re receiving this because you subscribed at <a href="${SITE_URL}">${SITE_URL}</a>.<br>
    <a href="{$unsubscribe}">Unsubscribe</a> &nbsp;&middot;&nbsp; The Gathering CTX &nbsp;&middot;&nbsp; Cleburne, TX</p>
  </div>
</div></body></html>`;
}

function devotionalEmailHtml({ title, series, scripture, excerpt, url }) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f2ed;font-family:Georgia,serif}
  .wrap{max-width:600px;margin:0 auto;background:#f5f2ed}
  .header{padding:40px 40px 32px;background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,.1)}
  .logo{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.4);font-family:Helvetica,sans-serif}
  .logo span{color:#c9a84c}
  .body{padding:40px}
  .label{font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:#c9a84c;font-family:Helvetica,sans-serif;margin-bottom:12px}
  .series{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:rgba(0,0,0,.4);font-family:Helvetica,sans-serif;margin-bottom:8px}
  h1{font-size:28px;font-weight:300;color:#0a0a0a;line-height:1.2;letter-spacing:-.01em;margin:0 0 8px}
  .scripture{font-size:12px;color:rgba(0,0,0,.45);font-style:italic;margin:0 0 24px;font-family:Helvetica,sans-serif}
  p{font-size:15px;line-height:1.8;color:rgba(0,0,0,.65);margin:0 0 28px}
  .btn{display:inline-block;padding:14px 32px;background:#0a0a0a;color:#fff;font-size:11px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;font-family:Helvetica,sans-serif;font-weight:700}
  .divider{border:none;border-top:1px solid rgba(0,0,0,.1);margin:32px 0}
  .footer{padding:24px 40px;border-top:1px solid rgba(0,0,0,.1);background:#ede8e0}
  .footer p{font-size:11px;color:rgba(0,0,0,.35);line-height:1.8;margin:0;font-family:Helvetica,sans-serif}
  .footer a{color:rgba(0,0,0,.45);text-decoration:none}
</style></head>
<body><div class="wrap">
  <div class="header">
    <div class="logo"><span>The Gathering</span> &nbsp;|&nbsp; Cleburne, TX</div>
  </div>
  <div class="body">
    <div class="label">New Devotional</div>
    ${series ? '<div class="series">' + series + '</div>' : ''}
    <h1>${title}</h1>
    ${scripture ? '<p class="scripture">' + scripture + '</p>' : ''}
    <p>${excerpt || "A new devotional is ready for you."}</p>
    <a href="${url}" class="btn">Read Now &rarr;</a>
  </div>
  <div class="footer">
    <p>You&rsquo;re receiving this because you subscribed at <a href="${SITE_URL}">${SITE_URL}</a>.<br>
    <a href="{$unsubscribe}">Unsubscribe</a> &nbsp;&middot;&nbsp; The Gathering CTX &nbsp;&middot;&nbsp; Cleburne, TX</p>
  </div>
</div></body></html>`;
}

// ── SEND CAMPAIGN ─────────────────────────────────────────────────────────────

async function sendCampaign(apiKey, { subject, htmlContent, groupId }) {
  // 1. Create campaign
  const campaign = await mlPost(apiKey, "/campaigns", {
    name: subject + " — " + new Date().toLocaleDateString("en-US"),
    type: "regular",
    emails: [{
      subject,
      from_name: FROM_NAME,
      from: FROM_EMAIL,
      reply_to: FROM_EMAIL,
      content: htmlContent
    }],
    groups: [groupId]
  });

  if (!campaign.data?.id) {
    throw new Error("Campaign creation failed: " + JSON.stringify(campaign).substring(0, 200));
  }

  // 2. Schedule to send immediately
  const sent = await mlPost(apiKey, `/campaigns/${campaign.data.id}/actions/send`, {});
  console.log("Campaign sent:", campaign.data.id, JSON.stringify(sent).substring(0, 100));
  return campaign.data.id;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

export default async (req) => {
  const apiKey = Netlify.env.get("MAILERLITE_API_KEY");
  if (!apiKey) { console.error("No MAILERLITE_API_KEY"); return; }

  // Load state from Netlify Blobs
  const store = getStore("email-state");
  let lastSermonSent, lastDevotionalSent;
  try {
    lastSermonSent = await store.get("last-sermon-sent") || "2020-01-01";
    lastDevotionalSent = await store.get("last-devotional-sent") || "2020-01-01";
  } catch {
    lastSermonSent = "2020-01-01";
    lastDevotionalSent = "2020-01-01";
  }
  console.log("Last sermon sent:", lastSermonSent, "| Last devotional sent:", lastDevotionalSent);

  // ── CHECK SERMONS (Buzzsprout RSS) ──
  try {
    const rssRes = await fetch("https://feeds.buzzsprout.com/2608288.rss");
    const rssText = await rssRes.text();

    // Parse latest episode
    const titleMatch = rssText.match(/<item>[\s\S]*?<title><!\[CDATA\[([^\]]+)\]\]><\/title>/);
    const pubDateMatch = rssText.match(/<item>[\s\S]*?<pubDate>([^<]+)<\/pubDate>/);
    const descMatch = rssText.match(/<item>[\s\S]*?<description><!\[CDATA\[([^\]]+)\]\]><\/description>/);
    const mp3Match = rssText.match(/url="(https:\/\/www\.buzzsprout\.com\/[^"]+\.mp3[^"]*)"/);
    const linkMatch = rssText.match(/<item>[\s\S]*?<link>([^<]+)<\/link>/);

    if (titleMatch && pubDateMatch) {
      const episodeTitle = titleMatch[1].trim();
      const pubDate = new Date(pubDateMatch[1].trim());
      const lastSentDate = new Date(lastSermonSent);

      if (pubDate > lastSentDate) {
        console.log("New sermon found:", episodeTitle);
        const groupId = await getGroupId(apiKey, "Sermon Subscribers");
        if (groupId) {
          const html = sermonEmailHtml({
            title: episodeTitle,
            description: descMatch ? descMatch[1].substring(0, 200).trim() : "",
            mp3Url: mp3Match ? mp3Match[1] : SITE_URL + "/sermons",
            episodeUrl: linkMatch ? linkMatch[1].trim() : SITE_URL + "/sermons"
          });
          await sendCampaign(apiKey, {
            subject: "New Message: " + episodeTitle,
            htmlContent: html,
            groupId
          });
          await store.set("last-sermon-sent", pubDate.toISOString());
          console.log("Sermon email sent for:", episodeTitle);
        }
      } else {
        console.log("No new sermon since", lastSermonSent);
      }
    }
  } catch (err) {
    console.error("Sermon check error:", err.message);
  }

  // ── CHECK DEVOTIONALS ──
  try {
    const devRes = await fetch(SITE_URL + "/devotionals.json");
    const devData = await devRes.json();
    const published = (devData.devotionals || []).filter(d => d.published);
    const lastSentDate = new Date(lastDevotionalSent);

    const newDev = published
      .filter(d => new Date(d.date) > lastSentDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (newDev) {
      console.log("New devotional found:", newDev.title);
      const groupId = await getGroupId(apiKey, "Devotional Subscribers");
      if (groupId) {
        const devUrl = SITE_URL + "/" + (newDev.file || "devotionals").replace(".html", "");
        const html = devotionalEmailHtml({
          title: newDev.title,
          series: newDev.series || "",
          scripture: newDev.scripture || "",
          excerpt: newDev.excerpt || "",
          url: devUrl
        });
        await sendCampaign(apiKey, {
          subject: "New Devotional: " + newDev.title,
          htmlContent: html,
          groupId
        });
        await store.set("last-devotional-sent", new Date(newDev.date).toISOString());
        console.log("Devotional email sent for:", newDev.title);
      }
    } else {
      console.log("No new devotional since", lastDevotionalSent);
    }
  } catch (err) {
    console.error("Devotional check error:", err.message);
  }
};

export const config = {
  schedule: "0 14 * * *"  // 9:00 AM CT daily (UTC-5)
};