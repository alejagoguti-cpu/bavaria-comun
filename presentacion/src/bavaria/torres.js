/* Torres del Plan Parcial (escenario 01), según el render oficial: torres sueltas de ladrillo terracota y blancas entre el bosque.
   Geometría: modelos/plan/torre.glb (tools/blender/torre_modulos.py): planta baja + pisos tipo apilados + cubierta, con instancias.
   Implantación dentro de cada manzana oficial: INTERPRETATIVA (el decreto fija la manzana y las viviendas, no la posición de cada torre).
   Viviendas por manzana: plan_bavaria.json. 8 apartamentos por piso (supuesto). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { WP } from './geo.js';

const LX = 28, LY = 17, H_BAJA = 4.2, H_PISO = 3.0, APTOS_PISO = 8;
const PISOS_TIPO = { vis: 14, vip: 14, t4: 12, mul: 12 }; // como el render oficial: torres de 8 a 15 pisos
const USO = { vis: 'Vivienda VIS', vip: 'Vivienda VIP', t4: 'Vivienda no VIS (tipo 4)', mul: 'Uso múltiple', com: 'Comercio y servicios', dot: 'Dotacional', eq: 'Equipamiento' };

function pbr(base, rep, ani, extra = {}) {
  const L = new THREE.TextureLoader(), t = (s, srgb) => { const x = L.load(`./bavaria/tex/${base}_${s}_1k.jpg`); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(rep, rep); x.anisotropy = ani; if (srgb) x.colorSpace = THREE.SRGBColorSpace; return x; };
  return new THREE.MeshStandardMaterial({ map: t('diff', true), normalMap: t('nor_gl'), roughnessMap: t('rough'), ...extra });
}

export async function crearTorres({ plan, renderer, grupo }) {
  const ani = renderer.capabilities.getMaxAnisotropy();
  const gl = await new GLTFLoader().loadAsync('./bavaria/modelos/torre.glb');
  const M = {
    ladrillo: pbr('red_brick_03', 1 / 1.2, ani, { color: '#a87458', roughness: 0.95 }),
    blanco: pbr('white_plaster_02', 1 / 2.2, ani, { color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.22 }),
    losa: pbr('concrete_wall_008', 1 / 3, ani, { color: '#eceae5' }),
    verde: pbr('leafy_grass', 1 / 2, ani),
    vidrio: new THREE.MeshPhysicalMaterial({ color: '#283541', metalness: 0.6, roughness: 0.06, envMapIntensity: 1.4, clearcoat: 1 }),
    marco: new THREE.MeshStandardMaterial({ color: '#2f3133', metalness: 0.7, roughness: 0.4 }),
    oscuro: new THREE.MeshStandardMaterial({ color: '#141516', roughness: 1 }),
    crema: pbr('white_plaster_02', 1 / 2.2, ani, { color: '#efe4d0' }),
    baranda: new THREE.MeshPhysicalMaterial({ color: '#a9c4cc', metalness: 0, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.45 }),
    metal: new THREE.MeshStandardMaterial({ color: '#3a3b3d', metalness: 0.8, roughness: 0.35 }),
  };
  const matDe = (n, muro) => n === 'muro' ? M[muro] : (M[n] || M.losa);

  /* implantación */
  const dentro = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const torres = []; // { x, z, ang, pisos, muro, ud }
  let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  // Implantación según el render oficial: bloques perimetrales que forman patios en cada manzana (no torres sueltas).
  // Cada bloque = módulos de 28 m estirados a lo largo del borde (sx), con cortes de 8-12 m entre bloques y esquinas libres.
  for (const e of plan.edificios) {
    const zona = plan.zonas.find(z => z.id === e.id); if (!zona) continue;
    const q = zona.p.reduce((a, b) => (b.o.length > a.o.length ? b : a)); let P = q.o.map(WP);
    // simplifica: quita vértices de bordes muy cortos
    P = P.filter((p, i) => { const n = P[(i + 1) % P.length]; return Math.hypot(n[0] - p[0], n[1] - p[1]) > 6; });
    if (P.length < 3) continue;
    const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cz = P.reduce((s, p) => s + p[1], 0) / P.length;
    const res = e.tipo in PISOS_TIPO, viv = e.viviendas || 0;
    const r0 = azar(), estilo = !res ? 'B' : r0 < 0.55 ? 'A' : r0 < 0.88 ? 'B' : 'C', muro = { A: 'ladrillo', B: 'blanco', C: 'crema' }[estilo];
    const bloques = [];
    for (let i = 0; i < P.length; i++) {
      const A = P[i], B = P[(i + 1) % P.length], L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L < 34) continue;
      const ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L; let nx = -uz, nz = ux;
      const mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2; if ((cx - mx) * nx + (cz - mz) * nz < 0) { nx = -nx; nz = -nz; }
      const prof = LY * (res ? 1 : 1.3), off = 6 + prof / 2, util = L - 2 * 14;
      const nseg = Math.max(1, Math.round(util / 42)), hueco = nseg > 1 ? 10 : 0, seg = (util - hueco * (nseg - 1)) / nseg;
      if (seg < 20) continue;
      for (let k = 0; k < nseg; k++) {
        const d = 14 + k * (seg + hueco) + seg / 2, x = A[0] + ux * d + nx * off, z = A[1] + uz * d + nz * off;
        // que el bloque no quede fuera de la manzana (bordes cóncavos)
        if (!dentro([x + nx * prof * 0.4, z + nz * prof * 0.4], P)) continue;
        bloques.push({ x, z, ang: Math.atan2(uz, ux), sx: seg / LX, esc: res ? 1 : 1.3 });
      }
    }
    if (!bloques.length) bloques.push({ x: cx, z: cz, ang: 0, sx: 1, esc: res ? 1 : 1.3 });
    const aptos = bloques.reduce((s, b) => s + APTOS_PISO * b.sx, 0);
    const base = res ? Math.min(14, Math.max(6, Math.ceil(viv / Math.max(1, aptos)))) : 3;
    bloques.forEach((bl, k) => {
      const pk = res ? Math.min(15, Math.max(5, base + [0, 2, -2, 3, -1][k % 5])) : base + (k % 2);
      torres.push({ ...bl, pisos: pk, muro, estilo, ud: { id: `${e.id}-B${k + 1}`, nombre: `${e.id} · bloque ${k + 1}`, uso: USO[e.tipo] || e.tipo, pisos: pk + 1, altura: H_BAJA + pk * H_PISO + 1.4,
        viviendas: res ? Math.round(pk * APTOS_PISO * bl.sx) : null, area_oficial: e.area_oficial, etapa: e.anio, escenario: '01 · Futuro sin propuesta',
        clase: 'Documentada (manzana y viviendas) · Interpretativa (bloques según el render oficial)', fuente: 'Decreto 448/2023 plano 1/2 · render oficial del plan' } });
    });
  }

  /* instancias: por muro (ladrillo/blanco) y por módulo; cada primitiva del GLB = un InstancedMesh con su material */
  const inst = [], sel = [], m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), uno = new THREE.Vector3(1, 1, 1);
  for (const estilo of ['A', 'B', 'C']) {
    const T = torres.filter(t => t.estilo === estilo); const muro = { A: 'ladrillo', B: 'blanco', C: 'crema' }[estilo]; if (!T.length) continue;
    const mats = { baja: [], piso: [], cubierta: [], alero: [] };
    for (const t of T) {
      q4.setFromAxisAngle(Y, -t.ang);
      const esc = new THREE.Vector3(t.sx || 1, 1, t.esc), base = (y) => m4.clone().compose(new THREE.Vector3(t.x, y, t.z), q4, esc);
      mats.baja.push([base(0), 0]); mats.alero.push([base(0), 0]);
      for (let p = 0; p < t.pisos; p++) mats.piso.push([base(H_BAJA + p * H_PISO), H_BAJA + p * H_PISO]);
      mats.cubierta.push([base(H_BAJA + t.pisos * H_PISO), H_BAJA + t.pisos * H_PISO]);
    }
    for (const nombre of Object.keys(mats)) {
      const nodo = gl.scene.getObjectByName(nombre === 'piso' ? 'piso_' + estilo : nombre); if (!nodo) continue;
      const lista = mats[nombre].sort((x, y) => x[1] - y[1]), ys = lista.map(x => x[1]);
      const prims = []; nodo.traverse(o => { if (o.isMesh) prims.push(o); });
      for (const pr of prims) {
        const im = new THREE.InstancedMesh(pr.geometry, matDe(pr.material.name, muro), lista.length);
        lista.forEach(([mm], i) => im.setMatrixAt(i, mm));
        im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; im.userData.ys = ys;
        grupo.add(im); inst.push(im);
      }
    }
  }
  // volúmenes invisibles para seleccionar torre por torre
    for (const t of torres) {
    const h = H_BAJA + t.pisos * H_PISO + 1.5, g = new THREE.BoxGeometry(LX * (t.sx || 1), h, LY * t.esc); g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#C7FF27', transparent: true, opacity: 0, depthWrite: false })); m.position.set(t.x, 0, t.z); m.rotation.y = -t.ang; m.userData = t.ud; grupo.add(m); sel.push(m);
  }
  /* crecimiento: muestra solo los módulos por debajo de la altura h (las instancias están ordenadas por altura) */
  const crecer = (h) => { for (const im of inst) { const ys = im.userData.ys; let lo = 0, hi = ys.length; while (lo < hi) { const m = (lo + hi) >> 1; if (ys[m] <= h) lo = m + 1; else hi = m; } im.count = lo; } for (const m of sel) m.visible = h > 60; };
  const hMax = Math.max(...torres.map(t => H_BAJA + t.pisos * H_PISO)) + 1;
  return { seleccionables: sel, torres, materiales: M, crecer, hMax };
}
