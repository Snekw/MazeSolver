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
 * SnwMazeAnimator handles the animation needs for the path finding
 */
class SnwMazeAnimator {
  /**
   * Initialize
   */
  constructor() {
    this.animationSpeed = 1;
    this.animBuffer = [];
    this.isRTAnim = false;
    this.shouldStop = false;
  }

  /**
   * Set the Real time animation
   * @param {Boolean} val - True/False
   * @constructor
   */
  set RealTimeAnimation(val) {
    this.isRTAnim = val;
  }

  /**
   * Set the animation speed
   * @param {Number} speed - Animation speed
   * @constructor
   */
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

  /**
   * Play the animation from current buffer
   * @returns {Promise.<void>}
   */
  async play() {
    this.shouldStop = false;
    while (this.animBuffer.length > 0 && !this.shouldStop) {
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
          speed = SnwMazeAnimator._getSpeed(speed);
        }
        await SnwMazeAnimator.sleep(speed);
      }
    }
  }

  /**
   * Stop the currently playing animation
   */
  stopAnimation() {
    this.shouldStop = true;
  }

  /**
   * Get the delay(ms) for the speed
   * @param {Number} speed - Animation speed 1-10
   * @returns {Number} - Delay in ms
   * @private
   */
  static _getSpeed(speed) {
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

  /**
   * Play the next frame from animation buffer
   */
  playNextFrame() {
    let curFrame = this.animBuffer[0];
    if (curFrame != null) {
      SNW.maze.renderer.renderPath(curFrame.x, curFrame.y, curFrame.connNode.x, curFrame.connNode.y, curFrame.type);
      this.animBuffer.splice(0, 1);
    }
  }

  /**
   * Play next frame as real time frame
   * @returns {Promise.<void>}
   */
  async playRtFrame() {
    let speed = this.animationSpeed || 1;
    if (this.animationSpeed > 10) {
      let overTen = speed - 10;
      if (this.animBuffer.length > overTen) {
        while (this.animBuffer.length > 0) {
          this.playNextFrame();
        }
        speed = 1;
        await SnwMazeAnimator.sleep(speed);
      }
    } else {
      this.playNextFrame();
      speed = SnwMazeAnimator._getSpeed(speed);
      await SnwMazeAnimator.sleep(speed);
    }
  }

  /**
   * Push a frame to animation buffer and play it if we are using real time animation
   * @param frame - The animation frame
   * @returns {Promise.<void>}
   */
  async pushToAnimBuffer(frame) {
    if (frame != null) {
      this.animBuffer.push(frame);
      if (this.isRTAnim) {
        await this.playRtFrame();
      }
    }
  }

  /**
   * Clear the animation buffer
   */
  clearAnimBuffer() {
    this.animBuffer = [];
  }

  /**
   * Blocking function to time the animation
   * @param ms
   * @returns {Promise}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}