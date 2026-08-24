// kgz-kids-deploy - Kids Zone devotional deployer.
//
// This reads the live devotional week from the `devos` table (the way
// publish-devotional reads from `devotionals`) and writes the `var DEVOS=[...]`
// array in the Kids Zone app. It replaces the old v12 design, which hardcoded
// each week's content inside a NEW_DEVOS template literal and hardcoded its
// read-mode health check (hasColWk3/4/5). That is why a stale deploy shipped
// last week's content and still reported "healthy" forever, and why a curly
// apostrophe pasted into the template literal could break the whole app.
//
// Content is now serialised with JSON.stringify (never hand-built), so no
// apostrophe, quote, or other character in the copy can break the file.
//
// Modes (?mode=): read (default), preview, publish, rollback.
// Targeting (optional): ?age=47  ?series=colossians  ?week=6  ?force=1  ?backup=<branch>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const TOKEN = Deno.env.get('GITHUB_TOKEN') || ''
const OWNER = 'thegatheringctx', REPO = 'thegatheringctx'
// Files that may carry the inline var DEVOS array, most-likely first.
const CANDIDATES = ['kgz/app/core-b.js', 'kgz/app/core-a.js', 'kgz/index.html']
// The Kids Zone inline array is the ages 4-7 content only. The 8-12 devo is a
// separate print/web piece and must never be mixed into this array.
const DEFAULT_AGE = '47'
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }

function jr(o: unknown, s = 200) { return new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } }) }
function b64(s: string) { return btoa(unescape(encodeURIComponent(s))) }

// Escape every non-ASCII char to \uXXXX so the committed file is pure ASCII and
// cannot be mangled by any editor, transport, or re-encode. JSON.stringify has
// already escaped quotes/backslashes; this only touches bytes >= 0x7f.
function asciiSafe(s: string) {
  return s.replace(/[\u0080-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
}

// Normalise a series name to a comparable token: 'Colossians: Rooted / All of
// Him' -> 'colossians', 'worship' -> 'worship'.
function seriesToken(s: unknown) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9].*$/, '').trim() }

// Human-readable week key used for branch names and reporting.
function weekKey(series: unknown, week: unknown) {
  const s = seriesToken(series) || 'week'
  return (week == null || week === '') ? s : s + '-wk' + week
}

function gh(p: string, opts: Record<string, unknown> = {}) {
  return fetch('https://api.github.com/repos/' + OWNER + '/' + REPO + p, {
    ...opts,
    headers: { Authorization: 'token ' + TOKEN, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'gathering', 'Content-Type': 'application/json' },
  } as RequestInit)
}
async function mainHead() { const r = await gh('/git/ref/heads/main'); if (!r.ok) return null; const d = await r.json(); return d.object.sha as string }
async function getFile(path: string, ref: string) {
  const r = await gh('/contents/' + path + '?ref=' + encodeURIComponent(ref))
  if (!r.ok) return null
  const d = await r.json()
  const raw = atob(String(d.content || '').replace(/\n/g, ''))
  return { sha: d.sha as string, content: decodeURIComponent(escape(raw)) }
}
async function findTarget() {
  for (const p of CANDIDATES) { const f = await getFile(p, 'main'); if (f && f.content.indexOf('var DEVOS') >= 0) return { path: p, file: f } }
  return null
}
async function makeBranch(name: string, sha: string) { const c = await gh('/git/refs', { method: 'POST', body: JSON.stringify({ ref: 'refs/heads/' + name, sha }) }); return c.ok || c.status === 422 }
async function commitTo(path: string, branch: string, content: string, msg: string) {
  const cur = await getFile(path, branch)
  const body: Record<string, unknown> = { message: msg, content: b64(content), branch }
  if (cur) body.sha = cur.sha
  const r = await gh('/contents/' + path, { method: 'PUT', body: JSON.stringify(body) })
  const d = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, commit: d && d.commit && d.commit.sha }
}

// Replace the `[...]` array literal after `var DEVOS=` by scanning for the
// matching close bracket while respecting string literals - never a blind
// indexOf that a `];` inside body copy could fool. Keeps the trailing `;`.
function replaceDevos(content: string, arrJson: string) {
  const k = content.indexOf('var DEVOS')
  if (k < 0) return null
  const start = content.indexOf('[', k)
  if (start < 0) return null
  let depth = 0, inStr = false, quote = '', end = -1
  for (let i = start; i < content.length; i++) {
    const ch = content[i]
    if (inStr) {
      if (ch === '\\') { i++; continue }
      if (ch === quote) inStr = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; quote = ch; continue }
    if (ch === '[') depth++
    else if (ch === ']') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end < 0) return null
  return content.slice(0, start) + arrJson + content.slice(end + 1)
}

