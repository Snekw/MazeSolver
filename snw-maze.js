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


SNW.maze.renderer.setRenderCanvasById('snw-maze-canvas');
SNW.maze.renderer.setRenderSize(10, 10);
SNW.maze.renderer.setRenderScale(20);

SNW.maze.renderer.render();

//Fields
let mazeRenderData = [];
let nodes = [];

/**
 * Load the img data to smaller array and draw the maze
 */
function initMaze() {
  let img = document.getElementById('img');

  //Create temporary canvas that we use to extract image data
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  let tCtx = tempCanvas.getContext('2d');
  tCtx.width = tempCanvas.width;
  tCtx.height = tempCanvas.height;
  tCtx.drawImage(img, 0, 0);
  let imgData = tCtx.getImageData(0, 0, img.width, img.height);

  let temp = [];
  //White = 1 = pathway
  //Black = 0 = wall
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i] == 255) {
      temp.push(1);
    } else {
      temp.push(0);
    }
  }

  //Make 2d array representing the pixels
  let temp2 = [];
  for (let y = 0; y < img.height; y++) {
    let t = [];
    for (let x = 0; x < img.width; x++) {
      t.push(temp[y * img.width + x]);
    }
    temp2.push(t);
  }
  mazeRenderData = temp2;

  //Update the renderer size
  SNW.maze.renderer.setRenderSize(img.width, img.height);
  //Update the render buffer
  let b = SNW.maze.renderer.getRenderBuffer();

  //Copy maze data to render buffer
  for (let y = 0; y < mazeRenderData.length; y++) {
    for (let x = 0; x < mazeRenderData[y].length; x++) {
      b[y][x] = mazeRenderData[y][x];
    }
  }

  SNW.maze.renderer.setRenderBuffer(b);
}

SNW.maze.NodeType = {
  NORMAL: 2,
  START: 3,
  END: 4,
  PATH: 5
};

/**
 * Maze Node class
 */
class MazeNode {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || SNW.maze.NodeType.NORMAL;
    this.connections = {
      left: null,
      right: null,
      up: null,
      down: null
    };
  }

  /**
   * Find the connections this node has
   */
  findConnections() {

    let shouldBreak = false;
    //Connections down
    for (let y = this.y + 1; y < mazeRenderData.length; y++) {
      if (shouldBreak)
        break;

      for (let i = 0; i < nodes.length; i++) {
        if (mazeRenderData[y][this.x] == 0) {
          shouldBreak = true;
          break;
        }
        if (nodes[i].x == this.x && nodes[i].y == y) {
          this.connections.down = _findNode(this.x, y);
          shouldBreak = true;
          break;
        }
      }
    }

    shouldBreak = false;
    //Connections up
    for (let y = this.y - 1; y > -1; y--) {
      if (shouldBreak)
        break;

      for (let i = 0; i < nodes.length; i++) {
        if (mazeRenderData[y][this.x] == 0) {
          shouldBreak = true;
          break;
        }
        if (nodes[i].x == this.x && nodes[i].y == y) {
          this.connections.up = _findNode(this.x, y);
          shouldBreak = true;
          break;
        }
      }
    }

    shouldBreak = false;
    //Connections right
    for (let x = this.x + 1; x < mazeRenderData[0].length; x++) {
      if (shouldBreak)
        break;

      for (let i = 0; i < nodes.length; i++) {
        if (mazeRenderData[this.y][x] == 0) {
          shouldBreak = true;
          break;
        }
        if (nodes[i].x == x && nodes[i].y == this.y) {
          this.connections.right = _findNode(x, this.y);
          shouldBreak = true;
          break;
        }
      }
    }

    shouldBreak = false;
    //Connections left
    for (let x = this.x - 1; x > -1; x--) {
      if (shouldBreak)
        break;

      for (let i = 0; i < nodes.length; i++) {
        if (mazeRenderData[this.y][x] == 0) {
          shouldBreak = true;
          break;
        }
        if (nodes[i].x == x && nodes[i].y == this.y) {
          this.connections.left = _findNode(x, this.y);
          shouldBreak = true;
          break;
        }
      }
    }
  }
}

/**
 * Find a node at x,y position
 * @param {number} ix
 * @param {number} iy
 * @returns {MazeNode}
 * @private
 */
function _findNode(ix, iy) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].x == ix && nodes[i].y == iy) {
      return nodes[i];
    }
  }
}

/**
 * Create the nodes
 */
function createNodes() {
  for (let y = 0; y < mazeRenderData.length; y++) {
    for (let x = 0; x < mazeRenderData[y].length; x++) {
      if (mazeRenderData[y][x] == 1) {
        if (y == 0 || x == 0) {
          nodes.push(new MazeNode(x, y, SNW.maze.NodeType.START));
        } else if (y == mazeRenderData.length - 1 || x == mazeRenderData[y].length - 1) {
          nodes.push(new MazeNode(x, y, SNW.maze.NodeType.END));
        } else {
          let left = false;
          let right = false;
          let up = false;
          let down = false;
          if (mazeRenderData[y - 1][x] == 1) {
            up = true;
          }
          if (mazeRenderData[y + 1][x] == 1) {
            down = true;
          }
          if (mazeRenderData[y][x - 1] == 1) {
            left = true;
          }
          if (mazeRenderData[y][x + 1] == 1) {
            right = true;
          }

          if ((left || right) && (up || down)) {
            nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
          } else {
            if (up && !down && !left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
            } else if (!up && down && !left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
            } else if (!up && !down && left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
            } else if (!up && !down && !left && right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
            }
          }
        }
      }
    }
  }
}

function solve() {
  let methodEl = document.getElementById('method');
  let method = methodEl[methodEl.selectedIndex].value;
  let n = [];
  for (let i = 0; i < nodes.length; i++) {
    n.push(nodes[i]);
  }
  let path = SNW.maze.pathFinding[method].solve(n);
}

//Create and draw the maze
initMaze();

//Create the nodes
createNodes();

//The render buffer
let b = SNW.maze.renderer.getRenderBuffer();

//Draw the nodes and find the connections
for (let i = 0; i < nodes.length; i++) {
  b[nodes[i].y][nodes[i].x] = nodes[i].type;
  nodes[i].findConnections();
}

//Render
SNW.maze.renderer.render();
