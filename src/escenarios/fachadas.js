/* Texturas de fachada por piso (canvas), en metros del mundo: un vano de 3,2 m por 3 m de piso.
   ExtrudeGeometry da en los muros UV en metros (borde, altura), así que repeat = 1/vano, 1/piso. */
import * as THREE from 'three';

const cache = {};
export function fachada(tipo, renderer) {
  if (cache[tipo]) return cache[tipo];
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d');
  const E = { // muro, vidrio, marco, losa
    blanco: ['#d9d6cf', '#3a4652', '#bfbbb3', '#c9c5bd'],
    ladrillo: ['#9a5a3e', '#33404a', '#d8d2c6', '#b9b2a6'],
    vidrio: ['#56636d', '#2c3a45', '#9aa4aa', '#8c969c'],
  }[tipo] || ['#cfcac2', '#384450', '#bdb8b0', '#c4bfb7'];
  g.fillStyle = E[0]; g.fillRect(0, 0, N, N);
  if (tipo === 'ladrillo') { // hiladas de ladrillo (24 x 7 cm aprox.)
    const hy = N / 3 * 0.075; g.strokeStyle = 'rgba(60,30,20,.35)'; g.lineWidth = 1;
    for (let y = 0, f = 0; y < N; y += hy, f++) { g.beginPath(); g.moveTo(0, y); g.lineTo(N, y); g.stroke();
      for (let x = (f % 2) * 20; x < N; x += 40) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + hy); g.stroke(); } }
    for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60},${40 + Math.random() * 30},${25 + Math.random() * 20},.25)`; g.fillRect(Math.random() * N, Math.random() * N, 18, hy - 1); }
  } else { for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`; g.fillRect(Math.random() * N, Math.random() * N, 2, 2); } }
  // losa de entrepiso
  g.fillStyle = E[3]; g.fillRect(0, N * 0.92, N, N * 0.08);
  // ventana (vidrio con reflejo de cielo) + marco + antepecho
  const vx = tipo === 'vidrio' ? 0.04 : 0.18, vy0 = 0.18, vy1 = 0.86;
  g.fillStyle = E[2]; g.fillRect(N * (vx - 0.02), N * (vy0 - 0.02), N * (1 - 2 * vx + 0.04), N * (vy1 - vy0 + 0.04));
  const gr = g.createLinearGradient(0, N * vy0, 0, N * vy1); gr.addColorStop(0, '#8fa6b8'); gr.addColorStop(0.45, E[1]); gr.addColorStop(1, '#1d262d');
  g.fillStyle = gr; g.fillRect(N * vx, N * vy0, N * (1 - 2 * vx), N * (vy1 - vy0));
  g.fillStyle = E[2]; g.fillRect(N * 0.5 - 3, N * vy0, 6, N * (vy1 - vy0)); // parteluz
  if (tipo !== 'vidrio') { g.fillStyle = 'rgba(30,30,30,.55)'; g.fillRect(N * vx, N * 0.6, N * (1 - 2 * vx), 4); } // baranda
  const map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1 / 3.2, 1 / 3.0); map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const mat = new THREE.MeshStandardMaterial({ map, roughness: tipo === 'vidrio' ? 0.35 : 0.85, metalness: tipo === 'vidrio' ? 0.3 : 0.0 });
  return (cache[tipo] = mat);
}
