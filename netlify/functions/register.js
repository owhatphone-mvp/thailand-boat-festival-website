// Netlify Function — TBF 2027 Registration Form
// Sends 2 emails: (1) team notification, (2) auto-reply to registrant
// Requires RESEND_API_KEY env var

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    let body = {};
    try { body = JSON.parse(event.body); } catch(e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { firstname = '', lastname = '', email = '', interest = '', phone = '' } = body;
    const fullName  = `${firstname} ${lastname}`.trim();
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.log('[TBF REGISTER]', JSON.stringify({ timestamp, fullName, email, interest, phone }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }

    // ─── EMAIL 1: Team Notification ───────────────────────────────────────
    const teamEmail = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:10px">
  <div style="background:#0a1628;padding:20px 24px;border-radius:8px 8px 0 0">
    <h2 style="color:#c9a84c;margin:0;font-size:1.05rem;letter-spacing:0.05em">🛥️ NEW REGISTRATION — Thailand Boat Festival 2027</h2>
  </div>
  <div style="background:#fff;padding:20px 24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
      <tr><td style="padding:8px 0;color:#999;width:110px">Name</td>      <td style="padding:8px 0;font-weight:600">${fullName}</td></tr>
      <tr><td style="padding:8px 0;color:#999">Email</td>     <td style="padding:8px 0"><a href="mailto:${email}" style="color:#0a1628">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#999">Interest</td>  <td style="padding:8px 0"><strong>${interest}</strong></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#999">Phone</td><td style="padding:8px 0">${phone}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#999">Registered</td><td style="padding:8px 0;color:#aaa;font-size:0.82rem">${timestamp} (Bangkok)</td></tr>
    </table>
    <div style="margin-top:16px;padding:12px;background:#f5f0e8;border-radius:6px;font-size:0.82rem;color:#666">
      Submitted via <strong>Registration Form</strong> — thailandboatfestival.com/#register
    </div>
  </div>
</div>`;

    // ─── EMAIL 2: Auto-Reply to Registrant ────────────────────────────────
    const autoReply = `
<div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#ffffff;">

  <!-- Header -->
  <div style="background:#0a1628;padding:32px 40px;text-align:center;">
    <p style="color:#c9a84c;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 8px;">Thailand Boat Festival 2027</p>
    <h1 style="color:#ffffff;font-size:1.6rem;font-weight:normal;margin:0;line-height:1.3;">You're on the list.</h1>
  </div>

  <!-- Body -->
  <div style="padding:40px 40px 32px;border:1px solid #e8e8e8;border-top:none;">
    <p style="color:#333;font-size:1rem;line-height:1.8;margin-bottom:1.2em;">
      Dear ${firstname || fullName},
    </p>
    <p style="color:#555;font-size:0.95rem;line-height:1.9;margin-bottom:1.2em;">
      Thank you for registering your interest in <strong style="color:#0a1628">Thailand Boat Festival 2027</strong>.
      We've received your details and are delighted to welcome you into our community.
    </p>
    <p style="color:#555;font-size:0.95rem;line-height:1.9;margin-bottom:1.2em;">
      Whether you'll be joining us as ${interest === 'Exhibitor' ? 'an exhibitor on the water' : interest === 'Sponsor' ? 'a valued partner' : 'a guest'}, we look forward to welcoming you to
      <strong style="color:#0a1628">Boat Lagoon Marina, Phuket</strong> — in January 2027.
    </p>

    <!-- Divider -->
    <div style="border-top:1px solid #e8d48b;margin:28px 0;"></div>

    <p style="color:#555;font-size:0.95rem;line-height:1.9;margin-bottom:1.2em;">
      As the festival takes shape, you'll be among the first to hear about:
    </p>
    <ul style="color:#555;font-size:0.9rem;line-height:2;padding-left:1.2em;margin-bottom:1.5em;">
      <li>Confirmed exhibitors and yacht brands</li>
      <li>VIP Windward Program details</li>
      <li>Official dates and registration opening</li>
      <li>Exclusive early access opportunities</li>
    </ul>

    <p style="color:#555;font-size:0.95rem;line-height:1.9;margin-bottom:2em;">
      Until then — stay tuned. The best is yet to come. 🛥️
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:2em;">
      <a href="https://fancy-hotteok-f7ad46.netlify.app/ask-sand"
         style="display:inline-block;padding:12px 32px;background:#c9a84c;color:#0a1628;text-decoration:none;border-radius:8px;font-family:sans-serif;font-size:0.88rem;font-weight:700;letter-spacing:0.04em;">
        Have questions? Ask Sand AI →
      </a>
    </div>

    <p style="color:#999;font-size:0.82rem;line-height:1.7;text-align:center;">
      Warm regards,<br>
      <strong style="color:#555;">The Thailand Boat Festival Team</strong><br>
      <a href="mailto:info@thailandboatfestival.com" style="color:#c9a84c;text-decoration:none;">info@thailandboatfestival.com</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f5f0e8;padding:16px 40px;text-align:center;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 6px 6px;">
    <p style="color:#aaa;font-size:0.72rem;margin:0;">
      Thailand Boat Festival · Boat Lagoon Marina, Phuket, Thailand<br>
      Organised by M Vision Public Company Limited
    </p>
  </div>

</div>`;

    // ─── Send both emails ──────────────────────────────────────────────────
    const fromAddr = 'Info TBF <info@thailandboatfestival.com>';

    try {
        await Promise.all([
            // 1. Team notification
            fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: fromAddr,
                    to: ['info@thailandboatfestival.com'],
                    subject: `[TBF Registration] ${interest} — ${fullName}`,
                    html: teamEmail
                })
            }),
            // 2. Auto-reply to registrant
            fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: fromAddr,
                    to: [email],
                    reply_to: 'info@thailandboatfestival.com',
                    subject: `You're registered — Thailand Boat Festival 2027`,
                    html: autoReply
                })
            })
        ]);

        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch(err) {
        console.log('[TBF REGISTER FALLBACK]', JSON.stringify({ timestamp, fullName, email, interest, phone }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }
}
