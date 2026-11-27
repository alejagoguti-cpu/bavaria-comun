/* Módulo hidropónico NFT en A (técnica de película de nutrientes): se arma pieza por pieza, el agua circula y las plantas crecen.
   Dimensiones de referencia (2,0 × 1,2 × 1,6 m, 4 tubos de 110 mm por cara, 8 plantas por tubo, tanque de 200 L):
   PENDIENTE reemplazarlas por la especificación del módulo de la autora (docs/pendientes_autora.md). */
import * as THREE from 'three';
import { logd } from './logdepth.js';
import { gsap } from 'gsap';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const LARGO = 2.0, ANCHO = 1.2, ALTO = 1.6, TUBOS = 4, PLANTAS = 8, R_TUBO = 0.055;

function hojaLechuga() { // roseta: 16 hojas curvas con borde ondulado y degradé de verde (vertex colors)
  const hojas = [];
  for (let i = 0; i < 16; i++) {
    const g = new THREE.PlaneGeometry(0.075, 0.11, 6, 8), p = g.attributes.position, col = [];
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k), y = p.getY(k) + 0.055, t = y / 0.11;
      const ancho = Math.sin(Math.PI * Math.min(1, t * 1.1)) * (0.6 + 0.4 * t);
      p.setX(k, x * ancho + Math.sin(y * 90 + x * 40) * 0.004 * t);
      p.setZ(k, -t * t * 0.05 + Math.abs(x) * 0.25 * t + Math.sin(x * 120) * 0.004 * t);
      p.setY(k, y);
      const c = new THREE.Color().setHSL(0.24 + 0.03 * t, 0.62, 0.22 + 0.32 * t); col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const a = i * 2.39996, r = 0.15 + (i / 16) * 0.85;
    g.rotateX(-0.25 - r * 0.9); g.rotateY(a); g.scale(0.6 + r * 0.6, 0.6 + r * 0.6, 0.6 + r * 0.6); g.translate(0, 0.01 * (1 - r), 0);
    g.computeVertexNormals(); hojas.push(g);
  }
  return mergeGeometries(hojas);
}

