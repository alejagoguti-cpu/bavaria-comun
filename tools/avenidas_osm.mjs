// Trazado real de las avenidas alrededor del predio (OpenStreetMap, ODbL) -> data/predio/avenidas.json (marco del modelo)
import fs from 'fs';
const MXg = 111320 * Math.cos(4.63 * Math.PI / 180), MYg = 110540, deLL = (lon, lat) => [+(5193.24 + (lon + 74.17) * MXg).toFixed(1), +(2090.06 + (lat - 4.63) * MYg).toFixed(1)];
const q = `[out:json][timeout:60];way["highway"~"primary|trunk|secondary"](4.605,-74.15,4.640,-74.11);out geom tags;`;
const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'User-Agent': 'bavaria-comun-build' } });
const j = await r.json(); const out = {};
for (const w of j.elements) { const t = w.tags || {}, nom = [t.name, t.alt_name, t.official_name].filter(Boolean).join(' | '); if (!/Boyac|Am[eé]ricas|Alsacia|Calle 6\b/i.test(nom)) continue;
  const k = /Boyac/i.test(nom) ? 'Av. Boyacá' : /Am[eé]ricas|Calle 6\b/i.test(nom) ? 'Av. de las Américas' : 'Av. Alsacia';
  (out[k] = out[k] || []).push(w.geometry.map(g => deLL(g.lon, g.lat))); }
fs.writeFileSync('data/predio/avenidas.json', JSON.stringify({ fuente: 'OpenStreetMap (© colaboradores, ODbL), Overpass ' + new Date().toISOString().slice(0, 10), vias: out }));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));
