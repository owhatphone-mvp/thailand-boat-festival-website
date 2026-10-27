"""Build the v5 'sales gallery' Phuket Property Expo pages, EN + TH.
Reuses the EN/TH strings from build_v3.py and adds the v5 keys.
Usage: python3 -I build_v5.py <REPO> <SP> <BASE> [ROBOTS]"""
import sys, os
REPO, SP, BASE = sys.argv[1], sys.argv[2], sys.argv[3]
ROBOTS = sys.argv[4] if len(sys.argv) > 4 else 'noindex,follow'

src = open(os.path.join(SP, 'build_v3.py'), encoding='utf-8').read()
src = src.split('\nfor d, sub in')[0]
ns = {'sys': sys, 'os': os, '__name__': 'v3strings'}
_argv = sys.argv
sys.argv = ['build_v3.py', REPO, SP, BASE, ROBOTS]
exec(compile(src, 'build_v3.py', 'exec'), ns)
sys.argv = _argv
EN, TH = ns['EN'], ns['TH']

EN.update(
  skip='Skip to content', fk_preload='latin',
  ed='1st Edition', n_visit2='Visit', n_exhibit='Exhibit', n_brokers='Brokers',
  f4t='Entry', f4s='Free with Early Bird registration', illus='Illustrative model.',
  door_v_h='Visit', door_v_s='Register free · Early Bird until 30 November',
  door_e_h='Exhibit', door_e_s='Book a booth · 32 modules of 3 × 3 m',
  model_alt='Concept model of the White House hall on a terrazzo plinth: booths along both long walls, a lounge in the middle and the Property Talks stage at the far end',
  model_cap='White House hall · 50 × 20 m · concept model', turn_hint='Drag to turn the model', turn_hint_touch='Swipe or scroll to turn the model',
  turn_label='Concept model of the hall. Use the arrow keys to turn it.', walk3d='Walk through in 3D',
  col_h2='Villas, branded residences and condominiums, in one hall', walk_alt='Inside the White House hall from the entrance: booths along both sides, the lounge in the middle and the Property Talks stage at the far end', walk_cap='White House hall · concept visualisation',
  b1='Presented by the companies building them.',
  b2='Hotel- and designer-branded residences, presented by their developers.',
  b3='New launches and completed buildings, from developers across the island.',
  site_cap='Boat Lagoon Marina at sunset. The White House hall is a short walk from the docks.',
  site_p="Thailand Boat Festival fills Boat Lagoon Marina with yachts for four days in January. The expo takes the White House, the air-conditioned hall beside the docks. Walk the pontoons, then meet the developers behind Phuket's villas and residences, the same afternoon and in the same place.",
  h_expo='Phuket Property Expo, daily', h_fest='Thailand Boat Festival docks, daily',
  plan_alt='Plan of the hall from above: booth modules along both long walls, four open modules near the entrance, the lounge in the middle and the stage at the far end',
  plan_tip='Select a module to see where it sits.', mod='Module',
  m_wall='along the wall, facing the main aisle', m_open='open module near the entrance, low furniture',
  dock_visit='Reserve your pass', dock_exhibit='Exhibit',
  plan_swipe='Swipe the plan to see every booth.', req_note='* Required',
)
TH.update(
  skip='ข้ามไปยังเนื้อหา', fk_preload='thai',
  ed='ครั้งที่ 1', n_visit2='มาเดินงาน', n_exhibit='ออกบูธ', n_brokers='โบรกเกอร์',
  f4t='การเข้าชม', f4s='ฟรี เมื่อลงทะเบียน Early Bird', illus='โมเดลประกอบ',
  door_v_h='มาเดินงาน', door_v_s='ลงทะเบียนฟรี · Early Bird ถึง 30 พฤศจิกายน',
  door_e_h='ออกบูธ', door_e_s='จองบูธ · 32 โมดูล ขนาด 3 × 3 ม.',
  model_alt='โมเดลแนวคิดของฮอลล์ White House บนแท่นหินขัด: บูธเรียงสองฝั่ง เลานจ์กลางฮอลล์ และเวที Property Talks ท้ายฮอลล์',
  model_cap='ฮอลล์ White House · 50 × 20 ม. · โมเดลแนวคิด', turn_hint='ลากเพื่อหมุนโมเดล', turn_hint_touch='ปัดหรือเลื่อนหน้าจอเพื่อหมุนโมเดล',
  turn_label='โมเดลแนวคิดของฮอลล์ ใช้ปุ่มลูกศรเพื่อหมุน', walk3d='เดินชมแบบ 3 มิติ',
  col_h2='วิลล่า branded residence และคอนโด รวมในฮอลล์เดียว', walk_alt='ภายในฮอลล์ White House มองจากทางเข้า: บูธเรียงสองฝั่ง เลานจ์กลางฮอลล์ และเวที Property Talks ท้ายฮอลล์', walk_cap='ฮอลล์ White House · ภาพจำลองแนวคิด',
  b1='นำเสนอโดยบริษัทผู้พัฒนาโครงการเอง',
  b2='เรซิเดนซ์ภายใต้แบรนด์โรงแรมและแบรนด์ดีไซน์ นำเสนอโดยผู้พัฒนาโครงการ',
  b3='โครงการเปิดใหม่และอาคารที่สร้างเสร็จแล้ว จากผู้พัฒนาโครงการทั่วเกาะ',
  site_cap='Boat Lagoon Marina ยามพระอาทิตย์ตก ฮอลล์ White House อยู่ห่างจากท่าเรือเพียงเดินไม่กี่นาที',
  site_p='Thailand Boat Festival เต็มไปด้วยเรือยอชท์ที่ Boat Lagoon Marina สี่วันในเดือนมกราคม งานอสังหาจัดในฮอลล์ White House ฮอลล์ติดแอร์ข้างท่าเรือ เดินชมเรือที่ท่า แล้วมาพบผู้พัฒนาโครงการวิลล่าและเรซิเดนซ์ของภูเก็ต ในบ่ายวันเดียวกัน ที่เดียวกัน',
  h_expo='Phuket Property Expo ทุกวัน', h_fest='ท่าเรือ Thailand Boat Festival ทุกวัน',
  plan_alt='ผังฮอลล์มุมบน: บูธเรียงตามผนังยาวสองฝั่ง โมดูลเปิดสี่โมดูลใกล้ทางเข้า เลานจ์กลางฮอลล์ และเวทีท้ายฮอลล์',
  plan_tip='เลือกโมดูลเพื่อดูตำแหน่ง', mod='โมดูล',
  m_wall='ริมผนัง หันหน้าเข้าทางเดินหลัก', m_open='โมดูลเปิดใกล้ทางเข้า เฟอร์นิเจอร์เตี้ย',
  dock_visit='สำรองสิทธิ์เข้างาน', dock_exhibit='ออกบูธ',
  plan_swipe='เลื่อนผังเพื่อดูบูธทั้งหมด', req_note='* จำเป็นต้องกรอก',
)

