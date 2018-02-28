// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class Oo2DVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    if (v instanceof Oo2DVector) {
      this.x += v.x;
      this.y += v.y;
    } else {
      this.x += v;
      this.y += v;
    }
    return this;
  }

  sub(v) {
    if (v instanceof Oo2DVector) {
      this.x -= v.x;
      this.y -= v.y;
    } else {
      this.x -= v;
      this.y -= v;
    }
    return this;
  }

  mul(v) {
    if (v instanceof Oo2DVector) {
      this.x *= v.x;
      this.y *= v.y;
    } else {
      this.x *= v;
      this.y *= v;
    }
    return this;
  }

  div(v) {
    if (v instanceof Oo2DVector) {
      this.x /= v.x;
      this.y /= v.y;
    } else {
      this.x /= v;
      this.y /= v;
    }
    return this;
  }

  static add(v1, v0) {
    return new Oo2DVector(v1.x + v0.x, v1.y + v0.y);
  }
  static sub(v1, v0) {
    return new Oo2DVector(v1.x - v0.x, v1.y - v0.y);
  }
  static mul(v1, v0) {
    return new Oo2DVector(v1.x * v0.x, v1.y * v0.y);
  }
  static div(v1, v0) {
    return new Oo2DVector(v1.x / v0.x, v1.y / v0.y);
  }
}
