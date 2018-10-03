// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class Oo2DVector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = (y !== void 0) ? y : this.x;
  }

  clone() {
    return new Oo2DVector(this.x, this.y);
  }

  set(x, y) {
    if (oo.isObject(x)) {
      this.x = x.x || 0;
      this.y = x.y || 0;
    } else {
      this.x = x || 0;
      this.y = (y !== void 0) ? y : this.x;
    }
    return this;
  }

  // v.add(vector)  v    += vector
  // v.add(scalar)  v.xy += scalar
  add(v) {
    this.x += (oo.isObject(v) ? v.x : v) || 0;
    this.y += (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  // v.addSV(vector, scalar)  v += vector * scalar
  addSV(v, s) {
    this.x += (v.x || 0) * s;
    this.y += (v.y || 0) * s;
    return this;
  }

  sub(v) {
    this.x -= (oo.isObject(v) ? v.x : v) || 0;
    this.y -= (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  mul(v) {
    this.x *= (oo.isObject(v) ? v.x : v) || 0;
    this.y *= (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  div(v) {
    this.x /= (oo.isObject(v) ? v.x : v) || 1;
    this.y /= (oo.isObject(v) ? v.y : v) || 1;
    return this;
  }

  clamp(min, max) {
    if (this.x < min) this.x = min;
    if (this.y < min) this.y = min;
    if (this.x > max) this.x = max;
    if (this.y > max) this.y = max;
    return this;
  }

  negate() {
    this.x = - this.x;
    this.y = - this.y;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  rotate90() {
    [this.x, this.y] = [-this.y, this.x];
    return this;
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    return this;
  }

  getNegation() {
    return this.clone().negate();
  }

  getRound() {
    return this.clone().round();
  }

  getNormal() {
    return this.clone().normalize();
  }

  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  getAtan2() {
    return Math.atan2(this.y, this.x);
  }

  getDegree() {
    return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
  }

  static add(v0, v1) {
    return v0.clone().add(v1);
  }

  static sub(v0, v1) {
    return v0.clone().sub(v1);
  }

  static mul(v0, v1) {
    return v0.clone().mul(v1);
  }

  static div(v0, v1) {
    return v0.clone().div(v1);
  }

  static angle(v0, v1) {
    return Math.acos(Oo2DVector.dot(v1, v0) / (v1.getMagnitude() * v0.getMagnitude()));
  }

  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y;
  }

  static cross(v0, v1) {
    return v0.x * v1.y - v0.y * v1.x;
  }

  static distance(v0, v1) {
    return Oo2DVector.sub(v0, v1).getMagnitude();
  }

  static lerp(v0, v1, alpha) {
    return new Oo2DVector(
      (1.0 - alpha) * v0.x + alpha * v1.x,
      (1.0 - alpha) * v0.y + alpha * v1.y
    );
  }

  static cubicBezierCurves(v0, v1, v2, v3, alpha) {
    var t = alpha;
    var s = 1.0 - t;
    var k0 = s * s * s;
    var k1 = 3.0 * s * s * t;
    var k2 = 3.0 * s * t * t;
    var k3 = t * t * t;
    var v = new Oo2DVector(0, 0);
    v.addSV(v0, k0);
    v.addSV(v1, k1);
    v.addSV(v2, k2);
    v.addSV(v3, k3);
    return v;
  }

  static create(x, y) {
    return new Oo2DVector(x, y);
  }
}

class Oo3DVector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = (y === void 0) ? this.x : y;
    this.z = (z === void 0) ? this.y : z;
  }

  clone() {
    return new Oo3DVector(this.x, this.y, this.z);
  }

  set(x, y, z) {
    if (oo.isObject(x)) {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
    } else {
      this.x = x || 0;
      this.y = (y !== void 0) ? y : this.x;
      this.z = (z !== void 0) ? z : this.y;
    }
    return this;
  }

  add(v) {
    this.x += (oo.isObject(v) ? v.x : v) || 0;
    this.y += (oo.isObject(v) ? v.y : v) || 0;
    this.z += (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  addSV(v, s) {
    this.x += (v.x || 0) * s;
    this.y += (v.y || 0) * s;
    this.z += (v.z || 0) * s;
    return this;
  }

  sub(v) {
    this.x -= (oo.isObject(v) ? v.x : v) || 0;
    this.y -= (oo.isObject(v) ? v.y : v) || 0;
    this.z -= (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  mul(v) {
    this.x *= (oo.isObject(v) ? v.x : v) || 0;
    this.y *= (oo.isObject(v) ? v.y : v) || 0;
    this.z *= (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  div(v) {
    this.x /= (oo.isObject(v) ? v.x : v) || 1;
    this.y /= (oo.isObject(v) ? v.y : v) || 1;
    this.z /= (oo.isObject(v) ? v.z : v) || 1;
    return this;
  }

  clamp(min, max) {
    if (this.x < min) this.x = min;
    if (this.y < min) this.y = min;
    if (this.z < min) this.z = min;
    if (this.x > max) this.x = max;
    if (this.y > max) this.y = max;
    if (this.z > max) this.z = max;
    return this;
  }

  negate() {
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  getNegation() {
    return this.clone().negate();
  }

  getRound() {
    return this.clone().round();
  }

  getNormal() {
    return this.clone().normalize();
  }

  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  getMagnitude() {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  getAtan2() {
    return Math.atan2(this.y, this.x);
  }

  getDegree() {
    return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
  }

  static add(v0, v1) {
    return v0.clone().add(v1);
  }

  static sub(v0, v1) {
    return v0.clone().sub(v1);
  }

  static mul(v0, v1) {
    return v0.clone().mul(v1);
  }

  static div(v0, v1) {
    return v0.clone().div(v1);
  }

  static angle(v0, v1) {
    return Math.acos(Oo3DVector.dot(v1, v0) / (v1.getMagnitude() * v0.getMagnitude()));
  }

  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y + v0.z * v1.z;
  }

  static cross(v0, v1) {
    // if v0 = x and v1 = y, then v = z
    return new Oo3DVector(
      v0.y * v1.z - v0.z * v1.y,
      v0.z * v1.x - v0.x * v1.z,
      v0.x * v1.y - v0.y * v1.x
    );
  }

  static distance(v0, v1) {
    return Oo3DVector.sub(v0, v1).getMagnitude();
  }

  static lerp(v0, v1, alpha) {
    return new Oo3DVector(
      (1.0 - alpha) * v0.x + alpha * v1.x,
      (1.0 - alpha) * v0.y + alpha * v1.y,
      (1.0 - alpha) * v0.z + alpha * v1.z
    );
  }

  static cubicBezierCurves(v0, v1, v2, v3, alpha) {
    var t = alpha;
    var s = 1.0 - t;
    var k0 = s * s * s;
    var k1 = 3.0 * s * s * t;
    var k2 = 3.0 * s * t * t;
    var k3 = t * t * t;

    var v = new Oo3DVector(0, 0, 0);
    v.addSV(v0, k0);
    v.addSV(v1, k1);
    v.addSV(v2, k2);
    v.addSV(v3, k3);
    return v;
  }

  static create(x, y, z) {
    return new Oo3DVector(x, y);
  }
}

