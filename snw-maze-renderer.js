/**
 * Copyright (c) 2017 Ilkka Kuosmanen
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
'use strict';
class SnwMazeRenderer {
  /**
   * Initialize a new renderer
   * @param {String} canvas - Canvas ID
   * @param {Number} width - Canvas width
   * @param {Number} height - Canvas height
   * @param {Number} scale - Render scale
   */
  constructor (canvas, width, height, scale) {
    this.init(canvas, width, height, scale);
  }

  init (canvas, width, height, scale) {
    this.canvas = document.getElementById(canvas);
    if (this.canvas === null || this.canvas.tagName !== 'CANVAS') {
      throw 'SnwRendered: BAD CANVAS!';
    }
    this.gl = this.canvas.getContext('2d');
    this.gl.imageSmoothingEnabled = false;
    this.Scale = scale;
    this.Width = width;
    this.Height = height;

    this.resize();
  }

  /**
   * Render a path
   * @param {Number} x - Start X coordinate
   * @param {Number} y - Start Y coordinate
   * @param {Number} ex - End X coordinate
   * @param {Number} ey - End Y coordinate
   * @param {Number} style - Render style
   */
  renderPath (x, y, ex, ey, style) {
    if (x === ex && y !== ey) {
      let ay = y;
      let aey = ey;
      if (ey < y) {
        ay = ey;
        aey = y;
      }
      for (let i = ay; i <= aey; i++) {
        this.renderBlock(x, i, style);
      }
    } else if (x !== ex && y === ey) {
      let ax = x;
      let aex = ex;
      if (ex < x) {
        ax = ex;
        aex = x;
      }
      for (let i = ax; i <= aex; i++) {
        this.renderBlock(i, y, style);
      }
    } else {
      this.renderBlock(x, y, style);
    }
  }

  /**
   * Render the nodes given in array
   * @param {MazeNode[]} nodes - The nodes to render
   */
  renderNodes (nodes) {
    this.clear();
    let rStartTime = performance.now();
    for (let i = 0; i < nodes.length; i++) {
      for (let key in nodes[i].connections) {
        if (nodes[i].connections.hasOwnProperty(key)) {
          if (nodes[i].connections[key] !== null) {
            this.renderPath(nodes[i].x, nodes[i].y, nodes[i].connections[key].x,
              nodes[i].connections[key].y, 1);
          } else {
            this.renderBlock(nodes[i].x, nodes[i].y, 1);
          }
        }
      }
    }
    console.info('Node render time: ' + (performance.now() - rStartTime).toString());
  }

  /**
   * Render the node locations
   * @param {MazeNode[]} nodes - Node array
   */
  renderNodePositions (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      for (let key in nodes[i].connections) {
        if (nodes[i].connections.hasOwnProperty(key)) {
          if (nodes[i].connections[key] !== null)
            this.renderBlock(nodes[i].x, nodes[i].y, 2);
        }
      }
    }
  }

  /**
   * Clear the canvas
   */
  clear () {
    this.gl.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  renderBlockStroke (x, y, style) {
    // window.requestAnimationFrame(() => {
    this.gl.strokeStyle = this.getStyle(style);
    this.gl.strokeRect(x * this.scale, y * this.scale, this.scale, this.scale);
    // });
  }

  renderBlock (x, y, style) {
    this.gl.fillStyle = this.getStyle(style);
    this.gl.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
  }

  /**
   * Get a render style associated with style ID
   * @param {Number} styleId - A style ID
   * @returns {String}
   */
  getStyle (styleId) {
    switch (styleId) {
      case 0:
        return '#000000';
        break;
      case 1:
        return '#8ba2ff';
        break;
      case 2:
        return '#0000ff';
        break;
      case 3:
        return '#00ffff';
        break;
      case 4:
        return '#ff0000';
        break;
      case 5:
        return '#ffeb00';
        break;
      case 6:
        return '#00ff8b';
        break;
      default:
        return '#ff00ff';
    }
  }

  /**
   * Set a render scale for the canvas
   * @param {Number} scale - Render scale
   * @constructor
   */
  set Scale (scale) {
    if (scale >= 1) {
      this.scale = scale;
    } else {
      this.scale = 1;
    }
    this.Width = this.width;
    this.Height = this.height;
  }

  /**
   * Get the render scale
   * @returns {Number}
   * @constructor
   */
  get Scale () {
    return this.scale;
  }

  /**
   * Set the width of the canvas
   * @param {Number} width -  The desired widht
   * @constructor
   */
  set Width (width) {
    // this.canvas.width = width;
    // this.gl.width = width;
    this.width = width;
    this.canvas.style.width = this.ScaledWidth +'px';
  }

  /**
   * Get the width of the canvas
   * @returns {Number}
   * @constructor
   */
  get Width () {
    return this.width;
  }

  /**
   * Set the height of the canvas
   * @param {Number} height - The desired height
   * @constructor
   */
  set Height (height) {
    // this.canvas.height = height;
    // this.gl.height = height;
    this.height = height;
    this.canvas.style.height = this.ScaledHeight +'px';
  }

  /**
   * Get height of the canvas
   * @returns {Number}
   * @constructor
   */
  get Height () {
    return this.height;
  }

  /**
   * Get the width of the canvas with scale
   * @returns {number}
   * @constructor
   */
  get ScaledWidth () {
    return this.width * this.scale;
  }

  /**
   * Get the height of the canvas with scale
   * @returns {number}
   * @constructor
   */
  get ScaledHeight () {
    return this.height * this.scale;
  }

  resize () {
    // Lookup the size the browser is displaying the canvas.
    let displayWidth = this.canvas.clientWidth;
    let displayHeight = this.canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (this.canvas.width !== displayWidth ||
      this.canvas.height !== displayHeight) {

      // Make the canvas the same size
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }
  }

  draw () {}
}

