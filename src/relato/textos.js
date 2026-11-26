/* Textos del relato sobre la escena: titular cinético, cifras que cuentan, tarjetas con ícono, rótulos anclados al 3D, subtítulo. */
import * as THREE from 'three';
import { gsap } from 'gsap';

const ICON = { // íconos lineales (trazo 1.6), nunca emojis
  auto: '<path d="M5 17h14M6 17l1.5-5h9L18 17M8 12l1-3h6l1 3"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/>',
  casa: '<path d="M4 11l8-6 8 6v8H4z"/><path d="M10 19v-5h4v5"/>',
  edificio: '<rect x="6" y="3" width="12" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  arbol: '<path d="M12 21v-6"/><path d="M12 3c-3 0-5 2.5-5 5.5 0 1 .3 2 .8 2.8C6.7 12 6 13.2 6 14.5 6 16.4 7.6 18 9.5 18h5c1.9 0 3.5-1.6 3.5-3.5 0-1.3-.7-2.5-1.8-3.2.5-.8.8-1.8.8-2.8C17 5.5 15 3 12 3z"/>',
  personas: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.2 1-4 3-4.6"/>',
  reciclar: '<path d="M7 19H4l2.5-4.3M17 19h3l-2.5-4.3M9.5 5.5L12 2l2.5 3.5"/><path d="M6.5 14.7L9.5 9.5M17.5 14.7L14.5 9.5M8 19h8"/>',
  hoja: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c4-4 7-6 10-8"/>',
  atomo: '<circle cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  datos: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M7 12l3-3 3 2 4-4M8 20h8M12 16v4"/>',
  cerebro: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V4a3 3 0 00-3 0z"/><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/>',
  gota: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
  colegio: '<path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5"/>',
  mercado: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16"/><path d="M9 20v-6h6v6"/>',
  hongo: '<path d="M4 12a8 7 0 0116 0z"/><path d="M10 12v7h4v-7"/>',
  aula: '<rect x="3" y="4" width="18" height="11"/><path d="M8 20l4-5 4 5"/>',
  lupa: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  moneda: '<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5"/>',
  puerta: '<path d="M5 21V4h10v17M15 21h4M12 12h.01"/>',
  capas: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
};
export const icono = (k, c = 'currentColor') => `<svg viewBox="0 0 24 24" style="stroke:${c}">${ICON[k] || ''}</svg>`;

export function crearTextos(X) {
  const capa = document.getElementById('relato-capa');
  const el = (tag, cls, html = '') => { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; capa.appendChild(e); return e; };
  const T = { vivos: new Map(), anclas: [] };
  const sacar = (e, d = 0.45) => gsap.to(e, { opacity: 0, y: -10, duration: d, onComplete: () => e.remove() });

  T.limpiar = () => { T.vivos.forEach(e => sacar(e)); T.vivos.clear(); T.anclas.forEach(a => sacar(a.e)); T.anclas = []; };
  T.quitar = (id) => { const e = T.vivos.get(id); if (e) { sacar(e); T.vivos.delete(id); } };
  const poner = (id, e) => { T.quitar(id); T.vivos.set(id, e); return e; };

  /* titular cinético: palabras que suben una a una; *texto* = lima */
  T.titulo = (id, txt, { kick = '', x = 7, y = 14, ancho = 62, chico = false } = {}) => {
    const html = txt.split(/(\*[^*]+\*)/).map(s => s.startsWith('*') ? `<em>${s.slice(1, -1)}</em>` : s).join('')
      .split(/(\s+|<em>|<\/em>)/).map(w => (/^\s+$/.test(w) || w === '<em>' || w === '</em>' || !w) ? w : `<span class="pal"><span>${w}</span></span>`).join('');
    const e = poner(id, el('div', 'r-titulo' + (chico ? ' chico' : ''), `${kick ? `<p class="mono">${kick}</p>` : ''}<h2>${html}</h2>`));
    Object.assign(e.style, { left: x + 'vw', top: y + 'vh', width: ancho + 'vw' });
    gsap.from(e.querySelectorAll('.pal > span'), { yPercent: 110, duration: 0.7, stagger: 0.045, ease: 'power3.out' });
    if (kick) gsap.from(e.querySelector('.mono'), { opacity: 0, x: -12, duration: 0.5 });
    return e;
  };
  /* cifra que se cuenta */
  T.dato = (id, { v, l, suf = '', pre = '', x = 7, y = 60, clase = '', dec = 0 }) => {
    const e = poner(id, el('div', 'r-dato', `<b>${pre}<span>0</span>${suf}</b><p>${l}</p>${clase ? `<i class="mono">${clase}</i>` : ''}`));
    Object.assign(e.style, { left: x + 'vw', top: y + 'vh' });
    const o = { n: 0 }; gsap.to(o, { n: v, duration: 1.8, ease: 'power2.out', onUpdate: () => { e.querySelector('span').textContent = o.n.toLocaleString('es-CO', { maximumFractionDigits: dec, minimumFractionDigits: dec }); } });
    gsap.from(e, { opacity: 0, y: 16, duration: 0.6 });
    return e;
  };
  /* tarjeta con ícono */
  T.tarjeta = (id, { ic, t, k = '', c = '#C7FF27', x = 7, y = 40, ancho = 22, delay = 0 }) => {
    const e = poner(id, el('div', 'r-tarjeta', `<div class="ic" style="color:${c}">${icono(ic, c)}</div><div>${k ? `<p class="mono">${k}</p>` : ''}<h3>${t}</h3></div>`));
    Object.assign(e.style, { left: x + 'vw', top: y + 'vh', width: ancho + 'vw', borderColor: c + '55' });
    gsap.from(e, { opacity: 0, x: -24, duration: 0.7, delay, ease: 'power3.out' });
    gsap.from(e.querySelector('.ic'), { scale: 0.4, rotate: -30, duration: 0.8, delay: delay + 0.1, ease: 'back.out(2)' });
    return e;
  };
  /* rótulo anclado a un punto del mundo [x, y, z] */
  T.rotulo = (txt, p, { c = '#F5F3EB', ic = null, delay = 0, clase = '' } = {}) => {
    const e = el('div', 'r-rotulo ' + clase, `${ic ? icono(ic, c) : ''}<span>${txt}</span>`); e.style.setProperty('--c', c);
    gsap.fromTo(e, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, delay, ease: 'back.out(1.8)' });
    T.anclas.push({ e, p: new THREE.Vector3(...p) }); return e;
  };
  /* proyección de los rótulos cada cuadro */
  const v = new THREE.Vector3();
  T.paso = () => {
    for (const a of T.anclas) { v.copy(a.p).project(X.cam); const vis = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      a.e.style.display = vis ? '' : 'none'; if (vis) a.e.style.transform = `translate(${(v.x * 0.5 + 0.5) * innerWidth}px, ${(-v.y * 0.5 + 0.5) * innerHeight}px)`; }
  };
  /* subtítulo de la frase */
  const sub = document.getElementById('relato-sub');
  T.subtitulo = (txt) => { sub.textContent = txt; gsap.fromTo(sub, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }); };
  return T;
}
