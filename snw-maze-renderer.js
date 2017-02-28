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
  render: _render,
  setRenderScale: _setScale,
  setRenderSize: _setSize,
  setRenderCanvasById: _setCanvasById,
  getRenderBuffer: _getRenderBuffer,
  setRenderBuffer: _setRenderBuffer,
  renderBlock: _renderBlock
};


let rScale = 20;
let rWidth = 1;
let rHeight = 1;
let rCanvas = null;

let rBuffer = [[0, 1, 1, -1], [0, 2, 2, 0]];

/**
 * The rendering process
 */
function _render() {
  if (rCanvas == null || rCanvas.tagName != 'CANVAS') {
    console.error('Snw-Maze-Renderer: Bad canvas!');
    return;
  }

  let ctx = rCanvas.getContext('2d');
  ctx.width = rCanvas.width;
  ctx.height = rCanvas.height;

  for (let y = 0; y < rHeight; y++) {
    for (let x = 0; x < rWidth; x++) {
      _renderBlock(x,y,rBuffer[y][x]);
    }
  }
}

/**
 * Render single maze block
 * @param x
 * @param y
 * @param style
 * @private
 */
function _renderBlock(x, y, style) {
  let ctx = rCanvas.getContext('2d');
  ctx.width = rCanvas.width;
  ctx.height = rCanvas.height;
  switch (style) {
    case 0:
      ctx.fillStyle = '#000000';
      break;
    case 1:
      ctx.fillStyle = '#8ba2ff';
      break;
    case 2:
      ctx.fillStyle = '#0000ff';
      break;
    case 3:
      ctx.fillStyle = '#00ffff';
      break;
    case 4:
      ctx.fillStyle = '#ff0000';
      break;
    case 5:
      ctx.fillStyle = '#ffeb00';
      break;
    case 6:
      ctx.fillStyle = '#00ff8b';
      break;
    default:
      ctx.fillStyle = '#ff00ff';
  }
  ctx.fillRect(x * rScale, y * rScale, rScale, rScale);
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
  if (rCanvas == null || rCanvas.tagName != 'CANVAS') {
    return;
  }

  rCanvas.width = rWidth * rScale;
  rCanvas.height = rHeight * rScale;
  _render();
}

/**
 * Set the
 * @param canvasId
 */
function _setCanvasById(canvasId) {
  rCanvas = document.getElementById(canvasId);
  if (rCanvas == null) {
    console.error('SNW-Maze-Renderer: Failed to set canvas. Bad id.');
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