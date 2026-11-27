# Lo que falta de la autora (Bavaria Común)

El prompt pide reconstruir **exactamente** la propuesta, sin rediseñarla. En los repos no hay planos ni modelos de la propuesta: lo que existe es la versión interpretativa del simulador. Para no inventar, se necesita:

1. **Implantación general** (DWG, PDF o imagen con escala): edificios nuevos, estructuras que se conservan / reutilizan / rediseñan / sustituyen, pasajes, accesos, bosque.
2. **Modelo 3D** (Revit, SketchUp, Rhino, IFC, FBX o GLB) o, si no hay, alturas y número de pisos por edificio.
3. **Plantas por piso** de los edificios NBIC (laboratorios, aulas, talleres, hidroponía).
4. **Cortes y fachadas**, materialidad.
5. **Módulo hidropónico**: medidas y componentes (depósito, tubería, soporte, bomba).
6. **Resultados de la sintaxis espacial** propios (si son distintos del cálculo del simulador).
7. **Renders** de referencia.

Dónde ponerlos: `modelos/propuesta/` (o decir la ruta local) y se convierten a GLB conservando nombres y propiedades.
