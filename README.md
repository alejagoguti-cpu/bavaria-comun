# Bavaria Común · urbia

Plataforma 3D geolocalizada de la antigua fábrica de Bavaria (Kennedy, Bogotá): **un territorio, dos futuros posibles**.

Web: https://alejagoguti-cpu.github.io/bavaria-comun/

- `?esc=actual` · `?esc=plan` · `?esc=comun` abre directo un escenario.

## Ejecutar localmente

```
npx http-server -p 8093 -c-1
```
Abrir http://localhost:8093. Verificación con captura: `node tools/cap/cap.mjs salida.png "?esc=plan" 40` (usa puppeteer-core y Chrome instalado).

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/escena` | marco de coordenadas común (`geo.js`) y malla fotorrealista de Google con recorte por polígono (`malla.js`) |
| `src/escenarios` | 00 estado actual, 01 plan parcial, 02 Bavaria Común |
| `src/ui` | interfaz urbia (sidebar, portada, herramientas, ficha) |
| `data/` | predio (OSM), plan parcial (Decreto 448/2023), sintaxis espacial, red territorial — reutilizados de simulador-kennedy |
| `modelos/`, `texturas/` | GLB y texturas PBR |
| `docs/` | auditoría, inventario de fuentes, pendientes de la autora |
| `tools/` | scripts que generan los datos |

## Estado por fases

| Fase | Estado |
|---|---|
| 1 Auditoría | hecha — `docs/01_auditoria.md` |
| 2 Investigación | iniciada — `docs/fuentes/inventario.md` |
| 3 Georreferenciación | hecha — mismo marco del simulador, malla calibrada al suelo |
| 4 Estado actual | malla real + borde y huellas seleccionables |
| 5 Futuro sin propuesta | 93 torres modeladas en Blender (`tools/blender/torre_modulos.py` → `modelos/plan/torre.glb`), PBR de Poly Haven, implantadas en las manzanas oficiales según el render oficial (`docs/fuentes/render_oficial_plan_parcial.avif`). Faltan: árboles entre torres, variación de fachadas, LOD para celular |
| 6 Bavaria Común | **pendiente de los archivos de la autora** — `docs/pendientes_autora.md` |
| 7–14 | por hacer |

Clasificación de cada dato: Documentada · Reconstruida · Interpretativa · Propuesta.
