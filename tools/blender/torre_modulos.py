"""Módulos de torre del Plan Parcial Bavaria Fábrica (lectura del render oficial: torres de ladrillo terracota y blancas).
Genera modelos/plan/torre.glb con tres objetos que la web apila con instancias:
  piso      un piso tipo (3,0 m): muros con vanos rehundidos 18 cm, marcos, parteluz, alféizar y losa saliente
  baja      planta baja (4,2 m): fachada acristalada con montantes, pilares y alero de acceso
  cubierta  remate: losa, pretil, cubierta verde, cuarto de máquinas y tanque
Materiales por nombre (la web pone las texturas PBR): muro, vidrio, marco, losa, verde, oscuro.
UV en metros (proyección por cara), para que el ladrillo quede a escala real.
Uso: "C:/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b --python tools/blender/torre_modulos.py
"""
import bpy, bmesh, os, math

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(RAIZ, 'modelos', 'plan', 'torre.glb')
os.makedirs(os.path.dirname(OUT), exist_ok=True)

LX, LY = 28.0, 17.0          # planta de la torre (m)
T = 0.25                     # espesor de muro
REH = 0.18                   # rehundido del vidrio

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
MATS = {}
def mat(n, c):
    if n in MATS: return MATS[n]
    m = bpy.data.materials.new(n); m.use_nodes = True
    b = next(x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'); b.inputs['Base Color'].default_value = (*c, 1)
    MATS[n] = m; return m
for n, c in [('muro', (.55, .3, .2)), ('vidrio', (.15, .2, .25)), ('marco', (.2, .2, .2)), ('losa', (.75, .74, .7)), ('verde', (.3, .45, .2)), ('oscuro', (.08, .08, .08))]: mat(n, c)

class Malla:
    def __init__(s): s.bm = bmesh.new(); s.uv = s.bm.loops.layers.uv.new('UVMap'); s.mi = {}
    def caja(s, x0, x1, y0, y1, z0, z1, m):
        if x1 - x0 < 1e-4 or y1 - y0 < 1e-4 or z1 - z0 < 1e-4: return
        bm = s.bm; idx = s.mi.setdefault(m, len(s.mi))
        v = [bm.verts.new(p) for p in [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]]
        for f in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]:
            fa = bm.faces.new([v[i] for i in f]); fa.material_index = idx
            fa.normal_update(); n = fa.normal
            for lp in fa.loops:
                p = lp.vert.co
                if abs(n.z) > .5: lp[s.uv].uv = (p.x, p.y)
                elif abs(n.x) > .5: lp[s.uv].uv = (p.y * (1 if n.x > 0 else -1), p.z)
                else: lp[s.uv].uv = (p.x * (-1 if n.y > 0 else 1), p.z)
    def objeto(s, nombre):
        me = bpy.data.meshes.new(nombre); s.bm.to_mesh(me); s.bm.free()
        orden = sorted(s.mi.items(), key=lambda kv: kv[1])
        for m, _ in orden: me.materials.append(MATS[m])
        ob = bpy.data.objects.new(nombre, me); bpy.context.collection.objects.link(ob); return ob

