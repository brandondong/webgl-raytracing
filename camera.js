'use strict';

const MOVE_DISTANCE = 0.1;

class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    // Initially, the camera matrix matches the direction of the world axis.
    this.cix = MOVE_DISTANCE;
    this.ciy = 0;
    this.ciz = 0;

    this.cjx = 0;
    this.cjy = MOVE_DISTANCE;
    this.cjz = 0;

    this.ckx = 0;
    this.cky = 0;
    this.ckz = MOVE_DISTANCE;

    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
  }

  moveForwards() {
    if (this.ckx === 0 && this.cky === 0) {
      // Pointing straight up or down.
      this.x += this.cjx;
      this.y += this.cjy;
    } else {
      const length = Math.sqrt(this.ckx * this.ckx + this.cky * this.cky);
      this.x += this.ckx / length * MOVE_DISTANCE;
      this.y += this.cky / length * MOVE_DISTANCE;
    }
    console.log([this.x, this.y]);
  }

  moveBackwards() {
    if (this.ckx === 0 && this.cky === 0) {
      // Pointing straight up or down.
      this.x -= this.cjx;
      this.y -= this.cjy;
    } else {
      const length = Math.sqrt(this.ckx * this.ckx + this.cky * this.cky);
      this.x -= this.ckx / length * MOVE_DISTANCE;
      this.y -= this.cky / length * MOVE_DISTANCE;
    }
    console.log([this.x, this.y]);
  }

  moveRight() {
    this.x += this.cix;
    this.y += this.ciy;
    console.log([this.x, this.y]);
  }

  moveLeft() {
    this.x -= this.cix;
    this.y -= this.ciy;
    console.log([this.x, this.y]);
  }

  mousedown(e) {
    this.isMouseDown = true;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  mousemove(e) {
    if (this.isMouseDown) {
      console.log([e.clientX - this.mouseX, e.clientY - this.mouseY]);
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }
  }

  mouseup() {
    this.isMouseDown = false;
  }
}