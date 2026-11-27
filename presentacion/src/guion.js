// Guion de Bavaria Común (motor e interfaz de kennedy-video): cada frase = un beat = una animación sincronizada con la voz.
// ini = segundo en que empieza la frase en public/bavaria/guion.m4a (transcripción Whisper + silencios de ffmpeg).
// X = API de kennedy-video (X.vuelo, X.ed.lista / lugar / rotulo / cifra / pop, X.gris…) + X.B (capas de Bavaria, src/bavaria/).
const TIEMPOS = [1.49, 9.6, 31.6, 46.05, 64.2, 74.9, 88.9, 109.4, 120.3, 129.45, 147.75, 157.3, 169.35, 183.5, 198.7];
export const FIN = 210.7;
const COL = { reu: '#C7FF27', red: '#f0b44c', sus: '#ff6b5a', bio: '#34d399', nano: '#c084fc', info: '#38bdf8', cogno: '#f472b6' };

/* pasos dentro de la frase: en fracciones de su duración; se anulan si llega otra frase; en un salto corren de inmediato */
let gen = 0;
function pasos(X, i, lista) {
  const g = ++gen, d = (i < TIEMPOS.length - 1 ? TIEMPOS[i + 1] : FIN) - TIEMPOS[i];
  lista.forEach(([f, fn]) => { const run = () => { if (g === gen) fn(d); }; if (X.R.rapido || !f) run(); else X.gsap.delayedCall(f * d, run); });
}
const E = (X, k) => X.B.est[k];

let n = 0; const beat = (t, a) => ({ t, ini: TIEMPOS[n++], a });

