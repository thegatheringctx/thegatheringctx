# Supabase edge functions & the Sunday publish pipeline

Source-of-record copies of the edge functions that keep gatheringctx.org in
step with the `sermons` and `devotionals` tables, plus how they run
automatically. Everything here runs on Supabase project
`ktuapfiexhlladgkuauc`; these files mirror what is deployed there.

## The two publishers

| Function | Reads | Writes to the repo | Registry it syncs |
|---|---|---|---|
| `publish-sermon` | `public.sermons` | `sermons/data/<slug>.json` | `sermons/data/index.json` |
| `publish-devotional` | `public.devotionals` | `<slug>.html` | `devotionals/data/index.json` |

Both accept `POST { "slug": "..." }` (or fall back to the latest active row),
commit through the GitHub Contents API, sync their registry **append-only**
(so curated values are never overwritten), return the registry outcome in a
`registry` field, and never let a registry failure fail the publish. Both are
idempotent: re-running on an unchanged row is a no-op. `?dryrun=1` returns the
rendered artifact without committing. Both are `verify_jwt:false` so cron can
call them with no auth header, and both need the `GITHUB_TOKEN` function
secret.

See `publish-sermon/README.md` for the sermon-specific details (notably: it
dedups the registry by `preachedOn` date rather than slug, because older
`sermons` rows carry different or null slugs than the curated registry).

## How they run on Sunday — pg_cron

The publish is wired into Postgres `pg_cron` (extension `pg_cron`, HTTP via
`pg_net`). No external orchestration is involved.

| jobid | jobname | schedule | what it does |
|---|---|---|---|
| 1 | `sunday-7pm-content-publish` | `0 0 * * 1` (Mon 00:00 UTC) | Activates each due `devotionals` row and calls `publish-devotional` with its slug; also flips the kids `devos` week over. |
| 2 | `content-publish-check` | `*/15 * * * *` (every 15 min) | Activates each due `sermons` row and calls `publish-sermon` with its slug; also activates due `podcast_episodes`. |

In both jobs the HTTP call fires only for rows the activating `UPDATE`
actually flipped (a `FOR ... RETURNING slug` loop), so no call goes out when
nothing is due. A sermon or devotional with a past `publish_at` therefore
goes fully live on its own: row activated, page/JSON written, archive
registry updated.

To inspect or edit a job:

```sql
select jobid, schedule, jobname, command from cron.job where jobid in (1,2);
-- edit with: select cron.alter_job(<jobid>, command := $cmd$ ... $cmd$);
```

## Note on kids devos

jobid 1 also flips the `public.devos` (kids) table's `active` flag, but there
is no publisher for it here — nothing renders kids devos to a static artifact
the way the two functions above do. That activation is left flag-only, exactly
as it was. If kids devos ever need their own static sync, that is a new
function to build.

## Deploying a change

These files are the record, not the deploy mechanism. After editing a
function, redeploy it to Supabase (MCP `deploy_edge_function`, or
`supabase functions deploy <name>`) for the change to take effect.