class SnwMazeWebGlRenderer extends SnwMazeRenderer {

  init (canvas, width, height, scale) {
    if (window.SNW.debug)
      console.log('Using webgl2');
    this.canvas = document.getElementById(canvas);
    this.canvas.width = width;
    this.canvas.height = height;
    this.Scale = scale;
    this.Width = width;
    this.Height = height;

    this.gl = this.canvas.getContext('webgl2', {
      antialias: false
    });

    this.lastUsedBufferInfo = null;
    this.objectsToDraw = [];
    this.colorIndexChart = [];

    this.initShaders();

    this.initObjects();

    this.initDraw();
    this.draw();
  }

  getStyle (styleId) {
    switch (styleId) {
      case 0:
        return [0.0, 0.0, 0.0, 1.0];
        break;
      case 1:
        return [140 / 256, 162 / 256, 1.0, 1.0];
        break;
      case 2:
        return [0.0, 0.0, 1.0, 1.0];
        break;
      case 3:
        return [0.0, 1.0, 1.0, 1.0];
        break;
      case 4:
        return [1.0, 0.0, 0.0, 1.0];
        break;
      case 5:
        return [1.0, 235 / 256, 0.0, 1.0];
        break;
      case 6:
        return [0.0, 1.0, 139 / 256, 1.0];
        break;
      default:
        return [1.0, 0.0, 1.0, 1.0];
    }
  }

  draw () {
    this.resize();
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    let rStart = performance.now();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.vertexAttribDivisor(this.offsetBuffer, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.offsetBuffer);
    this.gl.enableVertexAttribArray(this.offsetLocation);
    this.gl.vertexAttribPointer(this.offsetLocation, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.vertexAttribDivisor(this.offsetLocation, 1);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.enableVertexAttribArray(this.colorLocation);
    this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.vertexAttribDivisor(this.colorLocation, 1);

    this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, this.width * this.height);

    if (window.SNW.debug)
      console.info('WebGL2 render time: ' + (performance.now() - rStart).toString());
  }

