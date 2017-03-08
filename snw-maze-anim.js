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
SNW.maze.anim = {
  playAnim: _playBufferedAnim
};

class SnwMazeAnimator {
  constructor() {
    this.animationSpeed = 1;
    this.animBuffer = [];
    this.isRTAnim = false;
  }

  set RealTimeAnimation(val) {
    this.isRTAnim = val;
  }

  set AnimationSpeed(speed) {
    if (!isNaN(speed)) {
      speed = parseInt(speed);
      this.animationSpeed = speed;
    } else {
      try {
        this.animationSpeed = parseInt(speed);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async play() {
    while (this.animBuffer.length > 0) {
      this.playNextFrame();

      if (this.animationSpeed > 0) {
        let speed = this.animationSpeed;
        if (speed > 10) {
          let overTen = speed - 10;
          for (let i = 0; i < overTen; i++) {
            this.playNextFrame();
          }
          speed = 1;
        } else {
          speed = this._getSpeed(speed);
        }
        await sleep(speed);
      }
    }
  }

  _getSpeed(speed) {
    switch (speed) {
      case 1:
        speed = 1000;
        break;
      case 2:
        speed = 500;
        break;
      case 3:
        speed = 250;
        break;
      case 4:
        speed = 125;
        break;
      case 5:
        speed = 50;
        break;
      case 6:
        speed = 20;
        break;
      case 7:
        speed = 10;
        break;
      case 8:
        speed = 5;
        break;
      case 9:
        speed = 2;
        break;
      case 10:
        speed = 1;
        break;
      default:
        speed = 1;
        break;
    }
    return speed;
  }

  playNextFrame() {
    let curFrame = this.animBuffer[0];
    if (curFrame != null) {
      SNW.maze.renderer.renderPath(curFrame.x, curFrame.y, curFrame.connNode.x, curFrame.connNode.y, curFrame.type);
      this.animBuffer.splice(0, 1);
    }
  }

  async playRtFrame() {
    let speed = this.animationSpeed || 1;
    if (this.animationSpeed > 10) {
      let overTen = speed - 10;
      if (this.animBuffer.length > overTen) {
        while (this.animBuffer.length > 0) {
          this.playNextFrame();
        }
        speed = 1;
        await sleep(speed);
      }
    } else {
      let curFrame = this.animBuffer[0];
      SNW.maze.renderer.renderPath(curFrame.x, curFrame.y, curFrame.connNode.x, curFrame.connNode.y, curFrame.type);
      this.animBuffer.splice(0, 1);
      speed = this._getSpeed(speed);
      await sleep(speed);
    }
  }

  async pushToAnimBuffer(frame) {
    if (frame != null) {
      this.animBuffer.push(frame);
      if (this.isRTAnim) {
        await this.playRtFrame();
      }
    }
  }

  clearAnimBuffer() {
    this.animBuffer = [];
  }
}

/**
 * Blocking function to time the animation
 * @param ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let animationSpeed = 0;

/**
 * Set the animation speed
 * @param speed
 */
// function setAnimSpeed(speed) {
//   animationSpeed = speed;
// }

let animInProgress = false;
/**
 * Render the buffered animation
 * @param animBuffer
 * @param speed
 * @returns {Promise}
 * @private
 */
async function _playBufferedAnim(animBuffer, speed) {
  mazeAnimator.play();
  if (animInProgress) {
    return new Promise(resolve => (resolve()));
  }
  // setAnimSpeed(speed);
  animInProgress = true;
  // let rBuffer = SNW.maze.renderer.getRenderBuffer();
  //
  // for (let y = 0; y < rBuffer.length; y++) {
  //   for (let x = 0; x < rBuffer[y].length; x++) {
  //     rBuffer[y][x] = mazeRenderData[y][x];
  //   }
  // }
  //
  // SNW.maze.renderer.render();
  //
  // for (let i = 0; i < animBuffer.length; i++) {
  //   if (stopAnimProgress) {
  //     stopAnimProgress = false;
  //     break;
  //   }
  //   if (animBuffer[i].connNode) {
  //     SNW.maze.renderer.renderPath(animBuffer[i].x, animBuffer[i].y, animBuffer[i].connNode.x, animBuffer[i].connNode.y, animBuffer[i].type);
  //   } else {
  //     SNW.maze.renderer.renderBlock(animBuffer[i].x, animBuffer[i].y, animBuffer[i].type);
  //   }
  //
  //   //Delay the animation
  //   await sleep(animationSpeed);
  // }
  // animInProgress = false;
}

// setAnimSpeed(50);