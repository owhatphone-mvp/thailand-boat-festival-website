# TBF Website — Setup Notes
_อัปเดตล่าสุด: 29 มี.ค. 2569_

---

## 🌐 URLs

| ชื่อ | URL |
|------|-----|
| Website (live) | https://boatfestival.netlify.app |
| Netlify Dashboard | https://app.netlify.com/projects/boatfestival |
| Google Apps Script | https://script.google.com/macros/s/AKfycbyTyVLqUCB61xZQVtIcljWKCPyc9m3eeTCvwnq0DzuZ4UusxNuT1EdcQpGkDmQW-pyCTg/exec |

---

## ✅ ระบบ Auto-Reply Email (Register Form)

### สถาปัตยกรรม
```
ผู้ใช้กรอกฟอร์ม
  → Netlify Forms รับข้อมูล (form name: "register-tbf")
  → Netlify Webhook ส่ง POST → Google Apps Script
  → Apps Script ส่ง HTML email auto-reply ให้ผู้ลงทะเบียน
```

### ไม่ใช้ Resend/API key ใดๆ — ฟรีทั้งหมด ✅

### Netlify Forms
- Form name: `register-tbf`
- Fields: firstname, lastname, email, interest, phone
- Form detection: Enabled
- Webhook: POST → Apps Script URL ด้านบน

### Google Apps Script
- ไฟล์: `google-apps-script-autoreply.js` (อ้างอิงเท่านั้น — code จริงอยู่ใน Apps Script cloud)
- ส่ง email จาก: `owhatphone@gmail.com` (หรือ `info@thailandboatfestival.com` เมื่อ alias ตั้งเสร็จ)
- รับข้อมูลจาก Netlify webhook JSON: `payload.data.firstname`, `payload.data.email` ฯลฯ

---

## 📧 Gmail Alias (กำลังดำเนินการ)

**เป้าหมาย:** ส่ง auto-reply จาก `info@thailandboatfestival.com` แทน Gmail ส่วนตัว

**สถานะ:** ⏳ รอใส่ password

**วิธีทำต่อ:**
1. เปิด Gmail → Settings → Accounts and Import
2. ใต้ "Send mail as" → Add another email address
3. หน้า SMTP ใส่:
   - SMTP Server: `smtp.gmail.com`
   - Port: `587`
   - Username: `info@thailandboatfestival.com`
   - **Password: ใส่ password ของ `info@` (Google Workspace)**
   - TLS: checked
4. กด **Add Account »**
5. Google ส่ง verification email → คลิก link ยืนยัน

> ⚠️ ถ้า 2FA เปิดอยู่ ต้องสร้าง App Password แทน:
> Google Account → Security → App Passwords → สร้างใหม่สำหรับ "Mail"

---

## 📁 ไฟล์ในโปรเจค

| ไฟล์ | คำอธิบาย |
|------|----------|
| `index.html` | หน้าหลักเว็บ TBF (46 KB) |
| `google-apps-script-autoreply.js` | source code ของ Apps Script (reference copy) |
| `netlify.toml` | config Netlify (redirects, headers, functions) |
| `netlify/functions/register.js` | Netlify Function เดิม (Resend) — ไม่ได้ใช้แล้ว |
| `netlify/functions/chat.js` | AI chat function |
| `ask-sand.html` | หน้า sandbox/test |

---

## 📝 การเปลี่ยนแปลงที่ทำในเซสชันนี้

1. **ตัด stats bar** — ลบส่วนที่โชว์ตัวเลข (Attendees, VIP, etc.) ออกจาก index.html
2. **แก้ฟอร์ม Register** — เปลี่ยนจาก Resend API เป็น Netlify Forms (`data-netlify="true"`, `form-name` hidden input, AJAX submit)
3. **สร้าง Apps Script** — deploy auto-reply email script บน Google Apps Script
4. **ตั้ง Netlify webhook** — Form submission → Apps Script
5. **เริ่ม Gmail alias** — ใส่ข้อมูล `info@thailandboatfestival.com` แล้ว รอแค่ password

---

## 🔑 Netlify Personal Access Token

- Token name: `deploy-tbf`
- สร้างเมื่อ: 29 มี.ค. 2569
- หมดอายุ: 4 เม.ย. 2569
- ใช้สำหรับ: deploy ผ่าน CLI หากต้องการ
