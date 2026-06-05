// Netlify Function — Report Sand error
// Triggered from sand-admin: admin clicks "Flag" on a wrong Sand reply.
// Emails report to info@thailandboatfestival.com + logs to Blobs for audit trail.

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    let report = {};
    try { report = JSON.parse(event.body); }
    catch (_) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

    const {
        conversationId = '',
        messageIndex = -1,
        sandReply = '',
        comment = '',
        correctAnswer = '',
        reportedBy = 'admin'
    } = report;

    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
    const isoNow    = new Date().toISOString();
    const adminUrl  = `https://admin.thailandboatfestival.com/admin#${encodeURIComponent(conversationId)}`;

    // ─── Best-effort: append to Blobs error log
    try {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('sand-error-reports');
        const key = `report:${isoNow}_${conversationId.slice(0, 16)}`;
        await store.setJSON(key, {
            timestamp: isoNow,
            conversationId,
            messageIndex,
            sandReply: sandReply.slice(0, 4000),
            comment: comment.slice(0, 2000),
            correctAnswer: correctAnswer.slice(0, 2000),
            reportedBy
        });
    } catch (err) { console.warn('Blob log failed:', err.message); }

    // ─── Email report via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.log('[SAND ERROR REPORT — no Resend key, logged only]',
            JSON.stringify({ conversationId, messageIndex, sandReply: sandReply.slice(0,300), comment, correctAnswer }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged-only' }) };
    }

    const html = `
<div style="font-family:-apple-system,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#f8f6f0;border-radius:10px">
  <div style="background:#7a1a1a;padding:18px 22px;border-radius:8px 8px 0 0">
    <h2 style="color:#fff7e6;margin:0;font-size:1.05rem;letter-spacing:0.04em">🚩 SAND ERROR REPORT</h2>
    <div style="color:#f0d090;font-size:0.8rem;margin-top:4px">Sand replied incorrectly — review and update knowledge file</div>
  </div>
  <div style="background:#fff;padding:22px;border:1px solid #e0d8b8;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:0.88rem;margin-bottom:1rem">
      <tr><td style="padding:6px 0;color:#888;width:130px">Conversation</td><td style="padding:6px 0"><a href="${adminUrl}" style="color:#7a1a1a">${conversationId}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888">Message #</td><td style="padding:6px 0">${messageIndex}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Reported</td><td style="padding:6px 0;color:#666;font-size:0.8rem">${timestamp} (Bangkok)</td></tr>
      <tr><td style="padding:6px 0;color:#888">By</td><td style="padding:6px 0">${reportedBy}</td></tr>
    </table>
    <div style="margin-top:14px;padding:14px 16px;background:#fff0f0;border-left:3px solid #c93030;border-radius:4px">
      <div style="font-size:0.76rem;color:#7a1a1a;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">SAND'S WRONG REPLY</div>
      <div style="font-size:0.9rem;line-height:1.55;white-space:pre-wrap">${escapeHtml(sandReply)}</div>
    </div>
    ${comment ? `
    <div style="margin-top:12px;padding:14px 16px;background:#f5edd6;border-left:3px solid #b8902e;border-radius:4px">
      <div style="font-size:0.76rem;color:#8a6d1f;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">REVIEWER COMMENT</div>
      <div style="font-size:0.9rem;line-height:1.55;white-space:pre-wrap">${escapeHtml(comment)}</div>
    </div>` : ''}
    ${correctAnswer ? `
    <div style="margin-top:12px;padding:14px 16px;background:#ecf7ee;border-left:3px solid #2d7a4f;border-radius:4px">
      <div style="font-size:0.76rem;color:#2d7a4f;letter-spacing:0.08em;font-weight:700;margin-bottom:8px">CORRECT ANSWER</div>
      <div style="font-size:0.9rem;line-height:1.55;white-space:pre-wrap">${escapeHtml(correctAnswer)}</div>
    </div>` : ''}
    <div style="margin-top:18px;padding:12px;background:#f5f0e8;border-radius:6px;font-size:0.8rem;color:#666;line-height:1.5">
      <strong>Next steps for the team:</strong><br>
      1. Identify which knowledge file(s) Sand drew from (check console logs from chat function)<br>
      2. Update the relevant <code>knowledge/**/*.md</code> file with the correct information<br>
      3. Mark "Source confidence" or add explicit caveat if status is uncertain<br>
      4. Commit + push → live in 30 seconds
    </div>
  </div>
</div>`;

    try {
        const r = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'Sand Quality Control <sand@thailandboatfestival.com>',
                to: ['info@thailandboatfestival.com', 'owhatphone@gmail.com'],
                subject: `🚩 [Sand Error] ${conversationId.slice(0, 12)}… — msg #${messageIndex}`,
                html
            })
        });
        if (!r.ok) {
            const errText = await r.text();
            console.error('Resend error:', errText);
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged-only', emailError: true }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'email' }) };
    } catch (e) {
        console.error('Email send failed:', e.message);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged-only', emailError: true }) };
    }
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g,
        c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}
