"""Render the PPX White House hall in Blender Cycles from the three.js scene export (scene.json).
Usage: python3 render_hall.py <out.png> <W> <H> <samples> <cam px,py,pz> <target tx,ty,tz> <vfov> [focus_m]
Coordinates are three.js (Y up); converted to Blender (Z up) as (x, -z, y)."""
import sys, os, json, base64, math
import bpy, bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
out, W, H, SAMPLES = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
cam_p = [float(v) for v in sys.argv[5].split(',')]
cam_t = [float(v) for v in sys.argv[6].split(',')]
VFOV = float(sys.argv[7])
FOCUS = float(sys.argv[8]) if len(sys.argv) > 8 else 0

def B(x, y, z): return Vector((x, -z, y))

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
data = json.load(open(os.path.join(HERE, 'scene.json')))

# ---------- textures
texdir = os.path.join(HERE, 'tex'); os.makedirs(texdir, exist_ok=True)
images = []
for i, d in enumerate(data['texs']):
    p = os.path.join(texdir, f't{i}.png')
    if not os.path.exists(p):
        open(p, 'wb').write(base64.b64decode(d.split(',', 1)[1]))
    images.append(bpy.data.images.load(p))
wood_img = bpy.data.images.load(os.path.join(HERE, '..', 'basswood.jpg'))

def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1]

