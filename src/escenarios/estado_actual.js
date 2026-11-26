/* ESCENARIO 00 · ESTADO ACTUAL: la malla fotorrealista de Google ES la fábrica de hoy (naves, tanques, bosque).
   Encima: el borde del predio (OSM) y las huellas de las 29 edificaciones industriales, seleccionables. */
import * as THREE from 'three';
import { logd } from '../escena/logdepth.js';
import { WP, cargarJSON, areaPoligono } from '../escena/geo.js';

const ESTADO = { esqueleto: 'Nave en demolición (esqueleto)', nave: 'Nave industrial', torre: 'Torre', bodega: 'Bodega' };

export async function crearEstadoActual({ scene }) {
  const D = await cargarJSON('data/predio/bavaria.json');
  const g = new THREE.Group(); g.name = 'escenario00'; scene.add(g);
  const sitio = D.sitio.map(WP);

  // borde del predio: línea lima y una cortina de luz que se desvanece hacia arriba
  const pts = sitio.map(([x, z]) => new THREE.Vector3(x, 1.5, z)); pts.push(pts[0].clone());
  const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#C7FF27', transparent: true, opacity: 0.95 }));
  g.add(linea);
  const H = 40, pos = [], uv = [];
  for (let i = 0; i < sitio.length; i++) { const a = sitio[i], b = sitio[(i + 1) % sitio.length];
    pos.push(a[0], 0, a[1], b[0], 0, b[1], b[0], H, b[1], a[0], 0, a[1], b[0], H, b[1], a[0], H, a[1]); uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); }
  const gc = new THREE.BufferGeometry(); gc.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gc.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const mc = logd(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uA: { value: 0.35 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'varying vec2 vUv; uniform float uA; void main(){ gl_FragColor = vec4(0.78,1.0,0.15, uA * pow(1.0 - vUv.y, 2.2)); }' }));
  const cortina = new THREE.Mesh(gc, mc); g.add(cortina);

  // edificaciones existentes: volumen casi invisible que solo se ilumina al pasar el mouse / seleccionar
  const sel = [];
  D.edif.forEach((e, i) => {
    const s = new THREE.Shape(e.p.map(p => { const w = WP(p); return new THREE.Vector2(w[0], -w[1]); }));
    const ge = new THREE.ExtrudeGeometry(s, { depth: e.h || 10, bevelEnabled: false }); ge.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(ge, new THREE.MeshBasicMaterial({ color: '#C7FF27', transparent: true, opacity: 0.0, depthWrite: false }));
    m.userData = { id: `EX-${String(i + 1).padStart(2, '0')}`, nombre: `Edificación existente ${i + 1}`, uso: ESTADO[e.s] || e.s || 'Industrial',
      altura: e.h, area: Math.round(areaPoligono(e.p)), escenario: '00 · Estado actual', clase: 'Reconstruida (huella OSM, altura estimada)', fuente: 'OpenStreetMap (ODbL)' };
    g.add(m); sel.push(m);
  });
  return { grupo: g, cortina, linea, seleccionables: sel, sitio, area_ha: (areaPoligono(D.sitio) / 1e4) };
}
