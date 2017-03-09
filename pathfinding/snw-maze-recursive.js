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
  init(solveNodes, startI, endI) {
    this.start = startI;
    this.end = endI;
    this.nodes = solveNodes;
    this.endFound = false;
    this.endNode = null;
    this.retArr = [];
    this.animator = new SnwMazeAnimator();
    this.animator.RealTimeAnimation = this.RealTimeAnimation;

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visited = false;
      this.nodes[i].via = {};
    }
  }

  solve(nodes, startI, endI, cb) {
    this.init(nodes, startI, endI);

    this._checkNodes(this.nodes[this.start]).then(() => {
      this.makeRetArr(this.endNode).then(() => {
        cb(new FoundPath(this.retArr, this.findVisited(), this.animator));
      });
    });
  }

  /**
   * The actual path find method
   * @param node - Current node
   * @param lastNode - Last node
   * @private
   */
  async _checkNodes(node, lastNode) {
    if (this.endFound) {
      return;
    }
    if (recordAnim && animPathFind) {
      let n = {};
      if(lastNode){
        n = {
          x: node.x,
          y: node.y,
          type: 6,
          connNode: {
            x: lastNode.x,
            y: lastNode.y
          }
        };
      }else{
        n = {
          x: node.x,
          y: node.y,
          type: 6,
          connNode: {
            x: node.x,
            y: node.y
          }
        };
      }
      this.animator.AnimationSpeed = this.animationSpeed;
      await this.animator.pushToAnimBuffer(n);
      lastNode = node;
    }
    node.visited = true;
    if (node.type == SNW.maze.NodeType.END) {
      this.endFound = true;
      this.endNode = node;
      return;
    }

    if (node.connections.left != null && !node.connections.left.visited) {
      node.connections.left.via = node;
      await this._checkNodes(node.connections.left, lastNode);
    }
    if (node.connections.right != null && !node.connections.right.visited) {
      node.connections.right.via = node;
      await this._checkNodes(node.connections.right, lastNode);
    }
    if (node.connections.down != null && !node.connections.down.visited) {
      node.connections.down.via = node;
      await this._checkNodes(node.connections.down, lastNode);
    }
    if (node.connections.up != null && !node.connections.up.visited) {
      node.connections.up.via = node;
      await this._checkNodes(node.connections.up, lastNode);
    }
  }
}


SNW.maze.pathFinding.recursive = new SnwRecursive('Recursive');