# Luxury register (โอ 15 Oct 2026: no "free" — entry is by registration; frame as a place reserved, not a giveaway)
EN.update(
  f4t='Entry', f4s='By registration · Early Bird until 30 November',
  door_v_s='Reserve your pass · Early Bird until 30 November',
  cta1='Reserve your Early Bird pass',
  a1_plain='One registration, through either event, admits you to both. Early Bird registration closes on 30 November 2026.',
  v5='By registration. Early Bird registration closes on 30 November 2026',
  a1='<p>No. Entry is by registration, and one registration covers both events, whether you register through Phuket Property Expo or Thailand Boat Festival. Early Bird registration closes on 30 November 2026.</p>',
  lede="The luxury property show inside Thailand Boat Festival. Villas, branded residences and condominiums from Phuket's developers, presented at the marina in high season, to buyers already on the island.",
  walk_alt='Concept view inside the White House marquee at Boat Lagoon: developer booths along both sides, a lounge down the middle and the Property Talks stage at the far end', walk_cap='Inside the White House hall · concept image',
  i4t='Lounge and Property Talks', i4='A lounge set aside for unhurried conversations with developers, and Property Talks each day on owning in Phuket. Programme to be announced.',
)
TH.update(
  f4t='การเข้าชม', f4s='เข้างานด้วยการลงทะเบียน · Early Bird ถึง 30 พฤศจิกายน',
  door_v_s='สำรองสิทธิ์เข้างาน · Early Bird ถึง 30 พฤศจิกายน',
  cta1='สำรองสิทธิ์ Early Bird',
  a1_plain='ลงทะเบียนครั้งเดียวจากงานไหนก็ได้ เข้าชมได้ทั้งสองงาน ปิดรับลงทะเบียน Early Bird 30 พฤศจิกายน 2569',
  v5='เข้างานด้วยการลงทะเบียน ปิดรับ Early Bird 30 พฤศจิกายน 2569',
  a1='<p>ไม่ต้อง เข้างานด้วยการลงทะเบียน และลงทะเบียนครั้งเดียวจาก Phuket Property Expo หรือ Thailand Boat Festival ก็เข้าได้ทั้งสองงาน ปิดรับลงทะเบียน Early Bird 30 พฤศจิกายน 2569</p>',
  lede='งานอสังหาหรูภายใน Thailand Boat Festival รวมวิลล่า branded residence และคอนโดจากผู้พัฒนาโครงการในภูเก็ต นำเสนอที่มารีน่าในช่วงไฮซีซั่น ต่อผู้ซื้อที่อยู่บนเกาะอยู่แล้ว',
  walk_alt='ภาพแนวคิดภายในฮอลล์ White House ที่ Boat Lagoon: บูธผู้พัฒนาโครงการสองฝั่ง เลานจ์กลางฮอลล์ และเวที Property Talks ท้ายฮอลล์', walk_cap='ภายในฮอลล์ White House · ภาพจำลองแนวคิด',
  i4t='เลานจ์และ Property Talks', i4='เลานจ์สำหรับนั่งคุยกับผู้พัฒนาโครงการอย่างไม่เร่งรีบ และ Property Talks ทุกวันเรื่องการเป็นเจ้าของบ้านในภูเก็ต ประกาศโปรแกรมภายหลัง',
)

