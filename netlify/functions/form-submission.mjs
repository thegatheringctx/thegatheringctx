export default async (req) => {
  try {
    const payload = await req.json();
    const formName = payload.data?.['form-name'] || '';
    const email = payload.data?.email;
    if (!email) return new Response('No email', { status: 400 });
    const API_KEY = Netlify.env.get('MAILERLITE_API_KEY');
    if (!API_KEY) return new Response('Config error', { status: 500 });
    const groupName = formName === 'sermon-subscribe' ? 'Sermon Subscribers' : 'Devotional Subscribers';
    const groupId = await getOrCreateGroup(API_KEY, groupName);
    await addSubscriber(API_KEY, email, groupId);
    console.log('Added ' + email + ' to ' + groupName);
    return new Response('OK', { status: 200 });
  } catch (err) { console.error(err); return new Response('Error', { status: 500 }); }
};
async function getOrCreateGroup(k, name) {
  const d = await fetch('https://connect.mailerlite.com/api/groups?limit=50', { headers: { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json', Accept: 'application/json' } }).then(r=>r.json());
  const ex = (d.data||[]).find(g=>g.name===name);
  if (ex) return ex.id;
  const c = await fetch('https://connect.mailerlite.com/api/groups', { method: 'POST', headers: { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({name}) }).then(r=>r.json());
  return c.data.id;
}
async function addSubscriber(k, email, groupId) {
  return fetch('https://connect.mailerlite.com/api/subscribers', { method: 'POST', headers: { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({email, groups:[groupId], status:'active'}) }).then(r=>r.json());
}
export const config = { path: '/.netlify/functions/form-submission' };