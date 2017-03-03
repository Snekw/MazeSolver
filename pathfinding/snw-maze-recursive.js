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

/**
 * Recursive path find
 */
class SnwRecursive extends SnwPathFind {
  /**
   * Overrides the default solve function
   * @param solveNodes - Nodes the maze has
   * @param startI - Start node index
   * @param endI - End node index
   * @returns {FoundPath}
   */
  solve(solveNodes, startI, endI) {
    this.start = startI;
    this.end = endI;
    this.nodes = solveNodes;
    this.endFound = false;
    this.floodAnimBuff = [];

    for (let i = 0; i < this.nodes.length; i++) {
      solveNodes[i].visited = false;
      solveNodes[i].pathToNode = {};
    }

    this._checkNodes(this.nodes[this.start]);

    let retArr = [];
    let visited = this._findVisited();
    this._makeRetArr(this.nodes[this.end], retArr);
    return new FoundPath(retArr, visited, this.floodAnimBuff);
  }

  /**
   * Make the returned path array
   * @param n - Current node
   * @param arr - The return array
   * @private
   */
  _makeRetArr(n, arr) {
    let n2 = {};
    if (n.pathToNode) {
      n2 = {
        x: n.x,
        y: n.y,
        type: 5,
        connNode: {
          x: n.pathToNode.x,
          y: n.pathToNode.y
        }
      };
    } else {
      n2 = {
        x: n.x,
        y: n.y,
        type: 5,
        connNode: {
          x: n.x,
          y: n.y
        }
      };
    }
    arr.push(n2);
    if (recordAnim && animFoundPath) {
      this.floodAnimBuff.push(n2);
    }
    if (n.type != SNW.maze.NodeType.START) {
      this._makeRetArr(n.pathToNode, arr);
    }
  }

  /**
   * Find visited nodes
   * @returns {Array}
   * @private
   */
  _findVisited() {
    let visArr = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].visited === true) {
        let n2 = {};
        let n = this.nodes[i];
        if (n.pathToNode) {
          n2 = {
            x: n.x,
            y: n.y,
            type: 5,
            connNode: {
              x: n.pathToNode.x,
              y: n.pathToNode.y
            }
          };
        } else {
          n2 = {
            x: n.x,
            y: n.y,
            type: 5,
            connNode: {
              x: n.x,
              y: n.y
            }
          };
        }
        visArr.push(n2);
      }
    }
    return visArr;
  }

  /**
   * The actual path find method
   * @param node - Current node
   * @param lastNode - Last node
   * @private
   */
  _checkNodes(node, lastNode) {
    if (this.endFound) {
      return;
    }
    if (recordAnim && animPathFind) {
      let n = {
        x: node.x,
        y: node.y,
        type: 6,
        connNode: lastNode
      };
      this.floodAnimBuff.push(n);
      lastNode = node;
    }
    node.visited = true;
    if (node.type == SNW.maze.NodeType.END) {
      this.endFound = true;
      return;
    }

    if (node.connections.left != null && !node.connections.left.visited) {
      node.connections.left.pathToNode = node;
      this._checkNodes(node.connections.left, lastNode);
    }
    if (node.connections.right != null && !node.connections.right.visited) {
      node.connections.right.pathToNode = node;
      this._checkNodes(node.connections.right, lastNode);
    }
    if (node.connections.down != null && !node.connections.down.visited) {
      node.connections.down.pathToNode = node;
      this._checkNodes(node.connections.down, lastNode);
    }
    if (node.connections.up != null && !node.connections.up.visited) {
      node.connections.up.pathToNode = node;
      this._checkNodes(node.connections.up, lastNode);
    }
  }
}


SNW.maze.pathFinding.recursive = new SnwRecursive('Recursive');