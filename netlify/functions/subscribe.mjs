const MAILERLITE_API = "https://connect.mailerlite.com/api";
const GROUPS = { sermons: "Sermon Subscribers", devotionals: "Devotional Subscribers" };

async function getOrCreateGroup(apiKey, name) {
  console.log("[subscribe] Listing groups, looking for: " + name);
  const res = await fetch(MAILERLITE_API + "/groups?limit=100", {
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" }
  });
  const json = await res.json();
  console.log("[subscribe] Groups status=" + res.status + " count=" + (json.data||[]).length + " raw=" + JSON.stringify(json).substring(0,300));
  const existing = (json.data || []).find(g => g.name === name);
  if (existing) { console.log("[subscribe] Found group id=" + existing.id); return existing.id; }

  console.log("[subscribe] Creating group: " + name);
  const create = await fetch(MAILERLITE_API + "/groups", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  const created = await create.json();
  console.log("[subscribe] Create status=" + create.status + " result=" + JSON.stringify(created).substring(0,300));
  return created?.data?.id || null;
}

export default async (req) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  let email, list;
  try {
    const body = await req.json();
    email = body.email; list = body.list || "sermons";
  } catch { return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers }); }

  if (!email || !email.includes("@")) return new Response(JSON.stringify({ error: "Valid email required" }), { status: 400, headers });

  const apiKey = process.env.MAILERLITE_API_KEY;
  console.log("[subscribe] Request: email=" + email + " list=" + list + " apiKeyPresent=" + !!apiKey + " apiKeyLen=" + (apiKey||"").length);

  const groupName = GROUPS[list] || GROUPS.sermons;

  try {
    const groupId = await getOrCreateGroup(apiKey, groupName);
    if (!groupId) throw new Error("Could not get or create group '" + groupName + "'");

    console.log("[subscribe] Adding subscriber to groupId=" + groupId);
    const addRes = await fetch(MAILERLITE_API + "/subscribers", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, groups: [groupId] })
    });
    const addJson = await addRes.json();
    console.log("[subscribe] Add subscriber status=" + addRes.status + " result=" + JSON.stringify(addJson).substring(0,300));

    if (!addRes.ok) throw new Error("MailerLite error: " + JSON.stringify(addJson).substring(0,100));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.log("[subscribe] CAUGHT ERROR: " + err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/subscribe" };
