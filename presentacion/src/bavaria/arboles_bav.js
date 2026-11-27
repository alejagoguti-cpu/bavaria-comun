/* Árboles 3D reales del simulador de Kennedy (GLB de island_tree_01/02, arbolpeq y jacaranda, nivel L1) para el plan parcial:
   - los 987 árboles nuevos del plan en andenes y alamedas (plan_bavaria.json · arboles_nuevos)
   - arbolado de los parques de cesión y de los patios de las manzanas (interpretativo, como en el render oficial)
   Instancias por especie y por parte (madera / hojas). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { WP } from './geo.js';

const ESP = ['island_tree_01', 'island_tree_02', 'arbolpeq', 'jacaranda'];

export async function crearArbolesPlan({ plan, grupo, torres }) {
  const L = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const mods = await Promise.all(ESP.map(async (e) => {
    const partes = [];
    for (const p of ['madera', 'hojas']) {
      const g = await L.loadAsync(`./bavaria/arboles/${e}_L1_${p}.glb`);
      g.scene.updateMatrixWorld(true);
      g.scene.traverse(o => { if (o.isMesh) { const geo = o.geometry.clone().applyMatrix4(o.matrixWorld); const m = o.material.clone(); m.side = THREE.DoubleSide; if (m.transparent) { m.transparent = false; m.alphaTest = 0.45; } m.metalness = 0; m.roughness = 1; partes.push({ geo, mat: m }); } });
    }
    const b = new THREE.Box3(); partes.forEach(p => { p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); });
    const h = b.max.y - b.min.y || 1; partes.forEach(p => p.geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2).scale(1 / h, 1 / h, 1 / h));
    return partes;
  }));

  // sitios: árboles nuevos del plan + relleno de parques y patios (sin tocar las torres)
  const dentro = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const libre = (x, z) => !torres.some(t => Math.hypot(t.x - x, t.z - z) < 22 * (t.esc || 1));
  let s = 11; const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const sitios = plan.arboles_nuevos.map(a => { const w = WP(a); return [w[0], w[1]]; });
  for (const z of plan.zonas) {
    if (z.tipo === 'bosque') continue;
    const P = z.p[0].o.map(WP); let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, y); z1 = Math.max(z1, y); });
    const paso = z.tipo === 'cp' ? 11 : 15;
    for (let x = x0 + paso / 2; x < x1; x += paso) for (let y = z0 + paso / 2; y < z1; y += paso) {
      const px = x + (azar() - 0.5) * paso * 0.8, py = y + (azar() - 0.5) * paso * 0.8;
      if (azar() < (z.tipo === 'cp' ? 0.75 : 0.45) && dentro([px, py], P) && libre(px, py)) sitios.push([px, py]);
    }
  }
  // instancias
  const porEsp = ESP.map(() => []); sitios.forEach((p, i) => porEsp[Math.floor(azar() * ESP.length)].push(p));
  const o = new THREE.Object3D(), col = new THREE.Color(); let n = 0;
  porEsp.forEach((lista, k) => {
    if (!lista.length) return;
    for (const pt of mods[k]) {
      const im = new THREE.InstancedMesh(pt.geo, pt.mat, lista.length);
      lista.forEach(([x, z], i) => { const h = 9 + azar() * 7; o.position.set(x, 0, z); o.rotation.set(0, azar() * 6.28, 0); o.scale.setScalar(h); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
      im.castShadow = true; im.receiveShadow = true; grupo.add(im);
    }
    n += lista.length;
  });
  return { n };
}
