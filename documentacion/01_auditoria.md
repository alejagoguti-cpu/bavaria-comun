# Fase 1 — Auditoría (2026-11-26)

## Plataformas revisadas

| Plataforma | Motor | Lo que se reutiliza |
|---|---|---|
| anasoficasca-code/simulador (copia local: alejagoguti-cpu/simulador-kennedy) | three.js 0.160 (importmap unpkg) + 3d-tiles-renderer 0.3.45 con las teselas fotorrealistas de Google; datos de Unreal 5 + Cesium | Marco de coordenadas del mundo (origen en el humedal El Burro), malla de Google y su calibración del suelo, predio de Bavaria desde OSM, 3.250 copas de árbol detectadas, sintaxis espacial angular de Kennedy (método DepthmapX), Plan Parcial calcado del Decreto 448/2023, distrito NBIC, nodos de colegios y mercados, reloj de simulación |
| anasoficasca-code/ejercicio | three.js 0.160, Catastro Bogotá (ArcGIS REST) | Lógica de exploración de edificio: panel lateral, tarjeta flotante, dock inferior, pisos y recorrido. Se toma la lógica de interacción, no la marca JMC |
| alejagoguti-cpu/simulador-kennedy | igual al simulador | Seis simulaciones, reloj universal (`data3d/reloj.js`), indicadores. La conexión será por parámetros de URL y un estado compartido; el simulador original no se modifica |
| alejagoguti-cpu/urbia-brandbook | CSS + three (cromo.js) | Paleta: noche #08090C, carbón #171916, lima #C7FF27, marfil #F5F3EB, gris #898D84. Tipos: DM Sans / Manrope + JetBrains Mono. Logo urbia_logo.svg |

## Decisión de motor

No se agrega CesiumJS ni MapLibre: el motor existente (three + 3d-tiles-renderer) ya resuelve la malla fotorrealista, la georreferencia y la selección. Se suma solo lo que falta: GSAP (relato por scroll) y, cuando haya modelos, GLTFLoader + DRACO/KTX2 (ya incluidos en three).

## Georreferencia

Marco «modelo» del simulador (x este, y norte, metros):

- modelo → lon/lat: `lon = -74.17 + (x - 5193.24) / (111320·cos 4.63°)`, `lat = 4.63 + (y - 2090.06) / 110540`
- modelo → mundo three: `[x - 5341.33, 3161.9 - y]`
- suelo de Kennedy en la malla de Google: altura elipsoidal ≈ 2.564 m, luego se calibra midiendo la malla

Predio (OSM, `data/predio/bavaria.json`): 71,2 ha, 29 edificaciones industriales, tanques y zonas libres.

## Lo que ya existe por escenario

| Escenario | Estado | Datos |
|---|---|---|
| 00 Estado actual | Huellas OSM + alturas estimadas + malla de Google (lo real, con su foto) | `data/predio/` |
| 01 Futuro sin propuesta | 22 manzanas, 2 equipamientos, parques CP-01–10, bosque CAPRP-01–05, vías y alamedas, 10 etapas | `data/plan_parcial/plan_bavaria.json` (calcado del plano 1/2, error ≈ 10 m). Alturas = SUPUESTO (el decreto deja la altura «resultante») |
| 02 Bavaria Común | Programa NBIC en 12 edificios, 25 pasajes, sintaxis después | `simulador-kennedy/data3d/bavaria_distrito.js`. **Interpretativo**: no viene de planos de la autora (ver `pendientes_autora.md`) |

## Límites honestos

- No hay modelos 3D arquitectónicos (GLB/IFC/RVT) de ningún escenario en los repos: los volúmenes actuales son extrusiones de huellas.
- No hay plantas interiores del plan parcial ni de Bavaria Común. Los interiores que se hagan antes de recibirlas se marcan «Interpretativa».
- La llave de Google del simulador está restringida por dominio; hay que confirmar que acepta `alejagoguti-cpu.github.io/bavaria-comun`.
