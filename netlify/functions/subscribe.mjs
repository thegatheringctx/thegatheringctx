import { Handler } from "@netlify/functions";

const ML_API = "https://connect.mailerlite.com/api";

// MailerLite group IDs -- update these after confirming in dashboard
const GROUPS = {
  "new-here":    process.env.ML_GROUP_NEW_HERE    || process.env.MAILERLITE_GROUP_NEW,
  "visitor":     process.env.ML_GROUP_VISITOR     || process.env.MAILERLITE_GROUP_VISIT,
  "general":     process.env.ML_GROUP_GENERAL     || process.env.MAILERLITE_GROUP_GENERAL,
  "sermon":      process.env.ML_GROUP_SERMON      || process.env.MAILERLITE_GROUP_SERMON,
  "devotional":  process.env.ML_GROUP_DEVOTIONAL  || process.env.MAILERLITE_GROUP_DEVOTIONAL,
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

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
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured" }) };
    }

    // Build subscriber payload
    const subscriberData = {
      email: email.toLowerCase().trim(),
      fields: {},
      status: "active",
    };
    if (name) {
      const parts = name.trim().split(" ");
      subscriberData.fields.name = parts[0];
      if (parts.length > 1) subscriberData.fields.last_name = parts.slice(1).join(" ");
    }
    if (phone) subscriberData.fields.phone = phone;

    // Upsert subscriber
    const subRes = await fetch(`${ML_API}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(subscriberData),
    });

    if (!subRes.ok) {
      const err = await subRes.text();
      console.error("ML subscriber error:", err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Subscriber creation failed" }) };
    }

    const sub = await subRes.json();
    const subId = sub.data?.id;

    // Assign to group(s)
    const groupsToAssign = [GROUPS["general"]]; // Always add to general
    if (GROUPS[type] && GROUPS[type] !== GROUPS["general"]) {
      groupsToAssign.push(GROUPS[type]);
    }

    for (const groupId of groupsToAssign.filter(Boolean)) {
      await fetch(`${ML_API}/subscribers/${subId}/groups/${groupId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Subscribed successfully",
        type,
      }),
    };
  } catch (err) {
    console.error("Subscribe error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};