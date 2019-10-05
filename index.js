// Square to fill the entire canvas.
const SCREEN_SQUARE_VERTICES = [
  -1, 1,
  1, 1,
  1, -1,
  -1, 1,
  -1, -1,
  1, -1
];

// Place the canvas-filling square at z = 0.
const VERTEX_SOURCE = `
attribute vec2 coordinates;

void main(void) {
  gl_Position = vec4(coordinates, 0, 1);
}
`;

const FRAGMENT_SOURCE = `
uniform highp vec2 viewport;

void main(void) {
  gl_FragColor = vec4(gl_FragCoord.x / viewport.x, 0, gl_FragCoord.y / viewport.y, 1);
}
`;

const CANVAS_SIZE_OPTIONS = {
  '360p': { x: 640, y: 360 },
  '480p': { x: 854, y: 480 },
  '720p': { x: 1280, y: 720 }
};

const DEFAULT_SIZE = '480p';

function main() {
  const canvas = document.getElementById('glCanvas');
  const gl = canvas.getContext('webgl');

  // Only continue if WebGL is available and working.
  if (gl === null) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SCREEN_SQUARE_VERTICES), gl.STATIC_DRAW);

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, VERTEX_SOURCE);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, FRAGMENT_SOURCE);
  gl.compileShader(fragShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  const coordinatesVar = gl.getAttribLocation(shaderProgram, 'coordinates');
  gl.vertexAttribPointer(coordinatesVar, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinatesVar);

  const viewportSize = gl.getUniformLocation(shaderProgram, 'viewport');
  const size = CANVAS_SIZE_OPTIONS[DEFAULT_SIZE];
  gl.uniform2f(viewportSize, size.x, size.y);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const sizeSelect = document.getElementById('sizeSelect');
  sizeSelect.addEventListener('change', function () {
    const newSize = CANVAS_SIZE_OPTIONS[sizeSelect.value];
    canvas.width = newSize.x;
    canvas.height = newSize.y;
    gl.uniform2f(viewportSize, newSize.x, newSize.y);
    gl.viewport(0, 0, newSize.x, newSize.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  logCompileStatus(gl, vertShader);
  logCompileStatus(gl, fragShader);
}

function logCompileStatus(gl, shader) {
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  console.log('Shader compiled successfully: ' + compiled);
  const compilationLog = gl.getShaderInfoLog(shader);
  console.log('Shader compiler log: ' + compilationLog);
}

window.addEventListener('DOMContentLoaded', main);