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

// ---- signup routing (appended) ----------------------------------------
// The client POSTed straight to `kids` with a client-generated random id and no
// collision check. Now: wz-signup validates, allocates a unique id, rate limits.
(function(){
 if(window.__wzSignup)return; window.__wzSignup=1;
 if(typeof sb!=='function'||typeof wzPost!=='function')return;
 var _sb2=sb;
 window.sb=function(path,opts){
  try{
   if(path==='kids' && opts && String(opts.method).toUpperCase()==='POST' && opts.body){
    var k=opts.body;
    var typedPin=k.pin;
    return wzPost('wz-signup',{
      first_name:k.first_name, last_name:k.last_name, age:k.age,
      parent_name:k.parent_name, pin:typedPin,
      code:(window.__wzSignupCode||'')
    }).then(function(r){
      if(!r||!r.ok){
       var msg={bad_code:'That signup code is not right.',
                too_many_signups:'Too many new warriors from here right now. Try again shortly.',
                bad_pin:'PIN must be exactly 4 digits.',
                bad_age:'Enter a valid age (4-18).',
                missing_name:'Enter first and last name.',
                name_too_long:'That name is too long.'}[r&&r.error]||'Could not create the account. Try again.';
       throw new Error(msg);
      }
      // reattach the PIN the child just typed — the server never returns it,
      // and wz-award needs it for the rest of the session.
      var kid=r.kid; kid.pin=typedPin;
      return [kid];
    });
   }
  }catch(e){ if(e && e.message) throw e; }
  return _sb2(path,opts);
 };
})();
