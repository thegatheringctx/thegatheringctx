export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  try {
    const { name, request } = await req.json();
    if (!name || !request) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    // Send email via MailerLite transactional or log — store in Netlify form
    const payload = { name, request, submitted: new Date().toISOString() };
    console.log('Prayer request:', JSON.stringify(payload));
    // Also send to email via fetch to info@gatheringctx.org using MailerLite
    const mlKey = Netlify.env.get('MAILERLITE_API_KEY');
    if (mlKey) {
      await fetch('https://api.mailerlite.com/api/v2/subscribers', {
        method: 'POST',
        headers: { 'X-MailerLite-ApiKey': mlKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'info@gatheringctx.org', name: 'Prayer: ' + name, fields: { prayer: request } })
      }).catch(() => {});
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
export const config = { path: '/api/prayer-request' };
