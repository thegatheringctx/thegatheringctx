// Keep sensitive child data away from the browser's anon key.
// Queries needing privileged data are rerouted to service-role edge functions.
// We wrap sb() rather than reimplement the UI, so the PIN pad, the multi-kid
// picker, the prayer wall and the admin panel keep their exact behaviour.
(function(){
 if(window.__wzAuth)return; window.__wzAuth=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb=sb;
 function admPass(){ return (typeof ADM!=='undefined'&&ADM&&ADM.pass)?ADM.pass:''; }
 function kid(){ try{ return (window.APP&&APP.kid)||null; }catch(e){ return null; } }
 function isGet(opts){ return !opts || !opts.method || String(opts.method).toUpperCase()==='GET'; }

 window.sb=function(path,opts){
  try{
   if(typeof path==='string'){

    if(path.indexOf('kids?select=*')===0){
     // 1. kid login: last name + PIN
     var m=path.match(/last_name=ilike\.([^&]*)&pin=eq\.(\d{4})/);
     if(m){
      var typed=m[2];
      return wzPost('wz-login',{mode:'kid',last_name:decodeURIComponent(m[1]),pin:typed})
       .then(function(r){
        if(!r||!r.ok||!r.kids)return [];
        // reattach the PIN the child just typed: wz-award needs it and the
        // server deliberately never sends it back.
        return r.kids.map(function(k){ k.pin=typed; return k; });
       });
     }
     // 2. admin kid list
     if(path.indexOf('order=points.desc')>=0){
      return wzPost('wz-admin',{action:'kids',pass:admPass()})
       .then(function(r){ return (r&&r.ok&&r.kids)?r.kids:[]; });
     }
     // 3. parent login: PIN only
     var p=path.match(/pin=eq\.(\d{4})/);
     if(p){
      var ptyped=p[1];
      return wzPost('wz-login',{mode:'parent',pin:ptyped})
       .then(function(r){
        if(!r||!r.ok||!r.kids)return [];
        return r.kids.map(function(k){ k.pin=ptyped; return k; });
       });
     }
    }

    // 4. admin decisions list (anon SELECT revoked)
    if(path.indexOf('decisions?')===0 && isGet(opts)){
     return wzPost('wz-admin',{action:'rest',table:'decisions',method:'GET',query:'?'+path.split('?')[1],pass:admPass()})
      .then(function(r){ return (r&&r.ok&&Array.isArray(r.data))?r.data:[]; });
    }

    // 5. PRAYER WALL reads (anon SELECT revoked — a stranger could scrape
    //    children's grief). Kids read it via wz-read with id+pin; the admin
    //    (which needs unapproved rows too) goes through wz-admin.
    if(path.indexOf('prayer_wall?')===0 && isGet(opts)){
     var k=kid();
     var mine=path.match(/kid_id=eq\.([^&]+)/);
     if(k && mine && path.indexOf('prayed_by_pastor=is.true')>=0){
      return wzPost('wz-read',{kid_id:k.id,pin:k.pin,what:'my-answered'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     if(k && path.indexOf('approved=eq.true')>=0){
      return wzPost('wz-read',{kid_id:k.id,pin:k.pin,what:'prayers'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     // admin view (all rows, incl. unapproved)
     if(admPass()){
      return wzPost('wz-admin',{action:'rest',table:'prayer_wall',method:'GET',query:'?'+path.split('?')[1],pass:admPass()})
       .then(function(r){ return (r&&r.ok&&Array.isArray(r.data))?r.data:[]; });
     }
     return Promise.resolve([]);
    }

    // 6. TRANSACTIONS reads — a child's own ledger only.
    if(path.indexOf('transactions?')===0 && isGet(opts)){
     var k2=kid();
     if(k2){
      return wzPost('wz-read',{kid_id:k2.id,pin:k2.pin,what:'my-transactions'})
       .then(function(r){ return (r&&r.ok&&r.rows)?r.rows:[]; });
     }
     return Promise.resolve([]);
    }
   }
  }catch(e){}
  return _sb(path,opts);
 };
})();
