# Bavaria Común · urbia

Plataforma 3D geolocalizada de la antigua fábrica de Bavaria (Kennedy, Bogotá): **un territorio, dos futuros posibles**.

Web: https://alejagoguti-cpu.github.io/bavaria-comun/

- **Relato con voz** (botón «Ver el relato con voz»): lógica de kennedy-video. Cada frase del guion es un beat con su animación 3D; la grabación (`recursos/audio/guion.m4a`) avanza sola los beats según `src/relato/tiempos.js`.
  Teclas: → / espacio siguiente frase · ← anterior (reconstruye el estado) · P pausa · T subtítulos · B oculta textos · F pantalla completa · Esc salir · M marca un tiempo (calibrar). La URL guarda la frase (`#6`).
- `?esc=actual` · `?esc=plan` · `?esc=comun` abre directo un escenario (exploración libre).

### Relato (`src/relato/`)
| Archivo | Qué hace |
|---|---|
| `guion.js` | las 15 frases y la coreografía de cada una (sub-pasos en fracciones de la duración de la frase) |
| `tiempos.js` | segundo de inicio de cada frase: transcripción Whisper (`docs/fuentes/transcripcion_whisper_guion.json`) + silencios de ffmpeg |
| `capas.js` | capas 3D animadas: avenidas OSM, borde, torres que crecen, carros, presión inmobiliaria, árboles que se talan, categorías de estructuras, sintaxis antes/después, pasajes y peatones, bosque, NBIC, arcos a colegios/hogares/plazas, huertas en parques, flujos de cosecha |
| `modulo_hidro.js` | módulo NFT en A que se arma pieza por pieza, agua que circula, lechugas que crecen (medidas de referencia: pendiente la especificación de la autora) |
| `textos.js` | titulares cinéticos, cifras, tarjetas con íconos lineales, rótulos anclados al 3D |
| `motor.js` | audio, teclas, URL, HUD |

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
