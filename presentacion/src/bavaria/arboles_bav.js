/* Árboles del plan parcial como impostores renderizados en Cycles (árbol de Poly Haven, 4 vistas: mismo pipeline de Estrategias):
   cada árbol = dos planos cruzados con alfa recortado; tinte y escala variables. Sin manchas en el piso.
   Sitios: 987 árboles nuevos del plan (plan_bavaria.json), hileras en andenes y alamedas, arbolado de parques y patios (interpretativo). */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { WP } from './geo.js';

export async function crearArbolesPlan({ plan, grupo, torres }) {
  const TL = new THREE.TextureLoader();
  const tex = [0, 1, 2, 3].map(k => { const t = TL.load(`./bavaria/impostores/arbol_isla_${k}.webp`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
  const q1 = new THREE.PlaneGeometry(1, 1); q1.translate(0, 0.5, 0); const q2 = q1.clone().rotateY(Math.PI / 2);
  const geo = mergeGeometries([q1, q2]);
  const dentro = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const libre = (x, z) => !torres.some(t => Math.hypot(t.x - x, t.z - z) < 21 * (t.esc || 1));
  let s = 11; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const sitios = plan.arboles_nuevos.map(a => WP(a)).filter(([x, z]) => libre(x, z));
  for (const z of plan.zonas) {
    if (z.tipo === 'bosque') continue;
    const P = z.p[0].o.map(WP); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, y); z1 = Math.max(z1, y); });
    const paso = z.tipo === 'cp' || z.tipo === 'verde' ? 8 : 11;
    for (let x = x0 + paso / 2; x < x1; x += paso) for (let y = z0 + paso / 2; y < z1; y += paso) {
      const px = x + (azar() - 0.5) * paso * 0.9, py = y + (azar() - 0.5) * paso * 0.9;
      if (azar() < 0.8 && dentro([px, py], P) && libre(px, py)) sitios.push([px, py]);
    }
  }
  for (const al of [...(plan.alamedas || []), ...(plan.andenes || [])]) for (const q of al.p) { const P = q.o.map(WP);
    for (let i = 0; i < P.length; i++) { const A = P[i], B = P[(i + 1) % P.length], L = Math.hypot(B[0] - A[0], B[1] - A[1]); for (let d = 4; d < L; d += 9) { const x = A[0] + (B[0] - A[0]) * d / L, y = A[1] + (B[1] - A[1]) * d / L; if (libre(x, y)) sitios.push([x, y]); } } }
  const lotes = [[], [], [], []]; sitios.forEach(p => lotes[Math.floor(azar() * 4)].push(p));
  const o = new THREE.Object3D(), col = new THREE.Color();
  lotes.forEach((lista, k) => {
    const mat = new THREE.MeshStandardMaterial({ map: tex[k], alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, emissive: '#1d2a12', emissiveIntensity: 0.6 });
    const im = new THREE.InstancedMesh(geo, mat, lista.length);
    lista.forEach(([x, z], i) => { const h = 12 + azar() * 8; o.position.set(x, 0, z); o.rotation.set(0, azar() * Math.PI, 0); o.scale.set(h * 1.05, h, h * 1.05); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, col.setHSL(0.27 + azar() * 0.05, 0.25 + azar() * 0.2, 0.75 + azar() * 0.2)); });
    im.castShadow = true; im.receiveShadow = false; grupo.add(im);
  });
  return { n: sitios.length };
}
