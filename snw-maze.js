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


SNW.maze.renderer.setRenderCanvasById('snwMazeMainCanvas', 'snwMazeAnimCanvas');
SNW.maze.renderer.setRenderSize(10, 10);
SNW.maze.renderer.setRenderScale(20);

SNW.maze.renderer.render();

//Fields
let mazeRenderData = [];
let mazeNodeIndexChart = [];
let nodes = [];

//Animation
let mazeAnimator = null;
let stopAnimProgress = false;
let recordAnim = true;
let animPathFind = true;
let animFoundPath = true;

/**
 * Load the img data to smaller array and draw the maze
 */
function initMaze() {
  mazeAnimator = null;
  document.getElementById('playAnim').disabled = true;
  document.getElementById('stopAnim').disabled = true;
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

  mazeNodeIndexChart = [];
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
    this.rendered = false;
  }

  /**
   * Find the connections this node has
   */
  findConnections() {
    //Connections down
    if (this.connections.down == null) {
      let dy = 0;
      for (let y = this.y - 1; y > -1; y--) {
        dy++;
        if (mazeRenderData[y][this.x] == 0) {
          break;
        }

        if (mazeNodeIndexChart[y][this.x] != -1) {
          this.connections.down = nodes[mazeNodeIndexChart[y][this.x]];
          this.connections.down.distance = this.connections.down.distance || {};
          this.connections.down.distance.down = dy;
          nodes[mazeNodeIndexChart[y][this.x]].connections.up = this;
          nodes[mazeNodeIndexChart[y][this.x]].connections.up.distance = nodes[mazeNodeIndexChart[y][this.x]].connections.up.distance || {};
          nodes[mazeNodeIndexChart[y][this.x]].connections.up.distance.up = dy;
          break;
        }
      }
    }

    //Connections up
    if (this.connections.up == null) {
      let dy = 0;
      for (let y = this.y + 1; y < mazeNodeIndexChart.length; y++) {
        dy++;
        if (mazeRenderData[y][this.x] == 0) {
          break;
        }

        if (mazeNodeIndexChart[y][this.x] != -1) {
          this.connections.up = nodes[mazeNodeIndexChart[y][this.x]];
          this.connections.up.distance = this.connections.up.distance || {};
          this.connections.up.distance.up = dy;
          nodes[mazeNodeIndexChart[y][this.x]].connections.down = this;
          nodes[mazeNodeIndexChart[y][this.x]].connections.down.distance = nodes[mazeNodeIndexChart[y][this.x]].connections.down.distance || {};
          nodes[mazeNodeIndexChart[y][this.x]].connections.down.distance.down = dy;
          break;
        }
      }
    }

    //Connections right
    if (this.connections.right == null) {
      let dx = 0;
      for (let x = this.x - 1; x > -1; x--) {
        dx++;
        if (mazeRenderData[this.y][x] == 0) {
          break;
        }

        if (mazeNodeIndexChart[this.y][x] != -1) {
          this.connections.right = nodes[mazeNodeIndexChart[this.y][x]];
          this.connections.right.distance = this.connections.right.distance || {};
          this.connections.right.distance.right = dx;
          nodes[mazeNodeIndexChart[this.y][x]].connections.left = this;
          nodes[mazeNodeIndexChart[this.y][x]].connections.left.distance = nodes[mazeNodeIndexChart[this.y][x]].connections.left.distance || {};
          nodes[mazeNodeIndexChart[this.y][x]].connections.left.distance.left = dx;
          break;
        }
      }
    }

    //Connections left
    if (this.connections.left == null) {
      let dx = 0;
      for (let x = this.x + 1; x < mazeNodeIndexChart[this.y].length; x++) {
        dx++;
        if (mazeRenderData[this.y][x] == 0) {
          break;
        }

        if (mazeNodeIndexChart[this.y][x] != -1) {
          this.connections.left = nodes[mazeNodeIndexChart[this.y][x]];
          this.connections.left.distance = this.connections.left.distance || {};
          this.connections.left.distance.left = dx;
          nodes[mazeNodeIndexChart[this.y][x]].connections.right = this;
          nodes[mazeNodeIndexChart[this.y][x]].connections.right.distance = nodes[mazeNodeIndexChart[this.y][x]].connections.right.distance || {};
          nodes[mazeNodeIndexChart[this.y][x]].connections.right.distance.right = dx;
          break;
        }
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
          nodes[nodes.length - 1].distance = {
            left: 0,
            right: 0,
            up: 0,
            down: 0
          };
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
  /**
   * Initialize
   * @param path - Path nodes array
   * @param visited - Visited nodes array
   * @param animator - The animator from the path finding method
   */
  constructor(path, visited, animator) {
    this.path = path || [];
    this.visited = visited || [];
    this.animator = animator || [];
  }
}

let startTime = 0;
/**
 * Call the selected path finding method and render results
 */
function solve() {
  document.getElementById('playAnim').disabled = true;
  document.getElementById('stopAnim').disabled = true;
  recordAnim = document.getElementById('recordAnimation').checked;
  animPathFind = document.getElementById('animPathFind').checked;
  animFoundPath = document.getElementById('animFoundPath').checked;

  let methodEl = document.getElementById('method');
  let method = methodEl[methodEl.selectedIndex].value;
  let n = [];
  let startI = -1;
  let endI = -1;
  for (let i = 0; i < nodes.length; i++) {
    n.push(nodes[i]);
    if (nodes[i].type == SNW.maze.NodeType.START) {
      startI = i;
    } else if (nodes[i].type == SNW.maze.NodeType.END) {
      endI = i;
    }
  }
  startTime = performance.now();

  SNW.maze.pathFinding[method].RealTimeAnimation = document.getElementById('rtAnim').checked;
  SNW.maze.pathFinding[method].solve(n, startI, endI, renderSolved);
}

/**
 * Render the solved maze
 * @param {FoundPath} pathRet - The returned FoundPath object
 */
function renderSolved(pathRet) {
  let endTime = performance.now();

  let renderStart = performance.now();
  let path = pathRet.path;
  let visited = pathRet.visited;

  mazeAnimator = pathRet.animator;

  document.getElementById('playAnim').disabled = mazeAnimator.isRTAnim;

  //Render the visited paths and found path
  for (let i = 0; i < visited.length; i++) {
    SNW.maze.renderer.renderPath(visited[i].x, visited[i].y, visited[i].connNode.x, visited[i].connNode.y, 6, 'snwMazeAnimCanvas');
  }
  for (let i = 0; i < path.length; i++) {
    SNW.maze.renderer.renderPath(path[i].x, path[i].y, path[i].connNode.x, path[i].connNode.y, 5, 'snwMazeAnimCanvas');
  }

  let rt = performance.now() - renderStart;
  console.info('Visited + found path render time: ' + rt.toString());

  let t = endTime - startTime;
  let timeTaken = new Date();
  timeTaken.setTime(t);
  document.getElementById('pathTime').innerHTML = timeTaken.getMinutes() + 'm' + timeTaken.getSeconds() + 's' + timeTaken.getMilliseconds() + ' Raw: ' + t.toString();

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

  recordAnim = document.getElementById('recordAnimation').checked;
  animPathFind = document.getElementById('animPathFind').checked;
  animFoundPath = document.getElementById('animFoundPath').checked;

  let genStartTime = performance.now();
  nodes = [];
  mazeRenderData = [];

  //Create and draw the maze
  initMaze();

  //Create the nodes
  createNodes();

  //Draw the nodes and find the connections
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].findConnections();
  }

  //Render
  SNW.maze.renderer.renderNodes(nodes, 'snwMazeMainCanvas');

  let timeTaken = new Date();
  let t = performance.now() - genStartTime;
  timeTaken.setTime(t);

  genTime.innerHTML = timeTaken.getMinutes() + 'm' + timeTaken.getSeconds() + 's' + timeTaken.getMilliseconds() + ' Raw: ' + t.toString();
}