# 52-booth all-booth layout (โอ 15 Oct 2026: booths only, no lounge or stage; standard shell-scheme booths chosen)
import json as _j
EN.update(
  door_e_s='Book a booth · 52 modules of 3 × 3 m',
  ld_desc='Luxury property show in the air-conditioned White House hall at Thailand Boat Festival 2027, Boat Lagoon Marina, Phuket: luxury villas, branded residences and condominiums from Phuket developers and agencies, in 52 booths. Daily 13:00–19:00.',
  walk_alt='Concept view inside the White House marquee: white booths along both walls and on a centre island, visitors walking the aisles', walk_cap='Inside the White House hall · concept visualisation',
  i4t='Time with each developer', i4='Every booth has a table and seats, so you can sit down with the developer and go through a project properly.',
  hall_h='52 booths, one loop', hall_p1='52 booth modules of 3 × 3 m: 26 along the walls and 26 on a centre island. Book one module, or combine two for a 6 × 3 m booth.',
  hall_p2='Registration sits under the canopy outside, so the whole hall is booths. Aisles are 3.5 m wide and one loop passes every booth. The four island ends face the entrance and the rear aisle.',
  plan_alt='Plan of the hall from above: 52 booth modules, 26 along the two long walls and 26 back to back on a centre island, with a cross aisle in the middle and the entrance on the short side',
  plan_cap='Hall 50 × 20 m. Door and exit positions to be confirmed on site.',
  m_kinds=_j.dumps({'w': 'along the wall, opens onto the aisle', 'i': 'on the centre island, opens onto the aisle', 'c': 'corner, open on two sides', 'p': 'island end, open on two sides, faces the entrance or rear aisle'}).replace('"', '&quot;'),
  o3t='Island-end booth', o3='One of four premium booths at the island ends, open on two sides and first in view from the entrance.',
  fb_s='News of exhibiting developers and projects as they are announced.',
  bt_h='Booth types', bt_note='Standard booth: white partition walls, name board with lighting, project poster wall, display counter, a table with covered chairs. Concept images; final fit-out to be confirmed.',
  bt1='Wall booth', bt1s='3 × 3 m · open front · 18 booths',
  bt2='Corner booth', bt2s='3 × 3 m · open on two sides · 12 booths',
  bt3='Island end', bt3s='3 × 3 m · open on two sides · 4 booths',
  bt4='Island booth', bt4s='3 × 3 m · open front · 18 booths',
  bt5='Double booth', bt5s='6 × 3 m · two modules combined',
)
TH.update(
  door_e_s='จองบูธ · 52 โมดูล ขนาด 3 × 3 ม.',
  ld_desc='งานอสังหาหรูในฮอลล์ติดแอร์ White House ภายในงาน Thailand Boat Festival 2027 ที่ Boat Lagoon Marina ภูเก็ต: วิลล่าหรู branded residence และคอนโดจากผู้พัฒนาโครงการและเอเจนซี่ในภูเก็ต 52 บูธ เปิด 13:00–19:00 น.',
  walk_alt='ภาพแนวคิดภายในฮอลล์ White House: บูธสีขาวเรียงตามผนังและบนเกาะกลาง ผู้เข้าชมเดินตามทางเดิน', walk_cap='ภายในฮอลล์ White House · ภาพจำลองแนวคิด',
  i4t='มีเวลาคุยกับผู้พัฒนาโครงการ', i4='ทุกบูธมีโต๊ะและที่นั่ง นั่งคุยรายละเอียดโครงการกับผู้พัฒนาได้เต็มที่',
  hall_h='52 บูธ เดินรอบเดียวครบ', hall_p1='บูธ 52 โมดูล ขนาด 3 × 3 ม. ริมผนัง 26 บูธ และเกาะกลาง 26 บูธ จองโมดูลเดียว หรือรวมสองโมดูลเป็นบูธ 6 × 3 ม.',
  hall_p2='จุดลงทะเบียนอยู่ใต้หลังคาผ้าใบหน้าฮอลล์ ข้างในจึงเป็นบูธทั้งหมด ทางเดินกว้าง 3.5 ม. เดินวนรอบเดียวผ่านครบทุกบูธ หัวเกาะทั้งสี่บูธหันหาทางเข้าและทางเดินท้ายฮอลล์',
  plan_alt='ผังฮอลล์มุมบน: บูธ 52 โมดูล ริมผนังยาวสองฝั่ง 26 บูธ และเกาะกลางหันหลังชนกัน 26 บูธ มีทางตัดกลางฮอลล์ ทางเข้าอยู่ด้านสั้น',
  plan_cap='ฮอลล์ 50 × 20 ม. ตำแหน่งประตูและทางออกยืนยันหน้างานอีกครั้ง',
  m_kinds=_j.dumps({'w': 'ริมผนัง เปิดออกทางเดิน', 'i': 'เกาะกลาง เปิดออกทางเดิน', 'c': 'บูธมุม เปิดสองด้าน', 'p': 'หัวเกาะ เปิดสองด้าน หันหาทางเข้าหรือทางเดินท้ายฮอลล์'}, ensure_ascii=False).replace('"', '&quot;'),
  o3t='บูธหัวเกาะ', o3='บูธพรีเมียมหนึ่งในสี่บูธที่หัวเกาะ เปิดสองด้าน เห็นก่อนจากทางเข้า',
  fb_s='ข่าวผู้พัฒนาโครงการและโครงการที่มาออกงาน เมื่อประกาศ',
  bt_h='แบบบูธ', bt_note='บูธมาตรฐาน: ผนัง partition สีขาว ป้ายชื่อพร้อมไฟ ผนังติดโปสเตอร์โครงการ เคาน์เตอร์โชว์ โต๊ะและเก้าอี้คลุมผ้า ภาพจำลองแนวคิด รายละเอียดการตกแต่งยืนยันอีกครั้ง',
  bt1='บูธริมผนัง', bt1s='3 × 3 ม. · เปิดด้านหน้า · 18 บูธ',
  bt2='บูธมุม', bt2s='3 × 3 ม. · เปิดสองด้าน · 12 บูธ',
  bt3='หัวเกาะ', bt3s='3 × 3 ม. · เปิดสองด้าน · 4 บูธ',
  bt4='บูธเกาะกลาง', bt4s='3 × 3 ม. · เปิดด้านหน้า · 18 บูธ',
  bt5='บูธคู่', bt5s='6 × 3 ม. · รวมสองโมดูล',
)

