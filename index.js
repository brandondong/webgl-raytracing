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

// Variable for the screen filling (x,y) vertices.
const COORDINATES_VAR = 'coordinates';
// Variable for the viewport dimensions.
const VIEWPORT_VAR = 'viewport';

// Place the canvas-filling square at z = 0.
const VERTEX_SOURCE = `
precision highp float;
attribute vec2 ${COORDINATES_VAR};

void main(void) {
  gl_Position = vec4(${COORDINATES_VAR}, 0, 1);
}
`;

const FRAGMENT_SOURCE = `
precision highp float;
uniform vec2 ${VIEWPORT_VAR};

void main(void) {
  gl_FragColor = vec4(gl_FragCoord.x / ${VIEWPORT_VAR}.x, 0, gl_FragCoord.y / ${VIEWPORT_VAR}.y, 1);
  if (gl_FragCoord.x < ${VIEWPORT_VAR}.y / 2.0 && gl_FragCoord.y < ${VIEWPORT_VAR}.y / 2.0) {
    gl_FragColor = vec4(gl_FragCoord.x / ${VIEWPORT_VAR}.x, 0, gl_FragCoord.y / ${VIEWPORT_VAR}.y, 0.5);
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
  const { canvas, gl, viewportSizeVar } = setupWebGL();

  // Only continue if WebGL is available and working.
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  addSizeListener(gl, canvas, viewportSizeVar);

  const camera = new Camera();
  document.addEventListener('keypress', function (e) {
    if (e.key === 'w') {
      camera.moveForwards();
    } else if (e.key === 's') {
      camera.moveBackwards();
    } else if (e.key === 'd') {
      camera.moveRight();
    } else if (e.key === 'a') {
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
}

function setupWebGL() {
  const canvas = document.getElementById('glCanvas');
  const gl = canvas.getContext('webgl');
  if (gl === null) {
    return {};
  }
  const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  if (!logCompileStatus(gl, vertShader) || !logCompileStatus(gl, fragShader)) {
    return {};
  }
  const shaderProgram = createProgram(gl, vertShader, fragShader);
  bindVertices(gl, shaderProgram);
  const viewportSizeVar = bindInitialSize(gl, shaderProgram);
  render(gl);
  return { canvas, gl, viewportSizeVar };
}

function render(gl) {
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function bindInitialSize(gl, shaderProgram) {
  const viewportSizeVar = gl.getUniformLocation(shaderProgram, VIEWPORT_VAR);
  const size = CANVAS_SIZE_OPTIONS[DEFAULT_SIZE];
  gl.uniform2f(viewportSizeVar, size.x, size.y);
  return viewportSizeVar;
}

function addSizeListener(gl, canvas, viewportSizeVar) {
  const sizeSelect = document.getElementById('sizeSelect');
  sizeSelect.addEventListener('change', function () {
    const newSize = CANVAS_SIZE_OPTIONS[sizeSelect.value];
    canvas.width = newSize.x;
    canvas.height = newSize.y;
    gl.uniform2f(viewportSizeVar, newSize.x, newSize.y);
    gl.viewport(0, 0, newSize.x, newSize.y);
    render(gl);
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

function bindVertices(gl, shaderProgram) {
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(SCREEN_SQUARE_VERTICES), gl.STATIC_DRAW);

  const coordinates = gl.getAttribLocation(shaderProgram, COORDINATES_VAR);
  gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordinates);
}

function logCompileStatus(gl, shader) {
  const compilationLog = gl.getShaderInfoLog(shader);
  if (compilationLog) {
    console.log('Shader compiler log: ' + compilationLog);
  }
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  return compiled;
}

window.addEventListener('DOMContentLoaded', main);