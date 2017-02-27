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

SNW.maze.pathFinding.flood = {
  name: 'Flood',
  solve: floodSolve
};

/**
 * The entry point
 * @param {MazeNode[]} solveNodes -- The nodes we need to solve
 * @returns {FoundPath} -- The found path and visited nodes
 */
function floodSolve(solveNodes) {
  let start = -1;
  let end = -1;
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

  checkNodes(solveNodes[start]);

  let retArr = [];
  let visited = findVisited(solveNodes);
  makeRetArr(solveNodes[end], retArr);
  return new FoundPath(retArr, visited);
}

/**
 * Make the found path coordinate array
 * @param n - nodes
 * @param arr - the ret array
 */
function makeRetArr(n, arr) {
  arr.push({x: n.x, y: n.y});
  if (n.type != SNW.maze.NodeType.START) {
    makeRetArr(n.pathToNode, arr);
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
 */
function checkNodes(node) {
  node.visited = true;
  if (node.type == SNW.maze.NodeType.END || endFound) {
    endFound = true;
    return;
  }

  if (node.connections.left != null && !node.connections.left.visited) {
    node.connections.left.pathToNode = node;
    checkNodes(node.connections.left);
  }
  if (node.connections.right != null && !node.connections.right.visited) {
    node.connections.right.pathToNode = node;
    checkNodes(node.connections.right);
  }
  if (node.connections.down != null && !node.connections.down.visited) {
    node.connections.down.pathToNode = node;
    checkNodes(node.connections.down);
  }
  if (node.connections.up != null && !node.connections.up.visited) {
    node.connections.up.pathToNode = node;
    checkNodes(node.connections.up);
  }
}