/* Motor del relato (lógica de kennedy-video): cada frase del guion = un beat con su animación.
   - Con voz: la grabación avanza los beats sola (TIEMPOS); clic / → / espacio saltan a la siguiente frase (y el audio con ella).
   - ← vuelve a la frase anterior y reconstruye su estado. La URL guarda la frase (#5). P pausa, T subtítulos, B oculta textos, F pantalla completa.
   - M (calibrar): marca el inicio de la frase siguiente en el segundo actual y lo imprime en la consola. */
import { gsap } from 'gsap';
import { BEATS } from './guion.js';
import { FIN } from './tiempos.js';

export function crearMotor(X) {
  const audio = new Audio('recursos/audio/guion.m4a'); audio.preload = 'auto';
  const hud = document.getElementById('relato-hud'), barra = hud.querySelector('.barra i'), num = hud.querySelector('.num'), bPlay = hud.querySelector('[data-r="play"]');
  const puntos = hud.querySelector('.puntos'); BEATS.forEach((b, i) => { const p = document.createElement('button'); p.title = `${i + 1}. ${b.t.slice(0, 70)}…`; p.onclick = (e) => { e.stopPropagation(); ir(i); }; puntos.appendChild(p); });
  const M = { i: -1, tl: null, _a: false, calib: [] };
  const dur = (i) => (i < BEATS.length - 1 ? BEATS[i + 1].ini : FIN) - BEATS[i].ini;

  function ir(i, { sincAudio = true } = {}) {
    i = Math.max(0, Math.min(BEATS.length - 1, i));
    if (M.tl) M.tl.kill();
    M.i = i; history.replaceState(null, '', '#' + (i + 1));
    const b = BEATS[i], tl = gsap.timeline(); M.tl = tl;
    X.T.subtitulo(b.t);
    b.a(X, tl, dur(i));
    if (sincAudio && Math.abs(audio.currentTime - b.ini) > 0.4) audio.currentTime = b.ini;
    [...puntos.children].forEach((p, k) => p.classList.toggle('on', k <= i));
    num.textContent = `${String(i + 1).padStart(2, '0')} / ${BEATS.length}`;
  }
  // el audio manda: cuando la voz llega al inicio de la frase siguiente, se dispara su animación
  audio.addEventListener('timeupdate', () => {
    barra.style.width = (audio.currentTime / FIN * 100) + '%';
    if (!M.activo) return;
    const n = M.i + 1; if (n < BEATS.length && audio.currentTime >= BEATS[n].ini) ir(n, { sincAudio: false });
  });
  audio.addEventListener('ended', () => { bPlay.classList.remove('on'); X.T.titulo('fin', 'Un territorio. *Dos futuros posibles.*', { kick: 'Bavaria Común · urbia', y: 40 }); });
  const play = () => { audio.play().then(() => bPlay.classList.add('on')).catch(() => X.ui.aviso('Toca la pantalla para escuchar la voz')); };
  const pausa = () => { audio.pause(); bPlay.classList.remove('on'); };

  M.empezar = (desde = 0) => {
    M.activo = true; document.body.classList.add('en-relato'); X.ui.hero(false);
    ir(desde); audio.currentTime = BEATS[desde].ini; play();
  };
  M.salir = () => { M.activo = false; pausa(); if (M.tl) M.tl.kill(); X.T.limpiar(); X.C.limpiar(); document.body.classList.remove('en-relato'); history.replaceState(null, '', location.pathname + location.search); };
  M.siguiente = () => M.activo && ir(M.i + 1);
  M.anterior = () => M.activo && ir(M.i - 1);

  hud.querySelector('[data-r="sig"]').onclick = (e) => { e.stopPropagation(); M.siguiente(); };
  hud.querySelector('[data-r="ant"]').onclick = (e) => { e.stopPropagation(); M.anterior(); };
  bPlay.onclick = (e) => { e.stopPropagation(); audio.paused ? play() : pausa(); };
  hud.querySelector('[data-r="salir"]').onclick = (e) => { e.stopPropagation(); M.salir(); X.ui.hero(true); };
  hud.querySelector('.barra').onclick = (e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); const t = (e.clientX - r.left) / r.width * FIN; let k = 0; BEATS.forEach((b, j) => { if (b.ini <= t) k = j; }); ir(k); audio.currentTime = t; };

  addEventListener('keydown', (e) => {
    if (!M.activo) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); M.siguiente(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); M.anterior(); }
    else if (e.key === 'p' || e.key === 'P') audio.paused ? play() : pausa();
    else if (e.key === 't' || e.key === 'T') document.body.classList.toggle('sin-sub');
    else if (e.key === 'b' || e.key === 'B') document.body.classList.toggle('sin-textos');
    else if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    else if (e.key === 'Escape') { M.salir(); X.ui.hero(true); }
    else if (e.key === 'm' || e.key === 'M') { M.calib.push(+audio.currentTime.toFixed(2)); console.log('calibración (inicio de frases marcadas):', JSON.stringify(M.calib)); X.ui.aviso(`Marca ${M.calib.length}: ${audio.currentTime.toFixed(2)} s`); }
  });
  Object.defineProperty(M, 'activo', { get: () => M._a, set: (v) => { M._a = v; } });
  return M;
}
