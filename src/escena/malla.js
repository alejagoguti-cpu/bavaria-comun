/* Malla fotorrealista de Google (Photorealistic 3D Tiles), la misma del simulador de Kennedy.
   Además: una máscara en planta que recorta la malla dentro de un polígono (para levantar otro escenario
   donde hoy está la fábrica) sin tocar el resto de la ciudad. */
import * as THREE from 'three';
import { aLL, PREDIO_C, ALT_ELIPSOIDE } from './geo.js';

const GKEY = 'AIzaSyCF2MXjc0DYRFrHk7j_BCyxVpWOdYqDIC4'; // llave del simulador (restringida por dominio)

export async function crearMalla({ scene, cam, renderer, alCargar }) {
  const [TR, PL] = await Promise.all([import('3d-tiles-renderer'), import('3d-tiles-renderer/plugins')]);
  const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
  const draco = new DRACOLoader().setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/gltf/');
  const tiles = new TR.TilesRenderer();
  tiles.registerPlugin(new PL.GoogleCloudAuthPlugin({ apiToken: GKEY, autoRefreshToken: true }));
  tiles.registerPlugin(new PL.GLTFExtensionsPlugin({ dracoLoader: draco }));
  tiles.setCamera(cam); tiles.setResolutionFromRenderer(cam, renderer);
  tiles.errorTarget = 20;

  const M = { tiles, dy: 0, mats: new Set(), calib: 0, t: 0, error: null };
  // marco local: Este-Norte-Arriba en el centro del predio; y = 0 en el suelo
  const q = aLL(PREDIO_C[0], PREDIO_C[1]), D2R = Math.PI / 180, frame = new THREE.Matrix4();
  TR.WGS84_ELLIPSOID.getEastNorthUpFrame(q[1] * D2R, q[0] * D2R, frame);
  frame.multiply(new THREE.Matrix4().makeTranslation(0, 0, ALT_ELIPSOIDE));
  // el marco ENU queda centrado en el predio; el mundo three tiene su origen en El Burro: se desplaza al centro del predio
  const [cx, cz] = [PREDIO_C[0] - 5341.33, 3161.9 - PREDIO_C[1]];
  const base = new THREE.Matrix4().makeTranslation(cx, 0, cz).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)).multiply(frame.invert());
  tiles.group.matrixAutoUpdate = false;
  const aplicar = () => { tiles.group.matrix.makeTranslation(0, M.dy, 0).multiply(base); tiles.group.matrixWorldNeedsUpdate = true; tiles.group.updateMatrixWorld(true); };
  aplicar();

  // máscara de recorte en planta (mundo x, z)
  const U = {
    uMask: { value: new THREE.Texture() }, uBox: { value: new THREE.Vector4(0, 0, 1, 1) }, uCorte: { value: 0 },
    uSat: { value: 1.08 }, uBri: { value: 1.0 }, uLuz: { value: new THREE.Color(1, 1, 1) },
  };
  M.U = U;
  tiles.addEventListener('load-model', ({ scene: s }) => s.traverse(c => {
    const m = c.isMesh && c.material; if (!m || !m.map) return;
    m.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    m.toneMapped = false;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform sampler2D uMask; uniform vec4 uBox; uniform float uCorte, uSat, uBri; uniform vec3 uLuz;')
        .replace('void main() {', `void main() {
          if (uCorte > 0.5) { vec2 uv = (vWP.xz - uBox.xy) / uBox.zw; if (uv.x > 0.0 && uv.y > 0.0 && uv.x < 1.0 && uv.y < 1.0 && texture2D(uMask, uv).r > 0.5) discard; }`)
        .replace('#include <opaque_fragment>', `{ vec3 c = outgoingLight; float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          c = max(mix(vec3(l), c, uSat), 0.0) * uBri * uLuz; outgoingLight = c; }
          #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'mallaBavaria'; m.needsUpdate = true;
    M.mats.add(m);
  }));
  tiles.addEventListener('dispose-model', ({ scene: s }) => s.traverse(c => { if (c.isMesh) M.mats.delete(c.material); }));
  tiles.addEventListener('load-error', (e) => { M.error = (e && e.error && e.error.message) || 'error de carga'; console.warn('tesela', M.error); });
  scene.add(tiles.group);

  /* polígonos (mundo [x,z]) que se recortan; huecos = lo que se conserva (bosque) */
  M.mascara = (exteriores, huecos = []) => {
    if (!exteriores.length) { U.uCorte.value = 0; return; }
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const P of exteriores) for (const [x, z] of P) { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); }
    x0 -= 5; z0 -= 5; x1 += 5; z1 += 5;
    const N = 2048, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d');
    const px = (p) => [(p[0] - x0) / (x1 - x0) * N, (p[1] - z0) / (z1 - z0) * N];
    const traza = (P) => { g.beginPath(); P.forEach((p, i) => { const [a, b] = px(p); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); g.fill(); };
    g.fillStyle = '#000'; g.fillRect(0, 0, N, N); g.fillStyle = '#fff'; exteriores.forEach(traza);
    g.fillStyle = '#000'; huecos.forEach(traza);
    const tx = new THREE.CanvasTexture(cv); tx.flipY = false; tx.minFilter = tx.magFilter = THREE.LinearFilter; tx.generateMipmaps = false;
    U.uMask.value = tx; U.uBox.value.set(x0, z0, x1 - x0, z1 - z0); U.uCorte.value = 1;
  };

  /* suelo de la foto en y = 0: se mide la malla en puntos de calle (fuera del predio), percentil bajo para no medir techos ni copas */
  M.puntosCalle = [];
  const calibrar = () => {
    const st = tiles.stats; if (st.downloading + st.parsing > 4 || !M.puntosCalle.length) return false;
    const rc = new THREE.Raycaster(), ab = new THREE.Vector3(0, -1, 0), h = [];
    for (const [x, z] of M.puntosCalle) { rc.set(new THREE.Vector3(x, 600, z), ab); const k = rc.intersectObject(tiles.group, true)[0]; if (k && Math.abs(k.point.y) < 200) h.push(k.point.y); }
    if (h.length < 8) return false;
    h.sort((a, b) => a - b); M.dy -= h[Math.floor(h.length * 0.2)]; aplicar(); return true;
  };

  M.actualizar = (dt) => {
    try {
      tiles.setResolutionFromRenderer(cam, renderer); cam.updateMatrixWorld(); tiles.update();
      M.t += dt; if (M.calib < 2 && M.t > [4, 14][M.calib] && cam.position.y < 6000) { if (calibrar()) M.calib++; else M.t = 0; }
      if (alCargar) alCargar(tiles.stats);
    } catch (err) { if (!M.fallo) { M.fallo = true; console.warn('malla', err); } }
  };
  M.atribucion = () => tiles.getAttributions().filter(a => a.type === 'string').map(a => a.value).join(' · ');
  return M;
}
