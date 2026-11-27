"""Edificios tecnológicos de Bavaria Común (diseño interpretativo, no planos de la autora).
Cada tipología mide 40 x 20 m en planta (la web la estira a la huella real de la nave) y sale como un objeto en modelos/nbic.glb:
  invernadero  biotecnología: invernadero Venlo de 5 naves (acero + vidrio) con estanterías hidropónicas y plantas
  laboratorio  nano / hongos: nave de ladrillo reutilizada, cubierta en diente de sierra con paneles solares, frente de vidrio con lamas de madera
  datos        información: caja de paneles metálicos perforados, franja lima, cubierta solar, antena y equipos
  escuela      cognitivas: estructura de madera y vidrio, voladizo de terraza, cubierta verde, escalera exterior
  mirador      silos: corona de vidrio con anillo de acero (se pone sobre los silos reales)
Materiales por nombre: vidrio, acero, panel, madera, ladrillo, solar, verde, losa, lima, planta, oscuro.
Uso: blender -b --python tools/blender/edificios_nbic.py"""
import bpy, bmesh, os, math

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(RAIZ, 'modelos', 'nbic.glb')
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
MATS = {}
def mat(n, c, metal=0.0, rough=0.6, alpha=1.0):
    m = bpy.data.materials.new(n); m.use_nodes = True
    b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*c, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if alpha < 1: b.inputs['Alpha'].default_value = alpha; m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    MATS[n] = m
for a in [('vidrio', (.55, .68, .72), .1, .05, .35), ('acero', (.78, .79, .8), .9, .3), ('panel', (.2, .21, .23), .7, .45), ('madera', (.55, .36, .2), 0, .7),
          ('ladrillo', (.5, .27, .18), 0, .9), ('solar', (.05, .08, .16), .6, .15), ('verde', (.25, .42, .16), 0, .9), ('losa', (.82, .81, .78), 0, .8),
          ('lima', (.78, 1, .15), 0, .4), ('planta', (.3, .6, .18), 0, .8), ('oscuro', (.05, .05, .05), 0, 1)]:
    mat(*a)

class M:
    def __init__(s): s.bm = bmesh.new(); s.uv = s.bm.loops.layers.uv.new('UVMap'); s.mi = {}
    def _cara(s, vs, m):
        f = s.bm.faces.new(vs); f.material_index = s.mi.setdefault(m, len(s.mi)); f.normal_update(); n = f.normal
        for lp in f.loops:
            p = lp.vert.co
            lp[s.uv].uv = (p.x, p.y) if abs(n.z) > .5 else ((p.y, p.z) if abs(n.x) > .5 else (p.x, p.z))
    def caja(s, x0, x1, y0, y1, z0, z1, m):
        if x1 - x0 < 1e-4 or y1 - y0 < 1e-4 or z1 - z0 < 1e-4: return
        v = [s.bm.verts.new(p) for p in [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]]
        for f in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]: s._cara([v[i] for i in f], m)
    def prisma(s, pts, y0, y1, m):  # perfil en XZ extruido en Y
        a = [s.bm.verts.new((x, y0, z)) for x, z in pts]; b = [s.bm.verts.new((x, y1, z)) for x, z in pts]; n = len(pts)
        s._cara(a[::-1], m); s._cara(b, m)
        for i in range(n): j = (i + 1) % n; s._cara([a[i], a[j], b[j], b[i]], m)
    def cil(s, cx, cy, r, z0, z1, m, seg=32):
        a = [s.bm.verts.new((cx + r * math.cos(t), cy + r * math.sin(t), z0)) for t in [i * 2 * math.pi / seg for i in range(seg)]]
        b = [s.bm.verts.new((v.co.x, v.co.y, z1)) for v in a]
        s._cara(a[::-1], m); s._cara(b, m)
        for i in range(seg): j = (i + 1) % seg; s._cara([a[i], a[j], b[j], b[i]], m)
    def obj(s, nombre):
        me = bpy.data.meshes.new(nombre); s.bm.to_mesh(me); s.bm.free()
        for m, _ in sorted(s.mi.items(), key=lambda kv: kv[1]): me.materials.append(MATS[m])
        o = bpy.data.objects.new(nombre, me); bpy.context.collection.objects.link(o); return o

LX, LY = 40.0, 20.0
X0, X1, Y0, Y1 = -LX / 2, LX / 2, -LY / 2, LY / 2

