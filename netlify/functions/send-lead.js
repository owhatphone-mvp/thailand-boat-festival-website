// Netlify Function — Send TBF Lead to team email
// Receives confirmed lead from Sand AI and emails info@thailandboatfestival.com

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    let lead = {};
    try {
        lead = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const {
        name = '', email = '', company = '', interest = '', note = '',
        package: pkg = '', cash = '', barter = '', barter_value = '', barter_pct = '', status = ''
    } = lead;
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });

    const siteUrl = process.env.URL || 'https://boatfestival.netlify.app';

    // Fire-and-forget save to Netlify Forms (hidden <form name="sand-leads"> in index.html)
    try {
        const formBody = new URLSearchParams({
            'form-name': 'sand-leads',
            name, email, company, interest, note, timestamp,
            package: pkg, cash, barter, barter_value, barter_pct, status,
            source: 'sand-ai',
            'bot-field': ''
        }).toString();
        fetch(siteUrl + '/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody
        }).then(r => { if (!r.ok) console.error('Netlify Forms non-200:', r.status); })
          .catch(err => console.error('Netlify Forms error:', err));
    } catch (err) { console.error('Netlify Forms threw:', err); }

    // ─── Send via Resend API (set RESEND_API_KEY in Netlify env vars) ───
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.log('[TBF LEAD]', JSON.stringify({ timestamp, name, email, company, interest, note, pkg, cash, barter, barter_value, barter_pct, status }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }

    // Deal-structure box only when commercial fields present
    const hasDeal = !!(pkg || cash || barter || barter_value);
    const dealSection = hasDeal ? `
    <div style="margin-top:14px;padding:14px 16px;background:#fff7e6;border-left:3px solid #c9a84c;border-radius:4px">
      <div style="font-size:0.78rem;color:#8a6d1f;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">DEAL STRUCTURE</div>
      <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
        ${pkg          ? `<tr><td style="padding:4px 0;color:#999;width:110px">Package</td><td style="padding:4px 0;font-weight:600">${pkg}</td></tr>` : ''}
        ${cash         ? `<tr><td style="padding:4px 0;color:#999">Cash</td><td style="padding:4px 0">THB ${cash}</td></tr>` : ''}
        ${barter       ? `<tr><td style="padding:4px 0;color:#999;vertical-align:top">Barter</td><td style="padding:4px 0">${barter}</td></tr>` : ''}
        ${barter_value ? `<tr><td style="padding:4px 0;color:#999">Barter value</td><td style="padding:4px 0">THB ${barter_value}${barter_pct ? ` (${barter_pct}%)` : ''}</td></tr>` : ''}
        ${status       ? `<tr><td style="padding:4px 0;color:#999">Status</td><td style="padding:4px 0">${status}</td></tr>` : ''}
      </table>
    </div>` : '';

    const emailBody = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:10px">
  <div style="background:#0a1628;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#c9a84c;margin:0;font-size:1.1rem;letter-spacing:0.05em">🛥️ NEW LEAD — Thailand Boat Festival 2027</h2>
  </div>
  <div style="background:#fff;padding:20px 24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <tr><td style="padding:8px 0;color:#999;width:110px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
      ${company ? `<tr><td style="padding:8px 0;color:#999">Company</td><td style="padding:8px 0">${company}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#0a1628">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#999">Interest</td><td style="padding:8px 0"><strong>${interest}</strong></td></tr>
      ${note ? `<tr><td style="padding:8px 0;color:#999;vertical-align:top">Note</td><td style="padding:8px 0">${note}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#999">Time</td><td style="padding:8px 0;color:#aaa;font-size:0.82rem">${timestamp} (Bangkok)</td></tr>
    </table>
    ${dealSection}
    <div style="margin-top:16px;padding:12px;background:#f5f0e8;border-radius:6px;font-size:0.82rem;color:#666">
      Lead collected via <strong>Sand AI Concierge</strong> — thailandboatfestival.com/ask-sand
    </div>
  </div>
</div>`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Sand AI <sand@thailandboatfestival.com>',
                to: ['info@thailandboatfestival.com'],
                subject: `[TBF Lead] ${interest} — ${name}${company ? ' · ' + company : ''}`,
                html: emailBody
            })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('Resend error:', err);
            // Still log the lead so it's not lost
            console.log('[TBF LEAD FALLBACK]', JSON.stringify({ timestamp, name, email, company, interest, note }));
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'email' }) };
    } catch (e) {
        console.log('[TBF LEAD FALLBACK]', JSON.stringify({ timestamp, name, email, company, interest, note }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }
}
