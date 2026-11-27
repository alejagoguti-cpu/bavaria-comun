/* ESCENARIO 01 · FUTURO SIN PROPUESTA: Plan Parcial Bavaria Fábrica (Decreto Distrital 448 de 2023).
   Datos: data/plan_parcial/plan_bavaria.json (tools/plan_bavaria_real.py), calcado del plano oficial 1/2 (SDP, 1:2500).
   Documentado: huella de manzanas, parques, bosque conservado, equipamientos y vías.
   Supuesto: alturas por tipo (el decreto deja la altura «resultante»). Ver docs/fuentes/inventario.md. */
import * as THREE from 'three';
import { WP, cargarJSON } from './geo.js';
import { crearTorres } from './torres.js';
import { crearArbolesPlan } from './arboles_bav.js';

const TIPO = {
  dot: 'Dotacional', com: 'Comercio y servicios', t4: 'Vivienda no VIS (tipo 4)', mul: 'Uso múltiple',
  vis: 'Vivienda de interés social (VIS)', vip: 'Vivienda de interés prioritario (VIP)', eq: 'Equipamiento', cp: 'Parque (cesión)',
  bosque: 'Bosque que se conserva (CAPRP)', verde: 'Zona verde',
};

export async function crearPlanParcial({ scene, renderer }) {
  const P = await cargarJSON('./bavaria/plan_parcial/plan_bavaria.json');
  const g = new THREE.Group(); g.name = 'escenario01'; g.visible = false; scene.add(g);
  const forma = (q) => { const s = new THREE.Shape(q.o.map(p => { const w = WP(p); return new THREE.Vector2(w[0], -w[1]); }));
    for (const h of q.h || []) s.holes.push(new THREE.Path(h.map(p => { const w = WP(p); return new THREE.Vector2(w[0], -w[1]); }))); return s; };
  const plano = (polys, mat, y, ro = 0) => { for (const q of polys) { const ge = new THREE.ShapeGeometry(forma(q)); ge.rotateX(-Math.PI / 2); ge.translate(0, y, 0); const m = new THREE.Mesh(ge, mat); m.renderOrder = ro; m.receiveShadow = true; g.add(m); } };

  // suelo base del predio recortado (lo que no es manzana, vía ni parque queda como tierra de obra / zona dura)
  const ani = renderer.capabilities.getMaxAnisotropy(), TL = new THREE.TextureLoader();
  const pbr = (b, rep, extra = {}) => { const t = (s, c) => { const x = TL.load('./bavaria/tex/' + b + '_' + s + '_1k.jpg'); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(rep, rep); x.anisotropy = ani; if (c) x.colorSpace = THREE.SRGBColorSpace; return x; };
    return new THREE.MeshStandardMaterial({ map: t('diff', 1), normalMap: t('nor_gl'), roughnessMap: t('rough'), ...extra }); };
  // ShapeGeometry da UV = coordenadas del mundo en metros: repeat = 1 / tamaño de la textura
  const mTierra = pbr('leafy_grass', 1 / 4, { color: '#8fa36a' });
  const mCalzada = pbr('concrete_wall_008', 1 / 6, { color: '#8d8f91', roughness: 0.95 });
  const mAnden = pbr('concrete_wall_008', 1 / 2.5, { color: '#e2ddd2' });
  const mPrado = pbr('leafy_grass', 1 / 3, { color: '#9ab573' });
  const mLote = pbr('leafy_grass', 1 / 3.5, { color: '#94ab6c' });
  const borde = { o: P.borde.map(([u, v]) => [u, v]) }; // el borde viene en el marco del modelo
  plano([borde], mTierra, 0.05);
  for (const z of P.zonas) {
    if (z.tipo === 'bosque') continue; // el bosque es la malla real (no se recorta)
    plano(z.p, z.tipo === 'cp' || z.tipo === 'verde' ? mPrado : mLote, 0.12);
  }
  for (const c of P.calzadas) plano(c.p, mCalzada, 0.18);
  for (const a of P.andenes) plano(a.p, mAnden, 0.24);
  for (const a of P.alamedas) plano(a.p, mAnden, 0.22);

  // edificios: torres modeladas en Blender, implantadas en cada manzana (torres.js)
  const T = await crearTorres({ plan: P, renderer, grupo: g });
  const sel = T.seleccionables;
  const AR = await crearArbolesPlan({ plan: P, grupo: g, torres: T.torres });
  // exteriores a recortar de la malla = borde del plan; se conserva el bosque (CAPRP)
  const exteriores = [P.borde.map(WP)];
  const huecos = P.zonas.filter(z => z.tipo === 'bosque').flatMap(z => z.p.map(q => q.o.map(WP)));
  return { grupo: g, torres: T, arboles: AR, seleccionables: sel, exteriores, huecos, total_viviendas: P.total_viviendas, fuente: P.fuente };
}
