'use strict';

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
  if (gl_FragCoord.x < viewport.y / 2.0 && gl_FragCoord.y < viewport.y / 2.0) {
    gl_FragColor = vec4(gl_FragCoord.x / viewport.x, 0, gl_FragCoord.y / viewport.y, 0.5);
  }
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

  const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const shaderProgram = createProgram(gl, vertShader, fragShader);

  bindVertices(gl, shaderProgram, 'coordinates');
  bindInitialSizeAndUpdate(gl, canvas, shaderProgram, 'viewport');

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const camera = new Camera();
  document.addEventListener('keypress', function (e) {
    if (e.keyCode === 119) { // w.
      camera.moveForwards();
    } else if (e.keyCode === 115) { // s.
      camera.moveBackwards();
    } else if (e.keyCode === 100) { // d.
      camera.moveRight();
    } else if (e.keyCode == 97) { //a.
      camera.moveLeft();
    }
  });
  canvas.addEventListener('mousedown', function (e) {
    camera.mousedown(e);
  });
  canvas.addEventListener('mousemove', function (e) {
    camera.mousemove(e);
  });
  window.addEventListener('mouseup', function () {
    camera.mouseup();
  });

  logCompileStatus(gl, vertShader);
  logCompileStatus(gl, fragShader);
}

function bindInitialSizeAndUpdate(gl, canvas, shaderProgram, variableName) {
  const viewportSizeVar = gl.getUniformLocation(shaderProgram, variableName);
  const size = CANVAS_SIZE_OPTIONS[DEFAULT_SIZE];
  gl.uniform2f(viewportSizeVar, size.x, size.y);
  addSizeListener(gl, canvas, viewportSizeVar);
}

function addSizeListener(gl, canvas, viewportSizeVar) {
  const sizeSelect = document.getElementById('sizeSelect');
  sizeSelect.addEventListener('change', function () {
    const newSize = CANVAS_SIZE_OPTIONS[sizeSelect.value];
    canvas.width = newSize.x;
    canvas.height = newSize.y;
    gl.uniform2f(viewportSizeVar, newSize.x, newSize.y);
    gl.viewport(0, 0, newSize.x, newSize.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, vertShader, fragShader) {
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  return shaderProgram;
}

function bindVertices(gl, shaderProgram, variableName) {
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SCREEN_SQUARE_VERTICES), gl.STATIC_DRAW);

  const coordinates = gl.getAttribLocation(shaderProgram, variableName);
  gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);
}

function logCompileStatus(gl, shader) {
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  console.log('Shader compiled successfully: ' + compiled);
  const compilationLog = gl.getShaderInfoLog(shader);
  if (compilationLog) {
    console.log('Shader compiler log: ' + compilationLog);
  }
}

window.addEventListener('DOMContentLoaded', main);