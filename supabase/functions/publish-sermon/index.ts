import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const TOKEN = Deno.env.get('GITHUB_TOKEN') || ''
const OWNER = 'thegatheringctx', REPO = 'thegatheringctx'
const REG = 'sermons/data/index.json'
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }

function j(o: unknown, s = 200) { return new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } }) }
function shortSeries(s: unknown) { const v = String(s == null ? '' : s); const i = v.indexOf(':'); return (i > 0 ? v.slice(0, i) : v).trim() }
// Voice rule: passage ranges are written X to Y, never with a hyphen or dash.
function normPassage(s: unknown) { return String(s == null ? '' : s).replace(/(\d)\s*[-‐‑‒–—―−]\s*(\d)/g, '$1 to $2').trim() }
function b64(s: string) { return btoa(unescape(encodeURIComponent(s))) }

// The per-sermon data file consumed by /sermon-template.html at
// sermons/data/<slug>.json. Same shape as the hand-written files.
function detailJson(d: Record<string, any>) {
  const summary: string[] = []
  if (d.preview_text) summary.push(String(d.preview_text).trim())
  else if (d.big_idea) summary.push(String(d.big_idea).trim())
  const obj = {
    slug: d.slug,
    series: d.series || '',
    seriesShort: shortSeries(d.series),
    title: d.title || '',
    passage: normPassage(d.passage),
    preachedOn: d.preached_on || '',
    speaker: d.speaker || 'Pastor Billy Philips',
    podcastUrl: d.podcast_url || '',
    summary,
    subtitle: d.subtitle || '',
    week: d.week_number ?? null,
  }
  return JSON.stringify(obj, null, 2) + '\n'
}

async function ghGet(path: string) {
  const r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + path + '?ref=main', { headers: { Authorization: 'token ' + TOKEN, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'gathering' } })
  if (!r.ok) return null
  return await r.json()
}
async function ghPut(path: string, content: string, message: string, sha?: string) {
  const body: Record<string, unknown> = { message, content: b64(content) }
  if (sha) body.sha = sha
  const r = await fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + path, { method: 'PUT', headers: { Authorization: 'token ' + TOKEN, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'gathering' }, body: JSON.stringify(body) })
  const pj = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, commit: pj && pj.commit && pj.commit.sha }
}

// Append-only sync of sermons/data/index.json, newest first by preachedOn.
// Only ADDS missing sermons, so curated seriesGroup / seriesShort and week:null
// special messages already in the file are never overwritten. Format preserved.
async function syncRegistry() {
  const meta = await ghGet(REG)
  if (!meta) return { ok: false, error: 'registry_not_found' }
  let reg: Array<Record<string, any>>
  try { reg = JSON.parse(decodeURIComponent(escape(atob(String(meta.content || '').replace(/\n/g, ''))))) } catch (_) { return { ok: false, error: 'registry_parse_failed' } }
  if (!Array.isArray(reg)) return { ok: false, error: 'registry_not_array' }
  // Dedup by preachedOn (one sermon per Sunday). Older Supabase rows carry
  // different or null slugs than the curated registry, so a slug-based check
  // would re-add them as duplicates. Date is the stable key.
  const have = new Set(reg.map((x) => String(x.preachedOn || '')))
  const { data: rows, error } = await supabase.from('sermons').select('slug,title,series,week_number,passage,preached_on').eq('active', true).order('preached_on', { ascending: false })
  if (error) return { ok: false, error: error.message }
  const added: string[] = []
  for (const d of (rows || [])) {
    const s = String(d.slug || ''); const dt = String(d.preached_on || '')
    if (!s || !dt || have.has(dt)) continue
    const shortName = shortSeries(d.series)
    const e = { slug: s, title: d.title || '', seriesGroup: shortName, series: d.series || '', seriesShort: shortName, week: d.week_number ?? null, passage: normPassage(d.passage), preachedOn: dt }
    let at = reg.length
    for (let i = 0; i < reg.length; i++) { if (String(reg[i].preachedOn || '') < dt) { at = i; break } }
    reg.splice(at, 0, e)
    have.add(dt); added.push(s)
  }
  if (!added.length) return { ok: true, added: 0, total: reg.length }
  const out = '[\n' + reg.map((x) => JSON.stringify(x, null, 2).split('\n').map((l) => '  ' + l).join('\n')).join(',\n') + '\n]\n'
  const put = await ghPut(REG, out, 'Sync sermon registry: ' + added.join(', '), meta.sha)
  return { ok: put.ok, added, total: reg.length, commit: put.commit }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const url = new URL(req.url)
  let slug = url.searchParams.get('slug') || ''
  let id = url.searchParams.get('id') || ''
  const dryrun = url.searchParams.get('dryrun') === '1'
  if (req.method === 'POST') { try { const b = await req.json(); if (b.slug) slug = b.slug; if (b.id) id = String(b.id) } catch (_) { /* ignore */ } }
  if (!slug && id) { const { data } = await supabase.from('sermons').select('slug').eq('id', id).limit(1); if (data && data[0]) slug = data[0].slug }
  if (!slug) { const { data } = await supabase.from('sermons').select('slug').eq('active', true).order('preached_on', { ascending: false }).limit(1); if (data && data[0]) slug = data[0].slug }
  if (!slug) return j({ ok: false, error: 'no slug' }, 400)
  const { data: rows, error } = await supabase.from('sermons').select('*').eq('slug', slug).limit(1)
  if (error) return j({ ok: false, error: error.message }, 500)
  const d = rows && rows[0]
  if (!d) return j({ ok: false, error: 'sermon not found for slug ' + slug }, 404)
  if (!d.active) { await supabase.from('sermons').update({ active: true }).eq('slug', slug); d.active = true }
  const detail = detailJson(d)
  if (dryrun) return new Response(detail, { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } })
  if (!TOKEN) return j({ ok: false, reason: 'no_server_token', hint: 'Add GITHUB_TOKEN secret, then call again', slug })
  const path = 'sermons/data/' + slug + '.json'
  const existing = await ghGet(path)
  let existingContent = ''
  if (existing && existing.content) { try { existingContent = decodeURIComponent(escape(atob(String(existing.content).replace(/\n/g, '')))) } catch (_) { /* ignore */ } }
  let put: { ok: boolean; status: number; commit: unknown; unchanged?: boolean } = { ok: true, status: 200, commit: null, unchanged: true }
  if (existingContent !== detail) { put = await ghPut(path, detail, 'Publish sermon: ' + slug, existing && existing.sha) }
  let registry: unknown = null
  if (put.ok) { try { registry = await syncRegistry() } catch (e) { registry = { ok: false, error: String(e) } } }
  return j({ ok: put.ok, status: put.status, path, detailUnchanged: put.unchanged === true, commit: put.commit, registry })
})
