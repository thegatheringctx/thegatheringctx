export const handler = async (event) => {
  const CS_API = 'https://api.clearstream.io/v1';
  const API_KEY = process.env.CLEARSTREAM_API_KEY;
  const LISTS = { visit: 409374, new: 409376, victory: 409377 };
  const SEQUENCES = {
    visit: {
      1: 'Hey, it is Pastor Billy from The Gathering CTX in Cleburne. So glad you reached out. We meet Sundays at 5 PM at the Cleburne Conference Center. Any questions? Just reply here.',
      3: 'The Gathering CTX: No dress code, no pressure, a seat saved for you. See you Sunday at 5 PM. 1501 W Henderson St, Cleburne TX. Text STOP to unsubscribe.',
      7: 'The Gathering CTX: Still thinking about visiting? We would love to have you this Sunday at 5 PM. gatheringctx.org/what-to-expect -- Text STOP to unsubscribe.',
    },
    new: {
      1: 'Welcome to The Gathering CTX family. We are so glad you are here. Reply with any questions. This week at gatheringctx.org/devotionals -- Text STOP to unsubscribe.',
      4: 'The Gathering CTX: Have you connected yet? gatheringctx.org/belong. Our sermon podcast is on Apple and Spotify -- search The Gathering CTX.',
      7: 'Hey, Pastor Billy here. You are not an outsider at The Gathering. You belong. See you Sunday at 5 PM. Text STOP to unsubscribe.',
    },
    victory: {
      1: 'The Gathering CTX: Walking in victory is not a destination -- it is who you already are in Christ. This week: gatheringctx.org/sermons -- Text STOP to unsubscribe.',
      3: "Victory: 'Thanks be to God who gives us the victory through our Lord Jesus Christ.' 1 Cor 15:57. You are on the winning side. -- The Gathering CTX. Text STOP to unsubscribe.",
      7: 'The Gathering CTX: Want to go deeper? Our Formed and Sent track walks you into your calling. gatheringctx.org/formed. See you Sunday at 5. Text STOP to unsubscribe.',
    },
  };

  if (!API_KEY) return { statusCode: 500, body: 'No API key' };

  const results = { sent: 0, errors: 0 };

  for (const [listName, listId] of Object.entries(LISTS)) {
    const sequence = SEQUENCES[listName];
    try {
      const res = await fetch(CS_API + '/lists/' + listId + '/subscribers?limit=200', {
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const subscribers = data?.data || [];
      for (const sub of subscribers) {
        const created = new Date(sub.created_at || sub.subscribed_at);
        const days = Math.floor((Date.now() - created) / 86400000);
        const message = sequence[days];
        if (message && sub.mobile_number) {
          const r = await fetch(CS_API + '/messages', {
            method: 'POST',
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscribers: [{ mobile_number: sub.mobile_number }], message })
          });
          if (r.ok) results.sent++; else results.errors++;
        }
      }
    } catch(e) { results.errors++; }
  }

  return { statusCode: 200, body: JSON.stringify(results) };
};