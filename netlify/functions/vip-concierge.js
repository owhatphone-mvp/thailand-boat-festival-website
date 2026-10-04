// Netlify Function (v2) — VIP Concierge form
// Receives the short post-payment form from VIP Pass holders
// (thailandboatfestival.com/vip-concierge), stores it in Netlify Blobs
// "vip-concierge" and emails the VIP team at info@thailandboatfestival.com.
// Returns ok:true only when the submission was actually stored or emailed,
// so the page never shows a false "sent" message.

import { getStore } from '@netlify/blobs';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n = 600) => String(s ?? '').trim().slice(0, n);

export default async (req) => {
    if (req.method === 'OPTIONS') return new Response('', { status: 200, headers });
    if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

    let d;
    try { d = await req.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

    if (d.website) return json(200, { ok: true }); // honeypot: bots fill hidden field

    const rec = {
        email: clip(d.email, 160).toLowerCase(),
        name: clip(d.name, 120),
        company: clip(d.company, 160),
        position: clip(d.position, 120),
        boats: clip(d.boats, 800),
        viewing: clip(d.viewing, 20),
        days: Array.isArray(d.days) ? d.days.map(x => clip(x, 12)).slice(0, 4) : [],
        consent_network: d.consent_network === true,
        consent_website: d.consent_website === true,
        lang: clip(d.lang, 5),
        submitted_at: new Date().toISOString()
    };
    if (!rec.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rec.email) || !rec.name) {
        return json(400, { ok: false, error: 'Name and a valid email are required' });
    }
    const isTest = d.test === true;

    let stored = false, emailed = false;

    // 1) Store
    try {
        const store = getStore('vip-concierge');
        const key = `${isTest ? 'test' : 'vip'}:${rec.submitted_at}:${rec.email}`;
        await store.setJSON(key, rec);
        stored = true;
    } catch (e) {
        console.error('[VIP CONCIERGE] blob error', e);
    }

    // 2) Email the VIP team (skipped for test submissions)
    const resendKey = process.env.RESEND_API_KEY;
    if (!isTest && resendKey) {
        const ts = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
        const row = (k, v) => v ? `<tr><td style="padding:7px 0;color:#7a8c90;width:150px;vertical-align:top">${k}</td><td style="padding:7px 0">${v}</td></tr>` : '';
        const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto">
  <div style="background:#08222c;padding:18px 22px"><div style="color:#cfb57f;font-size:13px;letter-spacing:.12em">VIP CONCIERGE · TBF 2027</div>
  <div style="color:#f4f6f1;font-size:20px;margin-top:6px">${esc(rec.name)}${rec.company ? ' · ' + esc(rec.company) : ''}</div></div>
  <div style="border:1px solid #dde3e0;border-top:0;padding:16px 22px;font-size:14px;color:#0f252d">
    <table style="width:100%;border-collapse:collapse">
      ${row('Email', `<a href="mailto:${esc(rec.email)}">${esc(rec.email)}</a>`)}
      ${row('Position', esc(rec.position))}
      ${row('Wants a viewing', rec.viewing === 'yes' ? '<b>Yes, please book</b>' : 'Not now')}
      ${row('Boats of interest', esc(rec.boats).replace(/\n/g, '<br>'))}
      ${row('Visiting', esc(rec.days.join(', ')))}
      ${row('Share with VIPs/exhibitors', rec.consent_network ? 'Yes' : 'No')}
      ${row('Show on website', rec.consent_website ? 'Yes' : 'No')}
      ${row('Received', esc(ts) + ' (Bangkok)')}
    </table>
  </div>
</div>`;
        try {
            const r = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'TBF VIP Concierge <sand@thailandboatfestival.com>',
                    to: ['info@thailandboatfestival.com'],
                    reply_to: rec.email,
                    subject: `[TBF VIP] ${rec.viewing === 'yes' ? 'Viewing request' : 'Preferences'} — ${rec.name}${rec.company ? ' · ' + rec.company : ''}`,
                    html
                })
            });
            emailed = r.ok;
            if (!r.ok) console.error('[VIP CONCIERGE] resend', r.status, await r.text());
        } catch (e) {
            console.error('[VIP CONCIERGE] resend error', e);
        }
    }

    console.log('[VIP CONCIERGE]', JSON.stringify({ ...rec, stored, emailed, isTest }));
    if (!stored && !emailed) return json(500, { ok: false, error: 'Could not save your details' });
    return json(200, { ok: true, stored, emailed });
};