import re
NOBREAK = ['คอนโด', 'เรซิเดนซ์', 'เอเจนซี่', 'เอเจนต์', 'วิลล่า', 'เลานจ์', 'โมดูล', 'ฮอลล์', 'มารีน่า', 'ไฮซีซั่น', 'ทอล์ก', 'แบรนด์', 'ดีไซน์', 'โบรกเกอร์', 'พาร์ทเนอร์', 'เรือยอชท์', 'ทุกวัน', 'มกราคม', 'พฤศจิกายน', 'ลงทะเบียน', 'ผังงาน', 'จัดงาน', 'โครงการ', 'ผู้พัฒนา', 'ประเทศ', 'ที่ปรึกษา', 'เมื่อประกาศ', 'นำเสนอ', 'เดินรอบเดียวครบ', 'สำรองสิทธิ์', 'เข้างาน']
def keep_words(html):
    head, sep, body = html.partition('<body>')
    parts = re.split(r'(<script\b.*?</script>|<[^>]+>)', body, flags=re.S)
    for i in range(0, len(parts), 2):
        s = parts[i]
        for w in NOBREAK:
            s = s.replace(w, '<span class="nw">' + w + '</span>')
        parts[i] = s
    return head + sep + ''.join(parts)

T = open(os.path.join(SP, 'v5_template.html'), encoding='utf-8').read()
for d, sub in ((EN, ''), (TH, 'th/')):
    page = T.replace('{{robots}}', ROBOTS)
    for k, v in d.items():
        page = page.replace('{{' + k + '}}', v)
    assert '{{' not in page, page[page.index('{{'):page.index('{{') + 40]
    if d['lang'] == 'th':
        page = keep_words(page)
    out = os.path.join(REPO, BASE.strip('/'), sub, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page)
    print('wrote', out)
