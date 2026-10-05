// Netlify Function — personal VIP Pass invitation for likely-VIP registrants.
// Called only by the TBF registration sync (tbf_luma_sync.py) with a shared secret.
// Content is fixed here; callers can only choose recipient, name, language and interest.
// From team@ · reply-to info@ · bcc info@ so every invite and every reply lives in info@.
import crypto from 'node:crypto';

const SECRET_SHA256 = '5d9ab61bb437295524073ef2871a4223ce4e1037573eec9ec4507bebfa0ee688';
const INFO = 'info@thailandboatfestival.com';
const VIP_URL = 'https://thailandboatfestival.com/vip';

const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const T = {
  en: {
    subject: 'Welcome to Thailand Boat Festival 2027',
    hi: n => n ? `Hi ${n},` : 'Hello,',
    intro: 'Thank you for registering for Thailand Boat Festival 2027, 14–17 January at Boat Lagoon Marina, Phuket. Your entry pass with its QR code comes in a separate email from Luma.',
    opener: {
      buy: "You mentioned you're looking at yachts. Tell us which ones, and we'll arrange viewings with the dealers before you arrive. A host will walk you aboard.",
      property: "You mentioned luxury property. The festival brings yachts together with luxury property and lifestyle, and if you'd like to step aboard a few yachts while you're there, we can arrange the viewings for you.",
      cars: "You mentioned luxury cars. The festival brings yachts together with fine cars and lifestyle, and if you'd like to step aboard a few yachts while you're there, we can arrange the viewings for you."
    },
    partOf: 'That is part of our VIP Pass, together with:',
    list: ['Yacht viewings by appointment, arranged with participating dealers', 'VIP Lounge by the water, with hosts', 'Welcome drink, then free-flow beer, wine and soft drinks with light bites', 'VIP entrance, a TBF 2027 VIP gift, and entry all four days'],
    price: 'The VIP Pass is still at its <b>Early Bird price of 3,900 THB (incl. VAT) until 31 December</b>, then 5,500 THB. Passes are limited.',
    btn: 'Get Your VIP Pass',
    reply: "Or simply reply to this email and tell us which yachts you'd like to see. We'll take it from there.",
    sign: 'Warm regards,<br>Thailand Boat Festival team',
    foot: "If this isn't for you, there's no need to reply. We won't send this again."
  },
  th: {
    subject: 'ยินดีต้อนรับสู่ Thailand Boat Festival 2027',
    hi: n => n ? `สวัสดีค่ะคุณ${n}` : 'สวัสดีค่ะ',
    intro: 'ขอบคุณที่ลงทะเบียน Thailand Boat Festival 2027 วันที่ 14–17 มกราคม 2570 ที่ Boat Lagoon Marina ภูเก็ต บัตรเข้างานพร้อม QR code จะส่งถึงคุณแยกอีกฉบับจาก Luma นะคะ',
    opener: {
      buy: 'เห็นว่าคุณกำลังมองหาเรืออยู่ ถ้าบอกเราว่าสนใจลำไหน ทีมงานจะนัดดีลเลอร์ไว้ให้ก่อนวันงาน และพาคุณขึ้นชมถึงเรือค่ะ',
      property: 'เห็นว่าคุณสนใจอสังหาริมทรัพย์หรู ในงานมีทั้งเรือยอชท์ อสังหาฯ และไลฟ์สไตล์หรูอยู่ด้วยกัน ถ้าอยากขึ้นชมเรือสักลำระหว่างเดินงาน ทีมงานนัดให้ได้ค่ะ',
      cars: 'เห็นว่าคุณสนใจรถยนต์หรู ในงานมีทั้งเรือยอชท์ รถหรู และไลฟ์สไตล์อยู่ด้วยกัน ถ้าอยากขึ้นชมเรือสักลำระหว่างเดินงาน ทีมงานนัดให้ได้ค่ะ'
    },
    partOf: 'บริการนี้อยู่ในบัตร VIP ซึ่งมี:',
    list: ['นัดหมายขึ้นชมเรือล่วงหน้า ประสานกับดีลเลอร์ที่ร่วมโครงการ', 'VIP Lounge ริมน้ำ พร้อมทีมงานดูแล', 'Welcome drink และ free-flow เบียร์ ไวน์ ซอฟต์ดริงก์ พร้อมของว่าง', 'ทางเข้า VIP ของที่ระลึก VIP TBF 2027 และเข้างานได้ทั้ง 4 วัน'],
    price: 'ตอนนี้บัตร VIP ยังเป็น<b>ราคา Early Bird 3,900 บาท (รวม VAT) ถึง 31 ธ.ค. นี้</b> จากนั้น 5,500 บาท จำนวนจำกัด',
    btn: 'ซื้อบัตร VIP',
    reply: 'หรือตอบกลับอีเมลนี้ บอกเราว่าอยากชมเรือแบบไหน ทีมงานจะดูแลต่อให้ค่ะ',
    sign: 'ด้วยความยินดี<br>ทีมงาน Thailand Boat Festival',
    foot: 'ถ้ายังไม่สนใจ ไม่ต้องตอบกลับนะคะ เราจะไม่ส่งซ้ำ'
  }
};

function render(t, name, interest) {
  const p = s => `<p style="margin:0 0 14px;line-height:1.6">${s}</p>`;
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2433;font-size:15px">
  <div style="background:#0a1628;padding:18px 24px;border-radius:8px 8px 0 0;color:#c9a84c;font-weight:700;letter-spacing:.06em">THAILAND BOAT FESTIVAL 2027</div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
    ${p(esc(t.hi(name)))}${p(t.intro)}${p(t.opener[interest])}${p(t.partOf)}
    <ul style="margin:0 0 16px;padding-left:20px;line-height:1.7">${t.list.map(i => `<li>${i}</li>`).join('')}</ul>
    ${p(t.price)}
    <p style="margin:18px 0"><a href="${VIP_URL}" style="background:#c9a84c;color:#0a1628;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:6px;display:inline-block">${t.btn}</a></p>
    ${p(t.reply)}${p(t.sign)}
    <p style="margin:18px 0 0;font-size:12px;color:#8a94a3">${t.foot}</p>
  </div></div>`;
}

export async function handler(event) {
  const h = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: '{"error":"method"}' };
  const given = event.headers['x-vip-invite-secret'] || '';
  const hash = crypto.createHash('sha256').update(given).digest('hex');
  if (!given || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(SECRET_SHA256))) return { statusCode: 401, headers: h, body: '{"error":"auth"}' };
  let b; try { b = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers: h, body: '{"error":"json"}' }; }
  const email = String(b.email || '').trim();
  const lang = b.lang === 'th' ? 'th' : 'en';
  const interest = ['buy', 'property', 'cars'].includes(b.interest) ? b.interest : 'buy';
  const name = String(b.name || '').trim().slice(0, 60);
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) return { statusCode: 400, headers: h, body: '{"error":"email"}' };
  const key = process.env.RESEND_API_KEY;
  if (!key) return { statusCode: 500, headers: h, body: '{"error":"no mail key"}' };
  const t = T[lang];
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Thailand Boat Festival <team@thailandboatfestival.com>',
      to: [email], bcc: [INFO], reply_to: INFO,
      subject: t.subject, html: render(t, name, interest)
    })
  });
  const txt = await r.text();
  return { statusCode: r.ok ? 200 : 502, headers: h, body: JSON.stringify({ ok: r.ok, resend: txt.slice(0, 300) }) };
}
