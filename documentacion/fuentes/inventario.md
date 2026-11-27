# Inventario de fuentes

Confiabilidad: A = oficial vigente · B = oficial histórica o derivada con método · C = estimación / supuesto.

| # | Documento | Entidad | Fecha | Enlace | Página / plano | Información extraída | Geometría | Conf. |
|---|---|---|---|---|---|---|---|---|
| 1 | Decreto Distrital 448 de 2023 (modifica el Plan Parcial Bavaria Fábrica) | Alcaldía de Bogotá / SDP | 2023 | por verificar en Fase 2 | — | Modificación vigente del plan parcial | — | A |
| 2 | Plano 1/2 «Propuesta general — planteamiento urbano», 1:2500 | SDP | oct. 2023 | https://www.sdp.gov.co/sites/default/files/bavaria_fabrica_plano_1.pdf | 1/2 | Manzanas MZ-01–22, EQ-01–02, CP-01–10, CAPRP-01–05, vías | `data/plan_parcial/plan_bavaria.json` (afín a 3 esquinas, ±10 m) | A |
| 3 | Plano 2/2 «Etapas de desarrollo» | SDP | oct. 2023 | por verificar | 2/2 | Etapas 1–10 | `anio` en cada manzana | A (orden dentro de etapa: C) |
| 4 | Decreto Distrital 364 de 2017 (adopción original) | Alcaldía de Bogotá | 2017 | por verificar | — | Versión histórica, superada por el 448/2023 | — | B |
| 5 | 14.000 viviendas | Alcaldía de Bogotá (modificación 2023) | 2023 | por verificar | — | Total de viviendas | `total_viviendas` | A |
| 6 | Alturas por tipo (VIS/VIP 12, T4 10, múltiple 8, comercio 4) | Supuesto del modelo | 2026 | — | — | El decreto deja altura «resultante» | — | C |
| 7 | Huellas del predio y edificaciones | OpenStreetMap (ODbL) | 2026 | https://www.openstreetmap.org | — | Polígono 71,2 ha, 29 edificaciones | `data/predio/bavaria.json` | B |
| 8 | Copas de árbol (3.250) | Esri World Imagery z19, detección propia | 2026 | https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9 | — | Bosque existente | `data/predio/bavaria_arboles.json` | B |
| 9 | Sintaxis espacial angular (NAIN, NACH, R800) | Cálculo propio, método DepthmapX sobre OSM | 2026 | https://github.com/SpaceGroupUCL/depthmapX | — | Antes / después de los pasajes | `data/sintaxis/` | B |
| 10 | Colegios, mercados, equipamiento social | OSM + IPES plazas de mercado 2024 | 2024–2026 | https://www.ipes.gov.co | — | Nodos de la red territorial | `data/red/bavaria_red.json` | B |
| 12 | Render oficial del desarrollo (torres de ladrillo terracota y blancas entre el bosque) | Promotor / Distrito — origen por confirmar | — | aportado por la autora | — | Tipología: torres sueltas ~15–22 pisos, podios con cubierta verde | lectura tipológica para `modelos/plan/torre.glb` | B (falta enlace original) |
| 13 | Texturas PBR y cielo HDRI (red_brick_03, white_plaster_02, concrete_wall_008, leafy_grass, kloofendal_48d_partly_cloudy_puresky) | Poly Haven (CC0) | 2026 | https://polyhaven.com | — | Materiales | `texturas/` | — |
| 11 | Roco y Bainbridge (2002), *Converging Technologies for Improving Human Performance* (NBIC) | NSF / DOC | 2002 | https://www.wtec.org/ConvergingTechnologies/Report/NBIC_report.pdf | — | Marco NBIC | — | A |

La Fase 2 amplía y verifica esta tabla (SDP, SINUPOT, IDECA, Datos Abiertos, Catastro, constructoras).
