/* Marco de coordenadas común (el mismo del simulador de Kennedy, ver docs/01_auditoria.md).
   «modelo»: x este, y norte, en metros. «mundo» three.js: x este, y arriba, z sur. */
export const MXg = 111320 * Math.cos(4.63 * Math.PI / 180), MYg = 110540;
export const aLL = (x, y) => [-74.17 + (x - 5193.24) / MXg, 4.63 + (y - 2090.06) / MYg]; // modelo -> [lon, lat]
export const deLL = (lon, lat) => [5193.24 + (lon + 74.17) * MXg, 2090.06 + (lat - 4.63) * MYg]; // [lon, lat] -> modelo
export const W = (x, y) => [x - 5341.33, 3161.9 - y]; // modelo -> mundo [x, z]
export const WP = (p) => W(p[0], p[1]);
export const PREDIO_C = [9319.0, 2942.6]; // centro del predio (modelo)
export const ALT_ELIPSOIDE = 2564; // suelo de Kennedy en la malla de Google (luego se calibra)

export const cargarJSON = (u) => fetch(u).then(r => { if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.json(); });

export function areaPoligono(P) { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); }
