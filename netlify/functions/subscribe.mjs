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
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  let email, list;
  try { const body = await req.json(); email = body.email; list = body.list || "sermons"; }
  catch { return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers }); }
  if (!email || !email.includes("@")) return new Response(JSON.stringify({ error: "Valid email required" }), { status: 400, headers });
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500, headers });
  const groupName = GROUPS[list] || GROUPS.sermons;
  try {
    const groupId = await getOrCreateGroup(apiKey, groupName);
    if (!groupId) throw new Error("Could not get or create group");
    const res = await fetch(MAILERLITE_API + "/subscribers", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, groups: [groupId] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "MailerLite error");
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};
