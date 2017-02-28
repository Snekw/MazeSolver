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
let mazeNodeIndexChart = [];
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

  //Update the renderer size
  SNW.maze.renderer.setRenderSize(img.width, img.height);
  //Update the render buffer
  let b = SNW.maze.renderer.getRenderBuffer();

  //Make 2d array representing the pixels
  let temp2 = [];
  for (let y = 0; y < img.height; y++) {
    let t = [];
    for (let x = 0; x < img.width; x++) {
      let s = temp[y * img.width + x];
      t.push(s);
      //Update the buffer
      b[y][x] = s;
    }
    temp2.push(t);
  }
  mazeRenderData = temp2;

  let s = mazeRenderData.length;

  while (s--) {
    let s2 = mazeRenderData[s].length;
    mazeNodeIndexChart[s] = [];
    while (s2--) {
      mazeNodeIndexChart[s][s2] = -1;
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
    //Connections down
    for (let y = this.y + 1; y < mazeNodeIndexChart.length; y++) {
      if (mazeRenderData[y][this.x] == 0) {
        break;
      }

      if (mazeNodeIndexChart[y][this.x] != -1) {
        this.connections.down = nodes[mazeNodeIndexChart[y][this.x]];
        break;
      }
    }

    //Connections up
    for (let y = this.y - 1; y > -1; y--) {
      if (mazeRenderData[y][this.x] == 0) {
        break;
      }

      if (mazeNodeIndexChart[y][this.x] != -1) {
        this.connections.up = nodes[mazeNodeIndexChart[y][this.x]];
        break;
      }
    }

    //Connections right
    for (let x = this.x + 1; x < mazeNodeIndexChart[this.y].length; x++) {
      if (mazeRenderData[this.y][x] == 0) {
        break;
      }

      if (mazeNodeIndexChart[this.y][x] != -1) {
        this.connections.right = nodes[mazeNodeIndexChart[this.y][x]];
        break;
      }
    }

    //Connections left
    for (let x = this.x - 1; x > -1; x--) {
      if (mazeRenderData[this.y][x] == 0) {
        break;
      }

      if (mazeNodeIndexChart[this.y][x] != -1) {
        this.connections.left = nodes[mazeNodeIndexChart[this.y][x]];
        break;
      }
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
          mazeNodeIndexChart[y][x] = nodes.length - 1;
        } else if (y == mazeRenderData.length - 1 || x == mazeRenderData[y].length - 1) {
          nodes.push(new MazeNode(x, y, SNW.maze.NodeType.END));
          mazeNodeIndexChart[y][x] = nodes.length - 1;
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
            mazeNodeIndexChart[y][x] = nodes.length - 1;
          } else {
            if (up && !down && !left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
              mazeNodeIndexChart[y][x] = nodes.length - 1;
            } else if (!up && down && !left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
              mazeNodeIndexChart[y][x] = nodes.length - 1;
            } else if (!up && !down && left && !right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
              mazeNodeIndexChart[y][x] = nodes.length - 1;
            } else if (!up && !down && !left && right) {
              nodes.push(new MazeNode(x, y, SNW.maze.NodeType.NORMAL));
              mazeNodeIndexChart[y][x] = nodes.length - 1;
            }
          }
        }
      }
    }
  }
}

/**
 * Found path class
 */
class FoundPath {
  constructor(path, visited) {
    this.path = path || [];
    this.visited = visited || [];
  }
}

/**
 * Call the selected path finding method and render results
 */
function solve() {
  let methodEl = document.getElementById('method');
  let method = methodEl[methodEl.selectedIndex].value;
  let n = [];
  for (let i = 0; i < nodes.length; i++) {
    n.push(nodes[i]);
  }
  let pathRet = SNW.maze.pathFinding[method].solve(n);

  let path = pathRet.path;
  let visited = pathRet.visited;

  //Update the render buffer with the path
  let b = SNW.maze.renderer.getRenderBuffer();
  for (let i = 0; i < visited.length; i++) {
    b[visited[i].y][visited[i].x] = 6;
  }
  for (let i = 0; i < path.length; i++) {
    b[path[i].y][path[i].x] = 5;
  }
  SNW.maze.renderer.render();
}

/**
 * Image selection form the selection box
 */
function selectImage() {
  let imgSel = document.getElementById('imgSel');
  let img = imgSel[imgSel.selectedIndex].label;
  _loadImg('mazes/maze-' + img + '.png');
}

/**
 * Image selection from local computer
 * @param ele - The selection box
 */
function selectImageFromFile(ele) {
  console.log(ele);
  let file = ele.files[0];

  let reader = new FileReader();
  reader.onload = function (file) {
    console.log(file);
    _loadImg(file.target.result);
  };
  reader.readAsDataURL(file);
}

/**
 * Load image to browser and reload the maze
 * @param img - The image
 * @private
 */
function _loadImg(img) {
  let temp = new Image();
  temp.onload = function () {
    document.getElementById('img').src = img;
    doMaze();
  };
  temp.src = img;
}

/**
 * Do all of the file reading to create the nodes
 * and render the maze
 */
function doMaze() {
  let genTime = document.getElementById('genTime');
  genTime.innerHTML = '';

  let genStartTime = performance.now();
  nodes = [];
  mazeRenderData = [];

  //Create and draw the maze
  initMaze();

  //Create the nodes
  createNodes();

  let timeTaken = new Date();
  let t = performance.now() - genStartTime;
  timeTaken.setTime(t);

  //The render buffer
  let b = SNW.maze.renderer.getRenderBuffer();

  //Draw the nodes and find the connections
  for (let i = 0; i < nodes.length; i++) {
    b[nodes[i].y][nodes[i].x] = nodes[i].type;
    nodes[i].findConnections();
  }

  //Render
  SNW.maze.renderer.render();

  genTime.innerHTML = timeTaken.getMinutes() + 'm' + timeTaken.getSeconds() + 's' + timeTaken.getMilliseconds() + ' Raw: ' + t.toString();
}

/**
 * Remove the solved data from maze
 * -- Reloads the maze
 */
function mazeClear() {
  doMaze();
}

doMaze();