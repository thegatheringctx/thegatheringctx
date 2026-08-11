// Netlify Forms -> Supabase bridge.
//
// Netlify calls this function automatically after every VERIFIED form
// submission. Spam-filtered submissions never reach here, which is exactly
// what we want: the Prayer + Care Watch should only ever see real people.
//
// It writes into public.website_submissions, which the watch reads four
// times a day. The table is insert-only for the browser/anon role and
// readable only by the service role, so pastoral data is never public.
//
// Only the two pastoral forms are handled. Every other form on the site
// (subscribe, contact, etc.) is ignored and returns 200 so Netlify does
// not retry.

const SB_URL = process.env.SUPABASE_URL || 'https://ktuapfiexhlladgkuauc.supabase.co';
// Publishable (anon) key. Safe to ship: RLS grants this role INSERT only,
// never SELECT, on website_submissions.
const SB_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Z72fHkjKvEG0QnxdIsHBlg_Q4nLAaN6';

const HANDLED = new Set(['prayer-request', 'connect-card', 'serve-interest', 'contact']);

export const handler = async (event) => {
  let formName = '(unknown)';

  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || body;
    formName = payload.form_name || payload.formName || '(unknown)';

    if (!HANDLED.has(formName)) {
      return { statusCode: 200, body: JSON.stringify({ skipped: formName }) };
    }

    const d = payload.data || {};

    // Belt and braces. Netlify already strips honeypot hits before calling us.
    if (d['bot-field']) {
      return { statusCode: 200, body: JSON.stringify({ skipped: 'honeypot' }) };
    }

    const row = { form_type: formName };
    row.name = d.name || null;
    row.email = d.email || null;
    if (formName === 'prayer-request') {
      row.request = d.request || null;
    } else if (formName === 'serve-interest') {
      row.phone = d.phone || null;
      row.request = d.message || null;   // what they'd like to help with
      row.heard_from = d.interest || null; // area(s) of interest
    } else if (formName === 'contact') {
      row.phone = d.phone || null;
      row.request = d.message || null;   // their message
    } else { // connect-card
      row.phone = d.phone || null;
      row.heard_from = d.heard_from || null;
    }

    const res = await fetch(SB_URL + '/rest/v1/website_submissions', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      // Never log the submission body. It is pastoral data.
      const detail = await res.text().catch(() => '');
      console.error('[submission-created] Supabase insert failed for', formName, res.status, detail);
      return { statusCode: 500, body: JSON.stringify({ error: 'supabase_insert_failed', status: res.status }) };
    }

    console.log('[submission-created] Stored', formName, 'in website_submissions');
    return { statusCode: 200, body: JSON.stringify({ ok: true, form: formName }) };
  } catch (err) {
    console.error('[submission-created] Unhandled error for', formName, err && err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'unhandled' }) };
  }
};
