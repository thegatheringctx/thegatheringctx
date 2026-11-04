// Prayer wall "I prayed" taps.
//
// GET  /.netlify/functions/prayed?ids=a,b,c  -> { counts: { a: 3, b: 0 } }
// POST /.netlify/functions/prayed  { id }    -> { ok: true, count }
//
// Only ids that exist in the published /prayer-wall/data/wall.json are
// accepted, so nobody can create arbitrary keys. Each tap is its own blob
// (prayed/<id>/<visitor-day-hash>), written with onlyIfNew, so a count is
// a listing, never a read-modify-write. One tap per visitor per request per
// day. No names, emails or IPs are stored: the key holds a one-way hash.
//
// Deploy previews use a separate store so testing never touches the real
// counts.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function wallIds(origin) {
  const r = await fetch(origin + "/prayer-wall/data/wall.json", { headers: { "cache-control": "no-cache" } });
  if (!r.ok) return new Set();
  const d = await r.json().catch(() => ({}));
  return new Set((d.requests || []).map((x) => String(x.id)));
}

async function countFor(store, id) {
  const { blobs } = await store.list({ prefix: "prayed/" + id + "/" });
  return blobs.length;
}

export default async (req, context) => {
  const ctx = (context && context.deploy && context.deploy.context) || "production";
  const store = getStore({ name: ctx === "production" ? "prayer-wall" : "prayer-wall-preview", consistency: "strong" });
  const url = new URL(req.url);
  const ids = await wallIds(url.origin);

  try {
    if (req.method === "GET") {
      const want = (url.searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter((s) => ids.has(s)).slice(0, 60);
      const counts = {};
      await Promise.all(want.map(async (id) => { counts[id] = await countFor(store, id); }));
      return json({ counts });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const id = String(body.id || "");
      if (!ids.has(id)) return json({ error: "unknown_request" }, 404);
      const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "anon";
      const day = new Date().toISOString().slice(0, 10);
      const visitor = createHash("sha256").update(ip + "|" + day + "|" + id + "|gctx-wall").digest("hex").slice(0, 24);
      await store.set("prayed/" + id + "/" + day + "-" + visitor, "1", { onlyIfNew: true });
      return json({ ok: true, count: await countFor(store, id) });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (err) {
    console.error("[prayed] failed:", err && err.message);
    return json({ error: "unavailable" }, 500);
  }
};
