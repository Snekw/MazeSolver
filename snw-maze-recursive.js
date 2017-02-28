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
SNW.maze.pathFinding = SNW.maze.pathFinding || {};

SNW.maze.pathFinding.recursive = {
  name: 'Recursive',
  solve: recursiveSolve
};

/**
 * The entry point
 * @param {MazeNode[]} solveNodes -- The nodes we need to solve
 * @returns {FoundPath} -- The found path and visited nodes
 * @param anim - Whether animation is recorded or not
 */
function recursiveSolve(solveNodes, anim) {
  let start = -1;
  let end = -1;
  let floodAnimBuff = [];
  endFound = false;
  for (let i = 0; i < solveNodes.length; i++) {
    solveNodes[i].visited = false;
    solveNodes[i].pathToNode = {};
    if (solveNodes[i].type == SNW.maze.NodeType.START) {
      start = i;
    }
    if (solveNodes[i].type == SNW.maze.NodeType.END) {
      end = i;
    }
  }

  checkNodes(solveNodes[start], anim, floodAnimBuff);

  let retArr = [];
  let visited = findVisited(solveNodes);
  makeRetArr(solveNodes[end], retArr, anim, floodAnimBuff);
  return new FoundPath(retArr, visited, floodAnimBuff);
}

/**
 * Make the found path coordinate array
 * @param n - nodes
 * @param arr - the ret array
 * @param anim - Whether animation is recorded or not
 * @param floodAnimBuff - The animation buffer
 */
function makeRetArr(n, arr, anim, floodAnimBuff) {
  arr.push({x: n.x, y: n.y});
  if (anim) {
    floodAnimBuff.push({
      x: n.x,
      y: n.y,
      type: 5
    });
  }
  if (n.type != SNW.maze.NodeType.START) {
    makeRetArr(n.pathToNode, arr, anim, floodAnimBuff);
  }
}

/**
 * Find the visited nodes
 * @param n - nodes
 * @returns {Array}
 */
function findVisited(n) {
  let visArr = [];
  for (let i = 0; i < n.length; i++) {
    if (n[i].visited === true) {
      visArr.push({x: n[i].x, y: n[i].y});
    }
  }
  return visArr;
}

let endFound = false;

/**
 * Find the path
 * @param node - A node
 * @param anim - Whether animation is recorded or not
 * @param floodAnimBuff - The animation buffer
 */
function checkNodes(node, anim, floodAnimBuff) {
  if (anim) {
    let n = {
      x: node.x,
      y: node.y,
      type: 6
    };
    floodAnimBuff.push(n);
  }
  node.visited = true;
  if (node.type == SNW.maze.NodeType.END || endFound) {
    endFound = true;
    return;
  }

  if (node.connections.left != null && !node.connections.left.visited) {
    node.connections.left.pathToNode = node;
    checkNodes(node.connections.left, anim, floodAnimBuff);
  }
  if (node.connections.right != null && !node.connections.right.visited) {
    node.connections.right.pathToNode = node;
    checkNodes(node.connections.right, anim, floodAnimBuff);
  }
  if (node.connections.down != null && !node.connections.down.visited) {
    node.connections.down.pathToNode = node;
    checkNodes(node.connections.down, anim, floodAnimBuff);
  }
  if (node.connections.up != null && !node.connections.up.visited) {
    node.connections.up.pathToNode = node;
    checkNodes(node.connections.up, anim, floodAnimBuff);
  }
}