# ---------------------------------------------------------------- invernadero Venlo
def invernadero():
    g = M(); H = 5.0; naves = 5; w = LY / naves
    g.caja(X0, X1, Y0, Y1, 0, .15, 'losa')
    for i in range(naves):
        y0 = Y0 + i * w; yc = y0 + w / 2
        g.prisma([(X0, H), (X1, H), (X1, H + .02), (X0, H + .02)], y0, y0 + .08, 'acero')   # canalón
        for sgn in (-1, 1):  # faldones de vidrio con montantes cada 2 m
            pass
        g.prisma([(X0, H), (X1, H), (X1, H + 1.6), (X0, H + 1.6)], yc - .04, yc + .04, 'acero')  # cumbrera
        # vidrio del techo: dos planos inclinados como prismas finos
        for (ya, yb) in [(y0, yc), (yc, y0 + w)]:
            za, zb = (H, H + 1.6) if ya == y0 else (H + 1.6, H)
            v = [g.bm.verts.new(p) for p in [(X0, ya, za), (X1, ya, za), (X1, yb, zb), (X0, yb, zb)]]; g._cara(v, 'vidrio')
            v = [g.bm.verts.new(p) for p in [(X0, yb, zb), (X1, yb, zb), (X1, ya, za), (X0, ya, za)]]; g._cara(v, 'vidrio')
        x = X0
        while x <= X1 + .01:  # pórticos cada 4 m
            g.caja(x - .06, x + .06, y0, y0 + .12, 0, H, 'acero')
            for (ya, yb) in [(y0, yc), (yc, y0 + w)]:
                za, zb = (H, H + 1.6) if ya == y0 else (H + 1.6, H)
                n = 8
                for k in range(n): t0, t1 = k / n, (k + 1) / n; g.caja(x - .04, x + .04, ya + (yb - ya) * t0, ya + (yb - ya) * t1 + .01, za + (zb - za) * t0 - .05, za + (zb - za) * t0 + .05, 'acero')
            x += 4
        # estanterías hidropónicas (tres niveles de tubos con plantas)
        for k in range(3):
            yy = y0 + .9 + k * 1.2
            if yy > y0 + w - .6: break
            for z in (0.6, 1.3, 2.0):
                g.caja(X0 + 1.5, X1 - 1.5, yy, yy + .25, z, z + .12, 'losa')
                xx = X0 + 1.8
                while xx < X1 - 1.8: g.caja(xx, xx + .22, yy, yy + .25, z + .12, z + .4, 'planta'); xx += .6
            g.caja(X0 + 1.5, X0 + 1.6, yy, yy + .25, 0, 2.4, 'acero'); g.caja(X1 - 1.6, X1 - 1.5, yy, yy + .25, 0, 2.4, 'acero')
    # fachadas de vidrio con montantes
    for (ya, yb) in [(Y0, Y0 + .03), (Y1 - .03, Y1)]: g.caja(X0, X1, ya, yb, .15, H, 'vidrio')
    for xa in (X0, X1 - .03): g.caja(xa, xa + .03, Y0, Y1, .15, H, 'vidrio')
    x = X0
    while x <= X1: g.caja(x - .05, x + .05, Y0 - .05, Y0 + .05, 0, H, 'acero'); g.caja(x - .05, x + .05, Y1 - .05, Y1 + .05, 0, H, 'acero'); x += 2
    g.caja(X0, X1, Y0 - .06, Y0 + .06, 2.6, 2.7, 'acero'); g.caja(X0, X1, Y1 - .06, Y1 + .06, 2.6, 2.7, 'acero')
    g.caja(-2, 2, Y0 - .3, Y0, 0, 3, 'lima')  # portal de acceso
    return g.obj('invernadero')

