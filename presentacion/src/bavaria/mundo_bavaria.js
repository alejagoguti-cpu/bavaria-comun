/* Bavaria Común dentro del mundo de kennedy-video.
   Mis capas están en el marco del simulador (origen El Burro); kennedy-video usa otro origen: se desplaza todo con un grupo.
   modelo -> kennedy-video: [x - 7188, 2045.46 - y];  modelo -> simulador: [x - 5341.33, 3161.9 - y];  diferencia = (-1846.67, -1116.44). */
import * as THREE from 'three';
import { crearPlanParcial } from './plan_parcial.js';
import { crearCapas } from './capas.js';

export const OFF = [-1846.67, -1116.44];
export const K = ([x, z, y]) => (y === undefined ? [x + OFF[0], z + OFF[1]] : [x + OFF[0], y, z + OFF[1]]); // simulador -> kennedy-video

export async function crearBavaria(W) {
  const base = new THREE.Group(); base.name = 'bavariaComun'; base.position.set(OFF[0], 0, OFF[1]); W.scene.add(base);
  const E1 = await crearPlanParcial({ scene: base, renderer: W.r });
  const malla = { mascara: (ext, huecos = []) => W.fotoMascara && W.fotoMascara(ext.map(P => P.map(K)), huecos.map(P => P.map(K))) };
  const C = await crearCapas({ scene: base, E1, malla });
  const [PX, PZ] = K([C.PX, C.PZ]);
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
