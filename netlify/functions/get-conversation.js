// Public endpoint to restore a conversation by its UUID.
// No admin auth — the UUID itself is the protection (random 36-char string,
// stored only in the user's sessionStorage). This lets a returning visitor
// reload the page and see their chat history, without exposing other users'
// conversations.
//
// Functions v2 syntax — required for Netlify Blobs runtime injection.

import { getStore } from '@netlify/blobs';

const baseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
};

export default async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: baseHeaders });
    if (req.method !== 'GET')     return new Response(JSON.stringify({ error: 'GET only' }), { status: 405, headers: baseHeaders });

    const url = new URL(req.url);
    const id  = url.searchParams.get('id');

    // Strict UUID-shape check — reject anything that doesn't look like our IDs
    if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
        return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400, headers: baseHeaders });
    }

    try {
        const store  = getStore('sand-conversations');
        const record = await store.get(`conv:${id}`, { type: 'json' });
        if (!record) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: baseHeaders });

        // Return ONLY the fields the chat UI needs to redraw history.
        // No internal flags, no admin-only data.
        const slim = {
            id: record.id,
            messages: (record.messages || []).map(m => ({
                role: m.role,
                content: typeof m.content === 'string'
                    ? m.content.replace(/\[LEAD_CARD\][\s\S]*?\[\/LEAD_CARD\]/g, '').trim()
                    : ''
            })),
            lang: record.lang || 'en'
        };
        return new Response(JSON.stringify(slim), { status: 200, headers: baseHeaders });
    } catch (err) {
        console.error('get-conversation error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: baseHeaders });
    }
};

export const config = { path: '/api/get-conversation' };
