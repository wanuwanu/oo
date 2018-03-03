"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var Oo2DVector = function () {
  function Oo2DVector(x, y) {
    _classCallCheck(this, Oo2DVector);

    this.x = x;
    this.y = y;
  }

  _createClass(Oo2DVector, [{
    key: "clone",
    value: function clone() {
      return new Oo2DVector(this.x, this.y);
    }
  }, {
    key: "set",
    value: function set(x, y) {
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
  }, {
    key: "add",
    value: function add(v) {
      if (v instanceof Oo2DVector) {
        this.x += v.x;
        this.y += v.y;
      } else {
        this.x += v;
        this.y += v;
      }
      return this;
    }
  }, {
    key: "sub",
    value: function sub(v) {
      if (v instanceof Oo2DVector) {
        this.x -= v.x;
        this.y -= v.y;
      } else {
        this.x -= v;
        this.y -= v;
      }
      return this;
    }
  }, {
    key: "mul",
    value: function mul(v) {
      if (v instanceof Oo2DVector) {
        this.x *= v.x;
        this.y *= v.y;
      } else {
        this.x *= v;
        this.y *= v;
      }
      return this;
    }
  }, {
    key: "div",
    value: function div(v) {
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
  }, {
    key: "getSquareMagnitude",
    value: function getSquareMagnitude() {
      return this.x * this.x + this.y * this.y;
    }
  }, {
    key: "getMagnitude",
    value: function getMagnitude() {
      return Math.sqrt(this.getSquareMagnitude());
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var s = this.getMagnitude();
      if (s > 0.0) s = 1.0 / s;
      this.x *= s;
      this.y *= s;
      return this;
    }
  }, {
    key: "getNormal",
    value: function getNormal() {
      return this.clone().normalize();

      // var r = new Oo2DVector();
      // r.set(this);
      // r.normalize();
      // return r;
    }
  }], [{
    key: "add",
    value: function add(a, b) {
      return new Oo2DVector(a.x + b.x, a.y + b.y);
    }
  }, {
    key: "sub",
    value: function sub(a, b) {
      return new Oo2DVector(a.x - b.x, a.y - b.y);
    }
  }, {
    key: "mul",
    value: function mul(a, b) {
      return new Oo2DVector(a.x * b.x, a.y * b.y);
    }
  }, {
    key: "div",
    value: function div(a, b) {
      return new Oo2DVector(a.x / b.x, a.y / b.y);
    }
  }, {
    key: "dot",
    value: function dot(a, b) {
      return a.x * b.x + a.y * b.y;
    }
  }, {
    key: "cross",
    value: function cross(a, b) {
      return a.x * b.y - a.y * b.x;
    }
  }]);

  return Oo2DVector;
}();
