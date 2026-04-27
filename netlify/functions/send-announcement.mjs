const ML='https://connect.mailerlite.com/api';
const GN={sermons:'Sermon Subscribers',devotionals:'Devotional Subscribers'};
export default async(req)=>{
if(req.method!=='POST')return new Response('Not allowed',{status:405});
const k=Netlify.env.get('MAILERLITE_API_KEY');
const s=Netlify.env.get('ADMIN_SECRET');
if(s&&req.headers.get('x-admin-secret')!==s)return new Response('Unauthorized',{status:401});
let b;try{b=await req.json();}catch{return new Response('Bad JSON',{status:400});}
const{list,subject,title,series,scripture,excerpt,url}=b;
if(!list||!subject||!title||!url)return new Response('Missing fields',{status:400});
const gn=GN[list];if(!gn)return new Response('Bad list',{status:400});
const h={Authorization:'Bearer '+k,'Content-Type':'application/json',Accept:'application/json'};
const gd=await fetch(ML+'/groups?limit=100',{headers:h}).then(r=>r.json());
const gid=(gd.data||[]).find(g=>g.name===gn)?.id;
if(!gid)return new Response(JSON.stringify({error:'Group not found'}),{status:404,headers:{'Content-Type':'application/json'}});
const lbl=list==='sermons'?'New Sermon':'New Devotional';
const cta=list==='sermons'?'Listen Now':'Read Now';
const html='<!DOCTYPE html><html><body style="background:#0a0a0a;padding:40px 20px"><div style="max-width:600px;margin:auto;background:#111;border:1px solid #222;padding:48px 40px"><p style="color:#c9a84c;font-family:Arial;text-transform:uppercase;letter-spacing:3px;font-size:11px">'+lbl+'</p><h1 style="color:#f0f0f0;font-size:28px;font-family:Georgia">'+title+'</h1>'+(series?'<p style="color:#888;font-family:Arial;font-size:13px">'+series+'</p>':'')+(scripture?'<p style="color:#c9a84c;font-style:italic;font-family:Arial">'+scripture+'</p>':'')+(excerpt?'<p style="color:#ccc;border-left:3px solid #c9a84c;padding-left:16px;font-family:Georgia">'+excerpt+'</p>':'<p style="color:#aaa;font-family:Arial">New content is ready for you this week.</p>')+'<a href="'+url+'" style="display:inline-block;background:#c9a84c;color:#000;font-family:Arial;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;text-decoration:none">'+cta+' →</a><p style="margin-top:32px;font-size:11px;color:#444;font-family:Arial"><a href="https://gatheringctx.org" style="color:#666">gatheringctx.org</a> | <a href="{$unsubscribe}" style="color:#666">Unsubscribe</a></p></div></body></html>';
const cr=await fetch(ML+'/campaigns',{method:'POST',headers:h,body:JSON.stringify({name:lbl+': '+title,type:'regular',status:'draft',emails:[{subject,from_name:'The Gathering CTX',from:'pastor@gatheringctx.org',reply_to:'pastor@gatheringctx.org',content:html,type:'custom'}],groups:[gid]})}).then(r=>r.json());
const cid=cr.data?.id;
if(!cid)throw new Error('Campaign failed');
await fetch(ML+'/campaigns/'+cid+'/schedule',{method:'POST',headers:h,body:JSON.stringify({delivery:'instant'})});
return new Response(JSON.stringify({success:true,campaign_id:cid,group:gn}),{status:200,headers:{'Content-Type':'application/json'}});
};
export const config={path:'/api/send-announcement'};
