// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// Xorshift RNGs
// https://en.wikipedia.org/wiki/Xorshift
// http://www.jstatsoft.org/v08/i14/paper

class OoRandom {
  constructor(seed) {
    this.init(seed);
  }

  init(seed) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = 88675123;
    if (seed !== undefined) this.seed = seed;
    if (this.seed !== undefined) this.w = this.seed;

    this.nd_idx = 0;
    this.nd_work = 0;
  }

  getUint32() {
    var t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    this.w = (this.w >>> 0);
    return this.w;
  }

  // half-closed interval [0,1)  0 <= x <  1
  get() { return this.getUint32() / 4294967296.0; }
  //      closed interval [0,1]  0 <= x <= 1
  get1() { return this.getUint32() / 4294967295.0; }
  // [-1,1)
  get2() { return this.getUint32() / (4294967296.0 / 2) - 1.0; }

  // normal distribution
  getND() {
    this.nd_idx ^= 1;
    if (this.nd_idx === 0) return this.nd_work;
    do {
      var r1 = this.get2();
      var r2 = this.get2();
      var s = r1 * r1 + r2 * r2;
    } while (s > 1.0 || s === 0.0);
    s = Math.sqrt(-2.0 * Math.log(s) / s);
    this.nd_work = r2 * s;
    return r1 * s;
  }

  getRange(a, b) { return a + this.get1() * (b - a); }

  getIntRange(a, b) { return a + this.roll0(b - a + 1); }

  roll0(num_faces) {
    num_faces = num_faces || 6;
    return (this.getUint32() % num_faces);
  }

  // roll a dice
  roll(num_faces) { return this.roll0(num_faces) + 1; }
}