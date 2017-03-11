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
window.SNW = window.SNW || {};

SNW.maze = SNW.maze || {};

SNW.maze.renderer = {
  setRenderScale: _setScale,
  setRenderSize: _setSize,
  setRenderCanvasById: _setCanvasById,
  getRenderBuffer: _getRenderBuffer,
  setRenderBuffer: _setRenderBuffer,
  renderBlock: _renderBlock,
  renderPath: _renderPath,
  renderNodes: _renderNodes,
  clearCanvas: _clearCanvas
};


let rScale = 20;
let rWidth = 1;
let rHeight = 1;
let rCanvas = {};
let rCtx = {};

let rBuffer = [[0, 1, 1, -1], [0, 2, 2, 0]];

/**
 * Render a path
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @param {Number} ex - End X coordinate
 * @param {Number} ey - End Y coodinate
 * @param {Number} style - The render style
 * @param {String} canvas - The canvas to render to
 * @private
 */
function _renderPath(x, y, ex, ey, style, canvas) {
  let ax = x;
  let aax = ex;
  let ay = y;
  let aay = ey;
  //Flip the x an ex so that we can fill left to right
  if (ex < x) {
    ax = ex;
    aax = x;
  }
  //Flip the y an ey so that we can fill left to right
  if (ey < y) {
    ay = ey;
    aay = y;
  }
  let dx = aax - ax;
  let dy = aay - ay;
  rCtx[canvas].fillStyle = _getStyle(style);
  //Need to add 1 to the delta
  dx++;
  dy++;
  rCtx[canvas].fillRect(ax * rScale, ay * rScale, dx * rScale, dy * rScale);
}

/**
 * Render single maze block
 * @param x
 * @param y
 * @param style
 * @param {String} canvas - The canvas to render to
 * @private
 */
function _renderBlock(x, y, style, canvas) {
  rCtx[canvas].fillStyle = _getStyle(style);
  rCtx[canvas].fillRect(x * rScale, y * rScale, rScale, rScale);
}

/**
 * Get the render style
 * @param style
 * @returns {String}
 * @private
 */
function _getStyle(style) {
  switch (style) {
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
 * Set the render scale
 * @param {number} scale
 */
function _setScale(scale) {
  if (scale >= 1) {
    rScale = scale;
  } else {
    rScale = 1;
  }
  //Update the info so it will be updated on next render
  _setCanvasInfo();
}

/**
 * Set the renderer base size
 * Will be multiplied by render scale
 * @param {number} width
 * @param {number} height
 */
function _setSize(width, height) {
  if (width > 1) {
    rWidth = width;
  } else {
    rWidth = 1;
  }

  if (height > 1) {
    rHeight = height;
  } else {
    rHeight = 1;
  }

  let temp = [];

  for (let i = 0; i < rHeight; i++) {
    let t2 = [];
    for (let d = 0; d < rWidth; d++) {
      t2.push(-1);
    }
    temp.push(t2);
  }

  _setRenderBuffer(temp);

  //Update the info so it will be updated on next render
  _setCanvasInfo();
}

/**
 * Set the new size for the canvas and re-render
 * @private
 */
function _setCanvasInfo() {
  for (let canvas in rCanvas) {
    if (!rCanvas.hasOwnProperty(canvas)) {
      break;
    }
    if (rCanvas[canvas] == null || rCanvas[canvas].tagName != 'CANVAS') {
      throw 'SnwRendered: BAD CANVAS!';
    }

    rCanvas[canvas].width = rWidth * rScale;
    rCanvas[canvas].height = rHeight * rScale;
    rCtx[canvas].width = rCanvas[canvas].width;
    rCtx[canvas].height = rCanvas[canvas].height;
  }
}

/**
 * Set the
 * @param canvasArr
 */
function _setCanvasById(...canvasArr) {
  for (let i = 0; i < canvasArr.length; i++) {
    rCanvas[canvasArr[i]] = document.getElementById(canvasArr[i]);
    if (rCanvas[canvasArr[i]] == null) {
      console.error('SNW-Maze-Renderer: Failed to set canvas. Bad id.');
    }
    rCtx[canvasArr[i]] = rCanvas[canvasArr[i]].getContext('2d');
  }
  _setCanvasInfo();
}

/**
 * Get the currently used render buffer
 * @returns {[*,*]}
 */
function _getRenderBuffer() {
  return rBuffer;
}

/**
 * Set the currently used buffer
 * @param {[*,*]} newBuffer
 */
function _setRenderBuffer(newBuffer) {
  if (newBuffer.length == rHeight && newBuffer[0].length == rWidth) {
    rBuffer = newBuffer;
  }
}

let rNi = false;
/**
 * Render nods from array
 * @param {Array} nodes - Node array
 * @param {String} canvas - The canvas to render to
 * @private
 */
function _renderNodes(nodes, canvas) {
  // rNi shows whether we have rendered the node this pass or not
  // Changes every render call
  rNi = !rNi;
  let rStartTime = performance.now();
  for (let i = 0; i < nodes.length; i++) {
    for (let key in nodes[i].connections) {
      if (nodes[i].connections.hasOwnProperty(key)) {
        if (nodes[i].connections[key] != null)
          if (!nodes[i].connections[key].rendered != rNi) {
            _renderPath(nodes[i].x, nodes[i].y, nodes[i].connections[key].x, nodes[i].connections[key].y, 1, canvas);
          }
      }
    }
    nodes[i].rendered = rNi;
  }
  console.info('Node render time: ' + (performance.now() - rStartTime).toString());
}

/**
 * Clear a canvas
 * @param {String} canvas - The canvas to clear
 * @private
 */
function _clearCanvas(canvas) {
  if (rCtx[canvas]) {
    rCtx[canvas].clearRect(0, 0, rWidth * rScale, rHeight * rScale);
  }
}