def fachada(M, largo, eje, signo, z0, H, tipo='piso'):
    """Una fachada a lo largo de x (eje='x', y = signo*LY/2) o de y (eje='y'). Coordenadas locales: u a lo largo, w hacia adentro."""
    n = max(2, round(largo / 3.1)); b = largo / n
    def caja(u0, u1, w0, w1, a, c, m):
        if eje == 'x':
            y_ext = signo * LY / 2; ya, yb = sorted([y_ext - signo * w0, y_ext - signo * w1])
            M.caja(-largo / 2 + u0, -largo / 2 + u1, ya, yb, a, c, m)
        else:
            x_ext = signo * LX / 2; xa, xb = sorted([x_ext - signo * w0, x_ext - signo * w1])
            M.caja(xa, xb, -largo / 2 + u0, -largo / 2 + u1, a, c, m)
    if tipo == 'piso':
        sill, head, losa = 0.85, 2.45, 0.28
        for i in range(n):
            u = i * b; ww = b * 0.6; a0 = u + (b - ww) / 2; a1 = a0 + ww
            caja(u, a0, 0, T, z0, z0 + H - losa, 'muro'); caja(a1, u + b, 0, T, z0, z0 + H - losa, 'muro')       # machones
            caja(a0, a1, 0, T, z0, z0 + sill, 'muro'); caja(a0, a1, 0, T, z0 + head, z0 + H - losa, 'muro')      # antepecho y dintel
            caja(a0 - .02, a1 + .02, -0.06, REH, z0 + sill - .05, z0 + sill, 'losa')                            # alféizar
            caja(a0, a1, REH, REH + .02, z0 + sill, z0 + head, 'vidrio')                                       # vidrio rehundido
            for (p0, p1) in [(a0, a0 + .06), (a1 - .06, a1), ((a0 + a1) / 2 - .03, (a0 + a1) / 2 + .03)]:
                caja(p0, p1, REH - .04, REH + .02, z0 + sill, z0 + head, 'marco')                               # marcos y parteluz
            caja(a0, a1, REH - .04, REH + .02, z0 + head - .06, z0 + head, 'marco')
            caja(a0, a1, REH - .04, REH + .02, z0 + sill, z0 + sill + .06, 'marco')
            caja(a0, a1, REH - .03, REH + .01, z0 + 1.0, z0 + 1.04, 'marco')                                    # baranda de la ventana piso-techo
        caja(-0.08, largo + 0.08, -0.08, T, z0 + H - losa, z0 + H, 'losa')                                     # losa saliente
    elif tipo == 'baja':
        caja(0, largo, -0.05, T, z0 + H - 0.5, z0 + H, 'losa')
        caja(0, 0.5, 0, 0.5, z0, z0 + H - 0.5, 'losa'); caja(largo - 0.5, largo, 0, 0.5, z0, z0 + H - 0.5, 'losa')
        caja(0.5, largo - 0.5, 0.4, 0.42, z0, z0 + H - 0.5, 'vidrio')
        k = max(2, round(largo / 1.5))
        for i in range(1, k): u = i * largo / k; caja(u - .04, u + .04, 0.32, 0.44, z0, z0 + H - 0.5, 'marco')
        caja(0.5, largo - 0.5, 0.32, 0.44, z0 + 2.6, z0 + 2.66, 'marco')
        caja(0, largo, 0.44, 0.6, z0, z0 + 0.15, 'losa')

def cuerpo(tipo, H):
    M = Malla()
    for s in (1, -1): fachada(M, LX, 'x', s, 0, H, tipo)
    for s in (1, -1): fachada(M, LY - 2 * T, 'y', s, 0, H, tipo)
    # interior oscuro detrás del vidrio (que no se vea a través) y placa
    M.caja(-LX / 2 + .6, LX / 2 - .6, -LY / 2 + .6, LY / 2 - .6, 0, H - 0.3, 'oscuro')
    return M

ob = cuerpo('piso', 3.0).objeto('piso')
bj = cuerpo('baja', 4.2).objeto('baja')
# alero de acceso en la planta baja
M = Malla(); M.caja(-4, 4, LY / 2, LY / 2 + 2.4, 3.2, 3.45, 'losa'); al = M.objeto('alero')

# cubierta
M = Malla()
M.caja(-LX / 2 - .08, LX / 2 + .08, -LY / 2 - .08, LY / 2 + .08, 0, .3, 'losa')
for (x0, x1, y0, y1) in [(-LX / 2, LX / 2, LY / 2 - T, LY / 2), (-LX / 2, LX / 2, -LY / 2, -LY / 2 + T), (-LX / 2, -LX / 2 + T, -LY / 2, LY / 2), (LX / 2 - T, LX / 2, -LY / 2, LY / 2)]:
    M.caja(x0, x1, y0, y1, .3, 1.4, 'muro')
M.caja(-LX / 2 - .05, LX / 2 + .05, LY / 2 - T - .05, LY / 2 + .05, 1.4, 1.48, 'losa'); M.caja(-LX / 2 - .05, LX / 2 + .05, -LY / 2 - .05, -LY / 2 + T + .05, 1.4, 1.48, 'losa')
M.caja(-LX / 2 - .05, -LX / 2 + T + .05, -LY / 2, LY / 2, 1.4, 1.48, 'losa'); M.caja(LX / 2 - T - .05, LX / 2 + .05, -LY / 2, LY / 2, 1.4, 1.48, 'losa')
M.caja(-LX / 2 + T, LX / 2 - T, -LY / 2 + T, LY / 2 - T, .3, .45, 'verde')
M.caja(-3.5, 3.5, -2.5, 2.5, .3, 3.2, 'muro'); M.caja(-3.6, 3.6, -2.6, 2.6, 3.2, 3.4, 'losa')                # punto fijo / cuarto de máquinas
M.caja(5, 8, -1.5, 1.5, .45, 2.4, 'losa')                                                                      # tanque
for i in range(6): M.caja(-10 + i * 1.2, -9.4 + i * 1.2, 3, 7, .45, .9, 'marco')                               # paneles / ductos
cb = M.objeto('cubierta')

bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=False, export_apply=True, export_yup=True, export_materials='PLACEHOLDER' if False else 'EXPORT')
print('OK', OUT, {o.name: len(o.data.polygons) for o in [ob, bj, cb, al]})