// Every distinct `<prefix>-d1` id present in the live file, e.g. 'col6-47'.
function liveWeekPrefixes(content: string) {
  const set = new Set<string>()
  const re = /([a-z0-9-]+)-d1\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) set.add(m[1])
  return Array.from(set)
}

// Resolve which week should be live for this age group, mirroring
// publish-devotional: active rows, and (when not explicitly targeted) the group
// whose publish_at is newest and already due. Returns the day rows in order.
async function resolveTarget(age: string, series: string | null, week: number | null) {
  let q = supabase.from('devos').select('*').eq('active', true).eq('age_group', age)
  if (series) q = q.eq('series', series)
  if (week != null) q = q.eq('week_number', week)
  const { data, error } = await q
  if (error) return { error: error.message }
  const rows: Array<Record<string, any>> = data || []
  if (!rows.length) return { error: 'no_active_rows', age, series, week }

  // All active weeks for this age group (for the health report / duplicate warning).
  const allWeeks = Array.from(new Set(rows.map((r) => weekKey(r.series, r.week_number)))).sort()

  let group: Array<Record<string, any>>
  if (series || week != null) {
    // Explicit target - take exactly what was asked for.
    group = rows.slice()
  } else {
    // Auto - pick the newest already-due (series, week_number) group.
    const nowMs = Date.now()
    const due = rows.filter((r) => { const t = Date.parse(r.publish_at || ''); return isNaN(t) ? true : t <= nowMs })
    const pool = due.length ? due : rows
    let best = pool[0]
    for (const r of pool) if (String(r.publish_at || '') > String(best.publish_at || '')) best = r
    const bs = String(best.series || ''), bw = best.week_number
    group = pool.filter((r) => String(r.series || '') === bs && r.week_number === bw)
  }

  group.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const key = weekKey(group[0].series, group[0].week_number)
  const days = group.map((r) => ({ id: r.id, day: r.sort_order, title: r.title, scripture: r.scripture, body: r.content, prayer: r.prayer }))
  const warnings: string[] = []
  if (allWeeks.length > 1 && !(series || week != null)) warnings.push('multiple active weeks for age ' + age + ': ' + allWeeks.join(', ') + ' - deactivate prior weeks to remove ambiguity')
  const missing = days.filter((d) => !d.title || !d.body).map((d) => d.id)
  if (missing.length) warnings.push('rows missing title/body: ' + missing.join(', '))
  return { key, series: group[0].series, week: group[0].week_number, days, allWeeks, warnings }
}

// The current adult devotional week (active, newest already-due publish_at).
async function adultWeek() {
  const { data, error } = await supabase.from('devotionals').select('series,week_number,slug,publish_at').eq('active', true).order('publish_at', { ascending: false })
  if (error) return { error: error.message }
  const rows: Array<Record<string, any>> = data || []
  const nowMs = Date.now()
  const due = rows.filter((r) => { const t = Date.parse(r.publish_at || ''); return isNaN(t) ? true : t <= nowMs })
  const r = (due[0] || rows[0])
  if (!r) return { error: 'no_active_adult_devotional' }
  return { series: r.series, week: r.week_number, slug: r.slug }
}

