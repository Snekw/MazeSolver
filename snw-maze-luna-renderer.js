/**
 *  MazeSolver,
 *  Copyright (C) 2018 Ilkka Kuosmanen
 *
 *  This file is part of MazeSolver.
 *
 *  MazeSolver is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  MazeSolver is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with MazeSolver.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

class SnwMazeRendererBase {
  constructor (canvas, aspectRatio) {
    this.renderQueue = [];
    this.pauseRendering = true;
    this.rendering = false;
    this.lastRenderTimeStamp = performance.now();
    this.canvas = document.getElementById(canvas);
    this.renderLoop = this.renderLoop.bind(this);
    this.init(aspectRatio);
  }

  init () {}

  beginRendering () {
    this.pauseRendering = false;
    if (!this.rendering) {
      window.requestAnimationFrame(this.renderLoop);
      this.rendering = true;
    }
  }

  stopRendering () {
    this.pauseRendering = true;
    this.rendering = false;
  }

  renderLoop (timeStamp) {
    if (!this.pauseRendering) {
      this.renderFrame(timeStamp - this.lastRenderTimeStamp);
      window.requestAnimationFrame(this.renderLoop);
    }
  }

  queueCommands (commands) {
    this.renderQueue.push(commands);
  }

  renderFrame () {}
}

const vertexShader = `#version 300 es
#define POSITION_LOCATION 0

precision highp int;
precision highp float;

layout(location = POSITION_LOCATION) in float a_nodeState;
uniform uint u_nodeCount;
uniform uint u_lineWidth;
uniform float u_pointSize;

flat out float v_nodeState;

float scaleToScreenSpace(float val, vec2 minMax){
    return (((val - minMax.x) / (minMax.y - minMax.x)) * 2.0) - 1.0;
}

void main() {
    float x = scaleToScreenSpace(0.5 + float(float(gl_VertexID) - float(float(u_lineWidth)*floor(float(gl_VertexID)/float(u_lineWidth)))), vec2(0,u_lineWidth));
    float y = scaleToScreenSpace(0.5 + floor(float(float(gl_VertexID)/float(u_lineWidth))), vec2(0,u_lineWidth));
    gl_Position = vec4(x, y, 0.0, 1.0);
    gl_PointSize = u_pointSize;
    v_nodeState = a_nodeState;
}
`;
const fragmentShader = `#version 300 es

precision highp int;
precision highp float;

flat in float v_nodeState;
out vec4 fragColor;

void main() {
  switch(int(v_nodeState)){
  case 1:
    fragColor = vec4(1.0,0.0,0.0,1.0);
    break;
  case 2:
    fragColor = vec4(1.0,1.0,0.0,1.0);
    break;
  default:
    fragColor = vec4(1.0,1.0,1.0,1.0);
    break;
  }
}
`;

class SnwMazeLunaRenderer extends SnwMazeRendererBase {
  init (aspectRatio) {
    this.gl = this.canvas.getContext('webgl2', {
      antialias: false
    });
    this.gl.imageSmoothingEnabled = false;
    let width = Math.min(this.canvas.parentElement.clientHeight, this.canvas.parentElement.clientWidth);
    this.canvas.width = width;
    this.canvas.height = width / aspectRatio;

    this.vertexShader = this.createShaderFromString(vertexShader, this.gl.VERTEX_SHADER);
    this.fragmentShader = this.createShaderFromString(fragmentShader, this.gl.FRAGMENT_SHADER);
    this.shaderProgram = this.createShaderProgram(this.vertexShader, this.fragmentShader);
    this.gl.linkProgram(this.shaderProgram);
    this.gl.useProgram(this.shaderProgram);

    this.initLocations();

    this.beginRendering();
  }

  createShaderFromString (shaderString, type) {

    let shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, shaderString);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createShaderProgram (...shaders) {
    const program = this.gl.createProgram();
    for (const shader of shaders) {
      this.gl.attachShader(program, shader);
    }
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(program));
    } else {
      return program;
    }
  }

  createBuffers (length) {
    this.stateBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.stateBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.nodeStates, this.gl.DYNAMIC_DRAW, 0, this.nodeCount);
  }

  initLocations () {
    this.nodeCountLocation = this.gl.getUniformLocation(this.shaderProgram, 'u_nodeCount');
    this.lineWidthLocation = this.gl.getUniformLocation(this.shaderProgram, 'u_lineWidth');
    this.pointSizeLocation = this.gl.getUniformLocation(this.shaderProgram, 'u_pointSize');
    this.nodeStateLocation = 0;
  }

  setupUniforms () {
    this.gl.uniform1ui(this.nodeCountLocation, this.nodeCount);
    this.gl.uniform1ui(this.lineWidthLocation, this.lineWidth);
    this.gl.uniform1f(this.pointSizeLocation, (this.canvas.width / this.lineWidth));
  }

  renderFrame (deltaTime) {
    this.clear();
    this.draw();
  }

  draw () {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.stateBuffer);
    this.gl.enableVertexAttribArray(this.nodeStateLocation);
    this.gl.vertexAttribPointer(this.nodeStateLocation, 1, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.POINTS, 0, this.nodeCount);
  }

  /**
   * Clear the canvas
   */
  clear () {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  loadNodeGrid (rows, columns) {
    this.nodeCount = rows * columns;
    this.lineWidth = columns;

    this.nodeStates = new Float32Array(this.nodeCount);

    this.createBuffers();
    this.setupUniforms();
  }

  setNodeState (x, y, state) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.stateBuffer);
    this.nodeStates[x + y * this.lineWidth] = state;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.nodeStates, this.gl.DYNAMIC_DRAW);
  }
}
