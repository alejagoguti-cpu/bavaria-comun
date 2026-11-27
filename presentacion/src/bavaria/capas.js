/* Capas 3D del relato: cada una se arma una vez y se anima con GSAP (aparecer, crecer, fluir).
   Todo sale de datos reales (ver docs/fuentes/inventario.md); lo interpretativo se rotula así en la interfaz. */
import * as THREE from 'three';
import { logd } from './logdepth.js';
import { gsap } from 'gsap';
import { W, WP, cargarJSON } from './geo.js';
import { crearModuloHidro } from './modulo_hidro.js';

const LIMA = '#C7FF27';
export const COL = { reutilizar: '#C7FF27', redisenar: '#f0b44c', sustituir: '#ff6b5a', bio: '#34d399', nano: '#c084fc', info: '#38bdf8', cogno: '#f472b6', auto: '#9be15d', exced: '#f0b44c' };

/* ---------- utilidades ---------- */
function lineaGlow(puntos, color, ancho = 2.5, y = 1.2) { // cinta plana que mira al cielo, con progreso de dibujo uP (0..1)
  const pos = [], u = [], idx = []; let L = 0; const acc = [0];
  for (let i = 1; i < puntos.length; i++) { L += Math.hypot(puntos[i][0] - puntos[i - 1][0], puntos[i][1] - puntos[i - 1][1]); acc.push(L); }
  puntos.forEach((p, i) => {
    const a = puntos[Math.max(0, i - 1)], b = puntos[Math.min(puntos.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    pos.push(p[0] - dz * ancho / 2, y, p[1] + dx * ancho / 2, p[0] + dz * ancho / 2, y, p[1] - dx * ancho / 2);
    u.push(acc[i] / (L || 1), acc[i] / (L || 1));
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('u', new THREE.Float32BufferAttribute(u, 1)); g.setIndex(idx);
  const m = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, uniforms: { uP: { value: 0 }, uA: { value: 1 }, uC: { value: new THREE.Color(color) }, uT: { value: 0 }, uL: { value: L } },
    vertexShader: 'attribute float u; varying float vU; void main(){ vU = u; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying float vU; uniform float uP, uA, uT, uL; uniform vec3 uC; void main(){ if (vU > uP) discard;
      float pulso = 0.55 + 0.45 * smoothstep(0.85, 1.0, fract(vU * uL / 60.0 - uT * 0.6)); gl_FragColor = vec4(uC * (0.8 + pulso * 0.6), uA * (0.55 + 0.45 * pulso)); }` }));
  const me = new THREE.Mesh(g, m); me.renderOrder = 5; return me;
}

/* arcos entre pares de puntos del mundo: una sola geometría; uP revela, uT hace correr pulsos de luz */
function arcos(pares, color, alto = 0.25, n = 48) {
  const pos = [], u = [], fase = [];
  pares.forEach(([a, b], k) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]), h = Math.max(25, d * alto), f = Math.random();
    for (let i = 0; i < n; i++) for (const s of [i, i + 1]) {
      const t = s / n; pos.push(a[0] + (b[0] - a[0]) * t, 4 + 4 * h * t * (1 - t), a[1] + (b[1] - a[1]) * t); u.push(t); fase.push(f);
    }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('u', new THREE.Float32BufferAttribute(u, 1)); g.setAttribute('f', new THREE.Float32BufferAttribute(fase, 1));
  const m = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uP: { value: 0 }, uA: { value: 1 }, uT: { value: 0 }, uC: { value: new THREE.Color(color) } },
    vertexShader: 'attribute float u, f; varying float vU, vF; void main(){ vU = u; vF = f; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying float vU, vF; uniform float uP, uA, uT; uniform vec3 uC; void main(){ if (vU > uP) discard;
      float p = smoothstep(0.92, 1.0, 1.0 - abs(fract(vU - uT * 0.35 - vF) - 0.5) * 2.0); gl_FragColor = vec4(uC * (0.6 + 2.0 * p), uA * (0.35 + 0.65 * p)); }` }));
  const l = new THREE.LineSegments(g, m); l.renderOrder = 6; l.frustumCulled = false; return l;
}

