/* Guion de Bavaria Común: cada frase = un beat = una animación sincronizada con la voz (recursos/audio/guion.m4a).
   ini = segundo en que empieza la frase en la grabación (tools/alinear_audio: transcripción con marcas de tiempo).
   Cada beat recibe (X, tl, dur): X = API (capas 3D, textos, cámara), tl = línea de tiempo GSAP de la frase, dur = duración en s.
   Los sub-pasos se ubican en fracciones de dur, así siguen a la voz aunque se ajusten los tiempos. */
import { COL } from './capas.js';
import { TIEMPOS } from './tiempos.js';

const F = (X, tl, frac, dur, fn) => tl.call(fn, [], frac * dur);

export const BEATS = [
  /* 01 */ { t: 'Para desarrollar estos objetivos, se toma como punto de partida el antiguo predio industrial de Bavaria, ubicado entre las avenidas Boyacá y Las Américas.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.vista('bogota', 0); X.volar('kennedy', d * 0.28);
      F(X, tl, 0.24, d, () => X.volar('predio', d * 0.3));
      F(X, tl, 0.05, d, () => X.T.titulo('k', 'El antiguo predio industrial de *Bavaria*', { kick: '01 · Punto de partida', y: 12 }));
      F(X, tl, 0.48, d, () => { X.C.dibujarBorde(true, 2.8); X.T.dato('ha', { v: 71.2, dec: 1, l: 'hectáreas en Kennedy', suf: ' ha', y: 62 }); });
      F(X, tl, 0.64, d, () => { X.C.verAvenida('Av. Boyacá', true); X.rotuloAv('Av. Boyacá'); });
      F(X, tl, 0.80, d, () => { X.C.verAvenida('Av. de las Américas', true); X.rotuloAv('Av. de las Américas'); });
    } },
  /* 02 */ { t: 'Actualmente, la antigua cervecería se encuentra desocupada y sobre este suelo se proyecta una transformación urbana mediante un plan parcial. Esta situación permite comparar dos posibles formas de desarrollo del mismo lugar.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('predioBajo', d * 0.4);
      X.T.titulo('k', 'Hoy, la cervecería está *desocupada*', { kick: '02 · Estado actual', y: 12 });
      F(X, tl, 0.05, d, () => X.C.verExistentes('vacias'));
      F(X, tl, 0.2, d, () => { X.T.titulo('k', 'Sobre este suelo se proyecta un *plan parcial*', { kick: 'Decreto Distrital 448 de 2023', y: 12 }); X.C.verExistentes(null); X.C.crecerTorres(true, d * 0.18); });
      F(X, tl, 0.45, d, () => { X.C.crecerTorres(false, d * 0.2);
        X.T.tarjeta('a', { ic: 'edificio', k: 'Futuro 01', t: 'Sin propuesta', c: '#ff8a5a', y: 56 }); X.T.tarjeta('b', { ic: 'hoja', k: 'Futuro 02', t: 'Bavaria Común', c: '#C7FF27', y: 68, delay: 0.25 });
        X.T.titulo('k', 'Dos formas de desarrollo del *mismo lugar*', { kick: 'Un territorio, dos futuros', y: 12 }); });
    } },
  /* 03 */ { t: 'En el escenario sin propuesta se incorporan los proyectos urbanísticos previstos, para evaluar cómo los nuevos edificios, el aumento de población y la transformación de los usos del suelo podrían afectar la movilidad, la presión inmobiliaria y las condiciones ecológicas.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('torres', d * 0.25);
      X.T.titulo('k', 'Escenario *sin propuesta*', { kick: '03 · Plan Parcial Bavaria Fábrica', y: 12 });
      X.C.crecerTorres(true, d * 0.32);
      F(X, tl, 0.10, d, () => X.T.dato('viv', { v: 14002, l: 'viviendas previstas', y: 56, clase: 'Documentada · Alcaldía de Bogotá' }));
      F(X, tl, 0.34, d, () => X.T.dato('hab', { v: 39200, pre: '≈ ', l: 'nuevos habitantes', x: 22, y: 56, clase: 'Est. 2,8 personas por hogar' }));
      F(X, tl, 0.42, d, () => X.volar('predioAlto', d * 0.3));
      F(X, tl, 0.55, d, () => { X.T.tarjeta('m', { ic: 'auto', k: 'Movilidad', t: 'Más viajes por la Boyacá y las Américas', c: '#ffb36b', y: 38 }); X.C.fundir(X.C.carros, 1, 1.2); X.C.verAvenida('Av. Boyacá', true); X.C.verAvenida('Av. de las Américas', true);
        X.gsap.to(X.C.carrosLento, { v: 0.15, duration: d * 0.25, ease: 'power2.in' }); });
      F(X, tl, 0.70, d, () => { X.T.tarjeta('p', { ic: 'casa', k: 'Presión inmobiliaria', t: 'Sube el valor del suelo en los barrios vecinos', c: '#ff8a5a', y: 52, delay: 0 }); X.C.fundir(X.C.anillos, 1, 1.5); });
      F(X, tl, 0.85, d, () => { X.T.tarjeta('e', { ic: 'arbol', k: 'Condiciones ecológicas', t: `${X.C.nTaladas.toLocaleString('es-CO')} árboles en manzanas y vías`, c: '#ff5a4a', y: 66 }); X.C.fundir(X.C.taladas, 1, 1); });
    } },
  /* 04 */ { t: 'Frente a este escenario se plantea Bavaria Común, un Distrito de Tecnologías Convergentes que funciona como un clúster de conocimiento, donde se desarrollan investigaciones y procesos de formación que posteriormente pueden aplicarse en diferentes sectores de Kennedy.',
    a(X, tl, d) {
      X.estado({ torres: true, borde: true });
      X.volar('predio', d * 0.3);
      X.C.crecerTorres(false, d * 0.18);
      F(X, tl, 0.12, d, () => X.T.titulo('k', 'BAVARIA *COMÚN*', { kick: '04 · Frente a este escenario', y: 12 }));
      F(X, tl, 0.20, d, () => X.T.titulo('s', 'Distrito de Tecnologías Convergentes', { y: 32, chico: true }));
      F(X, tl, 0.30, d, () => X.C.verNBIC('todas'));
      F(X, tl, 0.45, d, () => X.T.tarjeta('c', { ic: 'lupa', k: 'Clúster de conocimiento', t: 'Investigación y formación', y: 58 }));
      F(X, tl, 0.68, d, () => { X.volar('kennedyMedio', d * 0.3); X.C.verArcos(X.C.arcosHogares, true, d * 0.3); X.T.tarjeta('k2', { ic: 'capas', k: 'Después', t: 'Se aplica en otros sectores de Kennedy', y: 70 }); });
    } },
  /* 05 */ { t: 'La intervención reconoce que algunas estructuras industriales pueden reutilizarse, mientras otras requieren un rediseño o sustitución según sus condiciones.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('predioBajo', d * 0.3);
      X.T.titulo('k', 'Reutilizar, *rediseñar* o sustituir', { kick: '05 · Estructuras industriales', y: 12 });
      const n = X.C.cuentaCat;
      F(X, tl, 0.08, d, () => { X.C.verExistentes({ solo: 'reutilizar' }); X.T.tarjeta('r', { ic: 'reciclar', k: `${n.reutilizar || 0} estructuras`, t: 'Se reutilizan', c: COL.reutilizar, y: 50 }); });
      F(X, tl, 0.45, d, () => { X.C.verExistentes({ solo: 'redisenar' }); X.T.tarjeta('d', { ic: 'capas', k: `${n.redisenar || 0} estructuras`, t: 'Se rediseñan', c: COL.redisenar, y: 61 }); });
      F(X, tl, 0.62, d, () => { X.C.verExistentes({ solo: 'sustituir' }); X.T.tarjeta('s', { ic: 'edificio', k: `${n.sustituir || 0} estructuras`, t: 'Se sustituyen', c: COL.sustituir, y: 72 }); });
      F(X, tl, 0.82, d, () => { X.C.verExistentes('categorias'); X.T.dato('nota', { v: 29, l: 'estructuras evaluadas según su estado', x: 74, y: 70, clase: 'Clasificación interpretativa · confirmar con la autora' }); });
    } },
  /* 06 */ { t: 'A partir del análisis de sintaxis espacial, se plantean nuevos accesos y pasajes peatonales, buscando conectar los recorridos del predio con las calles del entorno, sin intervenir el bosque existente.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('predioAlto', d * 0.3);
      X.T.titulo('k', 'Sintaxis *espacial*', { kick: '06 · Accesos y pasajes', y: 12 });
      X.C.sintaxis.material.uniforms.uM.value = 0; X.C.fundir(X.C.sintaxis, 1, 1.2);
      F(X, tl, 0.12, d, () => X.T.tarjeta('a', { ic: 'lupa', k: 'Integración angular · hoy', t: 'El predio es una barrera cerrada', c: '#5b8cff', y: 54 }));
      F(X, tl, 0.32, d, () => { X.C.pasajes.visible = true; X.C.pasajes.children.forEach((l, i) => { l.material.uniforms.uA.value = 1; X.gsap.fromTo(l.material.uniforms.uP, { value: 0 }, { value: 1, duration: 2.5, delay: i * 0.08 }); });
        X.C.entradas.forEach((p, i) => X.T.rotulo('', [p[0], 6, p[1]], { ic: 'puerta', c: '#C7FF27', delay: i * 0.06, clase: 'punto' }));
        X.T.tarjeta('p', { ic: 'puerta', k: `${X.C.entradas.length} accesos · 4,1 km`, t: 'Nuevos accesos y pasajes', c: '#C7FF27', y: 64 }); });
      F(X, tl, 0.50, d, () => { X.gsap.to(X.C.sintaxis.material.uniforms.uM, { value: 1, duration: 3 }); X.C.fundir(X.C.peatones, 1, 1); });
      F(X, tl, 0.75, d, () => { X.C.fundir(X.C.bosque, 1, 1.2); X.T.tarjeta('b', { ic: 'arbol', k: 'Sin intervenir', t: 'El bosque existente', c: '#8dff6a', y: 74 }); });
    } },
  /* 07 */ { t: 'El programa arquitectónico se organiza a partir de las cuatro tecnologías convergentes NBIC estudiadas por Roco y Bainbridge en 2002. Estas tecnologías se integran en diferentes edificios que combinan espacios de investigación, experimentación y aprendizaje.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('predio', d * 0.3);
      X.T.titulo('k', 'Tecnologías convergentes *NBIC*', { kick: '07 · Roco y Bainbridge, 2002', y: 12 });
      [['N', 'Nanotecnología', 'atomo', COL.nano, 'nano'], ['B', 'Biotecnología', 'hoja', COL.bio, 'bio'], ['I', 'Tecnologías de la información', 'datos', COL.info, 'info'], ['C', 'Ciencias cognitivas', 'cerebro', COL.cogno, 'cogno']]
        .forEach(([l, n, ic, c, k], i) => F(X, tl, 0.1 + i * 0.1, d, () => { X.T.tarjeta(l, { ic, k: l, t: n, c, y: 36 + i * 10.5, ancho: 20 }); X.C.verNBIC(k); }));
      F(X, tl, 0.58, d, () => { X.C.verNBIC('todas'); X.C.prog.forEach((v, i) => X.T.rotulo(v.userData.n, [v.userData.c[0], v.userData.h + 14 + i * 11, v.userData.c[1]], { c: COL[v.userData.k], delay: i * 0.12 })); });
      F(X, tl, 0.78, d, () => X.T.titulo('s', 'Investigación · experimentación · *aprendizaje*', { y: 32, chico: true }));
    } },
  /* 08 */ { t: 'Desde la biotecnología, se incorporan laboratorios de hidroponía, áreas de cultivo experimental de hongos y espacios para estudiar el aprovechamiento de residuos orgánicos.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.C.verNBIC('bio'); X.enfocar('bio', d * 0.3);
      X.T.titulo('k', '*Biotecnología*', { kick: '08 · B', y: 12 });
      F(X, tl, 0.15, d, () => { X.T.tarjeta('h', { ic: 'gota', k: 'Laboratorio', t: 'Hidroponía', c: COL.bio, y: 50 }); const p = X.puntoLab('bio'); X.C.modulo.colocar(p[0], p[1], p[2], p[3]); X.C.modulo.armar(d * 0.35); X.volarA(p, 9, d * 0.3); });
      F(X, tl, 0.45, d, () => { X.C.modulo.crecer(d * 0.4); X.T.tarjeta('o', { ic: 'hongo', k: 'Cultivo experimental', t: 'Hongos', c: COL.bio, y: 61 }); });
      F(X, tl, 0.72, d, () => X.T.tarjeta('r', { ic: 'reciclar', k: 'Aprovechamiento', t: 'Residuos orgánicos', c: COL.bio, y: 72 }));
    } },
  /* 09 */ { t: 'La nanotecnología se incorpora mediante espacios de investigación de materiales para mejorar la conservación de alimentos y reducir sus pérdidas.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.C.verNBIC('nano'); X.enfocar('nano', d * 0.35);
      X.T.titulo('k', '*Nanotecnología*', { kick: '09 · N', y: 12 });
      F(X, tl, 0.2, d, () => X.T.tarjeta('m', { ic: 'atomo', k: 'Investigación de materiales', t: 'Empaques que conservan los alimentos', c: COL.nano, y: 52 }));
      F(X, tl, 0.55, d, () => X.T.tarjeta('p', { ic: 'hoja', k: 'Objetivo', t: 'Reducir las pérdidas de alimentos', c: COL.nano, y: 64 }));
      F(X, tl, 0.7, d, () => X.T.tarjeta('i', { ic: 'lupa', k: 'En investigación', t: 'Línea de investigación, no tecnología probada', c: '#9a9d94', y: 76 }));
    } },
  /* 10 */ { t: 'Las tecnologías de la información se desarrollan en espacios de monitoreo y coordinación de la red alimentaria. Allí se aprende a utilizar herramientas digitales para registrar la producción, organizar pedidos y gestionar los excedentes de los mercados barriales.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.C.verNBIC('info'); X.enfocar('info', d * 0.25);
      X.T.titulo('k', 'Tecnologías de la *información*', { kick: '10 · I', y: 12 });
      F(X, tl, 0.18, d, () => X.T.tarjeta('m', { ic: 'datos', k: 'Monitoreo', t: 'Coordinación de la red alimentaria', c: COL.info, y: 46 }));
      F(X, tl, 0.35, d, () => { X.volar('kennedyMedio', d * 0.3); X.redMercados(true, d * 0.3); });
      F(X, tl, 0.55, d, () => X.T.tarjeta('r', { ic: 'edificio', k: 'Registrar', t: 'La producción', c: COL.info, y: 57, ancho: 18 }));
      F(X, tl, 0.68, d, () => X.T.tarjeta('o', { ic: 'datos', k: 'Organizar', t: 'Los pedidos', c: COL.info, y: 66, ancho: 18 }));
      F(X, tl, 0.80, d, () => X.T.tarjeta('e', { ic: 'mercado', k: 'Gestionar', t: 'Excedentes de los mercados barriales', c: COL.info, y: 75, ancho: 22 }));
    } },
  /* 11 */ { t: 'Y las ciencias cognitivas se integran mediante aulas y talleres donde los habitantes aprenden técnicas de producción alimentaria y manejo de cultivos.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.C.verNBIC('cogno'); X.enfocar('cogno', d * 0.3);
      X.T.titulo('k', 'Ciencias *cognitivas*', { kick: '11 · C', y: 12 });
      F(X, tl, 0.15, d, () => { X.C.pasajes.visible = true; X.C.pasajes.children.forEach(l => { l.material.uniforms.uP.value = 1; X.gsap.to(l.material.uniforms.uA, { value: 0.6, duration: 1 }); }); X.C.fundir(X.C.peatones, 1, 1); });
      F(X, tl, 0.25, d, () => X.T.tarjeta('a', { ic: 'aula', k: 'Aulas y talleres', t: 'Los habitantes aprenden', c: COL.cogno, y: 52 }));
      F(X, tl, 0.6, d, () => X.T.tarjeta('t', { ic: 'hoja', k: 'Técnicas', t: 'Producción alimentaria y manejo de cultivos', c: COL.cogno, y: 63 }));
    } },
  /* 12 */ { t: 'La intención es que los conocimientos desarrollados en Bavaria Común lleguen a los hogares y a una red de colegios de Kennedy, mediante la implementación de huertas hidropónicas.',
    a(X, tl, d) {
      X.estado({ torres: false, borde: true });
      X.volar('kennedy', d * 0.45);
      X.T.titulo('k', 'Del distrito a los *hogares* y los colegios', { kick: '12 · Transferencia de conocimiento', y: 12 });
      F(X, tl, 0.25, d, () => { X.C.verArcos(X.C.arcosHogares, true, d * 0.35); X.T.tarjeta('h', { ic: 'casa', k: 'Hogares', t: 'Huertas en casas y terrazas', c: '#C7FF27', y: 56 }); });
      F(X, tl, 0.5, d, () => { X.C.verArcos(X.C.arcosColegios, true, d * 0.35); X.T.dato('c', { v: X.C.colegios.length, l: 'colegios de Kennedy en la red', x: 7, y: 68, clase: 'OpenStreetMap' }); });
      F(X, tl, 0.75, d, () => X.T.tarjeta('g', { ic: 'gota', k: 'Mediante', t: 'Huertas hidropónicas', c: '#7cc8ff', y: 80 }));
    } },
  /* 13 */ { t: 'Estas huertas se plantean como módulos adaptables a diferentes espacios, con estructuras para sostener las plantas, depósitos de agua y sistemas que recirculan los nutrientes, sin utilizar suelo agrícola.',
    a(X, tl, d) {
      X.estado({ torres: false });
      const p = X.puntoLab('bio'); X.C.modulo.colocar(p[0], p[1], p[2], p[3]); X.volarA(p, 5.2, d * 0.2);
      X.T.titulo('k', 'Un *módulo* adaptable', { kick: '13 · Huerta hidropónica', y: 12 });
      F(X, tl, 0.05, d, () => X.C.modulo.armar(d * 0.55));
      F(X, tl, 0.18, d, () => X.T.tarjeta('e', { ic: 'capas', k: 'Estructura', t: 'Sostiene las plantas', c: '#c9ccd0', y: 46, ancho: 19 }));
      F(X, tl, 0.42, d, () => X.T.tarjeta('d', { ic: 'gota', k: 'Depósito', t: 'Agua con nutrientes', c: '#5aa9e6', y: 56, ancho: 19 }));
      F(X, tl, 0.58, d, () => { X.T.tarjeta('r', { ic: 'reciclar', k: 'Recirculación', t: 'La bomba devuelve los nutrientes', c: '#7cd3ff', y: 66, ancho: 19 }); X.C.modulo.crecer(d * 0.4); });
      F(X, tl, 0.78, d, () => { X.T.tarjeta('s', { ic: 'hoja', k: 'Sin suelo agrícola', t: 'Cabe en terrazas, patios y parques', c: '#C7FF27', y: 76, ancho: 19 }); X.C.modulo.despiezar(true); });
      F(X, tl, 0.92, d, () => X.C.modulo.despiezar(false));
    } },
  /* 14 */ { t: 'En los colegios, los módulos también pueden instalarse en áreas habilitadas de parques cercanos, creando espacios de cultivo compartidos donde los estudiantes y las comunidades aprendan a sembrar, cuidar y cosechar alimentos.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.volar('kennedy', d * 0.3);
      X.T.titulo('k', 'Colegios y *parques* cercanos', { kick: '14 · Cultivo compartido', y: 12 });
      F(X, tl, 0.1, d, () => { X.C.verArcos(X.C.enlacesColPar, true, d * 0.3); X.C.parques.forEach((p, i) => X.T.rotulo(p.n, [p.c[0], 30, p.c[1]], { ic: 'arbol', c: '#b8f5a0', delay: i * 0.1 })); });
      F(X, tl, 0.35, d, () => { const p = X.C.parques[0]; X.C.modulosParques.visible = true; X.volarA([p.c[0], p.c[1], 0], 70, d * 0.3); X.T.tarjeta('m', { ic: 'colegio', k: `${X.C.parques.length} parques (IDRD)`, t: 'Módulos en áreas habilitadas', c: '#b8f5a0', y: 58 }); });
      F(X, tl, 0.62, d, () => X.T.tarjeta('a', { ic: 'personas', k: 'Estudiantes y comunidad', t: 'Sembrar · cuidar · cosechar', c: '#b8f5a0', y: 69 }));
    } },
  /* 15 */ { t: 'Parte de las cosechas se destina al consumo propio, mientras los excedentes pueden venderse en los mercados barriales, generando ingresos adicionales para los hogares.',
    a(X, tl, d) {
      X.estado({ torres: false });
      X.C.modulosParques.visible = true;
      X.volar('kennedy', d * 0.25);
      X.T.titulo('k', 'Cosechar, *comer* y vender', { kick: '15 · Excedentes', y: 12 });
      F(X, tl, 0.1, d, () => { X.C.verArcos(X.C.flujoAuto, true, d * 0.3); X.T.tarjeta('c', { ic: 'casa', k: 'Consumo propio', t: 'Parte de la cosecha', c: COL.auto, y: 56 }); });
      F(X, tl, 0.42, d, () => { X.C.verArcos(X.C.flujoExc, true, d * 0.3); X.C.plazas.forEach((q, i) => X.T.rotulo(q.n, [q.w[0], 30, q.w[1]], { ic: 'mercado', c: COL.exced, delay: i * 0.08 })); X.T.tarjeta('e', { ic: 'mercado', k: 'Excedentes', t: 'Mercados barriales', c: COL.exced, y: 67 }); });
      F(X, tl, 0.72, d, () => X.T.tarjeta('i', { ic: 'moneda', k: 'Para los hogares', t: 'Ingresos adicionales', c: COL.exced, y: 78 }));
    } },
].map((b, i) => ({ ...b, ini: TIEMPOS[i] }));
