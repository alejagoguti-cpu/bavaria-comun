/* Los ShaderMaterial propios deben escribir la misma profundidad logarítmica que el resto (renderer con logarithmicDepthBuffer). */
export function logd(m) {
  m.vertexShader = '#include <common>\n#include <logdepthbuf_pars_vertex>\n' + m.vertexShader.replace(/gl_Position\s*=([^;]+);/, 'gl_Position =$1;\n#include <logdepthbuf_vertex>\n');
  m.fragmentShader = '#include <logdepthbuf_pars_fragment>\n' + m.fragmentShader.replace(/void main\(\)\s*\{/, 'void main(){\n#include <logdepthbuf_fragment>\n');
  return m;
}
