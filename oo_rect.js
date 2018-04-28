// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.default_align = 1;

class OoRect {
  constructor(x, y, w, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
  }

  clone() {
    return new OoRect(this.x, this.y, this.w, this.h);
  }

  // set(x, y, w, h)
  // set(rect)
  set(x, y, w, h) {
    if (x instanceof OoRect) {
      this.x = x.x;
      this.y = x.y;
      this.w = x.w;
      this.h = x.h;
    } else {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }

  // isContains(x, y)
  // isContains(position)
  isContains(x, y) {
    if (x instanceof Oo2DVector) {
      var position = x;
      x = position.x;
      y = position.y;
    }
    if (x < this.x || x >= this.x + this.w) return false;
    if (y < this.y || y >= this.y + this.h) return false;
    return true;
  }

  alignRect(outer_rect, align) {
    this.set(oo.alignedRect(outer_rect, this, align));
  }
}

oo.alignedRect = function (outer_rect, inner_rect, align) {
  var r0 = outer_rect;
  var r1 = inner_rect;

  var a0 = Math.floor(align / 10) % 10;
  var a1 = align % 10;
  if (a1 === 0) a1 = oo.env.default_align;
  if (a0 === 0) a0 = a1;

  function px(length, a) {
    // if ((a === 1) || (a === 4) || (a === 7)) return 0;
    // if ((a === 2) || (a === 5) || (a === 8)) return length / 2;
    // if ((a === 3) || (a === 6) || (a === 9)) return length;
    return length * ((a + 2) % 3) / 2;
  }

  function py(length, a) {
    // if ((a === 1) || (a === 2) || (a === 3)) return 0;
    // if ((a === 4) || (a === 5) || (a === 6)) return length / 2;
    // if ((a === 7) || (a === 8) || (a === 9)) return length;
    return length * Math.floor((a - 1) / 3) / 2;
  }

  var x = r0.x + px(r0.w, a0) - px(r1.w, a1);
  var y = r0.y + py(r0.h, a0) - py(r1.h, a1);

  return new OoRect(x, y, r1.w, r1.h);
};

