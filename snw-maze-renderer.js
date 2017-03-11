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
"use strict";
class SnwMazeRenderer {
  /**
   * Initialize a new renderer
   * @param {String} canvas - Canvas ID
   * @param {Number} width - Canvas width
   * @param {Number} height - Canvas height
   * @param {Number} scale - Render scale
   */
  constructor(canvas, width, height, scale) {
    this.canvas = document.getElementById(canvas);
    if (this.canvas == null || this.canvas.tagName != 'CANVAS') {
      throw 'SnwRendered: BAD CANVAS!';
    }
    this.ctx = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.scale = scale;

    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    this.ctx.width = width * scale;
    this.ctx.height = height * scale;
  }

  /**
   * Render a path
   * @param {Number} x - Start X coordinate
   * @param {Number} y - Start Y coordinate
   * @param {Number} ex - End X coordinate
   * @param {Number} ey - End Y coordinate
   * @param {Number} style - Render style
   */
  renderPath(x, y, ex, ey, style) {
    let ax = x;
    let aax = ex;
    let ay = y;
    let aay = ey;
    //Flip the x and ex so that we can fill from left to right
    if (ex < x) {
      ax = ex;
      aax = x;
    }
    //Flip the y and ey so that we can fill from left to right
    if (ey < y) {
      ay = ey;
      aay = y;
    }
    let dx = aax - ax;
    let dy = aay - ay;
    this.ctx.fillStyle = SnwMazeRenderer.getStyle(style);
    //Need to add 1 to the delta to render atleast one block at minimum
    dx++;
    dy++;
    this.ctx.fillRect(ax * this.scale, ay * this.scale, dx * this.scale, dy * this.scale);
  }

  /**
   * Render the nodes given in array
   * @param {Array} nodes - The nodes to render
   */
  renderNodes(nodes) {
    let rStartTime = performance.now();
    for (let i = 0; i < nodes.length; i++) {
      for (let key in nodes[i].connections) {
        if (nodes[i].connections.hasOwnProperty(key)) {
          if (nodes[i].connections[key] != null)
            this.renderPath(nodes[i].x, nodes[i].y, nodes[i].connections[key].x, nodes[i].connections[key].y, 1);
        }
      }
    }
    console.info('Node render time: ' + (performance.now() - rStartTime).toString());
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.ScaledWidth, this.ScaledHeight);
  }

  renderBlockStroke(x, y, style) {
    this.ctx.strokeStyle = SnwMazeRenderer.getStyle(style);
    this.ctx.strokeRect(x * this.scale, y * this.scale, this.scale, this.scale);
  }

  /**
   * Get a render style associated with style ID
   * @param {Number} styleId - A style ID
   * @returns {String}
   */
  static getStyle(styleId) {
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
  set Scale(scale) {
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
  get Scale() {
    return this.scale;
  }

  /**
   * Set the width of the canvas
   * @param {Number} width -  The desired widht
   * @constructor
   */
  set Width(width) {
    this.canvas.width = width * this.scale;
    this.ctx.width = width * this.scale;
    this.width = width;
  }

  /**
   * Get the width of the canvas
   * @returns {Number}
   * @constructor
   */
  get Width() {
    return this.width;
  }

  /**
   * Set the height of the canvas
   * @param {Number} height - The desired height
   * @constructor
   */
  set Height(height) {
    this.canvas.height = height * this.scale;
    this.ctx.height = height * this.scale;
    this.height = height;
  }

  /**
   * Get height of the canvas
   * @returns {Number}
   * @constructor
   */
  get Height() {
    return this.height;
  }

  /**
   * Get the width of the canvas with scale
   * @returns {number}
   * @constructor
   */
  get ScaledWidth() {
    return this.width * this.scale;
  }

  /**
   * Get the height of the canvas with scale
   * @returns {number}
   * @constructor
   */
  get ScaledHeight() {
    return this.height * this.scale;
  }
}