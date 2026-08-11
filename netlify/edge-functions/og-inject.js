/*
 * Per-sermon / per-devotional social-share tags.
 *
 * The sermon and devotional pages are rendered client-side from JSON, so
 * crawlers that do not run JS (Facebook, iMessage, etc.) only see the generic
 * default tags baked into the template. This edge function intercepts a single
 * /sermons/<slug> or /devotionals/<slug> request, reads the matching JSON, and
 * rewrites the <title> and Open Graph / Twitter tags in the served HTML so the
 * real title and description are present in the initial markup.
 *
 * Safety: every failure path returns the original, unmodified response, so the
 * worst case is exactly the behavior we have today. It never blocks the page.
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
  var url = new URL(request.url);
  var path = url.pathname;

  var kind, dir;
  if (path.indexOf("/sermons/") === 0) { kind = "sermon"; dir = "sermons"; }
  else if (path.indexOf("/devotionals/") === 0) { kind = "devotional"; dir = "devotionals"; }
  else return; // not ours -> normal handling

  var slug = path.replace(/^\/(sermons|devotionals)\//, "").replace(/\/+$/, "");
  // Only a bare single-segment slug (skip data files and nested paths).
  if (!slug || slug.indexOf("/") !== -1) return;

  var res = await context.next();
  var ct = res.headers.get("content-type") || "";
  if (ct.indexOf("text/html") === -1) return res; // only transform HTML

  // Rebuild the response with the (possibly) modified body. Content-Length must
  // be dropped because the body length changes; the runtime recomputes it.
  function send(body) {
    var headers = new Headers(res.headers);
    headers.delete("content-length");
    return new Response(body, { status: res.status, statusText: res.statusText, headers: headers });
  }

  var html = await res.text();
  // Only touch a genuine 200 render of the expected template. If the rewrite
  // pipeline returned anything else (e.g. a 404), serve it through untouched.
  var marker = kind === "sermon" ? "st-root" : "dt-root";
  if (!res.ok || html.indexOf(marker) === -1) return send(html);

  try {
    var dataRes = await fetch(url.origin + "/" + dir + "/data/" + slug + ".json");
    if (!dataRes.ok) return send(html);
    var d = await dataRes.json();
    if (!d || !d.title) return send(html);

    var desc = kind === "sermon"
      ? (d.subtitle || (d.summary && d.summary[0]) || d.title)
      : (d.description || d.subtitle || (d.intro && d.intro[0]) || d.title);

    var out = injectMeta(html, {
      title: d.title + " | The Gathering CTX",
      desc: String(desc || "").slice(0, 300)
    });
    return send(out);
  } catch (e) {
    return send(html); // any failure -> unmodified page
  }
};

export const config = { path: ["/sermons/*", "/devotionals/*"] };