export const CAPITULOS = [
  /* ===================================================================== 01 PUNTO DE PARTIDA */
  {
    n: '01', nombre: 'Bavaria · punto de partida', cine: false,
    beats: [
      beat('Para desarrollar estos objetivos, se toma como punto de partida el antiguo predio industrial de Bavaria, ubicado entre las avenidas Boyacá y Las Américas.', (X) => {
        const B = X.B; B.estado({ torres: false });
        X.cam(E(X, 'kennedy'), 0); X.vuelo([E(X, 'predio')], 7, { deriva: 0.06 });
        pasos(X, 0, [
          [0.05, () => X.ed.lista({ items: ['el antiguo predio *industrial*', 'de la cervecería *Bavaria*'], x: 4.5, y: 12, paso: 0.5 })],
          [0.45, () => { B.C.dibujarBorde(true, 2.8); X.ed.lugar([B.PX, B.PZ], 'Bavaria', { sub: '71,2 ha' }); }],
          [0.62, () => { B.C.verAvenida('Av. Boyacá', true); const r = B.C.avenidas['Av. Boyacá'].userData.rotulo; X.ed.lugar(B.K(r), 'Av. *Boyacá*', { lado: 'izq', pin: false }); }],
          [0.78, () => { B.C.verAvenida('Av. de las Américas', true); const r = B.C.avenidas['Av. de las Américas'].userData.rotulo; X.ed.lugar(B.K(r), 'Av. de las *Américas*', { pin: false }); }],
          [0.05, () => X.ed.rotulo('entre las avenidas *Boyacá* y *Las Américas*', { delay: 9 })],
        ]);
      }),
      beat('Actualmente, la antigua cervecería se encuentra desocupada y sobre este suelo se proyecta una transformación urbana mediante un plan parcial. Esta situación permite comparar dos posibles formas de desarrollo del mismo lugar.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true });
        X.vuelo([E(X, 'predioBajo')], 6);
        pasos(X, 1, [
          [0, () => { X.ed.lista({ items: ['la cervecería está *desocupada*'], x: 4.5, y: 12 }); B.C.verExistentes('vacias'); }],
          [0.2, (d) => { X.ed.listaMas?.(document.querySelector('.ed-lista'), 'se proyecta un *plan parcial*'); X.ed.lugar([B.PX - 200, B.PZ + 60], 'Plan Parcial *Bavaria Fábrica*', { sub: 'Decreto 448 de 2023' }); B.C.verExistentes(null); B.C.crecerTorres(true, d * 0.2); }],
          [0.45, (d) => { B.C.crecerTorres(false, d * 0.2); X.ed.rotulo('dos posibles formas de *desarrollo* del *mismo lugar*'); }],
        ]);
      }),
    ],
  },

  /* ===================================================================== 02 ESCENARIO SIN PROPUESTA */
  {
    n: '02', nombre: 'Escenario sin propuesta',
    beats: [
      beat('En el escenario sin propuesta se incorporan los proyectos urbanísticos previstos, para evaluar cómo los nuevos edificios, el aumento de población y la transformación de los usos del suelo podrían afectar la movilidad, la presión inmobiliaria y las condiciones ecológicas.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true });
        X.vuelo([E(X, 'torres')], 5, { deriva: 0.1 });
        pasos(X, 2, [
          [0, (d) => { B.C.crecerTorres(true, d * 0.35); X.ed.lista({ items: ['los *nuevos edificios*', 'el aumento de *población*', 'la transformación de los *usos del suelo*'], x: 4.5, y: 12, paso: d * 0.1 }); }],
          [0.12, () => X.ed.cifra({ v: 14002, texto: 'viviendas previstas', fuente: 'Alcaldía de Bogotá · Decreto 448 de 2023', x: 4.5, y: 52 })],
          [0.42, (d) => X.vuelo([E(X, 'predioAlto')], d * 0.25)],
          [0.55, (d) => { B.C.fundir(B.C.carros, 1, 1.2); B.C.verAvenida('Av. Boyacá', true); B.C.verAvenida('Av. de las Américas', true); X.gsap.to(B.C.carrosLento, { v: 0.15, duration: d * 0.25 }); X.ed.rotulo('podrían afectar la *movilidad*'); }],
          [0.69, () => { B.C.fundir(B.C.anillos, 1, 1.5); X.ed.rotulo('la *presión inmobiliaria*'); }],
          [0.82, () => { B.C.fundir(B.C.taladas, 1, 1); X.ed.rotulo('y las *condiciones ecológicas*'); X.ed.cifra({ v: B.C.nTaladas, texto: 'árboles en manzanas y vías del plan', fuente: 'copas detectadas × plano oficial', x: 4.5, y: 70 }); }],
        ]);
      }),
    ],
  },

  /* ===================================================================== 03 BAVARIA COMÚN */
  {
    n: '03', nombre: 'Bavaria Común',
    beats: [
      beat('Frente a este escenario se plantea Bavaria Común, un Distrito de Tecnologías Convergentes que funciona como un clúster de conocimiento, donde se desarrollan investigaciones y procesos de formación que posteriormente pueden aplicarse en diferentes sectores de Kennedy.', (X) => {
        const B = X.B; B.estado({ torres: true, borde: true });
        X.vuelo([E(X, 'predio')], 6);
        pasos(X, 3, [
          [0, (d) => B.C.crecerTorres(false, d * 0.18)],
          [0.12, () => X.ed.lista({ items: ['*Bavaria Común*', 'Distrito de *Tecnologías Convergentes*'], x: 4.5, y: 12, paso: 1.2 })],
          [0.3, () => B.C.verNBIC('todas')],
          [0.42, () => X.ed.rotulo('un *clúster de conocimiento*: investigación y *formación*')],
          [0.7, (d) => { X.vuelo([E(X, 'kennedyMedio')], d * 0.3); B.C.verArcos(B.C.arcosHogares, true, d * 0.3); X.ed.rotulo('que se aplica en diferentes sectores de *Kennedy*'); }],
        ]);
      }),
      beat('La intervención reconoce que algunas estructuras industriales pueden reutilizarse, mientras otras requieren un rediseño o sustitución según sus condiciones.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true }); const c = B.C.cuentaCat;
        X.vuelo([E(X, 'predioBajo')], 4);
        pasos(X, 4, [
          [0.05, () => { B.C.verExistentes({ solo: 'reutilizar' }); X.ed.lista({ items: [`*${c.reutilizar}* estructuras se *reutilizan*`], x: 4.5, y: 12 }); }],
          [0.45, () => { B.C.verExistentes({ solo: 'redisenar' }); X.ed.listaMas?.(document.querySelector('.ed-lista'), `*${c.redisenar}* requieren un *rediseño*`); }],
          [0.62, () => { B.C.verExistentes({ solo: 'sustituir' }); X.ed.listaMas?.(document.querySelector('.ed-lista'), `*${c.sustituir}* se *sustituyen*`); }],
          [0.8, () => { B.C.verExistentes('categorias'); X.ed.rotulo('según sus *condiciones* · clasificación interpretativa'); }],
        ]);
      }),
      beat('A partir del análisis de sintaxis espacial, se plantean nuevos accesos y pasajes peatonales, buscando conectar los recorridos del predio con las calles del entorno, sin intervenir el bosque existente.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true });
        X.vuelo([E(X, 'predioAlto')], 4);
        pasos(X, 5, [
          [0, () => { B.C.sintaxis.material.uniforms.uM.value = 0; B.C.fundir(B.C.sintaxis, 1, 1.2); X.ed.lista({ items: ['*sintaxis espacial* · integración angular'], x: 4.5, y: 12 }); }],
          [0.3, () => { B.C.pasajes.visible = true; B.C.pasajes.children.forEach((l, i) => { l.material.uniforms.uA.value = 1; X.gsap.fromTo(l.material.uniforms.uP, { value: 0 }, { value: 1, duration: 2.5, delay: i * 0.08 }); }); X.ed.listaMas?.(document.querySelector('.ed-lista'), `*${B.C.entradas.length}* accesos y *4,1 km* de pasajes`); }],
          [0.5, () => { X.gsap.to(B.C.sintaxis.material.uniforms.uM, { value: 1, duration: 3 }); B.C.fundir(B.C.peatones, 1, 1); X.ed.rotulo('conectar los recorridos con las *calles del entorno*'); }],
          [0.76, () => { B.C.fundir(B.C.bosque, 1, 1.2); X.ed.rotulo('sin intervenir el *bosque existente*'); }],
        ]);
      }),
    ],
  },

  /* ===================================================================== 04 TECNOLOGÍAS CONVERGENTES */
  {
    n: '04', nombre: 'Tecnologías convergentes NBIC',
    beats: [
      beat('El programa arquitectónico se organiza a partir de las cuatro tecnologías convergentes NBIC estudiadas por Roco y Bainbridge en 2002. Estas tecnologías se integran en diferentes edificios que combinan espacios de investigación, experimentación y aprendizaje.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true });
        X.vuelo([E(X, 'predio')], 5);
        pasos(X, 6, [
          [0.05, (d) => X.ed.lista({ items: ['*N*anotecnología', '*B*iotecnología', 'tecnologías de la *I*nformación', 'ciencias *C*ognitivas'], x: 4.5, y: 12, paso: d * 0.08 })],
          ...['nano', 'bio', 'info', 'cogno'].map((k, i) => [0.08 + i * 0.08, () => B.C.verNBIC(k)]),
          [0.42, () => X.ed.rotulo('Roco y Bainbridge, *2002*')],
          [0.58, () => { B.C.verNBIC('todas'); B.C.prog.forEach((v, i) => X.ed.lugar(B.K(v.userData.c), v.userData.n, { lado: i % 2 ? 'izq' : 'der', alto: 40 + (i % 3) * 34, delay: i * 0.15, pin: false })); }],
          [0.8, () => X.ed.rotulo('investigación · experimentación · *aprendizaje*')],
        ]);
      }),
      beat('Desde la biotecnología, se incorporan laboratorios de hidroponía, áreas de cultivo experimental de hongos y espacios para estudiar el aprovechamiento de residuos orgánicos.', (X) => {
        const B = X.B; B.estado({ torres: false }); B.C.verNBIC('bio');
        const e = B.edif('bio'); X.vuelo([{ p: e.p, o: e.o }], 4);
        pasos(X, 7, [
          [0.05, (d) => X.ed.lista({ items: ['laboratorios de *hidroponía*', 'cultivo experimental de *hongos*', 'aprovechamiento de *residuos orgánicos*'], x: 4.5, y: 12, paso: d * 0.25 })],
          [0.15, (d) => { const p = B.puntoLab('bio'); B.C.modulo.colocar(p[0], p[1], p[2], p[3]); B.C.modulo.armar(d * 0.35); X.vuelo([B.cerca(p, 9)], d * 0.3); }],
          [0.45, (d) => B.C.modulo.crecer(d * 0.4)],
          [0.6, () => X.ed.rotulo('*Biotecnología*')],
        ]);
      }),
      beat('La nanotecnología se incorpora mediante espacios de investigación de materiales para mejorar la conservación de alimentos y reducir sus pérdidas.', (X) => {
        const B = X.B; B.estado({ torres: false }); B.C.verNBIC('nano');
        const e = B.edif('nano'); X.vuelo([{ p: e.p, o: e.o }], 4);
        pasos(X, 8, [
          [0.1, (d) => X.ed.lista({ items: ['investigación de *materiales*', 'mejorar la *conservación* de alimentos', 'reducir sus *pérdidas*'], x: 4.5, y: 12, paso: d * 0.2 })],
          [0.3, () => X.ed.lugar(e.c, 'Laboratorio de *materiales*', { sub: 'línea de investigación, no tecnología probada' })],
          [0.6, () => X.ed.rotulo('*Nanotecnología*')],
        ]);
      }),
      beat('Las tecnologías de la información se desarrollan en espacios de monitoreo y coordinación de la red alimentaria. Allí se aprende a utilizar herramientas digitales para registrar la producción, organizar pedidos y gestionar los excedentes de los mercados barriales.', (X) => {
        const B = X.B; B.estado({ torres: false }); B.C.verNBIC('info');
        const e = B.edif('info'); X.vuelo([{ p: e.p, o: e.o }], 4);
        pasos(X, 9, [
          [0.05, () => X.ed.lista({ items: ['*monitoreo* y coordinación de la *red alimentaria*'], x: 4.5, y: 12 })],
          [0.35, (d) => { X.vuelo([E(X, 'kennedyMedio')], d * 0.3); B.C.verArcos(B.C.arcosMercados, true, d * 0.3); B.C.plazas.forEach((q, i) => X.ed.lugar(B.K(q.w), q.n, { delay: i * 0.1, lado: i % 2 ? 'izq' : 'der' })); }],
          [0.55, () => X.ed.listaMas?.(document.querySelector('.ed-lista'), 'registrar la *producción*')],
          [0.68, () => X.ed.listaMas?.(document.querySelector('.ed-lista'), 'organizar *pedidos*')],
          [0.8, () => X.ed.listaMas?.(document.querySelector('.ed-lista'), 'gestionar los *excedentes* de los mercados barriales')],
        ]);
      }),
      beat('Y las ciencias cognitivas se integran mediante aulas y talleres donde los habitantes aprenden técnicas de producción alimentaria y manejo de cultivos.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true }); B.C.verNBIC('cogno');
        const e = B.edif('cogno'); X.vuelo([{ p: e.p, o: e.o }], 4);
        pasos(X, 10, [
          [0.1, () => { B.C.pasajes.visible = true; B.C.pasajes.children.forEach(l => { l.material.uniforms.uP.value = 1; X.gsap.to(l.material.uniforms.uA, { value: 0.6, duration: 1 }); }); B.C.fundir(B.C.peatones, 1, 1); }],
          [0.2, (d) => X.ed.lista({ items: ['*aulas* y *talleres*', 'técnicas de *producción alimentaria*', 'manejo de *cultivos*'], x: 4.5, y: 12, paso: d * 0.2 })],
          [0.3, () => X.ed.lugar(e.c, 'Escuela de *agricultura urbana*')],
          [0.6, () => X.ed.rotulo('*Ciencias cognitivas*')],
        ]);
      }),
    ],
  },

  /* ===================================================================== 05 TRANSFERENCIA A KENNEDY */
  {
    n: '05', nombre: 'Huertas hidropónicas en Kennedy',
    beats: [
      beat('La intención es que los conocimientos desarrollados en Bavaria Común lleguen a los hogares y a una red de colegios de Kennedy, mediante la implementación de huertas hidropónicas.', (X) => {
        const B = X.B; B.estado({ torres: false, borde: true });
        X.vuelo([E(X, 'kennedy')], 6);
        pasos(X, 11, [
          [0.05, () => X.ed.lista({ items: ['de *Bavaria Común*', 'a los *hogares*'], x: 4.5, y: 12, paso: 1.5 })],
          [0.25, (d) => B.C.verArcos(B.C.arcosHogares, true, d * 0.35)],
          [0.5, (d) => { B.C.verArcos(B.C.arcosColegios, true, d * 0.35); X.ed.listaMas?.(document.querySelector('.ed-lista'), `y a *${B.C.colegios.length}* colegios de Kennedy`); }],
          [0.75, () => X.ed.rotulo('mediante *huertas hidropónicas*')],
        ]);
      }),
      beat('Estas huertas se plantean como módulos adaptables a diferentes espacios, con estructuras para sostener las plantas, depósitos de agua y sistemas que recirculan los nutrientes, sin utilizar suelo agrícola.', (X) => {
        const B = X.B; B.estado({ torres: false });
        const p = B.puntoLab('bio'); B.C.modulo.colocar(p[0], p[1], p[2], p[3]); X.vuelo([B.cerca(p, 5.2)], 3);
        pasos(X, 12, [
          [0.05, (d) => B.C.modulo.armar(d * 0.55)],
          [0.05, () => X.ed.lista({ items: ['módulos *adaptables*'], x: 4.5, y: 12 })],
          [0.18, () => X.ed.listaMas?.(document.querySelector('.ed-lista'), '*estructuras* que sostienen las plantas')],
          [0.42, () => X.ed.listaMas?.(document.querySelector('.ed-lista'), '*depósitos de agua*')],
          [0.58, (d) => { X.ed.listaMas?.(document.querySelector('.ed-lista'), 'sistemas que *recirculan* los nutrientes'); B.C.modulo.crecer(d * 0.4); }],
          [0.78, () => { X.ed.rotulo('sin utilizar *suelo agrícola*'); B.C.modulo.despiezar(true); }],
          [0.92, () => B.C.modulo.despiezar(false)],
        ]);
      }),
      beat('En los colegios, los módulos también pueden instalarse en áreas habilitadas de parques cercanos, creando espacios de cultivo compartidos donde los estudiantes y las comunidades aprendan a sembrar, cuidar y cosechar alimentos.', (X) => {
        const B = X.B; B.estado({ torres: false });
        X.vuelo([E(X, 'kennedy')], 4);
        pasos(X, 13, [
          [0.05, () => X.ed.lista({ items: ['*colegios* y *parques* cercanos'], x: 4.5, y: 12 })],
          [0.1, (d) => { B.C.verArcos(B.C.enlacesColPar, true, d * 0.3); B.C.parques.forEach((q, i) => X.ed.lugar(B.K(q.c), q.n, { delay: i * 0.12, lado: i % 2 ? 'izq' : 'der' })); }],
          [0.38, (d) => { const q = B.C.parques[0]; B.C.modulosParques.visible = true; X.vuelo([B.cerca([q.c[0], q.c[1]], 70)], d * 0.3); }],
          [0.62, () => X.ed.rotulo('aprender a *sembrar*, *cuidar* y *cosechar*')],
        ]);
      }),
      beat('Parte de las cosechas se destina al consumo propio, mientras los excedentes pueden venderse en los mercados barriales, generando ingresos adicionales para los hogares.', (X) => {
        const B = X.B; B.estado({ torres: false }); B.C.modulosParques.visible = true;
        X.vuelo([E(X, 'kennedy')], 4);
        pasos(X, 14, [
          [0.08, (d) => { B.C.verArcos(B.C.flujoAuto, true, d * 0.3); X.ed.lista({ items: ['*consumo propio*'], x: 4.5, y: 12 }); }],
          [0.42, (d) => { B.C.verArcos(B.C.flujoExc, true, d * 0.3); X.ed.listaMas?.(document.querySelector('.ed-lista'), 'excedentes a los *mercados barriales*'); B.C.plazas.forEach((q, i) => X.ed.lugar(B.K(q.w), q.n, { delay: i * 0.08, lado: i % 2 ? 'izq' : 'der' })); }],
          [0.72, () => X.ed.rotulo('*ingresos adicionales* para los hogares')],
        ]);
      }),
    ],
  },
];
