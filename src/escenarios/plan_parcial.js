/* ESCENARIO 01 · FUTURO SIN PROPUESTA: Plan Parcial Bavaria Fábrica (Decreto Distrital 448 de 2023).
   Datos: data/plan_parcial/plan_bavaria.json (tools/plan_bavaria_real.py), calcado del plano oficial 1/2 (SDP, 1:2500).
   Documentado: huella de manzanas, parques, bosque conservado, equipamientos y vías.
   Supuesto: alturas por tipo (el decreto deja la altura «resultante»). Ver docs/fuentes/inventario.md. */
import * as THREE from 'three';
import { WP, cargarJSON } from '../escena/geo.js';
import { fachada } from './fachadas.js';

const TIPO = {
  dot: 'Dotacional', com: 'Comercio y servicios', t4: 'Vivienda no VIS (tipo 4)', mul: 'Uso múltiple',
  vis: 'Vivienda de interés social (VIS)', vip: 'Vivienda de interés prioritario (VIP)', eq: 'Equipamiento', cp: 'Parque (cesión)',
  bosque: 'Bosque que se conserva (CAPRP)', verde: 'Zona verde',
};

export async function crearPlanParcial({ scene, renderer }) {
  const P = await cargarJSON('data/plan_parcial/plan_bavaria.json');
  const g = new THREE.Group(); g.name = 'escenario01'; g.visible = false; scene.add(g);
  const forma = (q) => { const s = new THREE.Shape(q.o.map(p => { const w = WP(p); return new THREE.Vector2(w[0], -w[1]); }));
    for (const h of q.h || []) s.holes.push(new THREE.Path(h.map(p => { const w = WP(p); return new THREE.Vector2(w[0], -w[1]); }))); return s; };
  const plano = (polys, mat, y, ro = 0) => { for (const q of polys) { const ge = new THREE.ShapeGeometry(forma(q)); ge.rotateX(-Math.PI / 2); ge.translate(0, y, 0); const m = new THREE.Mesh(ge, mat); m.renderOrder = ro; m.receiveShadow = true; g.add(m); } };

  // suelo base del predio recortado (lo que no es manzana, vía ni parque queda como tierra de obra / zona dura)
  const mTierra = new THREE.MeshStandardMaterial({ color: '#8a8478', roughness: 1 });
  const mCalzada = new THREE.MeshStandardMaterial({ color: '#3d3f42', roughness: 0.95 });
  const mAnden = new THREE.MeshStandardMaterial({ color: '#b9b4aa', roughness: 0.9 });
  const mPrado = new THREE.MeshStandardMaterial({ color: '#5f7a45', roughness: 1 });
  const mLote = new THREE.MeshStandardMaterial({ color: '#a39d92', roughness: 0.95 });
  const borde = { o: P.borde.map(([u, v]) => [u, v]) }; // el borde viene en el marco del modelo
  plano([borde], mTierra, 0.05);
  for (const z of P.zonas) {
    if (z.tipo === 'bosque') continue; // el bosque es la malla real (no se recorta)
    plano(z.p, z.tipo === 'cp' || z.tipo === 'verde' ? mPrado : mLote, 0.12);
  }
  for (const c of P.calzadas) plano(c.p, mCalzada, 0.18);
  for (const a of P.andenes) plano(a.p, mAnden, 0.24);
  for (const a of P.alamedas) plano(a.p, mAnden, 0.22);

  // edificios: extrusión de la huella del plano por número de pisos (3 m), patio vacío
  const mCub = new THREE.MeshStandardMaterial({ color: '#8d8a84', roughness: 0.9 });
  const sel = [];
  for (const e of P.edificios) {
    const h = e.pisos * 3.0, mz = P.manzanas.find(m => m.id === e.id) || {};
    for (const q of e.p) {
      const ge = new THREE.ExtrudeGeometry(forma(q), { depth: h, bevelEnabled: false });
      ge.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(ge, [mCub, fachada(e.mat, renderer)]);
      m.castShadow = m.receiveShadow = true;
      m.userData = {
        id: e.id, nombre: e.id, uso: TIPO[e.tipo] || e.tipo, pisos: e.pisos, altura: h, area_oficial: e.area_oficial,
        viviendas: e.viviendas ?? mz.viviendas, etapa: mz.etapa ?? e.anio, escenario: '01 · Futuro sin propuesta',
        clase: 'Documentada (huella) · Supuesto (altura)', fuente: 'Decreto 448/2023, plano 1/2 (SDP)',
      };
      g.add(m); sel.push(m);
    }
  }
  // exteriores a recortar de la malla = borde del plan; se conserva el bosque (CAPRP)
  const exteriores = [P.borde.map(WP)];
  const huecos = P.zonas.filter(z => z.tipo === 'bosque').flatMap(z => z.p.map(q => q.o.map(WP)));
  return { grupo: g, seleccionables: sel, exteriores, huecos, total_viviendas: P.total_viviendas, fuente: P.fuente };
}
