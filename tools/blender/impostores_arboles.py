"""Impostores de árboles: renderiza cada GLB del simulador (lado y cenital) con fondo transparente en Cycles.
Uso: blender -b --python tools/blender/impostores_arboles.py -- <carpeta_glb> <carpeta_salida>"""
import bpy, sys, os, math, mathutils
a = sys.argv[sys.argv.index('--') + 1:]; SRC, OUT = a[0], a[1]; os.makedirs(OUT, exist_ok=True)
ESP = ['island_tree_01', 'island_tree_02', 'jacaranda', 'arbolpeq']
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = 512; sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try: sc.view_settings.view_transform = 'Standard'
except Exception: pass
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND'); bg.inputs[0].default_value = (0.75, 0.82, 0.95, 1); bg.inputs[1].default_value = 0.9
for e in ESP:
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for p in ['madera', 'hojas']: bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, f'{e}_L1_{p}.glb'))
    mins = mathutils.Vector((1e9,) * 3); maxs = mathutils.Vector((-1e9,) * 3)
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        for v in o.bound_box: c = o.matrix_world @ mathutils.Vector(v); mins = mathutils.Vector(map(min, mins, c)); maxs = mathutils.Vector(map(max, maxs, c))
    cen = (mins + maxs) / 2; h = maxs.z - mins.z; r = max(maxs.x - mins.x, maxs.y - mins.y, h) / 2
    sun = bpy.data.lights.new('sol', 'SUN'); sun.energy = 4.0; so = bpy.data.objects.new('sol', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(40), math.radians(15), math.radians(30))
    cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
    # lado
    cam.ortho_scale = max(maxs.x - mins.x, h) * 1.04; co.location = (cen.x, cen.y - r * 4, cen.z); co.rotation_euler = (math.radians(90), 0, 0)
    sc.render.filepath = os.path.join(OUT, f'{e}_lado.png'); bpy.ops.render.render(write_still=True)
    # cenital
    cam.ortho_scale = max(maxs.x - mins.x, maxs.y - mins.y) * 1.04; co.location = (cen.x, cen.y, maxs.z + r * 3); co.rotation_euler = (0, 0, 0)
    sc.render.filepath = os.path.join(OUT, f'{e}_top.png'); bpy.ops.render.render(write_still=True)
    print('IMP', e, round(h, 2), round(max(maxs.x - mins.x, maxs.y - mins.y), 2))
