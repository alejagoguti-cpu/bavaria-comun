/* Interfaz urbia sobre la escena: sidebar, portada, barra de herramientas, ficha del elemento y carga real de teselas. */
const $ = (s) => document.querySelector(s);
const ESTADO_SECC = { // sección -> [escenario o acción, fase en que llega]
  inicio: ['inicio'], actual: ['actual'], plan: ['plan'], comun: ['comun'],
  comparar: [null, 8], transformacion: [null, 6], sintaxis: [null, 7], nbic: [null, 10], huertas: [null, 10], red: [null, 11], simulador: [null, 12], fuentes: ['fuentes'],
};

export function crearUI() {
  const oy = {};
  const emit = (k, v) => (oy[k] || []).forEach(f => f(v));
  const toast = (t) => { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 3200); };

  // sidebar
  $('#menu-btn').onclick = () => document.body.classList.toggle('menu-abierto');
  document.querySelectorAll('#sidebar [data-s]').forEach(b => b.onclick = () => {
    const [acc, fase] = ESTADO_SECC[b.dataset.s];
    if (MOVIL()) document.body.classList.remove('menu-abierto');
    if (acc === 'inicio') { emit('escenario', 'actual'); return api.hero(true); }
    if (acc === 'fuentes') return $('#fuentes').showModal();
    if (acc) { api.hero(false); return emit('escenario', acc); }
    toast(`En construcción · llega en la fase ${fase} (ver README)`);
  });
  // portada
  document.querySelectorAll('[data-esc]').forEach(b => b.onclick = () => { api.hero(false); emit('escenario', b.dataset.esc); });
  $('#btn-entrar').onclick = () => emit('entrar');
  $('#btn-comparar').onclick = () => toast('Comparar escenarios llega en la fase 8');
  // herramientas
  document.querySelectorAll('#herramientas [data-h]').forEach(b => b.onclick = () => {
    const h = b.dataset.h;
    if (h === 'luz') return $('#luces').classList.toggle('on');
    emit(h);
  });
  document.querySelectorAll('#luces [data-l]').forEach(b => b.onclick = () => {
    document.querySelectorAll('#luces [data-l]').forEach(x => x.classList.toggle('activo', x === b)); emit('luz', b.dataset.l);
  });
  $('#ficha .cerrar').onclick = () => api.info(null);
  $('#fuentes .cerrar').onclick = () => $('#fuentes').close();

  const api = {
    on: (k, f) => (oy[k] = oy[k] || []).push(f),
    aviso: toast,
    hero(on) { document.body.classList.toggle('con-hero', on); },
    escenario(k, D) {
      document.querySelectorAll('#sidebar [data-s]').forEach(b => b.classList.toggle('activo', b.dataset.s === k));
      const T = {
        actual: ['00', 'Estado actual', `Antigua fábrica de Bavaria · ${D.actual.area_ha.toFixed(1)} ha entre la Av. Boyacá y la Av. de las Américas. Lo que ves es la malla fotorrealista: naves, tanques y el bosque, como están hoy.`, 'Reconstruida'],
        plan: ['01', 'Futuro sin propuesta', `Plan Parcial Bavaria Fábrica (Decreto 448 de 2023): 22 manzanas, parques y el bosque que se conserva. ${D.plan.total_viviendas.toLocaleString('es-CO')} viviendas.`, 'Documentada · alturas supuestas'],
        comun: ['02', 'Bavaria Común', 'Distrito de Tecnologías Convergentes. Pendiente: reconstruir desde los planos y el modelo de la autora (no se inventa la arquitectura).', 'Propuesta · pendiente'],
      }[k];
      $('#esc-num').textContent = T[0]; $('#esc-nom').textContent = T[1]; $('#esc-txt').textContent = T[2]; $('#esc-clase').textContent = T[3];
      $('#rotulo').classList.toggle('pendiente', k === 'comun');
    },
    info(d) {
      const f = $('#ficha');
      if (!d) return f.classList.remove('on');
      const fila = (k, v) => v == null || v === '' ? '' : `<div><dt>${k}</dt><dd>${v}</dd></div>`;
      const n = (x) => typeof x === 'number' ? Math.round(x).toLocaleString('es-CO') : x;
      f.querySelector('.cuerpo').innerHTML = `<p class="mono">${d.escenario}</p><h3>${d.nombre}</h3><p class="uso">${d.uso}</p><dl>
        ${fila('Pisos', d.pisos)}${fila('Altura', d.altura != null ? n(d.altura) + ' m' : null)}${fila('Área oficial', d.area_oficial ? n(d.area_oficial) + ' m²' : null)}
        ${fila('Área huella', d.area ? n(d.area) + ' m²' : null)}${fila('Viviendas', d.viviendas ? n(d.viviendas) : null)}${fila('Etapa', d.etapa)}</dl>
        <p class="clase">${d.clase}</p><p class="mono fuente">${d.fuente}</p>`;
      f.classList.add('on');
    },
    carga(st) {
      const pend = st.downloading + st.parsing, el = $('#carga');
      el.classList.toggle('on', pend > 0);
      el.querySelector('span').textContent = pend > 0 ? `Cargando ciudad · ${pend} teselas` : '';
    },
  };
  return api;
}
const MOVIL = () => matchMedia('(max-width: 760px)').matches;