/* puntos de luz que viajan por polilíneas (peatones, carros) */
function viajeros(polis, n, color, tam = 6, vel = 12) {
  const tramos = polis.map(P => { const acc = [0]; for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return { P, acc, L: acc[acc.length - 1] }; }).filter(t => t.L > 5);
  const totL = tramos.reduce((a, t) => a + t.L, 0), pos = new Float32Array(n * 3), A = [];
  for (let i = 0; i < n; i++) { let r = Math.random() * totL, k = 0; while (r > tramos[k].L && k < tramos.length - 1) { r -= tramos[k].L; k++; } A.push({ k, s: r, v: vel * (0.6 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1) }); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color, size: tam, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 7;
  pts.userData.paso = (dt, lento = 1) => {
    for (let i = 0; i < n; i++) { const a = A[i], t = tramos[a.k]; a.s = (a.s + a.v * dt * lento + t.L) % t.L;
      let j = 1; while (j < t.acc.length - 1 && t.acc[j] < a.s) j++; const f = (a.s - t.acc[j - 1]) / (t.acc[j] - t.acc[j - 1] || 1), p = t.P[j - 1], q = t.P[j];
      pos[i * 3] = p[0] + (q[0] - p[0]) * f; pos[i * 3 + 1] = 2.2; pos[i * 3 + 2] = p[1] + (q[1] - p[1]) * f; }
    g.attributes.position.needsUpdate = true;
  };
  return pts;
}

function anillos(c, color) { // ondas en el suelo (presión inmobiliaria)
  const g = new THREE.RingGeometry(0, 1, 128); g.rotateX(-Math.PI / 2);
  const m = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uA: { value: 0 }, uC: { value: new THREE.Color(color) } },
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec2 vP; uniform float uT, uA; uniform vec3 uC; void main(){ float r = length(vP); float o = 0.0;
      for (int i = 0; i < 4; i++) { float rr = fract(uT * 0.18 + float(i) * 0.25); o += smoothstep(0.012, 0.0, abs(r - rr)) * (1.0 - rr); }
      o += 0.04 * (1.0 - r) * smoothstep(1.0, 0.6, r); gl_FragColor = vec4(uC, o * uA * 0.45); }` }));
  const me = new THREE.Mesh(g, m); me.position.set(c[0], 3, c[1]); me.scale.setScalar(1800); me.renderOrder = 4; return me;
}

function volumen(P, h, color) { // volumen de vidrio de color sobre una huella (resalta un edificio real de la malla)
  const s = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: h + 1.5, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });
  const me = new THREE.Mesh(g, m); me.renderOrder = 3;
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }));
  me.add(e); me.userData.borde = e; return me;
}
const fundir = (o, a, d = 1, extra = {}) => {
  const mats = []; o.traverse(c => { if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => mats.push(m)); });
  const tok = (o.userData.tok = (o.userData.tok || 0) + 1);
  if (a > 0) o.visible = true;
  mats.forEach(m => { if (m.uniforms && m.uniforms.uA) gsap.to(m.uniforms.uA, { value: a * (m.userData.max ?? 1), duration: d, overwrite: 'auto', ...extra }); else { m.transparent = true; gsap.to(m, { opacity: a * (m.userData.max ?? 1), duration: d, overwrite: 'auto', ...extra }); } });
  if (a === 0) gsap.delayedCall(d, () => { if (o.userData.tok === tok && !o.userData.mantener) o.visible = false; });
};

/* =================================================================== */
export async function crearCapas(X) {
  const { scene, E0, E1 } = X;
  const [AV, PRED, ARB, SX, RED, COLE, CRED, HOG, ENT] = await Promise.all([
    cargarJSON('./bavaria/predio/avenidas.json'), cargarJSON('./bavaria/predio/bavaria.json'), cargarJSON('./bavaria/predio/bavaria_arboles.json'),
    cargarJSON('./bavaria/sintaxis/bavaria_distrito_sx.json'), cargarJSON('./bavaria/red/bavaria_red.json'), cargarJSON('./bavaria/red/colegios.json'),
    cargarJSON('./bavaria/red/colegios_red.json'), cargarJSON('./bavaria/red/hogares.json'), cargarJSON('./bavaria/predio/entradas.json')]);
  const PLAN = await cargarJSON('./bavaria/plan_parcial/plan_bavaria.json');
  const raiz = new THREE.Group(); raiz.name = 'relato'; scene.add(raiz);
  const C = { raiz, t: 0 };
  const [PX, PZ] = W(9319, 2942.6);

  /* avenidas reales (OSM) */
  C.avenidas = {};
  for (const [nom, vias] of Object.entries(AV.vias)) {
    const g = new THREE.Group(); g.visible = false;
    for (const v of vias) { const l = lineaGlow(v.map(WP), nom === 'Av. Alsacia' ? '#F5F3EB' : '#F5F3EB', 9, 1.6); l.material.uniforms.uA.value = 0; g.add(l); }
    raiz.add(g); C.avenidas[nom] = g;
    // punto del rótulo: vértice de la avenida más cercano al predio
    let mej = null, dm = 1e9; for (const v of vias) for (const p of v) { const w = WP(p), d = Math.hypot(w[0] - PX, w[1] - PZ); if (d < dm) { dm = d; mej = w; } }
    g.userData.rotulo = mej;
  }
  C.verAvenida = (nom, on, d = 1.6) => { const g = C.avenidas[nom]; if (!g) return; g.visible = true; g.children.forEach(l => { gsap.to(l.material.uniforms.uP, { value: on ? 1 : 0, duration: d, ease: 'power2.inOut' }); gsap.to(l.material.uniforms.uA, { value: on ? 0.9 : 0, duration: d }); }); };

  /* borde del predio que se dibuja */
  const sitio = PRED.sitio.map(WP); sitio.push(sitio[0]);
  C.borde = lineaGlow(sitio, LIMA, 5, 1.8); C.borde.material.uniforms.uA.value = 0; raiz.add(C.borde);
  C.dibujarBorde = (on, d = 2.5) => { gsap.to(C.borde.material.uniforms.uP, { value: on ? 1 : 0, duration: d, ease: 'power2.inOut' }); gsap.to(C.borde.material.uniforms.uA, { value: on ? 1 : 0, duration: on ? 0.4 : d }); };

  /* edificaciones existentes: volúmenes de color por estado / categoría */
  const CAT = (s) => s === 'ladrillo' || s === 'silos' ? 'reutilizar' : s === 'esqueleto' ? 'redisenar' : 'sustituir';
  C.existentes = PRED.edif.map((e, i) => { const v = volumen(e.p.map(WP), e.h || 8, '#d9d6cf'); v.visible = false; v.userData.cat = CAT(e.s); v.userData.i = i; raiz.add(v); return v; });
  C.verExistentes = (modo, d = 1.2) => { // modo: null | 'vacias' | 'categorias' | {solo: cat}
    C.existentes.forEach((v, k) => {
      const cat = v.userData.cat, mat = v.material, bo = v.userData.borde.material;
      if (!modo) { fundir(v, 0, d); return; }
      const c = modo === 'vacias' ? '#e9e6df' : COL[cat]; mat.color.set(c); bo.color.set(c);
      const on = modo === 'vacias' || modo === 'categorias' || modo.solo === cat;
      mat.userData.max = modo === 'vacias' ? 0.22 : 0.42; bo.userData.max = 0.95;
      fundir(v, on ? 1 : 0.0, d, { delay: modo === 'categorias' ? k * 0.04 : 0 });
    });
  };
  C.cuentaCat = PRED.edif.reduce((a, e) => (a[CAT(e.s)] = (a[CAT(e.s)] || 0) + 1, a), {});

  /* torres del plan parcial que crecen piso a piso */
  C.alturaTorres = { h: 0 };
  C.crecerTorres = (on, d = 9) => {
    if (on) { E1.grupo.visible = true; X.malla && X.malla.mascara(E1.exteriores, E1.huecos); }
    gsap.to(C.alturaTorres, { h: on ? E1.torres.hMax : 0, duration: d, ease: on ? 'power1.inOut' : 'power2.in', overwrite: true,
      onUpdate: () => E1.torres.crecer(C.alturaTorres.h),
      onComplete: () => { if (!on) { E1.grupo.visible = false; X.malla && X.malla.mascara([]); } } });
  };
  C.torresYa = (on) => { gsap.killTweensOf(C.alturaTorres); C.alturaTorres.h = on ? E1.torres.hMax : 0; E1.torres.crecer(C.alturaTorres.h); E1.grupo.visible = on; X.malla && X.malla.mascara(on ? E1.exteriores : [], on ? E1.huecos : []); };

  /* indicadores del escenario sin propuesta */
  const polAv = (nom) => (AV.vias[nom] || []).map(v => v.map(WP));
  C.carros = viajeros([...polAv('Av. Boyacá'), ...polAv('Av. de las Américas')], 2600, '#ffb36b', 7, 13); raiz.add(C.carros); C.carros.visible = false;
  C.carrosLento = { v: 1 };
  C.anillos = anillos([PX, PZ], '#ff8a5a'); C.anillos.visible = false; raiz.add(C.anillos);
  { // árboles que el plan quita (bavaria_arboles.json × plan_bavaria.json.arboles_quitados: etapa en que se quitan; 0 = se queda)
    const q = ARB.arboles.filter((a, i) => PLAN.arboles_quitados[i] > 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(q.flatMap(a => { const w = WP(a); return [w[0], a[2] + 3, w[1]]; }), 3));
    C.taladas = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ff5a4a', size: 9, transparent: true, opacity: 0, depthWrite: false })); C.taladas.visible = false; raiz.add(C.taladas);
    C.nTaladas = q.length;
  }

  /* Bavaria Común: programa NBIC (bavaria_distrito.js del simulador: edificio e -> uso) */
  const PROG = [
    { e: 0, k: 'bio', n: 'Laboratorio de hidroponía, suelos y semillas' }, { e: 23, k: 'bio', n: 'Cultivo experimental de hongos y residuos orgánicos' },
    { e: 11, k: 'nano', n: 'Laboratorio de materiales para conservar alimentos' }, { e: 4, k: 'info', n: 'Centro de monitoreo de la red alimentaria' },
    { e: 6, k: 'info', n: 'Mirador y estación del clima (silos)' }, { e: 3, k: 'cogno', n: 'Escuela de agricultura urbana: aulas y talleres' }, { e: 5, k: 'cogno', n: 'Laboratorio de aprendizaje' },
  ];
  C.prog = PROG.map(p => { const e = PRED.edif[p.e]; const v = volumen(e.p.map(WP), e.h || 8, COL[p.k]); v.visible = false; v.userData = { ...v.userData, ...p }; raiz.add(v);
    let x = 0, z = 0; e.p.forEach(q => { const w = WP(q); x += w[0]; z += w[1]; }); v.userData.c = [x / e.p.length, z / e.p.length]; v.userData.h = e.h || 8; return v; });
  C.verNBIC = (k, d = 1) => C.prog.forEach((v, i) => { const on = k === 'todas' || k === v.userData.k; v.material.userData.max = 0.5; v.userData.borde.material.userData.max = 1; fundir(v, on ? 1 : 0, d, { delay: k === 'todas' ? i * 0.12 : 0 }); });
  C.edifNBIC = (k) => C.prog.find(v => v.userData.k === k);

  /* sintaxis espacial: integración angular antes / después (bavaria_distrito_sx.json) y pasajes nuevos */
  {
    const pos = [], ca = [], cb = [], ramp = (v) => { const c = new THREE.Color(); c.setHSL(0.66 - 0.66 * Math.min(1, Math.max(0, (v - 0.75) / 0.6)), 0.85, 0.5); return c; };
    const pas = [];
    const idx = []; const ANCHO = 7;
    for (const s of SX.seg) { const P = s.p.map(WP); if (s.n) pas.push(P); const A = ramp(s.ia), B = ramp(s.ib);
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; const nx = -dz / l * ANCHO / 2, nz = dx / l * ANCHO / 2, k = pos.length / 3;
        pos.push(a[0] + nx, 3, a[1] + nz, a[0] - nx, 3, a[1] - nz, b[0] + nx, 3, b[1] + nz, b[0] - nx, 3, b[1] - nz); idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        for (let j = 0; j < 4; j++) { ca.push(A.r, A.g, A.b); cb.push(B.r, B.g, B.b); } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.setAttribute('ca', new THREE.Float32BufferAttribute(ca, 3)); g.setAttribute('cb', new THREE.Float32BufferAttribute(cb, 3));
    const m = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, uniforms: { uM: { value: 0 }, uA: { value: 0 } },
      vertexShader: 'attribute vec3 ca, cb; uniform float uM; varying vec3 vC; void main(){ vC = mix(ca, cb, uM); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'varying vec3 vC; uniform float uA; void main(){ gl_FragColor = vec4(vC * 1.25, uA); }' }));
    C.sintaxis = new THREE.Mesh(g, m); C.sintaxis.renderOrder = 4; C.sintaxis.visible = false; C.sintaxis.frustumCulled = false; raiz.add(C.sintaxis);
    C.pasajes = new THREE.Group(); C.pasajes.visible = false; pas.forEach(P => { const l = lineaGlow(P, LIMA, 4, 2.4); l.material.uniforms.uA.value = 0; C.pasajes.add(l); }); raiz.add(C.pasajes);
    C.peatones = viajeros(pas, 420, '#fffbe8', 5, 1.4); C.peatones.visible = false; raiz.add(C.peatones);
  }
  { // bosque que no se interviene: copas reales detectadas (bandera 1 = bosque denso)
    const b = ARB.arboles.filter(a => a[4] === 1), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(b.flatMap(a => { const w = WP(a); return [w[0], a[2] + 2, w[1]]; }), 3));
    C.bosque = new THREE.Points(g, new THREE.PointsMaterial({ color: '#8dff6a', size: 7, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); C.bosque.visible = false; raiz.add(C.bosque);
  }

  /* red territorial: Bavaria -> colegios (OSM) y hogares (huellas OSM) */
  const bav = [PX, PZ];
  C.colegios = COLE.colegios.map(c => c.c);
  C.arcosColegios = arcos(C.colegios.map(c => [bav, c]), '#7cc8ff', 0.18); C.arcosColegios.visible = false; raiz.add(C.arcosColegios);
  { // 1 de cada 12 edificaciones a menos de 2,5 km: muestra de hogares (no todos para que se lea)
    const H = HOG.c.filter((h, i) => i % 45 === 0).map(h => WP(h)).filter(w => Math.hypot(w[0] - PX, w[1] - PZ) < 2600 && Math.hypot(w[0] - PX, w[1] - PZ) > 450);
    C.hogares = H; C.arcosHogares = arcos(H.map(h => [bav, h]), LIMA, 0.12, 32); C.arcosHogares.material.uniforms.uC.value.multiplyScalar(0.55); C.arcosHogares.visible = false; raiz.add(C.arcosHogares);
  }
  C.verArcos = (o, on, d = 3) => { const tok = (o.userData.tok = (o.userData.tok || 0) + 1); o.visible = true; gsap.to(o.material.uniforms.uP, { value: on ? 1 : 0, duration: d, ease: 'power2.out' }); gsap.to(o.material.uniforms.uA, { value: on ? 1 : 0, duration: on ? 0.5 : d, onComplete: () => { if (!on && o.userData.tok === tok) o.visible = false; } }); };

  /* huertas en parques cercanos a colegios (colegios_red.json, IDRD) */
  C.parques = CRED.huertas.map(h => ({ n: h.n, c: h.c, poly: h.poly, r: h.r }));
  C.enlacesColPar = arcos(CRED.asig.map(([hi, ci]) => [C.colegios[ci % C.colegios.length], C.parques[hi].c]).filter(p => p[0] && p[1]), '#b8f5a0', 0.08, 24);
  C.enlacesColPar.visible = false; raiz.add(C.enlacesColPar);
  C.plazas = RED.plazas.map(p => ({ n: p.n, w: WP(p.p) }));
  C.arcosMercados = arcos(C.plazas.map(q => [bav, q.w]), COL.info, 0.22); C.arcosMercados.visible = false; raiz.add(C.arcosMercados);

  /* módulo hidropónico (modulo_hidro.js) */
  C.modulo = crearModuloHidro(X); C.modulo.grupo.visible = false; raiz.add(C.modulo.grupo);
  // copias del módulo en los parques (instancias del conjunto completo, con su rotación)
  C.modulosParques = C.modulo.instanciar(C.parques.flatMap(p => { const out = []; const n = Math.max(4, Math.min(14, Math.round(p.r / 5))); for (let i = 0; i < n; i++) { const a = i * 2.39996, r = 4 + 3.2 * Math.sqrt(i); out.push([p.c[0] + Math.cos(a) * r * 1.8, p.c[1] + Math.sin(a) * r * 1.8, a]); } return out; }));
  C.modulosParques.visible = false; raiz.add(C.modulosParques);
  // flujos de cosecha: parques -> hogares cercanos (autoconsumo) y -> plazas de mercado (excedentes)
  C.flujoAuto = arcos(C.parques.flatMap(p => C.hogares.filter(h => Math.hypot(h[0] - p.c[0], h[1] - p.c[1]) < 900).slice(0, 6).map(h => [p.c, h])), COL.auto, 0.1, 24); C.flujoAuto.visible = false; raiz.add(C.flujoAuto);
  C.flujoExc = arcos(C.parques.map(p => { let b = C.plazas[0].w, d = 1e9; C.plazas.forEach(q => { const dd = Math.hypot(q.w[0] - p.c[0], q.w[1] - p.c[1]); if (dd < d) { d = dd; b = q.w; } }); return [p.c, b]; }), COL.exced, 0.2); C.flujoExc.visible = false; raiz.add(C.flujoExc);

  /* animación continua */
  C.paso = (dt) => {
    C.t += dt;
    raiz.traverse(o => { const u = o.material && o.material.uniforms; if (u && u.uT) u.uT.value = C.t; });
    if (C.carros.visible) C.carros.userData.paso(dt, C.carrosLento.v);
    if (C.peatones.visible) C.peatones.userData.paso(dt);
    C.modulo.paso(dt);
  };
  /* apagar todo (para reconstruir el estado de una frase) */
  C.limpiar = (d = 0.8) => {
    Object.keys(C.avenidas).forEach(n => C.verAvenida(n, false, d));
    C.verExistentes(null, d); C.verNBIC(null, d);
    [C.carros, C.taladas, C.bosque, C.peatones].forEach(o => fundir(o, 0, d));
    fundir(C.anillos, 0, d); fundir(C.sintaxis, 0, d); C.pasajes.children.forEach(l => gsap.to(l.material.uniforms.uA, { value: 0, duration: d }));
    [C.arcosColegios, C.arcosHogares, C.enlacesColPar, C.flujoAuto, C.flujoExc, C.arcosMercados].forEach(o => o.visible && C.verArcos(o, false, d));
    C.modulo.ocultar(d); C.modulosParques.visible = false; C.pasajes.visible = false;
  };
  C.entradas = ENT.entradas.map(WP);
  C.fundir = fundir; C.PX = PX; C.PZ = PZ;
  return C;
}
