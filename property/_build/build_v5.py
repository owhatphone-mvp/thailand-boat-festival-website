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
  i4t='เลานจ์และ Property Talks', i4='เลานจ์สำหรับนั่งคุยกับผู้พัฒนาโครงการอย่างไม่เร่งรีบ และ Property Talks ทุกวันเรื่องการเป็นเจ้าของบ้านในภูเก็ต ประกาศโปรแกรมภายหลัง',
)

import re
NOBREAK = ['คอนโด', 'เรซิเดนซ์', 'เอเจนซี่', 'เอเจนต์', 'วิลล่า', 'เลานจ์', 'โมดูล', 'ฮอลล์', 'มารีน่า', 'ไฮซีซั่น', 'ทอล์ก', 'แบรนด์', 'ดีไซน์', 'โบรกเกอร์', 'พาร์ทเนอร์', 'เรือยอชท์', 'ทุกวัน', 'มกราคม', 'พฤศจิกายน', 'ลงทะเบียน', 'ผังงาน', 'จัดงาน', 'โครงการ', 'ผู้พัฒนา', 'ประเทศ', 'ที่ปรึกษา', 'เมื่อประกาศ', 'นำเสนอ']
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
