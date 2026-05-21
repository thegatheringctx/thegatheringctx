export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:'Method not allowed'};

  try {
    const payload = JSON.parse(event.body || '{}');
    const data = payload.payload?.data || payload;
    const name = data.name || 'Friend';
    const phone = data.phone || '';
    const email = data.email || '';
    const heardFrom = data.heard_from || '';

    const CS_KEY = process.env.CLEARSTREAM_API_KEY;
    const CS_LIST = process.env.CLEARSTREAM_LIST_NEW || '409376';

    if (phone && CS_KEY) {
      // Add to Clearstream new-visitor list
      const sub = await fetch('https://api.clearstream.io/v1/subscribers', {
        method:'POST',
        headers:{'Authorization':'Bearer '+CS_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          mobile_number: phone.replace(/[^0-9]/g,''),
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' '),
          lists: [parseInt(CS_LIST)]
        })
      });
      console.log('Clearstream subscriber:', sub.status);
    }

    // Log the connection regardless
    console.log('Connect card:', JSON.stringify({name, email, phone, heardFrom}));

    return {statusCode:200, body:JSON.stringify({success:true})};
  } catch(err) {
    console.error('Connect card error:', err);
    return {statusCode:500, body:JSON.stringify({error:'Failed'})};
  }
};