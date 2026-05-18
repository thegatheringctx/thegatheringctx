export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  try {
    const { name, mobile, list = 'visit' } = await req.json();
    if (!mobile) return new Response(JSON.stringify({ error: 'Phone required' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    const apiKey = process.env.CLEARSTREAM_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'API key missing' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    // Correct list IDs: VISIT=409374, NEW=409376, VICTORY=409377
    const listMap = { visit: 409374, new: 409376, victory: 409377 };
    const listId = listMap[list.toLowerCase()] || 409374;
    const cleanPhone = mobile.replace(/\D/g, '');
    const e164 = cleanPhone.startsWith('1') ? '+' + cleanPhone : '+1' + cleanPhone;
    const res = await fetch('https://api.getclearstream.com/v1/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': apiKey },
      body: JSON.stringify({ mobile_number: e164, first_name: (name || '').split(' ')[0], last_name: (name || '').split(' ').slice(1).join(' '), lists: [listId] })
    });
    const data = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ success: res.ok, data }), { status: res.ok ? 200 : 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
export const config = { path: '/api/clearstream-subscribe' };
