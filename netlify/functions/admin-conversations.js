// Admin API for the Sand AI conversation dashboard.
// Functions v2 syntax (export default + Web Request/Response) — required so Netlify
// auto-injects the Blobs runtime context. Functions v1 returns MissingBlobsEnvironment.
//
// Auth: every request must carry `x-admin-password: <ADMIN_PASSWORD>` matching the
// Netlify env var. The frontend (sand-admin.html) sets this header after a local
// password gate. Password is intentionally simple — this is a soft-gate, not a real
// authn system. Conversations contain no payment data; LEAD info is also emailed to
// the team via send-lead.js.
//
// Storage: Netlify Blobs store "sand-conversations", keys "conv:{uuid}".
// Retention: 90 days; older entries are filtered out at the list endpoint
// (we don't actively delete — Blobs persists them, but they're hidden from UI).
//
// Endpoints:
//   GET    /.netlify/functions/admin-conversations?action=list
//   GET    /.netlify/functions/admin-conversations?action=get&id={uuid}
//   DELETE /.netlify/functions/admin-conversations?action=delete&id={uuid}

import { getStore } from '@netlify/blobs';

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
};

function json(status, body) {
    return new Response(JSON.stringify(body), { status, headers: baseHeaders });
}

export default async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: baseHeaders });

    // ─── Auth ───
    // Two paths accepted:
    //  1. HTTP Basic Auth (preferred — set up via the admin-auth edge function on
    //     admin.thailandboatfestival.com). Edge function blocks bad creds before they
    //     reach here, but we still verify in case someone hits the function URL directly.
    //  2. Legacy x-admin-password header (kept for compatibility with the old JS gate).
    const expectedPass = process.env.ADMIN_PASSWORD || '';
    const expectedUser = process.env.ADMIN_USER     || 'admin';
    if (!expectedPass) return json(500, { error: 'ADMIN_PASSWORD not configured on server' });

    const basic   = req.headers.get('authorization') || '';
    const xHeader = req.headers.get('x-admin-password') || '';
    let ok = false;
    if (basic.startsWith('Basic ')) {
        try {
            const decoded = atob(basic.slice(6));
            const idx = decoded.indexOf(':');
            const user = idx >= 0 ? decoded.slice(0, idx) : '';
            const pass = idx >= 0 ? decoded.slice(idx + 1) : decoded;
            if (user === expectedUser && pass === expectedPass) ok = true;
        } catch (_) {}
    }
    if (!ok && xHeader === expectedPass) ok = true;
    if (!ok) return json(401, { error: 'Unauthorized' });

    const url = new URL(req.url);
    const action = (url.searchParams.get('action') || 'list').toLowerCase();
    const id = url.searchParams.get('id');

    let store;
    try {
        store = getStore('sand-conversations');
    } catch (err) {
        return json(500, { error: 'Blobs unavailable: ' + err.message });
    }

    try {
        if (action === 'list') {
            const cutoff = Date.now() - RETENTION_MS;
            const { blobs } = await store.list({ prefix: 'conv:' });
            const records = await Promise.all(
                (blobs || []).map(async b => {
                    try {
                        const r = await store.get(b.key, { type: 'json' });
                        if (!r) return null;
                        const lastTs = new Date(r.lastActivity || r.createdAt || 0).getTime();
                        if (lastTs < cutoff) return null;
                        // Slim summary for list view
                        const firstUser = (r.messages || []).find(m => m.role === 'user');
                        return {
                            id: r.id || b.key.replace(/^conv:/, ''),
                            createdAt: r.createdAt,
                            lastActivity: r.lastActivity,
                            status: r.status || 'active',
                            lang: r.lang || 'en',
                            messageCount: r.messageCount || (r.messages || []).length,
                            firstMessage: firstUser?.content?.slice(0, 200) || '',
                            name: r.lead?.name || '',
                            company: r.lead?.company || '',
                            email: r.lead?.email || ''
                        };
                    } catch (_) {
                        return null;
                    }
                })
            );
            const list = records
                .filter(Boolean)
                .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            return json(200, { count: list.length, conversations: list });
        }

        if (action === 'get') {
            if (!id) return json(400, { error: 'Missing id' });
            const r = await store.get(`conv:${id}`, { type: 'json' });
            if (!r) return json(404, { error: 'Not found' });
            return json(200, r);
        }

        if (action === 'delete') {
            if (req.method !== 'DELETE') return json(405, { error: 'DELETE required' });
            if (!id) return json(400, { error: 'Missing id' });
            await store.delete(`conv:${id}`);
            return json(200, { ok: true, deleted: id });
        }

        return json(400, { error: 'Unknown action: ' + action });
    } catch (err) {
        console.error('admin-conversations error:', err);
        return json(500, { error: err.message });
    }
};

export const config = { path: '/api/admin-conversations' };
