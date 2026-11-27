/* Bavaria Común dentro del mundo de kennedy-video.
   Mis capas están en el marco del simulador (origen El Burro); kennedy-video usa otro origen: se desplaza todo con un grupo.
   modelo -> kennedy-video: [x - 7188, 2045.46 - y];  modelo -> simulador: [x - 5341.33, 3161.9 - y];  diferencia = (-1846.67, -1116.44). */
import * as THREE from 'three';
import { crearPlanParcial } from './plan_parcial.js';
import { crearCapas } from './capas.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { WP, cargarJSON } from './geo.js';

export const OFF = [-1846.67, -1116.44];
export const K = ([x, z, y]) => (y === undefined ? [x + OFF[0], z + OFF[1]] : [x + OFF[0], y, z + OFF[1]]); // simulador -> kennedy-video

export async function crearBavaria(W) {
  const base = new THREE.Group(); base.name = 'bavariaComun'; base.position.set(OFF[0], 0, OFF[1]); W.scene.add(base);
  const E1 = await crearPlanParcial({ scene: base, renderer: W.r });
  // máscara de la foto = torres del plan (si están) + huellas de los edificios de Bavaria Común (si están)
  const MK = { t: [[], []], n: [] };
  const aplicarMascara = () => W.fotoMascara && W.fotoMascara([...MK.t[0], ...MK.n].map(P => P.map(K)), MK.t[1].map(P => P.map(K)));
  const malla = { mascara: (ext, huecos = []) => { MK.t = [ext || [], huecos || []]; aplicarMascara(); } };
  const C = await crearCapas({ scene: base, E1, malla });
  const [PX, PZ] = K([C.PX, C.PZ]);

  /* Edificios tecnológicos de Bavaria Común (modelos/nbic.glb, tools/blender/edificios_nbic.py): reemplazan los volúmenes de color.
     Cada modelo (40 x 20 m) se ajusta al rectángulo orientado de la huella real de la nave. Diseño interpretativo. */
  const PRED = await cargarJSON('./bavaria/predio/bavaria.json');
  const gl = await new GLTFLoader().loadAsync('./bavaria/modelos/nbic.glb');
  const TIPO = { 0: 'invernadero', 23: 'laboratorio', 11: 'laboratorio', 4: 'datos', 6: 'mirador', 3: 'escuela', 5: 'escuela' };
  const ajustarMat = (o) => o.traverse(c => { if (!c.isMesh) return; const n = c.material.name; c.castShadow = c.receiveShadow = true;
    if (n === 'vidrio') c.material = new THREE.MeshPhysicalMaterial({ color: '#9fc3cf', metalness: 0.1, roughness: 0.04, transparent: true, opacity: 0.38, envMapIntensity: 1.5 });
    else if (n === 'lima') { c.material = c.material.clone(); c.material.emissive = new THREE.Color('#C7FF27'); c.material.emissiveIntensity = 0.9; }
    else if (n === 'solar') { c.material = c.material.clone(); c.material.metalness = 0.5; c.material.roughness = 0.12; } });
  const edifs = []; C.huellasNBIC = [];
  for (const v of C.prog) {
    const e = PRED.edif[v.userData.e], tipo = TIPO[v.userData.e]; const src = gl.scene.getObjectByName(tipo); if (!src) continue;
    const P = e.p.map(WP); C.huellasNBIC.push(P);
    let best = 0, ang = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > best) { best = l; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } }
    const c = Math.cos(ang), s = Math.sin(ang); let u0 = 1e9, u1 = -1e9, w0 = 1e9, w1 = -1e9; for (const [x, z] of P) { const u = x * c + z * s, w = -x * s + z * c; u0 = Math.min(u0, u); u1 = Math.max(u1, u); w0 = Math.min(w0, w); w1 = Math.max(w1, w); }
    const uc = (u0 + u1) / 2, wc = (w0 + w1) / 2, cx = uc * c - wc * s, cz = uc * s + wc * c;
    const piv = new THREE.Group();
    const dentro = (p) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const A = P[i], B2 = P[j]; if ((A[1] > p[1]) !== (B2[1] > p[1]) && p[0] < (B2[0] - A[0]) * (p[1] - A[1]) / (B2[1] - A[1]) + A[0]) r = !r; } return r; };
    if (tipo === 'mirador') { const o = src.clone(); ajustarMat(o); piv.add(o); piv.position.set(cx, (e.h || 30), cz); piv.scale.setScalar(Math.min(1.4, Math.max(0.6, Math.min(u1 - u0, w1 - w0) / 14))); }
    else {
      // cuadrícula de módulos a tamaño real dentro de la huella (separación de 6 m = calles internas / patios)
      const Lu = u1 - u0, Lw = w1 - w0, nx = Math.max(1, Math.round(Lu / 46)), nz = Math.max(1, Math.round(Lw / 26)), cu = Lu / nx, cw = Lw / nz;
      piv.position.set(cx, 0, cz); piv.rotation.y = -ang;
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const lu = -Lu / 2 + (i + 0.5) * cu, lw = -Lw / 2 + (j + 0.5) * cw, wx = cx + lu * c - lw * s, wz = cz + lu * s + lw * c;
        if (nx * nz > 1 && !dentro([wx, wz])) continue;
        const o = src.clone(); ajustarMat(o); o.position.set(lu, 0, lw); o.scale.set(Math.max(0.5, (cu - 6) / 40), 1, Math.max(0.5, (cw - 6) / 20)); piv.add(o);
      }
    }
    piv.visible = false; piv.userData = { k: v.userData.k, hy: piv.scale.y, on: false }; base.add(piv); edifs.push(piv);
  }
  C.edifsNBIC = edifs;
  C.verNBIC = (k, d = 1) => {
    const on = (p) => k === 'todas' || k === p.userData.k; let alguno = false;
    edifs.forEach((p, i) => { const vis = !!k && on(p); alguno = alguno || vis;
      gsap.killTweensOf(p.scale);
      if (vis) { if (!p.userData.on) { p.visible = true; gsap.fromTo(p.scale, { y: 0.01 }, { y: p.userData.hy, duration: 1.4, delay: k === 'todas' ? i * 0.12 : 0, ease: 'power3.out' }); } else p.scale.y = p.userData.hy; }
      else if (p.userData.on) gsap.to(p.scale, { y: 0.01, duration: Math.max(0.01, d * 0.6), onComplete: () => { p.visible = false; } });
      p.userData.on = vis; });
    MK.n = k ? C.huellasNBIC : []; aplicarMascara();
  };
  const B = { base, E1, C, K, PX, PZ };
  /* estaciones de cámara (marco kennedy-video) */
  B.est = {
    bogota: { p: [9000, 26000, 26000], o: [0, 0, 0] },
    kennedy: { p: [2200, 7600, 7000], o: [0, 0, 300] },
    kennedyMedio: { p: [PX - 900, 3200, PZ + 3400], o: [PX - 1800, 0, PZ - 300] },
    predio: { p: [PX + 650, 820, PZ + 1150], o: [PX, 0, PZ] },
    predioBajo: { p: [PX + 420, 330, PZ + 620], o: [PX - 40, 0, PZ - 40] },
    predioAlto: { p: [PX + 120, 1900, PZ + 600], o: [PX, 0, PZ] },
    torres: { p: [PX - 300, 120, PZ + 460], o: [PX - 60, 45, PZ + 120] },
  };
  /** cerca de un punto del simulador [x, z, ang, y]: a la altura de los ojos si dist < 15 m */
  B.cerca = (q, dist) => { const [x, z] = K([q[0], q[1]]), y = q[3] || 0; return dist < 15 ? { p: [x + dist * 0.95, y + 1.6 + dist * 0.28, z + dist * 1.15], o: [x, y + 0.9, z] } : { p: [x + dist * 0.9, y + dist * 0.75, z + dist * 1.1], o: [x, y + dist * 0.12, z] }; };
  B.edif = (k) => { const v = C.edifNBIC(k); const [x, z] = K(v.userData.c), h = v.userData.h; return { p: [x + 110, h + 95, z + 150], o: [x, h * 0.4, z], c: [x, z], h }; };
  B.puntoLab = (k) => { const v = C.edifNBIC(k), [x, z] = v.userData.c; return [x + 26, z + 26, 0.6, B.suelo(x + 26, z + 26)]; };
  B.suelo = (x, z) => { const t = W.gfoto?.tiles?.group; if (!t) return 0; const [kx, kz] = K([x, z]); const r = new THREE.Raycaster(new THREE.Vector3(kx, 400, kz), new THREE.Vector3(0, -1, 0)); const h = r.intersectObject(t, true)[0]; return h && Math.abs(h.point.y) < 60 ? h.point.y : 0; };
  /** estado limpio de las capas de Bavaria al empezar cada frase */
  B.estado = ({ torres = false, borde = false } = {}) => {
    C.limpiar(0.5);
    if ((C.alturaTorres.h > 0) !== torres) C.torresYa(torres);
    C.borde.material.uniforms.uP.value = borde ? 1 : 0; C.borde.material.uniforms.uA.value = borde ? 1 : 0;
  };
  B.paso = (dt) => C.paso(dt);
  return B;
}
