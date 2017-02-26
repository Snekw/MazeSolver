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

var file = null;

var maze = {};
var mazeNodes = [];
var actualNodes = [];

function loadFile() {
  var img = document.getElementById('img');
  // Create an empty canvas element
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  // Copy the image contents to the canvas
  var ctx = canvas.getContext("2d");
  ctx.width = img.width;
  ctx.height = img.height;
  ctx.drawImage(img, 0, 0);
  var imgData = ctx.getImageData(0, 0, img.width, img.height);

  var temp = [];
  for (var i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i] == 255) {
      temp.push(1);
    } else {
      temp.push(0);
    }
  }
  var temp2 = [];
  for (var x = 0; x < img.width; x++) {
    var t = [];
    for (var y = 0; y < img.height; y++) {
      t.push(temp[x * img.width + y]);
    }
    temp2.push(t);
  }
  imgData = null;
  ctx = null;
  temp = null;
  maze.data = temp2;
  maze.width = img.width;
  maze.height = img.height;
}

function drawMaze() {
  var mazeCanvas = document.getElementById('maze');
  var scale = parseInt(document.getElementById('scale').value);
  var mazeContext = mazeCanvas.getContext('2d');
  mazeContext.width = maze.width * scale;
  mazeContext.height = maze.height * scale;
  mazeCanvas.width = mazeContext.width;
  mazeCanvas.height = mazeContext.height;
  for (var y = 0; y < maze.height; y++) {
    for (var x = 0; x < maze.width; x++) {

      switch (maze.data[y][x]) {
        case 0:
          mazeContext.fillStyle = "#000000";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
        case 1:
          mazeContext.fillStyle = "#FFFFFF";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
        case 2:
          mazeContext.fillStyle = "#00FFFF";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
        case 3:
          mazeContext.fillStyle = "#0000FF";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
        case 4:
          mazeContext.fillStyle = "#FF0000";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
        case 5:
          mazeContext.fillStyle = "#FFFF00";
          mazeContext.fillRect(x * scale, y * scale, scale, scale);
          break;
      }
    }
  }
}

//Draw the set nodes with delay
function drawNode(x, y, d) {
  setTimeout(function () {
    maze.data[y][x] = d;

    drawMaze();
  }, 100 + (y * maze.height + x) * (500 / maze.width));
}

function getConnectionDir(x1, x2) {
  if (x1.x > x2.x) {
    return 'l';
  } else if (x2.x > x1.x) {
    return 'r';
  } else if (x1.y > x2.y) {
    return 'u';
  } else if (x2.y > x1.y) {
    return 'd';
  }
}

