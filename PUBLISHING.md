# Publishing content to gatheringctx.org

This is the go-forward workflow for keeping the site fresh, including from
the weekly **Cowork scheduled tasks**. The idea is simple:

> **You write the words (one small data file). The page builds itself.**

No hand-built HTML pages, no passwords, no dashboards. Every devotional and
sermon is a small JSON file in this repo. A shared template turns it into a
fully styled, on-brand page with the reader, the audio player, SEO tags, and
the correct per-book header theme. Because it lives in git, every change is
versioned and reversible, and Netlify deploys it automatically.

---

## How a weekly Cowork task publishes

After the task has generated the content, its **publish step** is:

1. Write one JSON file into the right folder (see schemas below).
2. Commit and push to the repo.
3. Netlify builds and deploys automatically. It is live in a minute or two.

That is the whole workflow. A devotional file at
`devotionals/data/colossians-week-1.json` is instantly live at
`https://gatheringctx.org/devotionals/colossians-week-1`.

---

## Devotionals

- **Folder:** `devotionals/data/`
- **File name:** the URL slug, e.g. `ephesians-week-2.json`
- **Lives at:** `/devotionals/<slug>`
- **Template:** `devotional-template.html`
- **Copy the skeleton:** `devotionals/data/_template.json`

### Fields

| Field | Required | What it is |
|---|---|---|
| `slug` | yes | URL slug; match the file name |
| `series` | yes | Book/series name, e.g. `"Ephesians"`, also picks the header theme |
| `week` | no | Week number in the series |
| `title` | yes | The devotional title |
| `subtitle` | no | One-line hook under the title |
| `passage` | no | e.g. `"Ephesians 1:1 to 14"` |
| `description` | no | SEO meta description (a sentence or two) |
| `intro` | no | Array of intro paragraphs |
| `days` | yes | Array of day objects (below) |
| `prayer` | no | `{ "title": "...", "body": "..." }` |
| `declaration` | no | Array of lines |
| `benediction` | no | Array of paragraphs |

Each **day** object: `n` (number), `title`, `scripture`, `scriptureRef`,
`pull` (optional one-line highlight), `body` (array of paragraphs),
`greekWord` (optional), `reflect` (array of questions).

---

## Sermons

- **Folder:** `sermons/data/`
- **File name:** the URL slug, e.g. `complete-in-him.json`
- **Lives at:** `/sermons/<slug>`
- **Template:** `sermon-template.html`
- **Copy the skeleton:** `sermons/data/_template.json`
- **Also add it to the list:** append one entry to `sermons/data/index.json`
  (`slug`, `title`, `seriesGroup`, `series`, `seriesShort`, `week`, `passage`,
  `preachedOn`) so it appears in the `/sermons` archive. The archive reads
  this file and sorts newest-first automatically.

### Fields

| Field | Required | What it is |
|---|---|---|
| `slug` | yes | URL slug; match the file name |
| `series` | yes | Series name, also picks the header theme |
| `seriesShort` | no | Short label for the hero, e.g. `"Colossians"` |
| `week` | no | Week number |
| `title` | yes | Sermon title |
| `subtitle` | no | One-line hook |
| `passage` | no | e.g. `"Colossians 2:6 to 23"` |
| `preachedOn` | no | Date `YYYY-MM-DD` |
| `speaker` | no | e.g. `"Pastor Billy Philips"` |
| `podcastUrl` | no | The Buzzsprout episode URL; becomes the audio player |
| `summary` | no | Array of paragraphs (the message overview) |
| `points` | no | Array of `{ "title": "...", "body": "..." }` outline points |
| `devotionalSlug` | no | Links to that week's devotional |

---

## Events

The `/events` page reads a single file, so keeping it current is one edit.

- **File:** `events/data/events.json`
- **Lives at:** `/events`

The file has a `recurring` block (the Sunday service banner) and a list of
`sections`. Each section has a `label`, a `title`, and a list of `cards`.
Each **card** has `date` (a short free-text tag like `"Coming Up"` or
`"Now Preaching"`), `title`, `body`, and an optional `linkHref` + `linkLabel`
button.

**Events clean themselves up.** Add `"expires": "YYYY-MM-DD"` to any dated
card and it disappears from the site the day after that date, so old events
never linger. A section with no cards left hides itself too. Leave `expires`
out for evergreen items (Partnership Class, "Have a question?", etc.) that
should always show.

Example card for a one-time event:

```json
{
  "date": "August 24, 2026",
  "title": "Night of Worship",
  "body": "One night. No sermon. Just worship. Bring someone with you.",
  "linkHref": "/visit",
  "linkLabel": "Plan Your Visit",
  "expires": "2026-08-24"
}
```

---

## Keeping the sitemap current

Search engines find pages through `sitemap.xml`. Instead of editing that file
by hand, regenerate it after publishing:

```
node scripts/build-sitemap.mjs
```

It keeps a curated list of the main pages and automatically adds every sermon
in `sermons/data/index.json` and every devotional in `devotionals/data/`, so
newly published content shows up in search on its own. Commit the updated
`sitemap.xml` alongside the content. When you add a brand new evergreen page
(not a sermon or devotional), add one line to the `CORE` list at the top of
`scripts/build-sitemap.mjs`.

---

## Per-book header themes

Each book gets its own header look automatically, chosen from the `series`
name. The themes live in `assets/series-themes.js`. Colossians is deep
cosmic violet, Ephesians royal blue and gold, Philippians warm amber,
Pentecost ember, Easter dawn; anything else falls back to the house gold.

- **To give a new book its own look:** add one entry to
  `assets/series-themes.js`, keyed by a lowercase word in the series name.
- **To override per file:** add `"theme": { "bg": "…css…", "accent": "#hex" }`
  or `"headerImage": "https://…"` to the JSON.

---

## Good to know

- **The `/sermons` archive now reads the JSON files** (`sermons/data/index.json`)
  and no longer depends on Supabase. Publishing a sermon = write its JSON +
  add one line to `index.json`.
- **The `/devotionals` archive and the homepage's "latest"** still read the
  existing Supabase content system, since the older devotional content lives
  in the static pages, not fully in Supabase. New devotionals published as
  JSON work at their own URL immediately; to also list one in the archive
  today, keep updating Supabase as you do now. Converging the devotional
  archive onto JSON (like sermons) is a planned follow-up.
- **Nothing is hand-built.** If a page ever looks off, fix the template or the
  theme once and every page updates.
- **Everything is reversible.** It is all in git history.
