/*
 * Per-sermon / per-devotional social-share tags.
 *
 * The sermon and devotional pages are rendered client-side from JSON, so
 * crawlers that do not run JS (Facebook, iMessage, etc.) only see the generic
 * default tags baked into the template. This edge function intercepts a single
 * /sermons/<slug> or /devotionals/<slug> request, reads the template and the
 * matching JSON, and returns the template with the <title> and Open Graph /
 * Twitter tags rewritten to the real title and description.
 *
 * Safety: it never serves the pipeline's own output. It fetches the static
 * template itself and only returns a custom response once everything has
 * succeeded. On ANY doubt it returns undefined, which makes Netlify serve the
 * request normally (the /sermons/* -> template rewrite), so a working page can
 * never be turned into a broken one.
 */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function replaceMeta(html, attr, val, content) {
  var safeVal = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  var re = new RegExp('(<meta\\s+' + attr + '="' + safeVal + '"\\s+content=")[^"]*(")', "i");
  return html.replace(re, "$1" + content + "$2");
}

function injectMeta(html, data) {
  var t = esc(data.title), d = esc(data.desc);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "<title>" + t + "</title>");
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, "$1" + d + "$2");
  html = replaceMeta(html, "property", "og:title", t);
  html = replaceMeta(html, "property", "og:description", d);
  html = replaceMeta(html, "name", "twitter:title", t);
  html = replaceMeta(html, "name", "twitter:description", d);
  return html;
}

export default async (request, context) => {
  try {
    var url = new URL(request.url);
    var path = url.pathname;

    var kind, dir, tmpl, marker;
    if (path.indexOf("/sermons/") === 0) {
      kind = "sermon"; dir = "sermons"; tmpl = "/sermon-template.html"; marker = "st-root";
    } else if (path.indexOf("/devotionals/") === 0) {
      kind = "devotional"; dir = "devotionals"; tmpl = "/devotional-template.html"; marker = "dt-root";
    } else {
      return; // not ours
    }

    var slug = path.replace(/^\/(sermons|devotionals)\//, "").replace(/\/+$/, "");
    // Only a bare single-segment slug (skip data files and nested paths).
    if (!slug || slug.indexOf("/") !== -1) return;

    // Fetch the static template and the content JSON directly. We never touch
    // context.next(), so we can only ever ADD a good response, never replace a
    // working one with a broken one.
    var tRes = await fetch(url.origin + tmpl);
    var dRes = await fetch(url.origin + "/" + dir + "/data/" + slug + ".json");
    if (!tRes.ok || !dRes.ok) return; // opt out -> Netlify serves normally

    var html = await tRes.text();
    if (html.indexOf(marker) === -1) return; // not the template we expected

    var d = await dRes.json();
    if (!d || !d.title) return;

    var desc = kind === "sermon"
      ? (d.subtitle || (d.summary && d.summary[0]) || d.title)
      : (d.description || d.subtitle || (d.intro && d.intro[0]) || d.title);

    var out = injectMeta(html, {
      title: d.title + " | The Gathering CTX",
      desc: String(desc || "").slice(0, 300)
    });

    var headers = new Headers(tRes.headers);
    headers.delete("content-length");
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(out, { status: 200, headers: headers });
  } catch (e) {
    return; // any failure -> normal handling, page never breaks
  }
};

export const config = { path: ["/sermons/*", "/devotionals/*"] };
