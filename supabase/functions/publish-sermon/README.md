# publish-sermon (Supabase edge function)

Source of record for the `publish-sermon` edge function. The function runs on
Supabase project `ktuapfiexhlladgkuauc`; this file is the version-controlled
copy of what is deployed there.

## What it does

Given a sermon, it keeps the static site in step with the `sermons` table,
the same way `publish-devotional` keeps devotionals in step:

1. Resolves the target sermon from `{slug}` (or `{id}`, or the latest active
   row if neither is given).
2. Activates the row if it is not already active. It never INSERTs, so there
   is no legacy NOT NULL trap the way `devotionals.content` is for
   `publish-devotional`.
3. Writes the per-sermon data file `sermons/data/<slug>.json` (the file
   `sermon-template.html` reads) via the GitHub Contents API. If the file is
   already identical it skips the commit (`detailUnchanged: true`).
4. Append-only syncs `sermons/data/index.json`, newest first by `preachedOn`.
   Only missing sermons are added, so curated `seriesGroup` / `seriesShort`
   and `week: null` special messages already in the file are never
   overwritten.
5. Returns the registry result in a `registry` field. A registry failure is
   caught and does not fail the publish.

## Two deliberate differences from publish-devotional

- **Dedup by `preachedOn` (date), not by slug.** Older `sermons` rows carry
  different or null slugs than the curated registry (e.g. Supabase
  `philippians-week-5` vs. registry `press-on-citizens-of-heaven`; the oldest
  rows have `slug: null`). A slug-based check would re-add those as
  duplicates. One sermon per Sunday, so the date is the stable key.
- **`normPassage()`** rewrites any hyphen/dash range to `X to Y` (Supabase
  has en-dash passages like `Philippians 2:1-11`), enforcing the site voice
  rule that passages read `2:1 to 11`.

## Invoke

```
POST https://ktuapfiexhlladgkuauc.supabase.co/functions/v1/publish-sermon
body: { "slug": "<sermon-slug>" }
```

`?dryrun=1` returns the detail JSON without committing. It is idempotent, so
it is safe to run every Sunday even when nothing changed.

## Wiring into the Sunday deploy

This is called from the weekly Cowork "SUNDAY Branch A" task, beside the
existing `publish-devotional` call, so the sermon page and the devotional
page stay in step. That orchestration lives in the Cowork task config, not in
this repo or in Supabase.

## Requires

The `GITHUB_TOKEN` function secret (a token with write access to this repo).
Without it the function returns `{ ok: false, reason: "no_server_token" }`.
