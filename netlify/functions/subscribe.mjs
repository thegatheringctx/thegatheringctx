import { Handler } from "@netlify/functions";

const ML_API = "https://connect.mailerlite.com/api";

// Confirmed MailerLite group IDs
const GROUPS = {
  "new-here":   "187839987092292840",
  "visitor":    "187839987092292840", // routes to New Here
  "general":    "187839987092292840", // default to New Here
  "sermon":     "186005510465521606",
  "devotional": "186005699107489474",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } };
  }
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { email, name, type = "general", phone } = body;

    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Valid email required" }) };
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured" }) };

    // Build subscriber
    const subData = { email: email.toLowerCase().trim(), fields: {}, status: "active" };
    if (name) {
      const parts = name.trim().split(" ");
      subData.fields.name = parts[0];
      if (parts.length > 1) subData.fields.last_name = parts.slice(1).join(" ");
    }
    if (phone) subData.fields.phone = phone;

    // Upsert subscriber
    const subRes = await fetch(ML_API + "/subscribers", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(subData),
    });

    if (!subRes.ok) {
      const err = await subRes.text();
      console.error("ML subscriber error:", err);
      // Try to continue -- subscriber may already exist
    }

    const sub = await subRes.json();
    const subId = sub?.data?.id;

    if (subId) {
      // Always add to New Here
      const groupId = GROUPS[type] || GROUPS["new-here"];
      await fetch(`${ML_API}/subscribers/${subId}/groups/${groupId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      });

      // If sermon or devotional, also add to that specific group
      if (type === "sermon" || type === "devotional") {
        await fetch(`${ML_API}/subscribers/${subId}/groups/${GROUPS[type]}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Subscribed successfully", type }),
    };
  } catch (err) {
    console.error("Subscribe error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};