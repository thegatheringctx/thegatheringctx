const ML_API = "https://connect.mailerlite.com/api";

// Email sequences
const SEQUENCES = {
  "new-here": [
    {
      subject: "Hey, you found it.",
      delay_hours: 0,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;padding:40px 24px;">
        <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#b8935a;margin-bottom:24px">THE GATHERING CTX</p>
        <h1 style="font-size:2rem;font-weight:300;margin-bottom:24px;line-height:1.2">Hey, you found it.</h1>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">We are genuinely glad you are here.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">The Gathering CTX meets every Sunday at 5:00 PM at the Cleburne Conference Center, 1501 W Henderson St, Cleburne, TX 76033.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">Here is what Sunday looks like: We open at 4:30, start at 5:00, and you will be out by about 6:30. Dress however you want. Bring your kids -- we have ministry for every age. And come expecting God to move.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:32px">We are not a program. We are a family on mission. And there is a seat at the table for you.</p>
        <a href="https://gatheringctx.org/visit" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 28px;font-family:sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase">Plan Your Visit</a>
        <p style="margin-top:40px;font-size:0.85rem;color:#888;line-height:1.6">Pastor Billy Philips<br>The Gathering CTX<br>Cleburne, Texas</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
        <p style="font-size:0.75rem;color:#aaa;line-height:1.6">The Gathering CTX &middot; 1501 W Henderson St, Cleburne TX 76033 &middot; (682) 286-5640<br>
        <a href="{{unsubscribe}}" style="color:#aaa">Unsubscribe</a></p>
      </div>`
    },
    {
      subject: "What happens when you walk through the door",
      delay_hours: 72,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;padding:40px 24px;">
        <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#b8935a;margin-bottom:24px">THE GATHERING CTX</p>
        <h1 style="font-size:2rem;font-weight:300;margin-bottom:24px;line-height:1.2">What happens when you walk through the door.</h1>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">We know that first Sunday can feel like a lot. So here is exactly what to expect.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px"><strong>4:30 PM</strong> -- Doors open. People are gathering, talking, finding seats. Nobody will attack you with a visitor card. Just find a seat and settle in.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px"><strong>5:00 PM</strong> -- We start with worship. Live music. Real. You do not need to know the songs.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px"><strong>Then</strong> -- We open the Bible and preach through it. Verse by verse, book by book. You can follow along or just listen.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:32px"><strong>6:30 PM</strong> -- We close in prayer and people hang around. That part is worth staying for.</p>
        <a href="https://gatheringctx.org/what-to-expect" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 28px;font-family:sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase">More FAQs</a>
        <p style="margin-top:40px;font-size:0.85rem;color:#888">Pastor Billy<br>The Gathering CTX</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
        <p style="font-size:0.75rem;color:#aaa">The Gathering CTX &middot; <a href="{{unsubscribe}}" style="color:#aaa">Unsubscribe</a></p>
      </div>`
    },
    {
      subject: "Your next step",
      delay_hours: 168,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;padding:40px 24px;">
        <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#b8935a;margin-bottom:24px">THE GATHERING CTX</p>
        <h1 style="font-size:2rem;font-weight:300;margin-bottom:24px;line-height:1.2">Your next step.</h1>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">We exist to make disciples who are confident and empowered to make disciples. That means we are not trying to build a crowd -- we are building a family on mission.</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:16px">When you are ready, here are the three on-ramps into the life of The Gathering:</p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:8px"><strong>Belong &amp; Become</strong> -- Our community groups. Where real life happens. <a href="https://gatheringctx.org/belong" style="color:#b8935a">Learn more</a></p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:8px"><strong>Formed &amp; Sent</strong> -- Our discipleship track. Where you are equipped and deployed. <a href="https://gatheringctx.org/formed" style="color:#b8935a">Learn more</a></p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:32px"><strong>Small Gatherings</strong> -- Midweek connection. Smaller, deeper, more personal. <a href="https://gatheringctx.org/small-gatherings" style="color:#b8935a">Learn more</a></p>
        <p style="font-size:1rem;line-height:1.8;margin-bottom:32px">No rush. No pressure. Just a door that is always open.</p>
        <a href="https://gatheringctx.org/visit" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:14px 28px;font-family:sans-serif;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase">See You Sunday</a>
        <p style="margin-top:40px;font-size:0.85rem;color:#888">Pastor Billy<br>The Gathering CTX</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
        <p style="font-size:0.75rem;color:#aaa">The Gathering CTX &middot; <a href="{{unsubscribe}}" style="color:#aaa">Unsubscribe</a></p>
      </div>`
    }
  ]
};

export const handler = async (event) => {
  // Webhook called by MailerLite automation when subscriber joins New Here group
  // Or called manually with { type, email, step }
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*" } };
  }

  const body = JSON.parse(event.body || "{}");
  const { type = "new-here", step = 0, email } = body;
  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) return { statusCode: 500, body: "No API key" };

  const sequence = SEQUENCES[type];
  if (!sequence || !sequence[step]) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid type or step" }) };
  }

  const msg = sequence[step];

  // Create and immediately schedule campaign
  const campRes = await fetch(`${ML_API}/campaigns`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Welcome ${type} step ${step} - ${new Date().toISOString().split("T")[0]}`,
      type: "regular",
      emails: [{
        subject: msg.subject,
        from_name: "Pastor Billy | The Gathering CTX",
        from: "info@gatheringctx.org",
        content: msg.html,
      }],
    }),
  });

  const camp = await campRes.json();
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, campaign_id: camp.data?.id, step, subject: msg.subject }),
  };
};