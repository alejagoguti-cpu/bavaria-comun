/* Torres del Plan Parcial (escenario 01), según el render oficial: torres sueltas de ladrillo terracota y blancas entre el bosque.
   Geometría: modelos/plan/torre.glb (tools/blender/torre_modulos.py): planta baja + pisos tipo apilados + cubierta, con instancias.
   Implantación dentro de cada manzana oficial: INTERPRETATIVA (el decreto fija la manzana y las viviendas, no la posición de cada torre).
   Viviendas por manzana: plan_bavaria.json. 8 apartamentos por piso (supuesto). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { WP } from '../escena/geo.js';

const LX = 28, LY = 17, H_BAJA = 4.2, H_PISO = 3.0, APTOS_PISO = 8;
const PISOS_TIPO = { vis: 20, vip: 20, t4: 16, mul: 14 };
const USO = { vis: 'Vivienda VIS', vip: 'Vivienda VIP', t4: 'Vivienda no VIS (tipo 4)', mul: 'Uso múltiple', com: 'Comercio y servicios', dot: 'Dotacional', eq: 'Equipamiento' };

function pbr(base, rep, ani, extra = {}) {
  const L = new THREE.TextureLoader(), t = (s, srgb) => { const x = L.load(`texturas/pbr/${base}_${s}_1k.jpg`); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(rep, rep); x.anisotropy = ani; if (srgb) x.colorSpace = THREE.SRGBColorSpace; return x; };
  return new THREE.MeshStandardMaterial({ map: t('diff', true), normalMap: t('nor_gl'), roughnessMap: t('rough'), ...extra });
}

export async function crearTorres({ plan, renderer, grupo }) {
  const ani = renderer.capabilities.getMaxAnisotropy();
  const gl = await new GLTFLoader().loadAsync('modelos/plan/torre.glb');
  const M = {
    ladrillo: pbr('red_brick_03', 1 / 1.4, ani, { color: '#e0875f', roughness: 1 }),
    blanco: pbr('white_plaster_02', 1 / 2.2, ani, { color: '#f1eee8' }),
    losa: pbr('concrete_wall_008', 1 / 3, ani, { color: '#d8d4cc' }),
    verde: pbr('leafy_grass', 1 / 2, ani),
    vidrio: new THREE.MeshPhysicalMaterial({ color: '#283541', metalness: 0.6, roughness: 0.06, envMapIntensity: 1.4, clearcoat: 1 }),
    marco: new THREE.MeshStandardMaterial({ color: '#2f3133', metalness: 0.7, roughness: 0.4 }),
    oscuro: new THREE.MeshStandardMaterial({ color: '#141516', roughness: 1 }),
  };
  const matDe = (n, muro) => n === 'muro' ? M[muro] : (M[n] || M.losa);

  /* implantación */
  const dentro = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const torres = []; // { x, z, ang, pisos, muro, ud }
  let semilla = 7; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  for (const e of plan.edificios) {
    const zona = plan.zonas.find(z => z.id === e.id); if (!zona) continue;
    const q = zona.p.reduce((a, b) => (b.o.length > a.o.length ? b : a)); const P = q.o.map(WP), Hs = (q.h || []).map(h => h.map(WP));
    // eje principal = lado más largo
    let best = 0, ang = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > best) { best = l; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } }
    const c = Math.cos(ang), s = Math.sin(ang), aLoc = ([x, z]) => [x * c + z * s, -x * s + z * c], aMun = ([u, v]) => [u * c - v * s, u * s + v * c];
    const L = P.map(aLoc); let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9; for (const [u, v] of L) { u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
    const res = e.tipo in PISOS_TIPO, ES = res ? 1 : 1.5, viv0 = e.viviendas || 0;
    const lotes = (gu, gv) => { const du = LX * ES + gu, dv = LY * ES + gv;
      const nu = Math.max(1, Math.floor((u1 - u0 + gu) / du)), nv = Math.max(1, Math.floor((v1 - v0 + gv) / dv));
      const ou = (u0 + u1) / 2 - (nu - 1) * du / 2, ov = (v0 + v1) / 2 - (nv - 1) * dv / 2, slots = [];
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        const cu = ou + i * du, cv = ov + j * dv, esq = [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].map(([a, b]) => aMun([cu + a * (LX * ES / 2 + 3), cv + b * (LY * ES / 2 + 3)]));
        if (esq.every(p => dentro(p, P) && !Hs.some(h => dentro(p, h)))) slots.push(aMun([cu, cv]));
      }
      return slots; };
    let slots = [];
    for (const [gu, gv] of res ? [[14, 18], [11, 14], [8, 10], [6, 8]] : [[10, 12], [6, 8]]) { slots = lotes(gu, gv); if (!res || slots.length * APTOS_PISO * 22 >= viv0) break; }
    if (!slots.length) slots.push(P.reduce((a, p) => [a[0] + p[0] / P.length, a[1] + p[1] / P.length], [0, 0]));
    const viv = e.viviendas || 0;
    let n = slots.length, pisos = 4;
    if (res) { n = Math.min(slots.length, Math.max(1, Math.ceil(viv / (APTOS_PISO * PISOS_TIPO[e.tipo])))); pisos = Math.min(22, Math.ceil(viv / (APTOS_PISO * n))); }
    const paso = slots.length / n, muro = e.tipo === 't4' || !res ? 'blanco' : (e.tipo === 'mul' && azar() < 0.4 ? 'blanco' : 'ladrillo');
    for (let k = 0; k < n; k++) {
      const [x, z] = slots[Math.floor(k * paso + paso / 2) % slots.length];
      const pk = res ? Math.min(24, Math.max(8, pisos + Math.round((azar() - 0.5) * 4))) : 3;
      torres.push({ x, z, ang, pisos: pk, muro, esc: ES, ud: { id: `${e.id}-T${k + 1}`, nombre: `${e.id} · torre ${k + 1}`, uso: USO[e.tipo] || e.tipo, pisos: pk + 1, altura: H_BAJA + pk * H_PISO + 1.4,
        viviendas: res ? pk * APTOS_PISO : null, area_oficial: e.area_oficial, etapa: e.anio, escenario: '01 · Futuro sin propuesta',
        clase: 'Documentada (manzana y viviendas) · Interpretativa (torre, pisos)', fuente: 'Decreto 448/2023 plano 1/2 · render oficial del plan' } });
    }
  }

  /* instancias: por muro (ladrillo/blanco) y por módulo; cada primitiva del GLB = un InstancedMesh con su material */
  const sel = [], m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), uno = new THREE.Vector3(1, 1, 1);
  for (const muro of ['ladrillo', 'blanco']) {
    const T = torres.filter(t => t.muro === muro); if (!T.length) continue;
    const mats = { baja: [], piso: [], cubierta: [], alero: [] };
    for (const t of T) {
      q4.setFromAxisAngle(Y, -t.ang);
      const esc = new THREE.Vector3(t.esc, 1, t.esc), base = (y) => m4.clone().compose(new THREE.Vector3(t.x, y, t.z), q4, esc);
      mats.baja.push(base(0)); mats.alero.push(base(0));
      for (let p = 0; p < t.pisos; p++) mats.piso.push(base(H_BAJA + p * H_PISO));
      mats.cubierta.push(base(H_BAJA + t.pisos * H_PISO));
    }
    for (const nombre of Object.keys(mats)) {
      const nodo = gl.scene.getObjectByName(nombre); if (!nodo) continue;
      const prims = []; nodo.traverse(o => { if (o.isMesh) prims.push(o); });
      for (const pr of prims) {
        const im = new THREE.InstancedMesh(pr.geometry, matDe(pr.material.name, muro), mats[nombre].length);
        mats[nombre].forEach((mm, i) => im.setMatrixAt(i, mm));
        im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
        grupo.add(im);
      }
    }
  }
  // volúmenes invisibles para seleccionar torre por torre
    for (const t of torres) {
    const h = H_BAJA + t.pisos * H_PISO + 1.5, g = new THREE.BoxGeometry(LX * t.esc, h, LY * t.esc); g.translate(0, h / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#C7FF27', transparent: true, opacity: 0, depthWrite: false })); m.position.set(t.x, 0, t.z); m.rotation.y = -t.ang; m.userData = t.ud; grupo.add(m); sel.push(m);
  }
  return { seleccionables: sel, torres, materiales: M };
}