# ---------------------------------------------------------------- laboratorio en nave reutilizada
def laboratorio():
    g = M(); H = 8.0
    g.caja(X0, X1, Y0, Y1, 0, .2, 'losa')
    for (x0, x1, y0, y1) in [(X0, X1, Y1 - .4, Y1), (X0, X0 + .4, Y0, Y1), (X1 - .4, X1, Y0, Y1)]: g.caja(x0, x1, y0, y1, 0, H, 'ladrillo')   # muros existentes
    for x in [X0 + 4 + i * 4 for i in range(8)]: g.caja(x - .9, x + .9, Y1 - .45, Y1 - .4, 2, 6, 'vidrio')   # vanos recuperados
    # frente nuevo de vidrio con lamas verticales de madera
    g.caja(X0 + .4, X1 - .4, Y0, Y0 + .05, .2, H, 'vidrio')
    x = X0 + .6
    while x < X1 - .5: g.caja(x, x + .08, Y0 - .7, Y0 - .1, .2, H, 'madera'); x += .45
    g.caja(X0, X1, Y0 - .9, Y0, H, H + .35, 'acero')
    # cubierta en diente de sierra (lucernarios al sur, paneles al norte)
    n = 5; w = LY / n
    for i in range(n):
        y0 = Y0 + i * w
        g.prisma([(X0, 0), (X1, 0), (X1, .01), (X0, .01)], 0, 0, 'losa') if False else None
        v = [g.bm.verts.new(p) for p in [(X0, y0, H), (X1, y0, H), (X1, y0 + w, H + 2.8), (X0, y0 + w, H + 2.8)]]; g._cara(v, 'solar')
        v = [g.bm.verts.new(p) for p in [(X0, y0 + w, H + 2.8), (X1, y0 + w, H + 2.8), (X1, y0 + w, H), (X0, y0 + w, H)]]; g._cara(v, 'vidrio')
        v = [g.bm.verts.new(p) for p in [(X0, y0 + w, H), (X1, y0 + w, H), (X1, y0 + w, H + 2.8), (X0, y0 + w, H + 2.8)]]; g._cara(v, 'vidrio')
        x = X0
        while x <= X1: g.caja(x - .03, x + .03, y0 + w - .03, y0 + w + .03, H, H + 2.8, 'acero'); x += 1.6
        g.caja(X0, X1, y0 + w - .08, y0 + w + .08, H + 2.8, H + 2.9, 'acero')
        x = X0 + .2
        while x < X1: g.caja(x, x + .02, y0, y0 + w, H + .02, H + .02 + 2.8 * 0 + .04, 'acero'); x += 1.7
    g.caja(X0 - .1, X1 + .1, Y0 - .1, Y1 + .1, H - .3, H, 'losa')
    g.caja(-3, 3, Y0 - 4, Y0 - .9, 3.6, 3.85, 'acero'); g.caja(-2.9, -2.7, Y0 - 4, Y0 - 3.8, 0, 3.6, 'acero'); g.caja(2.7, 2.9, Y0 - 4, Y0 - 3.8, 0, 3.6, 'acero')
    g.caja(-3, 3, Y0 - 1, Y0 - .9, 3.85, 4.3, 'lima')
    return g.obj('laboratorio')

# ---------------------------------------------------------------- centro de datos
def datos():
    g = M(); H = 10.0
    g.caja(X0, X1, Y0, Y1, 0, .2, 'losa')
    g.caja(X0 + .5, X1 - .5, Y0 + .5, Y1 - .5, .2, H, 'oscuro')
    # piel de paneles perforados separada 60 cm, con juntas
    for (ya, yb) in [(Y0, Y0 + .08), (Y1 - .08, Y1)]:
        x = X0
        while x < X1 - .01:
            z = .6
            while z < H - .01: g.caja(x + .03, x + 2.37, ya, yb, z + .03, min(H, z + 1.47), 'panel'); z += 1.5
            x += 2.4
    for (xa, xb) in [(X0, X0 + .08), (X1 - .08, X1)]:
        y = Y0
        while y < Y1 - .01:
            z = .6
            while z < H - .01: g.caja(xa, xb, y + .03, y + 2.37, z + .03, min(H, z + 1.47), 'panel'); z += 1.5
            y += 2.4
    g.caja(X0 - .02, X1 + .02, Y0 - .02, Y0 + .1, 5.2, 5.5, 'lima'); g.caja(X0 - .02, X1 + .02, Y1 - .1, Y1 + .02, 5.2, 5.5, 'lima')   # franja de luz
    g.caja(-6, 6, Y0 - .1, Y0 + .1, .2, 4.2, 'vidrio'); g.caja(-6.2, 6.2, Y0 - 2.5, Y0, 4.2, 4.5, 'acero')                        # acceso
    # cubierta: paneles solares inclinados, condensadoras y antena
    for i in range(6):
        y = Y0 + 2 + i * 2.8
        for k in range(4):
            x0 = X0 + 2 + k * 9
            v = [g.bm.verts.new(p) for p in [(x0, y, H + .6), (x0 + 8, y, H + .6), (x0 + 8, y + 2, H + 1.4), (x0, y + 2, H + 1.4)]]; g._cara(v, 'solar')
            v = [g.bm.verts.new(p) for p in [(x0, y + 2, H + 1.4), (x0 + 8, y + 2, H + 1.4), (x0 + 8, y, H + .6), (x0, y, H + .6)]]; g._cara(v, 'acero')
    for k in range(5): g.caja(X1 - 6, X1 - 2, Y0 + 2 + k * 3, Y0 + 4.2 + k * 3, H, H + 1.8, 'acero')
    g.cil(X0 + 4, Y1 - 4, .25, H, H + 14, 'acero', 12); g.cil(X0 + 4, Y1 - 4, .6, H + 10, H + 10.4, 'acero', 16)
    g.caja(X0, X1, Y0, Y1, H, H + .3, 'losa')
    return g.obj('datos')

