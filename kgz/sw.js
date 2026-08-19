/* Warrior Zone service worker */
const V='wz-v4';
const SHELL=['./'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{ if(e.data==='wz-kill'){ self.registration.unregister().then(()=>caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))))); } });
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  let url; try{ url=new URL(req.url); }catch(_){ return; }
  // Only ever handle our own origin. Supabase/YouTube/etc pass straight through.
  if(url.origin!==self.location.origin) return;
  const p=url.pathname;
  const isAsset = p.indexOf('/app/')===0 || p.indexOf('/img/')===0;
  if(isAsset){
    e.respondWith(
      caches.match(req).then(hit=> hit || fetch(req).then(res=>{
        if(res && res.status===200){ const cp=res.clone(); caches.open(V).then(c=>c.put(req,cp)); }
        return res;
      }).catch(()=>hit))
    );
    return;
  }
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put('./',cp)); return res; })
        .catch(()=>caches.match('./'))
    );
    return;
  }
});

/* --- push --- */
self.addEventListener('push',function(e){
  var d={title:'Warrior Zone',body:'Your warrior is waiting.',url:'/'};
  try{ if(e.data) d=Object.assign(d, e.data.json()); }catch(_){ try{ d.body=e.data.text(); }catch(__){} }
  e.waitUntil(self.registration.showNotification(d.title,{
    body:d.body, icon:'img/icon-192.png', badge:'img/icon-192.png',
    data:{url:d.url||'/'}, tag:'wz-nudge', renotify:false
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||'/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){
    for(var i=0;i<cs.length;i++){ if(cs[i].url.indexOf(self.location.origin)===0){ cs[i].focus(); return; } }
    return self.clients.openWindow(url);
  }));
});
