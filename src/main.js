/* BAVARIA COMÚN · plataforma 3D (urbia). Fase actual: landing con vuelo Bogotá → Kennedy → predio y escenarios 00 y 01. */
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { W, PREDIO_C, deLL } from './escena/geo.js';
import { crearMalla } from './escena/malla.js';
import { crearEstadoActual } from './escenarios/estado_actual.js';
import { crearPlanParcial } from './escenarios/plan_parcial.js';
import { crearUI } from './ui/ui.js';

const MOVIL = matchMedia('(max-width: 760px)').matches;
const RMQ = matchMedia('(prefers-reduced-motion: reduce)').matches;
const host = document.getElementById('escena');
const renderer = new THREE.WebGLRenderer({ antialias: !MOVIL, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOVIL ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = !MOVIL; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#9fb3c4');
scene.fog = new THREE.Fog('#a9b8c4', 14000, 70000); // bruma de la sabana
const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 2, 120000);

// luz de Bogotá (4,6° N): sol alto, cielo nublado frecuente
const hemi = new THREE.HemisphereLight('#dfe8f0', '#4a4a40', 1.4); scene.add(hemi);
const sol = new THREE.DirectionalLight('#fff3e0', 2.4); sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 4000 });
sol.shadow.bias = -0.0004; scene.add(sol, sol.target);

const [PX, PZ] = W(PREDIO_C[0], PREDIO_C[1]);
sol.position.set(PX - 700, 1500, PZ + 500); sol.target.position.set(PX, 0, PZ);

const ctl = new MapControls(cam, renderer.domElement);
ctl.enableDamping = true; ctl.dampingFactor = 0.08; ctl.maxPolarAngle = Math.PI * 0.47; ctl.minDistance = 30; ctl.maxDistance = 40000;
ctl.screenSpacePanning = false;

/* ---------- vistas de cámara (mundo) ---------- */
const [bx, by] = deLL(-74.075, 4.655), [BX, BZ] = W(bx, by); // centro de Bogotá
const [kx, ky] = deLL(-74.155, 4.630), [KX, KZ] = W(kx, ky); // Kennedy
const V = {
  bogota: { p: [BX + 9000, 26000, BZ + 21000], t: [BX - 2000, 0, BZ] },
  kennedy: { p: [KX + 2600, 5200, KZ + 6200], t: [KX, 0, KZ] },
  predio: { p: [PX + 650, 820, PZ + 1150], t: [PX, 0, PZ] },
  predioAlto: { p: [PX + 120, 1900, PZ + 600], t: [PX, 0, PZ] },
};
const vista = (v) => { cam.position.set(...v.p); ctl.target.set(...v.t); cam.lookAt(ctl.target); };
vista(V.bogota);

let vuelo = null; // { de, a, t, dur, fin }
const suave = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function volar(v, dur = 3.2) {
  return new Promise(res => {
    if (RMQ) { vista(v); return res(); }
    vuelo = { dp: cam.position.clone(), dt: ctl.target.clone(), ap: new THREE.Vector3(...v.p), at: new THREE.Vector3(...v.t), t: 0, dur, fin: res };
  });
}

/* ---------- mundo ---------- */
const ui = crearUI();
let malla = null;
try {
  malla = await crearMalla({ scene, cam, renderer, alCargar: (st) => ui.carga(st) });
} catch (e) { console.warn(e); ui.aviso('No cargó la malla fotorrealista de Google. Se muestra solo el modelo propio.'); }
const E0 = await crearEstadoActual({ scene });
const E1 = await crearPlanParcial({ scene, renderer });
if (malla) malla.puntosCalle = E0.sitio.filter((_, i) => i % 3 === 0).map(([x, z]) => [x + (x - PX) * 0.04, z + (z - PZ) * 0.04]);

/* ---------- escenarios ---------- */
const ESC = {
  actual: { n: '00 · Estado actual', ver() { E1.grupo.visible = false; malla && malla.mascara([]); } },
  plan: { n: '01 · Futuro sin propuesta', ver() { E1.grupo.visible = true; malla && malla.mascara(E1.exteriores, E1.huecos); } },
  comun: { n: '02 · Bavaria Común', ver() { E1.grupo.visible = false; malla && malla.mascara([]); } },
};
let actual = 'actual';
async function escenario(k, { vuela = true } = {}) {
  actual = k; ESC[k].ver(); ui.escenario(k, { plan: E1, actual: E0 });
  if (vuela) await volar(V.predio, 2.4);
}

