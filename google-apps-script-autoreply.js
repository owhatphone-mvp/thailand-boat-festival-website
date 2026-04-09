/**
 * Thailand Boat Festival 2027 — Auto-Reply Email via Google Apps Script
 *
 * วิธีติดตั้ง:
 * 1. ไปที่ https://script.google.com → New project
 * 2. วาง code นี้ทั้งหมดลงไป (แทนที่ code เดิม)
 * 3. กด Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL ที่ได้ (หน้าตาแบบ https://script.google.com/macros/s/xxxx/exec)
 * 5. ไป Netlify → Site → Forms → register-tbf → Notifications
 *    → Add notification → Outgoing webhook → วาง URL นั้น → Save
 */

// ===== CONFIG =====
var SENDER_NAME  = "Thailand Boat Festival 2027";
var SENDER_EMAIL = "info@thailandboatfestival.com"; // ต้องตั้ง alias ใน Gmail Settings → Send mail as ก่อน
var SUBJECT      = "You're registered — Thailand Boat Festival 2027 🛥️";

// ===== HTML EMAIL TEMPLATE =====
function getEmailHTML(firstname, interest) {
  var greeting = firstname || "Esteemed Guest";

  var interestLine = "";
  if (interest === "Exhibitor") {
    interestLine = "Whether you're planning to exhibit your brand on the water or on land, we look forward to welcoming you as part of the TBF 2027 showcase.";
  } else if (interest === "Sponsor") {
    interestLine = "We look forward to exploring a partnership that puts your brand in front of Southeast Asia's most discerning marine and lifestyle audience.";
  } else {
    interestLine = "We look forward to welcoming you to Boat Lagoon Marina for an unforgettable festival experience.";
  }

  return '<!DOCTYPE html>' +
  '<html lang="en">' +
  '<head><meta charset="UTF-8"></head>' +
  '<body style="margin:0;padding:0;background:#f5f0e8;font-family:\'Georgia\',serif">' +
  '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px">' +
  '<tr><td align="center">' +
  '<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden">' +

  '<!-- Header -->' +
  '<tr>' +
  '  <td style="background:#0a1628;padding:36px 40px 28px;text-align:center">' +
  '    <p style="color:#c9a84c;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 10px;">Thailand Boat Festival 2027</p>' +
  '    <h1 style="color:#ffffff;font-size:26px;font-weight:normal;margin:0;line-height:1.3;">You\'re on the list.</h1>' +
  '  </td>' +
  '</tr>' +

  '<!-- Body -->' +
  '<tr>' +
  '  <td style="padding:36px 40px 0">' +
  '    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 16px">Dear ' + greeting + ',</p>' +
  '    <p style="color:#555;font-size:15px;line-height:1.9;margin:0 0 16px">' +
  '      Thank you for registering your interest in <strong style="color:#0a1628">Thailand Boat Festival 2027</strong>. ' +
  '      We\'ve received your details and are delighted to welcome you into our community.' +
  '    </p>' +
  '    <p style="color:#555;font-size:15px;line-height:1.9;margin:0 0 24px">' + interestLine + '</p>' +
  '  </td>' +
  '</tr>' +

  '<!-- Divider -->' +
  '<tr><td style="padding:0 40px"><div style="border-top:1px solid #e8d48b;"></div></td></tr>' +

  '<!-- Updates list -->' +
  '<tr>' +
  '  <td style="padding:24px 40px 0">' +
  '    <p style="color:#555;font-size:15px;line-height:1.9;margin:0 0 12px">As the festival takes shape, you\'ll be among the first to hear about:</p>' +
  '    <ul style="color:#555;font-size:14px;line-height:2.1;padding-left:1.2em;margin:0 0 24px">' +
  '      <li>Confirmed exhibitors and yacht brands</li>' +
  '      <li>VIP Windward Program details</li>' +
  '      <li>Official dates and early registration opening</li>' +
  '      <li>Exclusive access opportunities</li>' +
  '    </ul>' +
  '    <p style="color:#555;font-size:15px;line-height:1.9;margin:0 0 28px">Until then — stay tuned. The best is yet to come. 🛥️</p>' +
  '  </td>' +
  '</tr>' +

  '<!-- CTA -->' +
  '<tr>' +
  '  <td style="padding:0 40px 32px;text-align:center">' +
  '    <a href="https://fancy-hotteok-f7ad46.netlify.app/ask-sand" ' +
  '       style="display:inline-block;background:#c9a84c;color:#0a1628;text-decoration:none;padding:13px 32px;border-radius:8px;font-family:sans-serif;font-size:14px;font-weight:700;letter-spacing:0.04em">' +
  '      Have questions? Ask Sand AI →' +
  '    </a>' +
  '  </td>' +
  '</tr>' +

  '<!-- Footer -->' +
  '<tr>' +
  '  <td style="background:#f5f0e8;padding:20px 40px;border-top:1px solid #e8e8e8;text-align:center">' +
  '    <p style="color:#aaa;font-size:12px;line-height:1.7;margin:0">' +
  '      Warm regards,<br>' +
  '      <strong style="color:#777">The Thailand Boat Festival Team</strong><br>' +
  '      <a href="mailto:info@thailandboatfestival.com" style="color:#c9a84c;text-decoration:none">info@thailandboatfestival.com</a>' +
  '    </p>' +
  '    <p style="color:#ccc;font-size:11px;margin:10px 0 0">' +
  '      Boat Lagoon Marina, Phuket, Thailand · Organised by M Vision Public Company Limited' +
  '    </p>' +
  '  </td>' +
  '</tr>' +

  '</table>' +
  '</td></tr>' +
  '</table>' +
  '</body></html>';
}

// ===== MAIN: รับ POST จาก Netlify Webhook =====
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Netlify ส่งข้อมูล form ใน payload.data
    var data      = payload.data || {};
    var firstname = data.firstname || "";
    var lastname  = data.lastname  || "";
    var name      = (firstname + " " + lastname).trim() || "Esteemed Guest";
    var email     = data.email    || "";
    var interest  = data.interest || "";

    if (!email) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "No email found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // ส่ง auto-reply email
    GmailApp.sendEmail(
      email,
      SUBJECT,
      "Dear " + (firstname || name) + ",\n\nThank you for registering your interest in Thailand Boat Festival 2027!\nWe've received your details and will keep you updated.\n\nSee you in Phuket — January 2027.\n\nThe Thailand Boat Festival Team\ninfo@thailandboatfestival.com",
      {
        name:     SENDER_NAME,
        from:     SENDER_EMAIL,
        replyTo:  SENDER_EMAIL,
        htmlBody: getEmailHTML(firstname || name, interest)
      }
    );

    Logger.log("Auto-reply sent to: " + email + " (" + name + ")");

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", email: email })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== TEST function =====
function testSendEmail() {
  var testEmail = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(
    testEmail,
    "[TEST] " + SUBJECT,
    "Test email",
    {
      name:     SENDER_NAME,
      from:     SENDER_EMAIL,
      replyTo:  SENDER_EMAIL,
      htmlBody: getEmailHTML("James", "Visitor")
    }
  );
  Logger.log("Test email sent to: " + testEmail);
}
