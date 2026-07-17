// Phase 3 — keep sensitive child data away from the browser's anon key.
// Queries that need privileged columns are rerouted to service-role edge fns.
// We wrap sb() rather than reimplement doLogin/doParentLogin/doAdminLogin, so the
// PIN pad, the multi-kid picker and the admin panel keep their exact behaviour.
(function(){
 if(window.__wzAuth)return; window.__wzAuth=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb=sb;
 function admPass(){ return (typeof ADM!=='undefined'&&ADM&&ADM.pass)?ADM.pass:''; }

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
        // reattach the PIN the child just typed: wz-award still needs it, and
        // the server deliberately never sends it back.
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

    // 4. admin decisions list — anon SELECT on decisions is revoked, so proxy it.
    //    (kids still POST decisions directly; only the READ is privileged.)
    if(path.indexOf('decisions?')===0 && (!opts || !opts.method || opts.method==='GET')){
     return wzPost('wz-admin',{action:'rest',table:'decisions',method:'GET',query:'?'+path.split('?')[1],pass:admPass()})
      .then(function(r){ return (r&&r.ok&&Array.isArray(r.data))?r.data:[]; });
    }
   }
  }catch(e){}
  return _sb(path,opts);
 };
})();
