// netlify/functions/devotionals-rss.mjs
// Auto-generates an RSS feed from devotionals.json
// MailerLite polls this feed and auto-emails Devotional Subscribers on new entries

export default async (req) => {
  try {
    // Fetch the live devotionals.json from the site
    const res = await fetch('https://gatheringctx.org/devotionals.json');
    if (!res.ok) throw new Error('Could not load devotionals.json');
    const data = await res.json();

    const devotionals = (data.devotionals || [])
      .filter(d => d.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const siteUrl = 'https://gatheringctx.org';
    const lastBuild = new Date().toUTCString();
    const latestDate = devotionals[0]
      ? new Date(devotionals[0].date).toUTCString()
      : lastBuild;

    const items = devotionals.map(d => {
      const url = d.file
        ? siteUrl + '/' + d.file.replace('.html', '')
        : siteUrl + '/devotionals';
      const pubDate = new Date(d.date).toUTCString();
      const description = d.excerpt
        ? d.excerpt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : 'A new devotional from The Gathering CTX.';
      const title = (d.title || 'Devotional')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const series = d.series
        ? d.series.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : '';

      return `    <item>
      <title>${title}${series ? ' — ' + series : ''}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>pastor@gatheringctx.org (Pastor Billy Philips)</author>
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Gathering CTX — Devotionals</title>
    <link>${siteUrl}/devotionals</link>
    <description>Daily devotionals from Pastor Billy Philips and The Gathering CTX in Cleburne, TX. Formed by the Word. Led by the Spirit.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <pubDate>${latestDate}</pubDate>
    <atom:link href="${siteUrl}/devotionals.rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/gather-01.jpg</url>
      <title>The Gathering CTX</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (err) {
    return new Response('RSS generation failed: ' + err.message, { status: 500 });
  }
};

export const config = {
  path: '/devotionals.rss'
};