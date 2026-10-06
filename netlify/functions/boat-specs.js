// Netlify Function (v2) — Boat spec lookup for the Berth finder
// POST /api/boat-specs  { q: "Azimut 68" }
// Looks up LOA / beam / draft / hull type for a named boat model using
// Anthropic Claude with web search, and caches answers in Netlify Blobs
// ("boat-specs") so repeat lookups are instant and free.
// Returns { ok, found, brand, model, hull, loa_m, beam_m, draft_m, source, cached }.
// Numbers are always metres; the page converts to feet when needed.

import { getStore } from '@netlify/blobs';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

const norm = (s) => String(s || '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}.\- ]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
const num = (v, lo, hi) => { const n = typeof v === 'string' ? parseFloat(v) : v; return (typeof n === 'number' && isFinite(n) && n >= lo && n <= hi) ? Math.round(n * 100) / 100 : null; };

const SYSTEM = `You look up the published dimensions of a named boat or yacht model for a marina berth-planning tool.
Use web search. Prefer the builder's official specification page; otherwise a reputable broker, dealer or boat-review listing.
Return ONLY one JSON object, no prose, no code fences:
{"found":true|false,"brand":"","model":"","hull":"mono"|"cat","loa_m":number,"beam_m":number,"draft_m":number,"source":"https://..."}
Rules:
- All lengths in metres (convert from feet if needed: 1 ft = 0.3048 m). loa_m is length overall (LOA), including platforms if the builder's LOA includes them.
- hull is "cat" for catamarans (sail or power), otherwise "mono".
- If the model has several versions, use the most common current version and the maximum draft.
- If you cannot identify the model with confidence, or cannot find at least LOA and beam, return {"found":false}.
- Never guess numbers.`;

export default async (req) => {
    if (req.method === 'OPTIONS') return new Response('', { status: 200, headers });
    if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

    let d;
    try { d = await req.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
    const q = norm(d.q);
    if (q.length < 3 || !/\p{L}/u.test(q)) return json(400, { ok: false, error: 'Please enter a brand and model' });

    let store = null;
    try { store = getStore('boat-specs'); } catch (e) { console.error('[BOAT SPECS] blobs', e); }

    // 1) Cache
    if (store) {
        try {
            const hit = await store.get('q:' + q, { type: 'json' });
            if (hit) return json(200, { ok: true, cached: true, ...hit });
        } catch (e) { console.error('[BOAT SPECS] cache read', e); }
    }

    // 2) Light rate limit per IP (30 new lookups per hour)
    const ip = (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (store) {
        try {
            const hour = new Date().toISOString().slice(0, 13);
            const key = `rl:${hour}:${ip}`;
            const n = (await store.get(key, { type: 'json' })) || 0;
            if (n >= 30) return json(429, { ok: false, error: 'Too many lookups, please try again later' });
            await store.setJSON(key, n + 1);
        } catch (e) { console.error('[BOAT SPECS] rate limit', e); }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return json(500, { ok: false, error: 'Lookup unavailable' });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 22000);
    let out;
    try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
                model: 'claude-sonnet-5-5',
                max_tokens: 600,
                system: SYSTEM,
                tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
                messages: [{ role: 'user', content: `Boat model: ${q}` }]
            }),
            signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!r.ok) { console.error('[BOAT SPECS] anthropic', r.status, (await r.text()).slice(0, 300)); return json(502, { ok: false, error: 'Lookup failed' }); }
        const data = await r.json();
        const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
        const m = text.match(/\{[\s\S]*\}/g);
        out = m ? JSON.parse(m[m.length - 1]) : { found: false };
    } catch (e) {
        clearTimeout(timer);
        console.error('[BOAT SPECS] error', e.name, e.message);
        return json(504, { ok: false, error: e.name === 'AbortError' ? 'Lookup timed out' : 'Lookup failed' });
    }

    const res = {
        found: out.found === true,
        brand: String(out.brand || '').slice(0, 60),
        model: String(out.model || '').slice(0, 80),
        hull: out.hull === 'cat' ? 'cat' : 'mono',
        loa_m: num(out.loa_m, 3, 120),
        beam_m: num(out.beam_m, 1, 30),
        draft_m: num(out.draft_m, 0.2, 8),
        source: /^https?:\/\//.test(out.source || '') ? String(out.source).slice(0, 300) : ''
    };
    if (!res.loa_m) res.found = false;
    if (!res.found) { res.loa_m = res.beam_m = res.draft_m = null; }

    if (store && res.found) {
        try { await store.setJSON('q:' + q, { ...res, looked_up_at: new Date().toISOString() }); }
        catch (e) { console.error('[BOAT SPECS] cache write', e); }
    }
    console.log('[BOAT SPECS]', q, JSON.stringify(res));
    return json(200, { ok: true, cached: false, ...res });
};
