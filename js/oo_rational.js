// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.OoRational = class {
  constructor(a, b) {
    this.a = a || 0;
    this.b = b || 1;
  }

  clone() {
    return new oo.OoRational(this.a, this.b);
  }

  set(a, b) {
    if (oo.isObject(a)) {
      this.a = a.a || 0;
      this.b = a.b || 1;
    } else {
      this.a = a || 0;
      this.b = b || 1;
    }
    return this;
  }

  mul(r) {
    this.a *= (oo.isObject(r) ? r.a : r) || 0;
    this.b *= (oo.isObject(r) ? r.b : 1) || 1;
    return this;
  }

  float() {
    return this.a / this.b;
  }

  static mul(r0, r1) {
    return r0.clone().mul(r1);
  }
};