# ---------------------------------------------------------------- escuela de madera y vidrio
def escuela():
    g = M(); Hp = 4.2
    g.caja(X0, X1, Y0, Y1, 0, .2, 'losa')
    for p in range(2):
        z0 = .2 + p * Hp
        g.caja(X0 + 1, X1 - 1, Y0 + 1, Y1 - 1, z0 + .3, z0 + Hp - .4, 'oscuro')
        g.caja(X0 + .9, X1 - .9, Y0 + .9, Y0 + .95, z0 + .3, z0 + Hp - .4, 'vidrio'); g.caja(X0 + .9, X1 - .9, Y1 - .95, Y1 - .9, z0 + .3, z0 + Hp - .4, 'vidrio')
        g.caja(X0 + .9, X0 + .95, Y0 + .9, Y1 - .9, z0 + .3, z0 + Hp - .4, 'vidrio'); g.caja(X1 - .95, X1 - .9, Y0 + .9, Y1 - .9, z0 + .3, z0 + Hp - .4, 'vidrio')
        g.caja(X0 - 2 * p, X1 + 2 * p, Y0 - 2.5 * p, Y1, z0 + Hp - .4, z0 + Hp, 'madera')      # losa de madera (la de arriba vuela)
        x = X0
        while x <= X1 + .01:  # pórticos de madera laminada
            for y in (Y0, Y1 - .3): g.caja(x - .15, x + .15, y, y + .3, z0, z0 + Hp - .4, 'madera')
            x += 4
        x = X0 + 1
        while x < X1 - 1: g.caja(x, x + .05, Y0 + .85, Y0 + .9, z0 + .3, z0 + Hp - .4, 'madera'); x += 1.33
    zt = .2 + 2 * Hp
    g.caja(X0 + .5, X1 - .5, Y0 + .5, Y1 - .5, zt, zt + .35, 'verde')
    x = X0 + 2
    while x < X1 - 2: g.caja(x, x + .9, Y0 + 2, Y1 - 2, zt + .35, zt + .8, 'planta'); x += 2.5
    g.caja(X0 - 2, X1 + 2, Y0 - 2.6, Y0 - 2.5, .2 + Hp, .2 + Hp + 1.05, 'vidrio')        # baranda de la terraza
    for k in range(14): g.caja(X1 + .2, X1 + 2, Y0 + 2 + k * .3, Y0 + 2.3 + k * .3, .2 + k * .3, .5 + k * .3, 'madera')   # escalera exterior
    g.caja(X1 + .1, X1 + .2, Y0 + 2, Y0 + 6.5, .2, 5.2, 'acero')
    return g.obj('escuela')

# ---------------------------------------------------------------- mirador sobre silos
def mirador():
    g = M(); R = 7.0
    g.cil(0, 0, R + .6, 0, .5, 'acero', 48); g.cil(0, 0, R, .5, 3.5, 'vidrio', 48); g.cil(0, 0, R + 1, 3.5, 3.9, 'acero', 48)
    for k in range(24): t = k * 2 * math.pi / 24; g.caja(R * math.cos(t) - .06, R * math.cos(t) + .06, R * math.sin(t) - .06, R * math.sin(t) + .06, .5, 3.5, 'acero')
    g.cil(0, 0, R + 1.2, .4, .5, 'lima', 48)
    g.cil(3, 0, .15, 3.9, 9, 'acero', 10); g.caja(2.5, 3.5, -.5, .5, 9, 9.6, 'panel')   # estación del clima
    return g.obj('mirador')

objs = [invernadero(), laboratorio(), datos(), escuela(), mirador()]
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=False, export_apply=True, export_yup=True)
print('OK', OUT, {o.name: len(o.data.polygons) for o in objs})
