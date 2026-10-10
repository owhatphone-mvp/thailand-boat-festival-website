// Netlify Function — Phuket Property Expo exhibitor enquiry
// Emails the enquiry to info@propertyexpophuket.com and sends a short acknowledgement to the sender.

const TO = 'info@propertyexpophuket.com';
const FROM = 'Phuket Property Expo <info@propertyexpophuket.com>';

const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    let d = {};
    try { d = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
    if (d.website) return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }; // honeypot

    const name = String(d.name || '').trim().slice(0, 120);
    const company = String(d.company || '').trim().slice(0, 160);
    const email = String(d.email || '').trim().slice(0, 160);
    const phone = String(d.phone || '').trim().slice(0, 60);
    const interest = String(d.interest || '').trim().slice(0, 60);
    const message = String(d.message || '').trim().slice(0, 2000);
    const lang = d.lang === 'th' ? 'th' : 'en';
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'name and a valid email are required' }) };
    }

    const key = process.env.RESEND_API_KEY;
    const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });
    if (!key) {
        console.log('[PPX LEAD]', JSON.stringify({ when, name, company, email, phone, interest, message, lang }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }

    const row = (k, v) => v ? `<tr><td style="padding:6px 0;color:#405254;width:120px;vertical-align:top">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>` : '';
    const internal = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#10272B">
  <div style="background:#10272B;color:#EEF0EC;padding:18px 22px;border-radius:6px 6px 0 0">
    <div style="font-size:12px;letter-spacing:.08em;color:#C9A56A">PHUKET PROPERTY EXPO 2027</div>
    <div style="font-size:18px;margin-top:4px">Exhibitor enquiry</div>
  </div>
  <div style="background:#fff;border:1px solid #CBD3CE;border-top:0;padding:18px 22px;border-radius:0 0 6px 6px">
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${row('Name', name)}${row('Company', company)}
      <tr><td style="padding:6px 0;color:#405254">Email</td><td style="padding:6px 0"><a href="mailto:${esc(email)}" style="color:#1F5C58">${esc(email)}</a></td></tr>
      ${row('Phone', phone)}${row('Interested in', interest)}${row('Message', message)}
      <tr><td style="padding:6px 0;color:#405254">Received</td><td style="padding:6px 0;color:#405254">${when} (Bangkok) · page: ${lang}</td></tr>
    </table>
  </div>
</div>`;

    const ack = lang === 'th'
        ? { subject: 'ได้รับคำขอรายละเอียดการออกบูธ Phuket Property Expo 2027 แล้ว',
            html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#10272B;font-size:16px;line-height:1.7"><p>สวัสดีคุณ${esc(name)}</p><p>เราได้รับคำขอรายละเอียดการออกบูธ Phuket Property Expo 2027 ของคุณแล้ว ทีมงานจะติดต่อกลับพร้อมรายละเอียดและผังบูธภายใน 2 วันทำการ</p><p>งานจัดวันที่ 14–17 มกราคม 2570 เวลา 14:00–21:00 น. ที่ฮอลล์ White House, Boat Lagoon Marina ภูเก็ต ภายในงาน Thailand Boat Festival</p><p>ขอบคุณครับ<br>Phuket Property Expo<br><a href="https://propertyexpophuket.com" style="color:#1F5C58">propertyexpophuket.com</a></p></div>` }
        : { subject: 'Your Phuket Property Expo 2027 exhibitor enquiry',
            html: `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#10272B;font-size:16px;line-height:1.7"><p>Dear ${esc(name)},</p><p>Thank you for your enquiry about exhibiting at Phuket Property Expo 2027. Our team will reply with the exhibitor pack and floor plan within two working days.</p><p>The expo runs 14–17 January 2027, 14:00–21:00 daily, in the White House hall at Boat Lagoon Marina, Phuket, inside Thailand Boat Festival.</p><p>Kind regards,<br>Phuket Property Expo<br><a href="https://propertyexpophuket.com" style="color:#1F5C58">propertyexpophuket.com</a></p></div>` };

    const send = (payload) => fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });

    try {
        const r1 = await send({ from: FROM, to: [TO], reply_to: email, subject: `[PPX exhibitor] ${interest || 'enquiry'} — ${name}${company ? ' · ' + company : ''}`, html: internal });
        if (!r1.ok) { console.error('Resend internal:', await r1.text()); console.log('[PPX LEAD FALLBACK]', JSON.stringify({ when, name, company, email, phone, interest, message })); return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) }; }
        send({ from: FROM, to: [email], subject: ack.subject, html: ack.html }).catch((e) => console.error('Resend ack:', e));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'email' }) };
    } catch (e) {
        console.error(e); console.log('[PPX LEAD FALLBACK]', JSON.stringify({ when, name, company, email, phone, interest, message }));
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, method: 'logged' }) };
    }
}
