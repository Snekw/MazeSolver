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
class SnwMazeEditor {
  constructor() {
    this.canvas = new SnwMazeRenderer('snwMazeCursorCanvas', 10, 10, 10);
    this.canvas.canvas.addEventListener('mousemove', updateCursor);
    this.canvas.canvas.addEventListener('mouseleave', deleteCursor);
    this.canvas.canvas.addEventListener('mousedown', mazeEditorClick);
    this.canvas.canvas.addEventListener('contextmenu', mazeContextMenu);
  }

  updateCanvasInfo(width, height, scale) {
    this.canvas.Scale = scale;
    this.canvas.Width = width;
    this.canvas.Height = height;
  }

  renderCursor(x, y) {
    this.canvas.clear();
    this.canvas.renderBlockStroke(x, y, 4);
  }

  deleteCursor() {
    this.canvas.clear();
  }

  static GetMousePosInside(e) {
    let m = getMouseRelativePosition(e);
    m.x = Math.trunc(m.x / mazeEditor.canvas.Scale);
    m.y = Math.trunc(m.y / mazeEditor.canvas.Scale);
    return m;
  }
}

function updateCursor(e) {
  let m = SnwMazeEditor.GetMousePosInside(e);
  mazeEditor.renderCursor(m.x, m.y);
}

function deleteCursor() {
  mazeEditor.deleteCursor();
}

function mazeEditorClick(e) {
  let m = SnwMazeEditor.GetMousePosInside(e);
  switch (e.which) {
    case 1:
      mazeRenderData[m.y][m.x] = 1;
      break;
    case 3:
      mazeRenderData[m.y][m.x] = 0;
  }
  nodes = [];
  updateMazeNodeIndexChart();
  //Create the nodes
  createNodes();

  //Find the connections
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].findConnections();
  }
  mainCanvas.renderNodes(nodes);
  animCanvas.clear();
}

function getMouseRelativePosition(e) {
  return {
    x: e.clientX - e.currentTarget.getBoundingClientRect().left,
    y: e.clientY - e.currentTarget.getBoundingClientRect().top
  }
}

function mazeContextMenu(e) {
  e.preventDefault();
  return false;
}