export function crearModuloHidro(X) {
  let M_plataforma = [];
  const g = new THREE.Group(); g.name = 'moduloHidro';
  const alu = new THREE.MeshStandardMaterial({ color: '#c9ccd0', metalness: 0.85, roughness: 0.32 });
  const pvc = new THREE.MeshPhysicalMaterial({ color: '#f4f4f1', roughness: 0.35, clearcoat: 0.6 });
  const negro = new THREE.MeshStandardMaterial({ color: '#1b1c1d', roughness: 0.7 });
  const tanqueM = new THREE.MeshStandardMaterial({ color: '#2d5f8f', roughness: 0.45 });
  const lechugaM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, side: THREE.DoubleSide });
  const raizM = new THREE.MeshStandardMaterial({ color: '#efe6cf', roughness: 0.8 });
  const aguaM = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uA: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'varying vec2 vUv; uniform float uT, uA; void main(){ float d = smoothstep(0.6, 1.0, sin((vUv.x * 18.0 - uT * 3.0) * 3.1416) * 0.5 + 0.5); gl_FragColor = vec4(vec3(0.35, 0.85, 1.0) * (0.5 + d), uA * (0.25 + 0.75 * d)); }' }));
  const partes = []; // { obj, desde: Vector3 (desplazamiento al despiezar), orden, nombre }
  const agrega = (o, nombre, orden, desde) => { o.castShadow = o.receiveShadow = true; g.add(o); partes.push({ o, nombre, orden, desde: desde || new THREE.Vector3(0, 1.5, 0), base: o.position.clone() }); return o; };

  // estructura en A: 4 patas inclinadas + travesaños + base
  const perf = (l) => new RoundedBoxGeometry(0.04, l, 0.04, 2, 0.006);
  const inc = Math.atan2(ANCHO / 2 - 0.1, ALTO);
  for (const x of [-LARGO / 2 + 0.05, LARGO / 2 - 0.05]) for (const s of [-1, 1]) {
    const pata = new THREE.Mesh(perf(Math.hypot(ALTO, ANCHO / 2 - 0.1)), alu); pata.position.set(x, ALTO / 2, s * (ANCHO / 4 + 0.025)); pata.rotation.x = s * inc;
    agrega(pata, 'Estructura de aluminio', 0, new THREE.Vector3(0, 0, s * 1.2));
  }
  for (const z of [-ANCHO / 2 + 0.06, ANCHO / 2 - 0.06]) { const b = new THREE.Mesh(new RoundedBoxGeometry(LARGO, 0.04, 0.04, 2, 0.006), alu); b.position.set(0, 0.04, z); agrega(b, 'Estructura de aluminio', 0, new THREE.Vector3(0, -0.6, 0)); }
  const cumbre = new THREE.Mesh(new RoundedBoxGeometry(LARGO, 0.05, 0.05, 2, 0.008), alu); cumbre.position.set(0, ALTO, 0); agrega(cumbre, 'Estructura de aluminio', 0, new THREE.Vector3(0, 1.2, 0));

  // tubos NFT con canastillas, raíces y lechugas
  const lech = hojaLechuga(), plantas = [];
  for (const s of [-1, 1]) for (let i = 0; i < TUBOS; i++) {
    const y = 0.32 + i * (ALTO - 0.45) / (TUBOS - 1), z = s * ((ANCHO / 2 - 0.1) * (1 - (y - 0.04) / ALTO) + 0.05);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R_TUBO, R_TUBO, LARGO + 0.1, 40, 1), pvc); t.rotation.z = Math.PI / 2; t.position.set(0, y, z);
    agrega(t, 'Tubos de PVC (NFT)', 1, new THREE.Vector3(0, 0, s * 0.9));
    for (const xe of [-1, 1]) { const tapa = new THREE.Mesh(new THREE.CylinderGeometry(R_TUBO + 0.008, R_TUBO + 0.008, 0.03, 40), pvc); tapa.rotation.z = Math.PI / 2; tapa.position.set(xe * (LARGO / 2 + 0.06), y, z); agrega(tapa, 'Tubos de PVC (NFT)', 1, new THREE.Vector3(xe * 0.6, 0, s * 0.9)); }
    // película de agua dentro del tubo (se ve por las canastillas)
    const ag = new THREE.Mesh(new THREE.CylinderGeometry(R_TUBO * 0.6, R_TUBO * 0.6, LARGO, 12, 1, true), aguaM); ag.rotation.z = Math.PI / 2; ag.position.set(0, y - R_TUBO * 0.45, z); ag.scale.set(1, 1, 0.35); g.add(ag);
    for (let k = 0; k < PLANTAS; k++) {
      const x = -LARGO / 2 + 0.15 + k * (LARGO - 0.3) / (PLANTAS - 1);
      const cana = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.05, 20, 1, true), negro); cana.position.set(x, y + R_TUBO - 0.01, z); agrega(cana, 'Canastillas', 2, new THREE.Vector3(0, 0.5, 0));
      const raiz = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 10), raizM); raiz.position.set(x, y - 0.01, z); raiz.rotation.x = Math.PI; g.add(raiz);
      const p = new THREE.Mesh(lech, lechugaM); p.position.set(x, y + R_TUBO + 0.01, z); p.rotation.y = k * 1.7 + i; p.castShadow = true; p.scale.setScalar(0.001); g.add(p); plantas.push(p);
    }
  }
  // tanque, bomba y tuberías de subida / retorno
  const tanque = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.75, 48), tanqueM); tanque.position.set(LARGO / 2 + 0.55, 0.375, 0); agrega(tanque, 'Depósito de agua (200 L)', 3, new THREE.Vector3(1.4, 0, 0));
  const tapaT = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 48), negro); tapaT.position.set(LARGO / 2 + 0.55, 0.77, 0); agrega(tapaT, 'Depósito de agua (200 L)', 3, new THREE.Vector3(1.4, 0.4, 0));
  const bomba = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.12, 0.12, 3, 0.02), negro); bomba.position.set(LARGO / 2 + 0.55, 0.85, 0.2); agrega(bomba, 'Bomba sumergible', 4, new THREE.Vector3(1.4, 0.8, 0.4));
  const curva = (pts) => new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const sube = curva([[LARGO / 2 + 0.5, 0.85, 0.2], [LARGO / 2 + 0.3, ALTO + 0.1, 0.1], [LARGO / 2 + 0.08, ALTO - 0.05, 0]]);
  const baja = curva([[-LARGO / 2 - 0.08, 0.3, 0], [-LARGO / 2 - 0.2, 0.12, 0], [0, 0.1, -0.05], [LARGO / 2 + 0.3, 0.12, -0.15], [LARGO / 2 + 0.5, 0.78, -0.2]]);
  for (const [c, nombre] of [[sube, 'Tubería de impulsión'], [baja, 'Retorno: recircula los nutrientes']]) {
    const tb = new THREE.Mesh(new THREE.TubeGeometry(c, 64, 0.016, 16), pvc); agrega(tb, nombre, 4, new THREE.Vector3(0, 0.8, 0));
    const ag = new THREE.Mesh(new THREE.TubeGeometry(c, 64, 0.019, 12), aguaM); g.add(ag);
  }

  /* plataforma de piso real bajo el módulo (de cerca la malla de Google se ve borrosa): adoquín de concreto + pasto, borde difuminado */
  {
    const TL = new THREE.TextureLoader(), tx = (n, rep, srgb) => { const t = TL.load('./bavaria/tex/' + n + '_1k.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
    const mk = (r0, r1, base, rep, color) => { const geo = new THREE.RingGeometry(r0, r1, 96, 4); geo.rotateX(-Math.PI / 2);
      const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, p.getZ(i) / 2);
      const m = new THREE.MeshStandardMaterial({ map: tx(base + '_diff', rep, true), normalMap: tx(base + '_nor_gl', rep), roughnessMap: tx(base + '_rough', rep), color, transparent: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
      m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vR;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvR = length(position.xz);');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vR;').replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= 1.0 - smoothstep(' + (r1 * 0.7).toFixed(1) + ', ' + r1.toFixed(1) + ', vR);'); };
      const me = new THREE.Mesh(geo, m); me.receiveShadow = true; me.userData.noInst = true; return me; };
    const pasto = mk(2.4, 16, 'leafy_grass', 1, '#9cb07a'); pasto.position.y = -0.38; g.add(pasto);
    const piso = mk(0, 2.6, 'concrete_wall_008', 1.2, '#c9c4ba'); piso.position.y = -0.36; g.add(piso);
    M_plataforma = [pasto, piso];
  }

  /* estado y animaciones */
  const M = { grupo: g, plantas, partes };
  M.armar = (d = 6) => { // pieza por pieza desde su despiece
    g.visible = true; const tl = gsap.timeline();
    partes.forEach((p) => { p.o.position.copy(p.base).add(p.desde); p.o.visible = false; });
    plantas.forEach(p => p.scale.setScalar(0.001)); aguaM.uniforms.uA.value = 0;
    const ord = [...new Set(partes.map(p => p.orden))].sort();
    ord.forEach((o, k) => { const ps = partes.filter(p => p.orden === o);
      tl.add(() => ps.forEach(p => { p.o.visible = true; }), k * d / (ord.length + 2));
      ps.forEach((p, j) => tl.to(p.o.position, { x: p.base.x, y: p.base.y, z: p.base.z, duration: 1.1, ease: 'power3.out' }, k * d / (ord.length + 2) + j * 0.01)); });
    tl.to(aguaM.uniforms.uA, { value: 1, duration: 1.2 }, d * 0.75);
    return tl;
  };
  M.despiezar = (on, d = 1.4) => partes.forEach(p => gsap.to(p.o.position, { x: p.base.x + (on ? p.desde.x * 0.6 : 0), y: p.base.y + (on ? p.desde.y * 0.6 : 0), z: p.base.z + (on ? p.desde.z * 0.6 : 0), duration: d, ease: 'power2.inOut' }));
  M.crecer = (d = 5) => plantas.forEach((p, i) => gsap.to(p.scale, { x: 1, y: 1, z: 1, duration: d * 0.6, delay: (i % PLANTAS) * d * 0.04 + Math.random() * 0.4, ease: 'power2.out' }));
  M.ya = () => { g.visible = true; partes.forEach(p => { p.o.position.copy(p.base); p.o.visible = true; }); plantas.forEach(p => p.scale.setScalar(1)); aguaM.uniforms.uA.value = 1; };
  M.ocultar = (d = 0.6) => { if (!g.visible) return; gsap.to(aguaM.uniforms.uA, { value: 0, duration: d }); gsap.delayedCall(d, () => { g.visible = false; }); };
  M.paso = (dt) => { aguaM.uniforms.uT.value += dt; };
  M.colocar = (x, z, ang = 0, y = 0) => { g.position.set(x, y + 0.4, z); g.rotation.y = ang; };

  /* instancias del módulo completo (para muchos sitios): cada malla del módulo -> InstancedMesh con la transformación del sitio */
  M.instanciar = (sitios) => {
    const gi = new THREE.Group(); M.ya(); g.updateMatrixWorld(true);
    const m = new THREE.Matrix4(), base = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), uno = new THREE.Vector3(1, 1, 1);
    const grupos = new Map(); g.traverse(o => { if (!o.isMesh || o.material === aguaM || o.userData.noInst) return; const k = o.geometry.uuid + o.material.uuid; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(o); });
    for (const lista of grupos.values()) {
      const im = new THREE.InstancedMesh(lista[0].geometry, lista[0].material, lista.length * sitios.length); let i = 0;
      for (const [x, z, a] of sitios) { base.compose(new THREE.Vector3(x, 0.4, z), q.setFromAxisAngle(Y, a), uno);
        for (const o of lista) { o.updateMatrix(); m.multiplyMatrices(base, o.matrix); im.setMatrixAt(i++, m); } }
      im.castShadow = true; im.frustumCulled = false; gi.add(im);
    }
    g.visible = false; return gi;
  };
  return M;
}
