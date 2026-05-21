export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return {statusCode:405,body:'Method not allowed'};

  try {
    const payload = JSON.parse(event.body || '{}');
    // Handle both direct POST and Netlify form webhook
    const data = payload.payload?.data || payload;
    const name = data.name || 'Anonymous';
    const email = data.email || '';
    const request = data.request || '';

    const ML_KEY = process.env.MAILERLITE_API_KEY;

    if (ML_KEY && request) {
      // Send notification email via MailerLite transactional
      await fetch('https://connect.mailerlite.com/api/subscribers', {
        method:'POST',
        headers:{'Authorization':'Bearer '+ML_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          email: email || ('prayer+'+Date.now()+'@gatheringctx.org'),
          fields:{name:name, last_name:'(Prayer Request)', phone:request.substring(0,200)},
          groups:[]
        })
      });
    }

    console.log('Prayer request from:', name, '|', request.substring(0,100));
    return {statusCode:200, body:JSON.stringify({success:true, message:'Prayer request received.'})};
  } catch(err) {
    console.error('Prayer error:', err);
    return {statusCode:500, body:JSON.stringify({error:'Failed'})};
  }
};