function findNodes() {
  for (var y = 0; y < maze.height; y++) {
    var temp = [];
    for (var x = 0; x < maze.width; x++) {
      if (maze.data[y][x] === 1) {
        var connections = [];
        var isStart = false;
        var isEnd = false;
        //Start node
        if (y == 0 || x == 0) {
          if (maze.data[y + 1][x] == 1) {
            connections.push({x: x, y: y + 1});
            isStart = true;
            isEnd = false;
          }
          else if (maze.data[y][x + 1] == 1) {
            connections.push({x: x + 1, y: y});
            isStart = true;
            isEnd = false;
          } else {
            console.log('BAD MAZE!');
          }
        }
        //End node
        else if (y == maze.height - 1 || x == maze.width - 1) {
          if (maze.data[y - 1][x] == 1) {
            connections.push({x: x, y: y - 1});
            isStart = false;
            isEnd = true;
          }
          else if (maze.data[y][x - 1] == 1) {
            connections.push({x: x - 1, y: y});
            isStart = false;
            isEnd = true;
          }
        }
        //Not start or end node
        else {
          if (maze.data[y - 1][x] == 1) {
            connections.push({x: x, y: y - 1});
          }
          if (maze.data[y + 1][x] == 1) {
            connections.push({x: x, y: y + 1});
          }
          if (maze.data[y][x + 1] == 1) {
            connections.push({x: 1 + x, y: y});
          }
          if (maze.data[y][x - 1] == 1) {
            connections.push({x: x - 1, y: y});
          }
        }
        temp.push({
          isStart: isStart,
          isEnd: isEnd,
          x: x,
          y: y,
          connections: connections
        });
        drawNode(x, y, 2);
      }
    }
    mazeNodes.push(temp);
  }


  //Filter out nodes that aren't needed
  actualNodes = [];

  for (var y = 0; y < maze.height; y++) {
    var temp = [];
    for (var x = 0; x < mazeNodes[y].length; x++) {
      if (!mazeNodes[y][x].isStart && !mazeNodes[y][x].isEnd) {
        var lastWasUpOrDown = false;
        var lastWasLeftOrRight = false;
        for (var d = 0; d < mazeNodes[y][x].connections.length; d++) {
          if (mazeNodes[y][x].connections[d].x > mazeNodes[y][x].x || mazeNodes[y][x].connections[d].x < mazeNodes[y][x].x) {
            lastWasLeftOrRight = true;
          } else if (mazeNodes[y][x].connections[d].y > mazeNodes[y][x].y || mazeNodes[y][x].connections[d].y < mazeNodes[y][x].y) {
            lastWasUpOrDown = true;
          }
          if (mazeNodes[y][x].connections.length == 1) {
            temp.push(mazeNodes[y][x]);
            break;
          }
          if (lastWasUpOrDown && lastWasLeftOrRight) {
            temp.push(mazeNodes[y][x]);
            break;
          }
        }
      } else {
        temp.push(mazeNodes[y][x]);
      }
    }
    actualNodes.push(temp);
  }

  //Relink the nodes
  for (var y = 0; y < maze.height; y++) {
    for (var x = 0; x < actualNodes[y].length; x++) {
      for (var z = 0; z < actualNodes[y][x].connections.length; z++) {
        switch (getConnectionDir(actualNodes[y][x], actualNodes[y][x].connections[z])) {
          case 'r':
            actualNodes[y][x].connections[z] = actualNodes[y][x + 1];
            break;
          case 'l':
            actualNodes[y][x].connections[z] = actualNodes[y][x - 1];
            break;
          case 'd':
            actualNodes[y][x].connections[z] = actualNodes[y + 1][x];
            break;
          case 'u':
            actualNodes[y][x].connections[z] = actualNodes[y - 1][x];
            break;
        }
      }
    }
  }

  //Draw the actual nodes
  for (var y = 0; y < actualNodes.length; y++) {
    for (var x = 0; x < actualNodes[y].length; x++) {
      drawNode(actualNodes[y][x].x, actualNodes[y][x].y, 3);
    }
  }

  var temp = [];
  //Re-order the actual nodes array
  for (var y = 0; y < actualNodes.length; y++) {
    for (var x = 0; x < actualNodes[y].length; x++) {
      temp.push(actualNodes[y][x]);
    }
  }

  //change connections to indexes
  for (var i = 0; i < temp.length; i++) {
    for (var d = 0; d < temp[i].connections.length; d++) {
      for (var x = 0; x < temp.length; x++) {
        if (temp[i].connections[d].x == temp[x].x && temp[i].connections[d].y == temp[x].y) {
          temp[i].connections[d] = x;
        }
      }
    }
  }
  actualNodes = temp;
  console.log(actualNodes);
}

function drawFoundPath(path) {
  for (var i = 0; i < path.length; i++) {
    drawNode(path[i].x, path[i].y, 4);
  }
}

/*****************************************************/
/* PATH FINDING */

function flood() {
  var path = [];
  var n = actualNodes;

  //Find start node
  var startNode = null;
  for (var i = 0; i < n.length; i++) {
    if (n[i].isStart) {
      startNode = n[i];
    }
  }

  // flood_checkNext(0, n);
  //Draw the path
  drawFoundPath(path);
}

function flood_checkNext(index, n) {
  drawNode(n[index].x, n[index].y, 5);
  for (var i = 0; i < n[index].connections.length; i++) {
    for (var d = 0; d < n.length; d++) {
      if (n[d].x == n[index].connections[i].x && n[d].y == n[index].connections[i].y) {
        if (n[d].visited) {
          break;
        }
        n[d].visited = true;
        flood_checkNext(d, n);
        break;
      }
    }
  }
}


/*****************************************************/

function maze_solve() {
  loadFile();

  drawMaze();

  findNodes();

  setTimeout(function () {
    flood()
  }, 1000);
}

maze_solve();