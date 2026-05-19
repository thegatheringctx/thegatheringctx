import { schedule } from "@netlify/functions";

const CS_API = "https://api.clearstream.io/v1";
const API_KEY = process.env.CLEARSTREAM_API_KEY;

// Clearstream list IDs
const LISTS = {
  visit:   409374,
  new:     409376,
  victory: 409377,
};

// SMS sequences -- day offset => message
const SEQUENCES = {
  visit: {
    1: "Hey, it's Pastor Billy from The Gathering CTX in Cleburne. So glad you reached out. We meet Sundays at 5 PM at the Cleburne Conference Center. Any questions before Sunday? Just reply here.",
    3: "The Gathering CTX: One thing we want you to know -- no dress code, no pressure, a seat saved for you. See you Sunday at 5 PM. 1501 W Henderson St, Cleburne TX. Text STOP to unsubscribe.",
    7: "The Gathering CTX: Still thinking about visiting? We would love to have you this Sunday at 5 PM. Here is everything you need to know: gatheringctx.org/what-to-expect -- Text STOP to unsubscribe.",
  },
  new: {
    1: "Welcome to The Gathering CTX family. We are so glad you are here. Reply with any questions. Check out this week's devotional at gatheringctx.org/devotionals -- Text STOP to unsubscribe.",
    4: "The Gathering CTX: Have you connected yet? Belong and Become is how we build real community here -- gatheringctx.org/belong. Our sermon podcast is on Apple and Spotify. Search The Gathering CTX.",
    7: "Hey, Pastor Billy here. You are not an outsider at The Gathering. You belong. See you this Sunday at 5 PM. And reply any time if you need anything. Text STOP to unsubscribe.",
  },
  victory: {
    1: "The Gathering CTX: Walking in victory is not a destination -- it is who you already are in Christ. This week's message: gatheringctx.org/sermons -- Text STOP to unsubscribe.",
    3: "Victory truth: 'Thanks be to God, who gives us the victory through our Lord Jesus Christ.' 1 Cor 15:57. You are on the winning side. -- The Gathering CTX. Text STOP to unsubscribe.",
    7: "The Gathering CTX: Want to go deeper? Our Formed and Sent track walks you into your calling. Learn more at gatheringctx.org/formed. See you Sunday at 5 PM. Text STOP to unsubscribe.",
  },
};

async function getListSubscribers(listId) {
  const res = await fetch(`${CS_API}/lists/${listId}/subscribers?limit=200`, {
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

async function sendSMS(mobileNumber, message) {
  const res = await fetch(`${CS_API}/messages`, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      subscribers: [{ mobile_number: mobileNumber }],
      message,
    }),
  });
  return res.ok;
}

function daysSince(dateStr) {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now - created;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Runs daily at 10 AM CT (16:00 UTC)
export const handler = schedule("0 16 * * *", async () => {
  if (!API_KEY) {
    console.error("CLEARSTREAM_API_KEY not set");
    return { statusCode: 500 };
  }

  const results = { sent: 0, errors: 0 };

  for (const [listName, listId] of Object.entries(LISTS)) {
    const sequence = SEQUENCES[listName];
    const subscribers = await getListSubscribers(listId);

    for (const sub of subscribers) {
      const days = daysSince(sub.created_at || sub.subscribed_at);
      const message = sequence[days];

      if (message && sub.mobile_number) {
        const ok = await sendSMS(sub.mobile_number, message);
        if (ok) {
          results.sent++;
          console.log(`Sent day ${days} message to ${listName} subscriber`);
        } else {
          results.errors++;
        }
      }
    }
  }

  console.log(`SMS Scheduler complete: ${results.sent} sent, ${results.errors} errors`);
  return { statusCode: 200 };
});