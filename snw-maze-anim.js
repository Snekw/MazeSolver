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
  playAnim: _playAnim
};

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
function setAnimSpeed(speed) {
  animationSpeed = speed;
}

let animInProgress = false;
/**
 * Render the animation
 * @param animBuffer
 * @param speed
 * @returns {Promise}
 * @private
 */
async function _playAnim(animBuffer, speed) {
  if (animInProgress) {
    return new Promise(resolve => (resolve()));
  }
  setAnimSpeed(speed);
  animInProgress = true;

  let rBuffer = SNW.maze.renderer.getRenderBuffer();

  for (let y = 0; y < rBuffer.length; y++) {
    for (let x = 0; x < rBuffer[y].length; x++) {
      rBuffer[y][x] = mazeRenderData[y][x];
    }
  }

  SNW.maze.renderer.render();

  for (let i = 0; i < animBuffer.length; i++) {
    if (animBuffer[i].connNode) {
      SNW.maze.renderer.renderPath(animBuffer[i].x, animBuffer[i].y, animBuffer[i].connNode.x, animBuffer[i].connNode.y, animBuffer[i].type);
    } else {
      SNW.maze.renderer.renderBlock(animBuffer[i].x, animBuffer[i].y, animBuffer[i].type);
    }

    //Delay the animation
    await sleep(animationSpeed);
  }
  animInProgress = false;
}