// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class Oo2DVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Oo2DVector(this.x, this.y);
  }

  set(x, y) {
    if (x instanceof Oo2DVector) {
      this.x = x.x;
      this.y = x.y;
    } else {
      if (y === undefined) {
        this.x = x;
        this.y = x;
      } else {
        this.x = x;
        this.y = y;
      }
    }
    return this;
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
      if (v.x !== 0) this.x /= v.x;
      if (v.y !== 0) this.y /= v.y;
    } else {
      if (v !== 0) {
        this.x /= v;
        this.y /= v;
      }
    }
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    return this;
  }

  getRound() {
    return this.clone().round();
  }

  getNormal() {
    return this.clone().normalize();
  }

  getSquareMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.getSquareMagnitude());
  }

  getAtan2() {
    return Math.atan2(this.y, this.x);
  }

  getDegree() {
    return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
  }

  static add(v0, v1) {
    return new Oo2DVector(v0.x + v1.x, v0.y + v1.y);
  }
  static sub(v0, v1) {
    return new Oo2DVector(v0.x - v1.x, v0.y - v1.y);
  }
  static mul(v0, v1) {
    return new Oo2DVector(v0.x * v1.x, v0.y * v1.y);
  }
  static div(v0, v1) {
    return new Oo2DVector(v0.x / v1.x, v0.y / v1.y);
  }

  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y;
  }

  static cross(v0, v1) {
    return v0.x * v1.y - v0.y * v1.x;
  }

  static lerp(v0, v1, alpha) {
    return new Oo2DVector(
      (1.0 - alpha) * v0.x + alpha * v1.x,
      (1.0 - alpha) * v0.y + alpha * v1.y
    );
  }
}
