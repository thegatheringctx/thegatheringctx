import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const TOKEN = Deno.env.get('GITHUB_TOKEN') || ''
const OWNER='thegatheringctx', REPO='thegatheringctx'
const REG='devotionals/data/index.json'
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'}
const FONTS='<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet">'
const STYLE=`<style>
  :root {
    --cream: #FAF6F0;
    --warm-white: #F5EFE6;
    --gold: #B8860B;
    --gold-light: #D4A843;
    --deep-wine: #5C1A1B;
    --charcoal: #2B2B2B;
    --text: #3A3632;
    --text-light: #6B6560;
    --olive: #6B7B4C;
    --rule: #D6CCBC;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--cream); color: var(--text); font-family: 'Source Sans 3', Georgia, serif; font-size: 17px; line-height: 1.8; -webkit-font-smoothing: antialiased; }
  .hero { position: relative; min-height: 70vh; display: flex; align-items: center; justify-content: center; text-align: center; background: linear-gradient(175deg, var(--deep-wine) 0%, #3D1213 55%, #1E0A0A 100%); overflow: hidden; padding: 4rem 2rem; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(184,134,11,0.12) 0%, transparent 70%), radial-gradient(circle at 20% 80%, rgba(184,134,11,0.06) 0%, transparent 50%); pointer-events: none; }
  .hero-content { position: relative; z-index: 1; max-width: 700px; animation: fadeUp 1.2s ease-out; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  .hero-label { font-family: 'Source Sans 3', sans-serif; text-transform: uppercase; letter-spacing: 4px; font-size: 0.75rem; color: var(--gold-light); margin-bottom: 1.5rem; font-weight: 600; }
  .hero h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(2.8rem, 6vw, 4.5rem); font-weight: 700; color: #FAEFD8; line-height: 1.15; margin-bottom: 1.2rem; }
  .hero-subtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(1.1rem, 2.5vw, 1.4rem); font-style: italic; color: rgba(250,239,216,0.7); line-height: 1.6; max-width: 540px; margin: 0 auto; }
  .hero-divider { width: 60px; height: 2px; background: var(--gold); margin: 1.8rem auto; opacity: 0.7; }
  .hero-scripture-ref { font-family: 'Source Sans 3', sans-serif; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(250,239,216,0.45); margin-top: 0.5rem; }
  .article-wrapper { max-width: 680px; margin: 0 auto; padding: 4rem 2rem 5rem; }
  .audio-player-section { background: var(--warm-white); border: 1px solid var(--rule); border-radius: 8px; padding: 1.5rem; margin-bottom: 2.5rem; }
  .audio-label { font-family: 'Source Sans 3', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--gold); font-weight: 600; margin-bottom: 1rem; }
  .section-number { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 700; color: var(--gold); opacity: 0.25; line-height: 1; margin-bottom: -0.3rem; }
  h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.75rem; font-weight: 700; color: var(--deep-wine); line-height: 1.3; margin-bottom: 1.2rem; }
  p { margin-bottom: 1.4rem; font-weight: 300; }
  .scripture-block { background: var(--warm-white); border-left: 3px solid var(--gold); padding: 1.5rem 1.8rem; margin: 2rem 0; border-radius: 0 6px 6px 0; }
  .scripture-block p { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-style: italic; color: var(--text); line-height: 1.85; margin-bottom: 0.6rem; }
  .scripture-block p:last-child { margin-bottom: 0; }
  .scripture-ref { font-family: 'Source Sans 3', sans-serif; font-style: normal; font-size: 0.8rem; font-weight: 600; color: var(--gold); letter-spacing: 1px; text-transform: uppercase; display: block; margin-top: 0.8rem; }
  .pull-quote { font-family: 'Cormorant Garamond', serif; font-size: 1.45rem; font-weight: 600; font-style: italic; color: var(--deep-wine); text-align: center; padding: 2.2rem 1.5rem; margin: 2.5rem 0; position: relative; line-height: 1.5; }
  .pull-quote::before, .pull-quote::after { content: ''; display: block; width: 40px; height: 1px; background: var(--gold); margin: 0 auto; }
  .pull-quote::before { margin-bottom: 1.5rem; }
  .pull-quote::after { margin-top: 1.5rem; }
  .section-divider { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 3rem 0; color: var(--rule); }
  .section-divider::before, .section-divider::after { content: ''; height: 1px; flex: 1; background: var(--rule); }
  .section-divider .dot { width: 6px; height: 6px; background: var(--gold); border-radius: 50%; opacity: 0.5; }
  .reflection-box { background: linear-gradient(135deg, var(--warm-white) 0%, #F0E8DA 100%); border: 1px solid var(--rule); border-radius: 8px; padding: 2rem 2rem; margin: 2.5rem 0; }
  .reflection-box h3 { font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; color: var(--gold); margin-bottom: 1rem; font-weight: 600; }
  .reflection-box p { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-style: italic; color: var(--text); line-height: 1.7; margin-bottom: 0.8rem; }
  .reflection-box p:last-child { margin-bottom: 0; }
  .prayer-section { background: var(--deep-wine); color: #FAEFD8; border-radius: 8px; padding: 2.5rem 2.2rem; margin: 3rem 0; position: relative; overflow: hidden; }
  .prayer-section::before { content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%); pointer-events: none; }
  .prayer-section h3 { font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; color: var(--gold-light); margin-bottom: 1.2rem; font-weight: 600; position: relative; }
  .prayer-section p { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-style: italic; color: rgba(250,239,216,0.9); line-height: 1.8; position: relative; }
  .benediction { text-align: center; padding: 3rem 1rem; margin-top: 2rem; }
  .benediction p { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-style: italic; color: var(--text-light); line-height: 1.9; }
  .benediction .amen { font-style: normal; font-weight: 700; color: var(--deep-wine); display: block; margin-top: 0.8rem; letter-spacing: 2px; }
  strong { font-weight: 600; color: var(--charcoal); }
  em { color: var(--text); }
  .greek-word { display: inline-block; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; color: var(--deep-wine); }
  .word-def { display: inline-block; background: var(--warm-white); padding: 0.15rem 0.6rem; border-radius: 3px; font-size: 0.9rem; font-weight: 600; color: var(--text-light); margin-left: 0.3rem; }
  .declaration-box { background: linear-gradient(135deg, #1E0A0A 0%, var(--deep-wine) 100%); border: 1px solid rgba(184,134,11,0.3); border-radius: 8px; padding: 2.5rem 2rem; margin: 3rem 0; text-align: center; }
  .declaration-box h3 { font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 3px; color: var(--gold-light); margin-bottom: 1.5rem; font-weight: 600; }
  .declaration-box p { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 600; color: #FAEFD8; line-height: 1.9; margin-bottom: 0; }
  .footer { text-align: center; padding: 2.5rem 2rem; border-top: 1px solid var(--rule); max-width: 680px; margin: 0 auto; }
  .footer p { font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.3rem; font-weight: 400; }
  .footer .site-name { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 1rem; color: var(--deep-wine); letter-spacing: 1px; }
  @media (max-width: 600px) { .article-wrapper { padding: 2.5rem 1.3rem 3rem; } .hero { min-height: 55vh; padding: 3rem 1.5rem; } .pull-quote { font-size: 1.25rem; padding: 1.8rem 1rem; } .scripture-block { padding: 1.2rem 1.3rem; } .prayer-section { padding: 2rem 1.5rem; } }
</style>`
function j(o:unknown,s=200){return new Response(JSON.stringify(o),{status:s,headers:{...CORS,'Content-Type':'application/json'}})}
function esc(s:unknown){return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function paras(t:unknown){if(!t)return '';return String(t).split(/\n\n+/).map(p=>'<p>'+esc(p.trim()).replace(/\n/g,'<br>')+'</p>').join('')}
function fmtDate(d:string){if(!d)return '';try{return new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}catch(_){return ''}}
function cleanTitle(t:unknown){return String(t==null?'':t).replace(/,?\s*[—-]?\s*5-Day Devotional\s*$/i,'').trim()}
function cleanVerse(v:unknown){return esc(String(v==null?'':v).replace(/\s*\([^)]*ESV\)\s*$/,'').trim())}
function divider(){return '<div class="section-divider"><span class="dot"></span></div>'}
function dayBlock(n:number,d:Record<string,any>){const t=d['day_'+n+'_title'];if(!t)return '';const ref=d['day_'+n+'_scripture']||'';const verse=cleanVerse(d['day_'+n+'_verse']||'');const content=d['day_'+n+'_content']||'';let h=divider();h+='<div class="section-number">0'+n+'</div>';h+='<h2>'+esc(t)+'</h2>';if(verse){h+='<div class="scripture-block"><p>'+verse+'</p>'+(ref?'<span class="scripture-ref">'+esc(ref)+' &middot; ESV</span>':'')+'</div>'}h+=paras(content);return h}
function render(d:Record<string,any>){let h='';h+='<header class="hero"><div class="hero-content">';h+='<p class="hero-label">'+esc(d.series||'')+(d.week_number?' &middot; Week '+d.week_number:'')+' Devotional</p>';h+='<h1>'+esc(cleanTitle(d.title))+'</h1>';h+='<div class="hero-divider"></div>';if(d.preview_text)h+='<p class="hero-subtitle">'+esc(d.preview_text)+'</p>';if(d.passage)h+='<p class="hero-scripture-ref">'+esc(d.passage)+'</p>';h+='</div></header>';h+='<article class="article-wrapper">';if(d.has_sermon_audio&&d.sermon_audio_url){h+='<div class="audio-player-section"><div class="audio-label">Listen to the Sermon</div><p><a href="'+esc(d.sermon_audio_url)+'" style="color:var(--gold);font-weight:600;text-decoration:none">Open the sermon audio &#8594;</a></p></div>'}if(d.intro_paragraphs)h+=paras(d.intro_paragraphs);for(let n=1;n<=5;n++)h+=dayBlock(n,d);if(d.reflect_questions)h+='<div class="reflection-box"><h3>Reflect</h3>'+paras(d.reflect_questions)+'</div>';if(d.prayer_of_identity)h+='<div class="prayer-section"><h3>A Prayer of Identity</h3>'+paras(d.prayer_of_identity)+'</div>';if(d.closing_declaration)h+='<div class="declaration-box"><h3>Declaration</h3>'+paras(d.closing_declaration)+'</div>';if(d.send_out)h+='<div class="benediction">'+paras(d.send_out)+'</div>';h+='</article>';h+='<footer class="footer"><p class="site-name">The Gathering CTX</p><p>Cleburne, Texas &middot; <a href="https://gatheringctx.org" style="color:var(--gold);text-decoration:none">gatheringctx.org</a></p><p><a href="https://gatheringctx.org/devotionals" style="color:var(--gold);text-decoration:none">&#8592; All Devotionals</a></p></footer>';const title=esc(d.title||'Devotional')+' | The Gathering CTX';return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>'+title+'</title>\n'+(d.preview_text?'<meta name="description" content="'+esc(d.preview_text)+'" />\n':'')+FONTS+'\n'+STYLE+'\n</head>\n<body>\n'+h+'\n</body>\n</html>\n'}
function b64(s:string){return btoa(unescape(encodeURIComponent(s)))}
async function getSHA(p:string){const r=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+p,{headers:{Authorization:'token '+TOKEN,Accept:'application/vnd.github.v3+json','User-Agent':'gathering'}});if(!r.ok)return null;const d=await r.json();return d.sha||null}
function shortSeries(s:unknown){const v=String(s==null?'':s);const i=v.indexOf(':');return (i>0?v.slice(0,i):v).trim()}
async function syncRegistry(){
  const r=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+REG+'?ref=main',{headers:{Authorization:'token '+TOKEN,Accept:'application/vnd.github.v3+json','User-Agent':'gathering'}})
  if(!r.ok)return {ok:false,error:'registry_not_found',status:r.status}
  const meta=await r.json()
  let reg:Array<Record<string,unknown>>
  try{ reg=JSON.parse(decodeURIComponent(escape(atob(String(meta.content||'').replace(/\n/g,''))))) }catch(_){ return {ok:false,error:'registry_parse_failed'} }
  if(!Array.isArray(reg))return {ok:false,error:'registry_not_array'}
  const have=new Set(reg.map(x=>String(x.slug||'')))
  const {data:rows,error}=await supabase.from('devotionals').select('slug,series,week_number,title,passage,preview_text,publish_at').eq('active',true).order('publish_at',{ascending:true})
  if(error)return {ok:false,error:error.message}
  const added:string[]=[]
  for(const d of (rows||[])){
    const s=String(d.slug||''); if(!s||have.has(s))continue
    const series=shortSeries(d.series)
    const e:Record<string,unknown>={slug:s,url:'/'+s,series,week:d.week_number??null,title:cleanTitle(d.title),subtitle:d.preview_text||'',passage:d.passage||''}
    let at=-1
    for(let i=0;i<reg.length;i++){ if(shortSeries(reg[i].series)===series) at=i }
    if(at>=0) reg.splice(at+1,0,e); else reg.push(e)
    have.add(s); added.push(s)
  }
  if(!added.length)return {ok:true,added:0,total:reg.length}
  const out='[\n'+reg.map(x=>'  '+JSON.stringify(x)).join(',\n')+'\n]\n'
  const put=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+REG,{method:'PUT',headers:{Authorization:'token '+TOKEN,Accept:'application/vnd.github.v3+json','Content-Type':'application/json','User-Agent':'gathering'},body:JSON.stringify({message:'Sync devotional registry: '+added.join(', '),content:b64(out),sha:meta.sha})})
  const pj=await put.json().catch(()=>({}))
  return {ok:put.ok,added,total:reg.length,commit:pj&&pj.commit&&pj.commit.sha}
}
Deno.serve(async (req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:CORS})
  const url=new URL(req.url)
  let slug=url.searchParams.get('slug')||''
  const dryrun=url.searchParams.get('dryrun')==='1'
  if(req.method==='POST'){try{const b=await req.json();if(b.slug)slug=b.slug}catch(_){/*ignore*/}}
  if(!slug){const {data}=await supabase.from('devotionals').select('slug').eq('active',true).order('publish_at',{ascending:false}).limit(1);if(data&&data[0])slug=data[0].slug}
  if(!slug)return j({ok:false,error:'no slug'},400)
  const {data:rows,error}=await supabase.from('devotionals').select('*').eq('slug',slug).limit(1)
  if(error)return j({ok:false,error:error.message},500)
  const d=rows&&rows[0]
  if(!d)return j({ok:false,error:'devotional not found for slug '+slug},404)
  const html=render(d)
  if(dryrun)return new Response(html,{status:200,headers:{...CORS,'Content-Type':'text/html'}})
  if(!TOKEN)return j({ok:false,reason:'no_server_token',hint:'Add GITHUB_TOKEN secret, then call again',slug})
  const path=slug+'.html'
  const sha=await getSHA(path)
  const put=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/'+path,{method:'PUT',headers:{Authorization:'token '+TOKEN,Accept:'application/vnd.github.v3+json','Content-Type':'application/json','User-Agent':'gathering'},body:JSON.stringify({message:'Publish devotional: '+slug,content:b64(html),sha:sha||undefined})})
  const pj=await put.json().catch(()=>({}))
  let registry:unknown=null
  if(put.ok){ try{ registry=await syncRegistry() }catch(e){ registry={ok:false,error:String(e)} } }
  return j({ok:put.ok,status:put.status,path:path,commit:pj&&pj.commit&&pj.commit.sha,registry})
})
