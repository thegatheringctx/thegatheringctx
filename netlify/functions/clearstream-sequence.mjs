const CS_API = "https://api.clearstream.io/v1";
const API_KEY = process.env.CLEARSTREAM_API_KEY;

// List IDs (confirmed)
const LISTS = {
  visit:   409374,
  new:     409376,
  victory: 409377,
};

// SMS sequences per list
const SEQUENCES = {
  visit: [
    // Day 0 (immediate) -- sent by clearstream-subscribe.mjs on sign-up
    // Day 1 follow-up
    { delay_days: 1, message: "Hey, this is Pastor Billy from The Gathering CTX. So glad you reached out. We meet Sundays at 5 PM at the Cleburne Conference Center. Any questions before Sunday? Just reply here." },
    // Day 3
    { delay_days: 3, message: "The Gathering CTX: One thing we want you to know before you come -- there is no dress code, no pressure, and a seat saved for you. See you Sunday at 5 PM. 1501 W Henderson St, Cleburne TX." },
  ],
  new: [
    { delay_days: 1, message: "Welcome to The Gathering CTX family. We are so glad you are here. Reply with any questions or just to say hey. And check out our devotional this week at gatheringctx.org/devotionals" },
    { delay_days: 4, message: "The Gathering CTX: Have you connected yet? Belong & Become is how we build real community here -- gatheringctx.org/belong. Also, our sermon podcast is on Apple and Spotify. Search 'The Gathering CTX'." },
    { delay_days: 7, message: "Hey, Pastor Billy here. I just want you to know -- you are not an outsider at The Gathering. You belong. See you this Sunday at 5 PM. Text STOP to unsubscribe." },
  ],
  victory: [
    { delay_days: 1, message: "The Gathering CTX: Walking in victory is not a destination -- it is who you already are in Christ. This week: gatheringctx.org/sermons for the latest message on what that looks like." },
    { delay_days: 3, message: "Victory truth for today: 'But thanks be to God, who gives us the victory through our Lord Jesus Christ.' 1 Cor 15:57. You are already on the winning side." },
    { delay_days: 7, message: "The Gathering CTX: Want to go deeper? Our Formed & Sent track is how we walk people into their calling. Learn more at gatheringctx.org/formed. See you Sunday at 5." },
  ],
};

export const handler = async (event) => {
  // This function is called by a scheduled job or webhook
  // For now it documents the sequence -- actual scheduling requires Clearstream automations
  // or a Netlify scheduled function calling the Clearstream send API

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { list_type, phone, delay_days } = JSON.parse(event.body || "{}");

    if (!list_type || !SEQUENCES[list_type]) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid list_type" }) };
    }

    const sequence = SEQUENCES[list_type];
    const step = sequence.find(s => s.delay_days === delay_days);

    if (!step) {
      return { statusCode: 404, body: JSON.stringify({ error: "No message for this delay" }) };
    }

    if (phone) {
      // Send to specific subscriber
      const res = await fetch(`${CS_API}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscribers: [{ mobile_number: phone }],
          message: step.message,
        }),
      });
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify({ success: true, data }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sequence: SEQUENCES[list_type] }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};