# ---------- materials
def principled(name, color, rough=0.6, metal=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if coat: b.inputs['Coat Weight'].default_value = coat
    return m, b

def wood(name, tint):
    m, b = principled(name, tint, 0.42, 0, 0.25)
    nt = m.node_tree
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = wood_img
    coord = nt.nodes.new('ShaderNodeTexCoord'); mapn = nt.nodes.new('ShaderNodeMapping')
    mapn.inputs['Scale'].default_value = (0.6, 0.6, 0.6)
    nt.links.new(coord.outputs['Object'], mapn.inputs['Vector']); nt.links.new(mapn.outputs['Vector'], tex.inputs['Vector'])
    tex.projection = 'BOX'; tex.projection_blend = 0.3
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(tex.outputs['Color'], mix.inputs['A']); mix.inputs['B'].default_value = tint
    nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    return m

def graphic(name, img):
    m, b = principled(name, (1, 1, 1, 1), 0.35)
    nt = m.node_tree; tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(tex.outputs['Color'], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = 0.35
    return m

OVR = {
    'e4dfd4': ('floor', lambda n: principled(n, srgb('dcd7cc'), 0.14, 0, 0)[0]),          # polished stone floor
    'e9e6dc': ('wall', lambda n: principled(n, srgb(os.environ.get('WALL','ece9e1')), 0.8)[0]),
    'f8f4ea': ('ivory', lambda n: principled(n, srgb('f3efe6'), 0.45, 0, 0.3)[0]),          # lacquered joinery
    'CEIL': ('ceiling', lambda n: principled(n, srgb(os.environ.get('CEIL','f3efe6')), 0.7)[0]),
    'bc9a5c': ('brass', lambda n: principled(n, srgb('c9a463'), 0.28, 1.0)[0]),
    'c7ab7a': ('oak', lambda n: wood(n, srgb('d6b98a'))),
    '8e724f': ('walnut', lambda n: wood(n, srgb('8a6a46'))),
    '123f3a': ('green', lambda n: principled(n, srgb('123f3a'), 0.32, 0, 0.2)[0]),
    '283b39': ('charcoal', lambda n: principled(n, srgb('222e2d'), 0.35)[0]),
    '94a798': ('sage', lambda n: principled(n, srgb('9fb1a2'), 0.9)[0]),
    'e0d7c5': ('linen', lambda n: principled(n, srgb('e3dac9'), 0.95)[0]),
    'd3ddd0': ('runner', lambda n: principled(n, srgb('cfd8cb'), 0.95)[0]),
    'd2c3a5': ('rug', lambda n: principled(n, srgb('d8c9aa'), 0.95)[0]),
    '37664b': ('leaf', lambda n: principled(n, srgb('3f7350'), 0.55)[0]),
    '477451': ('leaf2', lambda n: principled(n, srgb('487a55'), 0.55)[0]),
    '8f7955': ('trunk', lambda n: principled(n, srgb('8f7955'), 0.8)[0]),
}
mats = []
for i, d in enumerate(data['mats']):
    c = d['color']
    if d['map'] >= 0:
        mats.append(graphic(f'g{i}', images[d['map']])); continue
    if d['type'] == 'MeshPhysicalMaterial' and d['transparent']:
        m = bpy.data.materials.new(f'glass{i}'); m.use_nodes = True
        b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = srgb('dfeeee')
        b.inputs['Roughness'].default_value = 0.03; b.inputs['Transmission Weight'].default_value = 1.0; b.inputs['IOR'].default_value = 1.45
        mats.append(m); continue
    if d['emissive'] != '000000' and d['ei'] > 0:
        m, b = principled(f'led{i}', srgb('fff7e6'), 1.0)
        b.inputs['Emission Color'].default_value = srgb('ffe7c2'); b.inputs['Emission Strength'].default_value = 14
        mats.append(m); continue
    if c in OVR:
        n, f = OVR[c]; mats.append(f(f'{n}{i}')); continue
    if d['type'] == 'MeshBasicMaterial':
        mats.append(principled(f'basic{i}', srgb(c), 0.6)[0]); continue
    mats.append(principled(f'm{i}', srgb(c), max(0.3, d['rough']), d['metal'])[0])

# ---------- meshes (joined per material for speed)
from collections import defaultdict
groups = defaultdict(list)
for r in data['meshes']:
    md = data['mats'][r['m']]
    p = r['p']
    if r['k'] == 'PlaneGeometry' and md['map'] >= 0:
        ys = p[1::3]
        if max(ys) < 0.08 and min(ys) > -0.01: continue          # floor decals ("3 m / circulation"): skip
    if min(p[1::3]) > 4.7 and data['mats'][r['m']]['color'] == 'f8f4ea':
        r = dict(r); r['ceil'] = True
    groups[(r['m'], r.get('ceil', False))].append(r)

bevel_kinds = {'BoxGeometry'}
ceil_mat = OVR['CEIL'][1]('ceiling')
for (mi, is_ceil), recs in groups.items():
    for kind in set(r['k'] for r in recs):
        verts, faces, uvs = [], [], []
        for r in recs:
            if r['k'] != kind: continue
            base = len(verts); p = r['p']
            for j in range(0, len(p), 3): verts.append(tuple(B(p[j], p[j + 1], p[j + 2])))
            I = r['i']
            for j in range(0, len(I), 3): faces.append((base + I[j], base + I[j + 1], base + I[j + 2]))
            if 'uv' in r:
                uv = r['uv']
                for j in range(0, len(I), 3):
                    uvs.append([(uv[2 * I[j + k]], uv[2 * I[j + k] + 1]) for k in range(3)])
        me = bpy.data.meshes.new(f'm{mi}_{kind}_{int(is_ceil)}')
        me.from_pydata(verts, [], faces); me.update()
        if uvs:
            layer = me.uv_layers.new(name='UV')
            for fi, tri in enumerate(uvs):
                for k in range(3): layer.data[fi * 3 + k].uv = tri[k]
        ob = bpy.data.objects.new(me.name, me); scene.collection.objects.link(ob)
        ob.data.materials.append(ceil_mat if is_ceil else mats[mi])
        if kind in bevel_kinds and not uvs:
            bm = bmesh.new(); bm.from_mesh(me)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bm.to_mesh(me); bm.free()
            mod = ob.modifiers.new('bevel', 'BEVEL'); mod.width = 0.006; mod.segments = 2; mod.limit_method = 'ANGLE'
            mod.harden_normals = False
        smooth = kind in ('SphereGeometry', 'CylinderGeometry', 'BufferGeometry')
        for poly in me.polygons: poly.use_smooth = smooth

# ---------- lighting: ceiling LED rows already emit; add soft area lights under the ceiling and a gentle world
for x in range(3, 50, 5):
    for z in (-5.5, 0, 5.5):
        L = bpy.data.lights.new(f'a{x}{z}', 'AREA'); L.shape = 'RECTANGLE'; L.size = 1.6; L.size_y = 0.6
        L.energy = 120; L.color = (1.0, 0.93, 0.84)
        o = bpy.data.objects.new(L.name, L); o.location = B(x, 4.55, z); scene.collection.objects.link(o)
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.9, 0.88, 0.84, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = float(os.environ.get('WORLD','0.55'))
# stage: wash the screen and back wall, so the far end reads as the destination
for zz in (-2.6, 0, 2.6):
    S = bpy.data.lights.new(f'stage{zz}', 'SPOT'); S.energy = 900; S.spot_size = math.radians(55); S.spot_blend = 0.6; S.color = (1.0, 0.92, 0.8)
    so = bpy.data.objects.new(S.name, S); so.location = B(41.5, 4.4, zz); scene.collection.objects.link(so)
    so.rotation_euler = (B(47.9, 2.0, zz * 0.6) - so.location).to_track_quat('-Z', 'Y').to_euler()
# wall washers above the booth rows
for x in range(4, 46, 6):
    for z in (-8.6, 8.6):
        L = bpy.data.lights.new(f'w{x}{z}', 'AREA'); L.shape = 'RECTANGLE'; L.size = 2.4; L.size_y = 0.3; L.energy = 70; L.color = (1.0, 0.94, 0.86)
        o = bpy.data.objects.new(L.name, L); o.location = B(x, 4.5, z * 0.92); scene.collection.objects.link(o)

# ---------- camera
cd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cd); scene.collection.objects.link(cam)
cam.location = B(*cam_p)
direction = B(*cam_t) - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
cd.sensor_fit = 'VERTICAL'; cd.angle_y = math.radians(VFOV)
if FOCUS > 0:
    cd.dof.use_dof = True; cd.dof.focus_distance = FOCUS; cd.dof.aperture_fstop = 5.6
scene.camera = cam

# ---------- render settings
scene.render.engine = 'CYCLES'
c = scene.cycles; c.device = 'CPU'; c.samples = SAMPLES; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.02
c.use_denoising = True
try: c.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
c.max_bounces = 6; c.diffuse_bounces = 3; c.glossy_bounces = 3; c.transmission_bounces = 4
c.caustics_reflective = False; c.caustics_refractive = False; c.blur_glossy = 1.0
scene.render.resolution_x = W; scene.render.resolution_y = H; scene.render.resolution_percentage = 100
scene.render.threads_mode = 'AUTO'
try:
    scene.view_settings.view_transform = 'AgX'; scene.view_settings.look = 'AgX - Medium High Contrast'
except Exception:
    scene.view_settings.view_transform = 'Filmic'
scene.view_settings.exposure = 0.45
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('wrote', out)