/**
 * Remove the solved data from maze
 * -- Reloads the maze
 */
function mazeClear() {
  // doMaze();
  SNW.maze.renderer.clearCanvas('snwMazeAnimCanvas');
}

/**
 * Set the rendering scale
 * @param scale - Scale
 */
function setScale(scale) {
  SNW.maze.renderer.setRenderScale(scale);
  SNW.maze.renderer.renderNodes(nodes, 'snwMazeMainCanvas');
}

/**
 * Play the current animation
 */
function startAnim() {
  if (mazeAnimator == null)
    return;

  document.getElementById('stopAnim').disabled = false;
  let animSpeed = document.getElementById('animSpeed').value;
  mazeClear();
  mazeAnimator.AnimationSpeed = animSpeed;
  let tempBuffer = [];
  for(let i = 0; i < mazeAnimator.animBuffer.length; i++){
    tempBuffer[i] = mazeAnimator.animBuffer[i];
  }
  mazeAnimator.play().then(()=>{
    mazeAnimator.animBuffer = tempBuffer;
    document.getElementById('stopAnim').disabled = true;
  });
}

/**
 * Stop the currently playing animation
 */
function stopAnim() {
  if (mazeAnimator == null)
    return;

  mazeAnimator.stopAnimation();
  stopAnimProgress = true;
  document.getElementById('stopAnim').disabled = true;
}

/**
 * Update the method checkbox with available path finding methods
 * @private
 */
function _updateAvailableMethods() {
  let methodBox = document.getElementById('method');
  for (let key in SNW.maze.pathFinding) {
    if (SNW.maze.pathFinding.hasOwnProperty(key)) {
      let n = document.createElement('option');
      n.innerHTML = SNW.maze.pathFinding[key].name;
      n.value = key;
      methodBox.appendChild(n);
    }
  }
}

/**
 * Toggle the visibility of the reference image
 */
function toggleShowImage() {
  let img = document.getElementById('img');
  let imgSep = document.getElementById('imgSep');
  if (img.className == 'hide') {
    imgSep.className = 'show';
    img.className = 'show';
  } else {
    imgSep.className = 'hide';
    img.className = 'hide';
  }
}

/**
 * Set the animation speed
 * @param {Number} speed - The animation speed
 */
function setAnimationSpeed(speed) {
  if (isNaN(speed)) {
    try {
      speed = parseInt(speed);
    } catch (e) {
      console.log(e);
      return;
    }
  }
  for (let key in SNW.maze.pathFinding) {
    if (SNW.maze.pathFinding.hasOwnProperty(key)) {
      SNW.maze.pathFinding[key].setAnimSpeed(speed);
    }
  }
  if (mazeAnimator != null) {
    mazeAnimator.AnimationSpeed = speed;
  }
}

/**
 * Update the animation controls
 */
function updateAnimCheckBoxes() {
  let tggl = !document.getElementById('recordAnimation').checked;
  document.getElementById('rtAnim').disabled = tggl;
  document.getElementById('animPathFind').disabled = tggl;
  document.getElementById('animFoundPath').disabled = tggl;
  document.getElementById('animSpeed').disabled = tggl;
}

_updateAvailableMethods();
doMaze();