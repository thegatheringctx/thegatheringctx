const MAILERLITE_API = "https://connect.mailerlite.com/api";
const GROUPS = { sermons: "Sermon Subscribers", devotionals: "Devotional Subscribers" };

async function getOrCreateGroup(apiKey, name) {
  const res = await fetch(MAILERLITE_API + "/groups?limit=100", {
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" }
  });
  const data = await res.json();
  const found = (data.data || []).find(g => g.name === name);
  if (found) return found.id;
  const create = await fetch(MAILERLITE_API + "/groups", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  const created = await create.json();
  return created.data && created.data.id;
}

export default async (req) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") return new Response("", { status: 200, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  const apiKey = Netlify.env.get("MAILERLITE_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "Not configured" }), { status: 500, headers });

  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers }); }

  const { email, list = "sermons" } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return new Response(JSON.stringify({ error: "Valid email required" }), { status: 400, headers });

  const groupName = GROUPS[list];
  if (!groupName) return new Response(JSON.stringify({ error: "Invalid list" }), { status: 400, headers });

  try {
    const groupId = await getOrCreateGroup(apiKey, groupName);
    const sub = await fetch(MAILERLITE_API + "/subscribers", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, groups: [groupId], status: "active" })
    });
    if (!sub.ok) { const e = await sub.json(); throw new Error(e.message || "MailerLite error"); }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/subscribe" };