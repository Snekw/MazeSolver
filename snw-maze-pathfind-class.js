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

/**
 * Base class for all path finding methods
 */
class SnwPathFind {
  /**
   * Initialize
   * @param {String} name - Name of the path finding method
   */
  constructor(name) {
    this.name = name || 'default';
    this.animationSpeed = 5;
    this.RealTimeAnimation = this.RealTimeAnimation || false;
  }

  /**
   * The default solve method
   * @param {Array} nodes - Node array
   * @param {Number} startI - Start node index
   * @param {Number} endI - End node index
   * @param {Function} cb - Callback
   * @abstract
   * @returns {null}
   */
  solve(nodes, startI, endI, cb) {
    console.error(this.name + ': SOLVE METHOD NOT SET!');
    return null;
  }

  /**
   * Set the animation speed for the animator
   * @param speed
   */
  setAnimSpeed(speed) {
    if (isNaN(speed)) {
      try {
        this.animationSpeed = parseInt(speed);
      } catch (e) {
        console.log(e);
      }
    } else {
      this.animationSpeed = speed;
    }
  }

  /**
   * Make the return node array
   * @param n - The end node
   * @returns {Promise}
   */
  async makeRetArr(n) {
    let n2 = {};
    if (n.via) {
      n2 = {
        x: n.x,
        y: n.y,
        type: 5,
        connNode: {
          x: n.via.x,
          y: n.via.y
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
    this.retArr.push(n2);
    if (recordAnim && animFoundPath) {
      this.animator.AnimationSpeed = this.animationSpeed;
      await this.animator.pushToAnimBuffer(n2);
    }
    if (n.type != SNW.maze.NodeType.START) {
      return this.makeRetArr(n.via);
    }
  }

  /**
   * Find visited nodes
   * @returns {Array}
   */
  findVisited() {
    let visArr = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].visited === true) {
        let n2 = {};
        let n = this.nodes[i];
        if (n.via) {
          n2 = {
            x: n.x,
            y: n.y,
            type: 5,
            connNode: {
              x: n.via.x,
              y: n.via.y
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
}