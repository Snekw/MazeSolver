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
  solve: solve
};

function solve(solveNodes) {
  let start = -1;
  let end = -1;
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

  CheckNodes(solveNodes[start]);

  let retArr = [];
  MakeRetArr(solveNodes[end] ,retArr);
  return retArr;
}

function MakeRetArr(n, arr) {
  arr.push({x: n.x, y: n.y});
  if(n.type != SNW.maze.NodeType.START){
    MakeRetArr(n.pathToNode, arr);
  }
}

function CheckNodes(node) {
  node.visited = true;

  if (node.connections.left != null && !node.connections.left.visited) {
    node.connections.left.pathToNode = node;
    CheckNodes(node.connections.left);
  }
  if (node.connections.right != null && !node.connections.right.visited) {
    node.connections.right.pathToNode = node;
    CheckNodes(node.connections.right);
  }
  if (node.connections.down != null && !node.connections.down.visited) {
    node.connections.down.pathToNode = node;
    CheckNodes(node.connections.down);
  }
  if (node.connections.up != null && !node.connections.up.visited) {
    node.connections.up.pathToNode = node;
    CheckNodes(node.connections.up);
  }
}