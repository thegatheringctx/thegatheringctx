// Phase 3 — keep kids.pin away from the browser's anon key.
// The three queries that needed SELECT on kids.pin are rerouted to service-role
// edge functions. We wrap sb() rather than reimplement doLogin/doParentLogin/
// doAdminLogin, so the PIN pad, the multi-kid picker and the admin panel keep
// their exact existing behaviour.
(function(){
 if(window.__wzAuth)return; window.__wzAuth=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb=sb;
 window.sb=function(path,opts){
  try{
   if(typeof path==='string'&&path.indexOf('kids?select=*')===0){

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
     var pass=(typeof ADM!=='undefined'&&ADM&&ADM.pass)?ADM.pass:'';
     return wzPost('wz-admin',{action:'kids',pass:pass})
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
  }catch(e){}
  return _sb(path,opts);
 };
})();
