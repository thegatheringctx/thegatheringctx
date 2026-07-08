// Compatibility shim. Do not add storage logic here.
//
// HISTORY: this function used to push each prayer request into MailerLite
// as a subscriber, stuffing the prayer text into the `phone` field capped
// at 200 characters, and inventing an email address when the person left
// theirs blank. That put pastoral content in a marketing list. Removed.
//
// WHO STORES PRAYER REQUESTS NOW: netlify/functions/submission-created.mjs.
// Netlify calls it automatically for every verified form submission and it
// inserts into public.website_submissions, which the Prayer + Care Watch
// reads four times a day.
//
// WHY THIS FILE STILL EXISTS: index.html does not call this endpoint (zero
// references), but a Netlify form notification webhook may still point at
// it. Returning 200 keeps any such webhook healthy. It must NOT insert into
// Supabase: submission-created already does, and a second write here would
// duplicate every prayer request.
//
// If you confirm no webhook targets this path, delete the file.

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Acknowledge without persisting and without logging the request body.
  // Prayer requests are pastoral data and do not belong in function logs.
  console.log('[prayer-request] Received. Storage is handled by submission-created.');

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Prayer request received.',
      stored_by: 'submission-created'
    })
  };
};