// Kids week vs adult week - the guard that did not exist before.
function compareWeeks(kids: { series: unknown; week: unknown }, adult: { series: unknown; week: unknown }) {
  const sameSeries = seriesToken(kids.series) === seriesToken(adult.series)
  const sameWeek = String(kids.week ?? '') === String(adult.week ?? '')
  return { inSync: sameSeries && sameWeek, sameSeries, sameWeek }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (!TOKEN) return jr({ ok: false, error: 'no_token' })

  const u = new URL(req.url)
  const mode = u.searchParams.get('mode') || 'read'
  const age = u.searchParams.get('age') || DEFAULT_AGE
  const series = u.searchParams.get('series')
  const weekRaw = u.searchParams.get('week')
  const week = weekRaw == null || weekRaw === '' ? null : Number(weekRaw)
  const force = u.searchParams.get('force') === '1'

  const head = await mainHead(); if (!head) return jr({ ok: false, error: 'no_main' })
  const t = await findTarget(); if (!t) return jr({ ok: false, error: 'devos_array_not_found_in_candidates', candidates: CANDIDATES })
  const content = t.file.content

  // What the table says should be live.
  const tgt = await resolveTarget(age, series, week)
  if ((tgt as any).error) return jr({ ok: false, error: 'target_resolve_failed', detail: tgt, targetFile: t.path }, 400)
  const target = tgt as { key: string; series: unknown; week: unknown; days: any[]; allWeeks: string[]; warnings: string[] }
  const wk = weekKey(target.series, target.week)

  // Guard data: compare against the current adult devotional week.
  const adult = await adultWeek()
  const cmp = (adult as any).error ? { inSync: false, sameSeries: false, sameWeek: false } : compareWeeks({ series: target.series, week: target.week }, adult as any)

  if (mode === 'read') {
    const live = liveWeekPrefixes(content)
    const expectPrefix = (target.days[0] && String(target.days[0].id || '').replace(/-d\d+$/, '')) || null
    // liveMatchesTable: does the deployed file already carry the exact week the
    // table says should be live. inSync (below) is the kids-vs-adult guard and
    // means the same thing in every mode.
    const liveMatchesTable = expectPrefix != null && live.length === 1 && live[0] === expectPrefix
    return jr({
      ok: true, mode: 'read', targetFile: t.path,
      liveWeeks: live, tableWeek: wk, tableExpectsPrefix: expectPrefix,
      dayCount: target.days.length, inSync: cmp.inSync, liveMatchesTable,
      allActiveWeeks: target.allWeeks, adultWeek: adult,
      warnings: target.warnings,
    })
  }

  // Build the new array - serialised, never hand-built.
  const arrJson = asciiSafe(JSON.stringify(target.days))
  const patched = replaceDevos(content, arrJson)
  if (!patched) return jr({ ok: false, error: 'markers_not_found', targetFile: t.path })

  if (mode === 'preview') {
    const branch = 'kids-' + wk + '-preview'
    await makeBranch(branch, head)
    const r = await commitTo(t.path, branch, patched, 'Preview: ' + wk + ' kids devos')
    return jr({ ok: r.ok, mode: 'preview', branch, targetFile: t.path, weekPublished: wk, dayCount: target.days.length, status: r.status, commit: r.commit, inSync: cmp.inSync, adultWeek: adult, warnings: target.warnings })
  }

  if (mode === 'publish') {
    // Fail closed on kids/adult drift unless explicitly forced. Publishing a
    // mismatched week to main is exactly the "breaks every week" failure this
    // refactor exists to stop, so the guard gates the write rather than only
    // reporting after the fact.
    if (!cmp.inSync && !force) {
      return jr({ ok: false, mode: 'publish', error: 'week_mismatch',
        message: 'Kids week (' + wk + ') does not match the active adult devotional week. Refusing to publish. Re-run with force=1 to override.',
        kidsWeek: { series: target.series, week: target.week }, adultWeek: adult, targetFile: t.path, inSync: false }, 409)
    }
    const backup = 'kids-' + wk + '-backup'
    const bk = await makeBranch(backup, head)
    const r = await commitTo(t.path, 'main', patched, 'Publish: ' + wk + ' kids devos')
    return jr({ ok: r.ok, mode: 'publish', targetFile: t.path, weekPublished: wk, dayCount: target.days.length,
      commit: r.commit, inSync: cmp.inSync, backup_branch: backup, backup_made: bk, backup_points_to: head,
      status: r.status, oldLen: content.length, newLen: patched.length, adultWeek: adult, forced: force, warnings: target.warnings })
  }

  if (mode === 'rollback') {
    const backup = u.searchParams.get('backup') || ('kids-' + wk + '-backup')
    const bf = await getFile(t.path, backup)
    if (!bf) return jr({ ok: false, error: 'no_backup', backup, targetFile: t.path })
    const r = await commitTo(t.path, 'main', bf.content, 'Rollback: restore prior kids devos (' + backup + ')')
    return jr({ ok: r.ok, mode: 'rollback', targetFile: t.path, backup_branch: backup, status: r.status, commit: r.commit })
  }

  return jr({ ok: false, error: 'unknown_mode', mode })
})