/* ---------- selección ---------- */
const rc = new THREE.Raycaster(), mouse = new THREE.Vector2();
let resaltado = null;
const seleccionables = () => actual === 'plan' ? E1.seleccionables : actual === 'actual' ? E0.seleccionables : [];
function tocar(ev, clic) {
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  rc.setFromCamera(mouse, cam);
  const h = rc.intersectObjects(seleccionables(), false)[0];
  const o = h ? h.object : null;
  if (o !== resaltado) {
    if (resaltado) pintar(resaltado, false);
    resaltado = o; if (o) pintar(o, true);
    renderer.domElement.style.cursor = o ? 'pointer' : '';
  }
  if (clic && o) { ui.info(o.userData); enfocar(o); }
  else if (clic && !o) ui.info(null);
}
function pintar(o, on) {
  if (Array.isArray(o.material)) o.material = on ? o.material.map(m => { const c = m.clone(); c.emissive = new THREE.Color('#C7FF27'); c.emissiveIntensity = 0.18; c.userData.orig = m; return c; }) : o.material.map(m => m.userData.orig || m);
  else o.material.opacity = on ? 0.28 : 0.0;
}
function enfocar(o) {
  const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()).length();
  const dir = cam.position.clone().sub(ctl.target).normalize();
  volar({ p: c.clone().add(dir.multiplyScalar(Math.max(140, s * 1.6))).toArray(), t: [c.x, b.min.y + s * 0.15, c.z] }, 1.6);
}
let abajo = null;
renderer.domElement.addEventListener('pointerdown', (e) => { abajo = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => { if (abajo && Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) < 6) tocar(e, true); abajo = null; });
renderer.domElement.addEventListener('pointermove', (e) => { if (!MOVIL && !abajo) tocar(e, false); });

/* ---------- acciones de la interfaz ---------- */
ui.on('escenario', (k) => escenario(k));
ui.on('reset', () => volar(V.predio, 1.8));
ui.on('cenital', () => volar(V.predioAlto, 1.8));
ui.on('pantalla', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
ui.on('luz', (k) => {
  const L = { amanecer: ['#ffd2a8', 1.4, -1, 0.35, 0.82], manana: ['#fff1dc', 2.2, -0.6, 0.8, 0.95], mediodia: ['#ffffff', 2.6, 0.05, 1.0, 1.0],
    atardecer: ['#ffb27a', 1.5, 1, 0.3, 0.8], noche: ['#7d95c8', 0.25, 0.6, 0.6, 0.32] }[k];
  sol.color.set(L[0]); sol.intensity = L[1]; const a = L[2] * 1300;
  sol.position.set(PX + a, 300 + 1300 * L[3], PZ + 400); hemi.intensity = 0.4 + L[4] * 1.0;
  if (malla) malla.U.uLuz.value.set(L[0]).lerp(new THREE.Color(1, 1, 1), 0.65).multiplyScalar(L[4]);
  const cielo = { amanecer: '#d9b9a3', manana: '#a9bccb', mediodia: '#9fb3c4', atardecer: '#c99f84', noche: '#121822' }[k];
  scene.background.set(cielo); scene.fog.color.set(cielo);
});
ui.on('entrar', async () => {
  ui.hero(false);
  await volar(V.kennedy, 3.4);
  await volar(V.predio, 3.0);
});

/* ---------- bucle ---------- */
const reloj = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(reloj.getDelta(), 0.1);
  if (vuelo) {
    vuelo.t += dt / vuelo.dur; const k = suave(Math.min(1, vuelo.t));
    // arco: sube un poco a mitad de camino si el viaje es largo
    const d = vuelo.dp.distanceTo(vuelo.ap), alza = Math.sin(Math.PI * k) * Math.min(2500, d * 0.18);
    cam.position.lerpVectors(vuelo.dp, vuelo.ap, k); cam.position.y += alza; ctl.target.lerpVectors(vuelo.dt, vuelo.at, k);
    cam.lookAt(ctl.target);
    if (vuelo.t >= 1) { const f = vuelo.fin; vuelo = null; f(); }
  } else ctl.update();
  E0.cortina.material.uniforms.uA.value = 0.22 + 0.12 * Math.sin(performance.now() / 900);
  if (malla) malla.actualizar(dt);
  renderer.render(scene, cam);
});
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// enlaces directos: ?esc=plan|actual|comun salta la introducción
const q = new URLSearchParams(location.search).get('esc');
if (q && ESC[q]) { ui.hero(false); vista(V.predio); escenario(q, { vuela: false }); }
else { escenario('actual', { vuela: false }); ui.hero(true); }
window.BAV = { cam, ctl, scene, malla, E0, E1, escenario, volar, V };
