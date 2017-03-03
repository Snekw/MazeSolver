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

class SnwAstar extends SnwPathFind {

  init(startI, endI) {
    this.nodes = nodes;
    this.start = startI;
    this.end = endI;
    this.path = [];
    this.workSet = [];
    this.endFound = false;
    this.endNode = this.nodes[this.end];
    this.retArr = [];
    this.animBuff = [];

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visited = false;
      this.nodes[i].via = null;
      this.nodes[i].dDistance = Number.MAX_SAFE_INTEGER;

      //Straight distance to end node
      let d = -1;
      let dx = Math.abs(this.nodes[i].x - this.endNode.x);
      let dy = Math.abs(this.nodes[i].y - this.endNode.y);
      d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      this.nodes[i].aDistance = d;
    }

    this.nodes[this.start].dDistance = 0;
    this.workSet.push(this.nodes[this.start]);
  }

  solve(nodes, startI, endI) {
    this.init(startI, endI);

    this.aStar();

    this._makeRetArr(this.endNode);
    return new FoundPath(this.retArr, this._findVisited(), this.animBuff);
  }

  aStar() {
    while (this.workSet.length > 0 && !this.endFound) {
      let i = 0;
      let curMinDist = Number.MAX_SAFE_INTEGER;
      //Find the node with shortest path currently
      for (let d = 0; d < this.workSet.length; d++) {
        let dist = this.workSet[d].dDistance + this.workSet[d].aDistance;
        if (dist < curMinDist) {
          i = d;
          curMinDist = dist;
        }
      }
      //Make sure that the current node has not been visited
      if (this.workSet[i].visited) {
        //Remove current index from work set
        this.workSet.splice(i, 1);
        continue;
      }
      if (this.workSet[i].type == SNW.maze.NodeType.END) {
        this.endFound = true;
        this.endNode = this.workSet[i];
        break;
      }
      if (recordAnim && animPathFind) {
        let n = {};
        if (this.workSet[i].via) {
          n = {
            x: this.workSet[i].x,
            y: this.workSet[i].y,
            type: 6,
            connNode: {
              x: this.workSet[i].via.x,
              y: this.workSet[i].via.y
            }
          };
        } else {
          n = {
            x: this.workSet[i].x,
            y: this.workSet[i].y,
            type: 6,
            connNode: {
              x: this.workSet[i].x,
              y: this.workSet[i].y
            }
          };
        }
        this.animBuff.push(n);
      }

      for (let key in this.workSet[i].connections) {
        if (this.workSet[i].connections.hasOwnProperty(key)) {
          if (this.workSet[i].connections[key] != null) {
            if (this.workSet[i].dDistance + this.workSet[i].connections[key].distance[key] < this.workSet[i].connections[key].dDistance) {
              this.workSet[i].connections[key].dDistance = this.workSet[i].dDistance + this.workSet[i].connections[key].distance[key];
              this.workSet[i].connections[key].via = this.workSet[i];
            }
            //Push the node to work set
            if (!this.workSet[i].connections[key].visited) {
              this.workSet.push(this.workSet[i].connections[key]);
            }
          }
        }
      }
      this.workSet[i].visited = true;
      //Remove current index from work set
      this.workSet.splice(i, 1);
    }
  }

  _makeRetArr(n) {
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
      this.animBuff.push(n2);
    }
    if (n.type != SNW.maze.NodeType.START) {
      this._makeRetArr(n.via);
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

class SnwAstarAnimated extends SnwAstar {

  solve(nodes,startI, endI, cb) {
    this.init(startI, endI);

    this.dijkstra().then(() => {
      this._makeRetArr(this.endNode).then(() => {
        cb(new FoundPath(this.retArr, [], []));
      });
    });
  }

  async _makeRetArr(n) {
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
      SNW.maze.renderer.renderPath(n2.x, n2.y, n2.connNode.x, n2.connNode.y, 5);
      if (animationSpeed > 0)
        await sleep(animationSpeed);
    }
    if (n.type != SNW.maze.NodeType.START) {
      return this._makeRetArr(n.via);
    }

  }

  async dijkstra() {
    while (this.workSet.length > 0 && !this.endFound) {
      let i = 0;
      let curMinDist = Number.MAX_SAFE_INTEGER;
      //Find the node with shortest path currently
      for (let d = 0; d < this.workSet.length; d++) {
        let dist = this.workSet[d].dDistance + this.workSet[d].aDistance;
        if (dist < curMinDist) {
          i = d;
          curMinDist = dist;
        }
      }
      //Make sure that the current node has not been visited
      if (this.workSet[i].visited) {
        //Remove current index from work set
        this.workSet.splice(i, 1);
        continue;
      }
      if (this.workSet[i].type == SNW.maze.NodeType.END) {
        this.endFound = true;
        this.endNode = this.workSet[i];
        break;
      }
      if (recordAnim && animPathFind) {
        let n = {};
        if (this.workSet[i].via) {
          n = {
            x: this.workSet[i].x,
            y: this.workSet[i].y,
            type: 6,
            connNode: {
              x: this.workSet[i].via.x,
              y: this.workSet[i].via.y
            }
          };
        } else {
          n = {
            x: this.workSet[i].x,
            y: this.workSet[i].y,
            type: 6,
            connNode: {
              x: this.workSet[i].x,
              y: this.workSet[i].y
            }
          };
        }
        SNW.maze.renderer.renderPath(n.x, n.y, n.connNode.x, n.connNode.y, 6);
        if (animationSpeed > 0)
          await sleep(animationSpeed);
        // this.animBuff.push(n);
      }

      for (let key in this.workSet[i].connections) {
        if (this.workSet[i].connections.hasOwnProperty(key)) {
          if (this.workSet[i].connections[key] != null) {
            if (this.workSet[i].dDistance + this.workSet[i].connections[key].distance[key] < this.workSet[i].connections[key].dDistance) {
              this.workSet[i].connections[key].dDistance = this.workSet[i].dDistance + this.workSet[i].connections[key].distance[key];
              this.workSet[i].connections[key].via = this.workSet[i];
            }
            //Push the node to work set
            if (!this.workSet[i].connections[key].visited) {
              this.workSet.push(this.workSet[i].connections[key]);
            }
          }
        }
      }
      this.workSet[i].visited = true;
      //Remove current index from work set
      this.workSet.splice(i, 1);
    }
  }
}

SNW.maze.pathFinding.aStar = new SnwAstar('A*');
SNW.maze.pathFinding.aStarAnimated = new SnwAstarAnimated('A* - Animated', true);