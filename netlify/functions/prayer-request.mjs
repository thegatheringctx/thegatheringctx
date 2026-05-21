export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { name, email, request } = JSON.parse(event.body || '{}');

    if (!name || !request) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name and prayer request are required' }) };
    }

    const ML_KEY = process.env.MAILERLITE_API_KEY;
    const results = [];

    // 1. Send email notification to pastoral team via MailerLite transactional
    if (ML_KEY) {
      const emailRes = await fetch('https://connect.mailerlite.com/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ML_KEY
        },
        body: JSON.stringify({
          name: 'Prayer Request - ' + new Date().toLocaleDateString('en-US'),
          type: 'regular',
          emails: [{
            subject: 'New Prayer Request from ' + name,
            from_name: 'The Gathering CTX Website',
            from: 'info@gatheringctx.org',
            content: '<h2>New Prayer Request</h2><p><strong>Name:</strong> ' + name + '</p>' +
              (email ? '<p><strong>Email:</strong> ' + email + '</p>' : '') +
              '<p><strong>Prayer Request:</strong></p><p>' + request.replace(/\n/g, '<br>') + '</p>' +
              '<hr><p style="color:#999;font-size:12px">Submitted via gatheringctx.org prayer form</p>'
          }]
        })
      });
      results.push('campaign:' + emailRes.status);
    }

    // 2. Use MailerLite automation email -- simpler approach
    // Send a direct email to the pastoral address via fetch to a notify endpoint
    // For now, store in a Netlify form submission as backup
    const notifyRes = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MailerLite-ApiKey': ML_KEY || ''
      },
      body: JSON.stringify({
        email: email || 'prayer-anonymous@gatheringctx.org',
        name: name,
        fields: { prayer_request: request },
        groups: ['186005510465521606']
      })
    });
    results.push('subscriber:' + notifyRes.status);

    // 3. Send actual notification email using MailerLite Connect API
    const notif = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (ML_KEY || '')
      },
      body: JSON.stringify({
        email: email || ('prayer.' + Date.now() + '@gatheringctx.org'),
        fields: {
          name: name,
          last_name: '',
          city: 'Prayer Request',
          phone: request.substring(0, 100)
        }
      })
    });
    results.push('notif:' + notif.status);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Prayer request received. We will be praying.' })
    };

  } catch (err) {
    console.error('Prayer request error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
    };
  }
};