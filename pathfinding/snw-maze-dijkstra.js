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

class SnwDijkstra extends SnwPathFind {
  solve(nodes) {
    this.nodes = nodes;
    this.start = -1;
    this.end = -1;
    this.path = [];
    this.workSet = [];
    this.endFound = false;
    this.endNode = null;
    this.retArr = [];
    this.animBuff = [];

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visited = false;
      this.nodes[i].via = null;
      this.nodes[i].dDistance = Number.MAX_SAFE_INTEGER;
      if (this.nodes[i].type == SNW.maze.NodeType.START) {
        this.start = i;
      }
      if (this.nodes[i].type == SNW.maze.NodeType.END) {
        this.end = i;
      }
    }

    this.nodes[this.start].dDistance = 0;
    this.workSet.push(this.nodes[this.start]);

    this.dijkstra();

    this._makeRetArr(this.endNode);
    return new FoundPath(this.retArr, this._findVisited(), this.animBuff);
  }

  dijkstra() {
    while (this.workSet.length > 0 && !this.endFound) {
      let i = 0;
      let curMinDist = Number.MAX_SAFE_INTEGER;
      //Find the node with shortest path currently
      for (let d = 0; d < this.workSet.length; d++) {
        if (this.workSet[d].dDistance < curMinDist) {
          i = d;
          curMinDist = this.workSet[d].dDistance;
        }
      }
      if (this.workSet[i].type == SNW.maze.NodeType.END) {
        this.endFound = true;
        this.endNode = this.workSet[i];
        break;
      }
      if (recordAnim && animPathFind) {
        let n = {
          x: this.workSet[i].x,
          y:  this.workSet[i].y,
          type: 6,
          connNode:  this.workSet[i].via
        };
        this.animBuff.push(n);
      }

      for(let key in this.workSet[i].connections){
        if(this.workSet[i].connections.hasOwnProperty(key)){
          if(this.workSet[i].connections[key] != null){
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
    this.retArr.push({x: n.x, y: n.y});
    if (recordAnim && animFoundPath) {
      this.animBuff.push({
        x: n.x,
        y: n.y,
        connNode: n.via,
        type: 5
      });
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
        visArr.push({x: this.nodes[i].x, y: this.nodes[i].y});
      }
    }
    return visArr;
  }
}

SNW.maze.pathFinding.dijkstra = new SnwDijkstra('Dijkstra');