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

  getSquareMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.getSquareMagnitude());
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    return this;
  }

  getNormal() {
    return this.clone().normalize();

    // var r = new Oo2DVector();
    // r.set(this);
    // r.normalize();
    // return r;
  }

  static add(a, b) {
    return new Oo2DVector(a.x + b.x, a.y + b.y);
  }
  static sub(a, b) {
    return new Oo2DVector(a.x - b.x, a.y - b.y);
  }
  static mul(a, b) {
    return new Oo2DVector(a.x * b.x, a.y * b.y);
  }
  static div(a, b) {
    return new Oo2DVector(a.x / b.x, a.y / b.y);
  }

  static dot(a, b){
    return a.x * b.x + a.y * b.y;
  }
  static cross(a, b){
    return a.x * b.y - a.y * b.x;
  }
  
}
