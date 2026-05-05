export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  try {
    const body = await req.json();
    const { name, mobile, list = 'visit' } = body;
    if (!mobile) {
      return new Response(JSON.stringify({ error: 'Mobile number required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    const apiKey = Netlify.env.get('CLEARSTREAM_API_KEY');
    const listMap = {
      visit: Netlify.env.get('CLEARSTREAM_LIST_VISIT'),
      new: Netlify.env.get('CLEARSTREAM_LIST_NEW'),
      victory: Netlify.env.get('CLEARSTREAM_LIST_VICTORY'),
    };
    const listId = listMap[list] || listMap['visit'];
    const cleanMobile = mobile.replace(/\D/g, '');
    const nameParts = (name || '').trim().split(' ');
    const payload = {
      mobile: cleanMobile,
      ...(nameParts[0] && { first_name: nameParts[0] }),
      ...(nameParts[1] && { last_name: nameParts.slice(1).join(' ') }),
      ...(listId && { lists: [parseInt(listId)] }),
    };
    const response = await fetch('https://api.getclearstream.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to subscribe', detail: data }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};
export const config = { path: '/api/clearstream-subscribe' };
