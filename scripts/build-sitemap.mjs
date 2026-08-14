#!/usr/bin/env node
/*
 * Regenerate sitemap.xml for gatheringctx.org.
 *
 * Why this exists: the individual sermon and devotional pages are published as
 * JSON data files, so the sitemap should grow itself instead of being hand
 * edited. Run this after publishing content and commit the updated sitemap.xml:
 *
 *     node scripts/build-sitemap.mjs
 *
 * Core pages are the curated list below. Sermon pages are read from
 * sermons/data/index.json, and template-driven devotionals from
 * devotionals/data/*.json, so newly published content appears automatically.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://gatheringctx.org";
const TODAY = new Date().toISOString().slice(0, 10);

// ---- Curated core pages: [path, changefreq, priority] ----
const CORE = [
  ["/", "weekly", "1.0"],
  ["/visit", "monthly", "0.9"],
  ["/new-here", "monthly", "0.9"],
  ["/sermons", "weekly", "0.9"],
  ["/devotionals", "weekly", "0.9"],
  ["/kids", "monthly", "0.8"],
  ["/generosity", "monthly", "0.8"],
  ["/events", "weekly", "0.8"],
  ["/our-story", "monthly", "0.8"],
  ["/beliefs", "monthly", "0.8"],
  ["/leadership", "monthly", "0.8"],
  ["/what-to-expect", "monthly", "0.8"],
  ["/baptism", "monthly", "0.8"],
  ["/gallery", "monthly", "0.7"],
  ["/belong", "monthly", "0.8"],
  ["/formed", "monthly", "0.7"],
  ["/small-gatherings", "monthly", "0.7"],
  ["/small-groups", "monthly", "0.7"],
  ["/resources", "weekly", "0.7"],
  ["/testimonies", "weekly", "0.7"],
  ["/decrees", "monthly", "0.7"],
  ["/prayer-guide", "weekly", "0.7"],
  ["/reading-plan", "weekly", "0.7"],
  ["/ephesians", "weekly", "0.8"],
  ["/philippians", "monthly", "0.7"],
  ["/church-cleburne-tx", "monthly", "0.8"],
  ["/spirit-filled-church-cleburne", "monthly", "0.8"],
  ["/bible-church-johnson-county", "monthly", "0.7"],
  ["/church-near-burleson", "monthly", "0.7"],
  ["/church-near-joshua-tx", "monthly", "0.7"],
  ["/church-near-alvarado", "monthly", "0.7"],
  ["/church-near-godley-tx", "monthly", "0.7"],
  ["/faq", "monthly", "0.7"],
  ["/prayer", "weekly", "0.8"],
  ["/serve", "monthly", "0.8"],
  ["/contact", "monthly", "0.7"],
  ["/testimony", "monthly", "0.7"],
  ["/privacy", "yearly", "0.3"],
  // Static (pre-template) devotional pages that still live as their own files
  ["/devotional-pentecost", "monthly", "0.7"],
  ["/devotional-easter-sunday", "monthly", "0.7"],
  ["/devotional-palm-sunday", "monthly", "0.7"],
  ["/devotional-ephesians-1", "monthly", "0.7"],
  ["/devotional-ephesians-2", "monthly", "0.7"],
  ["/devotional-ephesians-3", "monthly", "0.7"],
  ["/devotional-ephesians-4", "monthly", "0.7"],
  ["/devotional-ephesians-5", "monthly", "0.7"],
  ["/devotional-ephesians-6", "monthly", "0.7"],
  ["/devotional-philippians-1", "monthly", "0.7"],
  ["/devotional-philippians-2", "monthly", "0.7"],
  ["/devotional-philippians-3", "monthly", "0.7"],
  ["/devotional-philippians-4", "monthly", "0.7"],
  ["/devotional-philippians-5", "monthly", "0.7"],
  ["/devotional-philippians-6", "monthly", "0.7"],
  ["/devotional-colossians-1", "monthly", "0.7"],
  ["/devotional-colossians-2", "monthly", "0.7"],
  ["/devotional-colossians-3", "monthly", "0.7"],
  ["/devotional-colossians-4", "monthly", "0.7"],
  ["/devotional-worship-why-what-how", "monthly", "0.7"],
  ["/family-devotional-ephesians", "monthly", "0.6"],
];

function readJson(rel) {
  try { return JSON.parse(readFileSync(join(ROOT, rel), "utf8")); }
  catch { return null; }
}

// ---- Sermon detail pages from the archive index (lastmod = preachedOn) ----
const sermonRows = [];
const sermonIndex = readJson("sermons/data/index.json");
if (Array.isArray(sermonIndex)) {
  for (const s of sermonIndex) {
    if (!s || !s.slug) continue;
    const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(String(s.preachedOn || "")) ? s.preachedOn : TODAY;
    sermonRows.push([`/sermons/${s.slug}`, "monthly", "0.7", lastmod]);
  }
}

// ---- Template-driven devotional pages (devotionals/data/*.json) ----
// While we are here, also (re)build devotionals/data/index.json so the sermon
// and devotional pages can auto-link to each other by series + week. This
// mirrors sermons/data/index.json, but is generated instead of hand-kept.
const devoRows = [];
const devoIndex = [];
try {
  for (const f of readdirSync(join(ROOT, "devotionals/data"))) {
    if (!f.endsWith(".json") || f.startsWith("_") || f === "index.json") continue;
    const slug = f.replace(/\.json$/, "");
    devoRows.push([`/devotionals/${slug}`, "monthly", "0.7", TODAY]);
    const d = readJson(`devotionals/data/${f}`) || {};
    devoIndex.push({
      slug: d.slug || slug,
      series: d.series || "",
      week: d.week != null ? d.week : null,
      title: d.title || "",
      subtitle: d.subtitle || "",
      passage: d.passage || "",
    });
  }
  devoIndex.sort((a, b) =>
    String(a.series).localeCompare(String(b.series)) || (Number(a.week) - Number(b.week)));
  writeFileSync(join(ROOT, "devotionals/data/index.json"), JSON.stringify(devoIndex, null, 2) + "\n");
} catch { /* no devotionals data dir */ }

// ---- Assemble, de-duplicating by path (first definition wins) ----
const seen = new Set();
const rows = [];
for (const r of [...CORE, ...sermonRows, ...devoRows]) {
  const [path] = r;
  if (seen.has(path)) continue;
  seen.add(path);
  rows.push(r);
}

const body = rows.map(([path, changefreq, priority, lastmod]) =>
  `  <url><loc>${ORIGIN}${path}</loc><lastmod>${lastmod || TODAY}</lastmod>` +
  `<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written: ${rows.length} URLs (${sermonRows.length} sermons, ${devoRows.length} devotionals)`);