  initShaders () {
    this.vertexShader = this.createShaderFromScriptElement('2d-vertex-shader');
    this.fragmentShader = this.createShaderFromScriptElement('2d-fragment-shader');

    this.createShaderProgram([this.vertexShader, this.fragmentShader]);
    this.gl.useProgram(this.shaderProgram);
  }

  initObjects () {
    let rStart = performance.now();
    let vertexArr = [
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ];
    let colorArr = [];
    let offsetArr = [];
    this.colorIndexChart = [];

    for (let y = 0; y < this.height; y++) {
      this.colorIndexChart[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.colorIndexChart[y][x] = colorArr.length * 4;
        colorArr.push(0);
        colorArr.push(0);
        colorArr.push(0);
        colorArr.push(1);
        offsetArr.push(x);
        offsetArr.push(y);
      }
    }
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexArr), this.gl.STATIC_DRAW);

    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colorArr), this.gl.DYNAMIC_DRAW);

    this.offsetBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.offsetBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(offsetArr), this.gl.STATIC_DRAW);

    if (window.SNW.debug)
      console.info('WebGL2 buffer setup: ' + (performance.now() - rStart).toString());
  }

  initDraw () {
    this.positionLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_position');
    this.resolutionLocation = this.gl.getUniformLocation(this.shaderProgram,
      'u_resolution');
    this.colorLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_color');
    this.offsetLocation = this.gl.getAttribLocation(this.shaderProgram, 'a_offset');

    this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
  }

  createShaderFromScriptElement (id) {
    let element = document.getElementById(id);
    let type = null;
    let shaderSource = element.text;
    switch (element.type) {
      case 'x-shader/x-vertex':
        type = this.gl.VERTEX_SHADER;
        break;
      case 'x-shader/x-fragment':
        type = this.gl.FRAGMENT_SHADER;
        break;
    }

    let shader = this.gl.createShader(type);

    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        'An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  createShaderProgram (shaders) {
    this.shaderProgram = this.gl.createProgram();
    for (let i = 0; i < shaders.length; i++) {
      this.gl.attachShader(this.shaderProgram, shaders[i]);
    }
    this.gl.linkProgram(this.shaderProgram);

    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' +
        this.gl.getProgramInfoLog(this.shaderProgram));
    }
  }

  clear () {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.draw();
  }

  renderBlock (x, y, style) {
    this.changeColorAtCoordinate(x, y, this.getStyle(style));
  }

  changeColorAtCoordinate (x, y, color) {
    let index = this.colorIndexChart[y][x];
    let change = new Float32Array(color);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, index, change, 0, 3);
  }

  renderPath (x, y, ex, ey, style) {
    if (x === ex && y !== ey) {
      let ay = y;
      let aey = ey;
      if (ey < y) {
        ay = ey;
        aey = y;
      }
      for (let i = ay; i <= aey; i++) {
        this.renderBlock(x, i, style);
      }
    } else if (x !== ex && y === ey) {
      let ax = x;
      let aex = ex;
      if (ex < x) {
        ax = ex;
        aex = x;
      }
      for (let i = ax; i <= aex; i++) {
        this.renderBlock(i, y, style);
      }
    } else {
      this.renderBlock(x, y, style);
    }
  }

  renderNodes (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      for (let key in nodes[i].connections) {
        if (nodes[i].connections.hasOwnProperty(key)) {
          if (nodes[i].connections[key] !== null) {
            this.renderPath(nodes[i].x, nodes[i].y, nodes[i].connections[key].x,
              nodes[i].connections[key].y, 1);
          } else {
            this.renderBlock(nodes[i].x, nodes[i].y, 1);
          }
        }
      }
    }
    this.draw();
  }

  renderNodePositions (nodes) {
    super.renderNodePositions(nodes);
    this.draw();
  }
}