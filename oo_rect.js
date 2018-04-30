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
      // this.x = x.x;
      // this.y = x.y;
      // this.w = x.w;
      // this.h = x.h;
      Object.assign(this, x);
    } else {
      // this.x = x;
      // this.y = y;
      // this.w = w;
      // this.h = h;
      Object.assign(this, { x, y, w, h });
    }
  }

  // isContains(x, y)
  // isContains(position)
  isContains(x, y) {
    if (x instanceof Oo2DVector) [x, y] = [x.x, x.y];
    if (x < this.x || x >= this.x + this.w) return false;
    if (y < this.y || y >= this.y + this.h) return false;
    return true;
  }

  alignRect(outer_rect, align) {
    this.set(oo.alignedRect(outer_rect, this, align));
  }
}

oo.alignX = function (align, width) {
  // if ((a === 1) || (a === 4) || (a === 7)) return 0;
  // if ((a === 2) || (a === 5) || (a === 8)) return width / 2;
  // if ((a === 3) || (a === 6) || (a === 9)) return width;
  if (align === 0) align = oo.env.default_align;
  return width * ((align + 2) % 3) / 2;
};

oo.alignY = function (align, height) {
  // if ((a === 1) || (a === 2) || (a === 3)) return 0;
  // if ((a === 4) || (a === 5) || (a === 6)) return height / 2;
  // if ((a === 7) || (a === 8) || (a === 9)) return height;
  if (align === 0) align = oo.env.default_align;
  return height * Math.floor((align - 1) / 3) / 2;
};

oo.alignedRect = function (outer_rect, inner_rect, align) {
  var r0 = outer_rect;
  var r1 = inner_rect;

  var a0 = Math.floor(align / 10) % 10;
  var a1 = align % 10;
  if (a1 === 0) a1 = oo.env.default_align;
  if (a0 === 0) a0 = a1;

  var x = r0.x + r1.x + oo.alignX(a0, r0.w) - oo.alignX(a1, r1.w);
  var y = r0.y + r1.y + oo.alignY(a0, r0.h) - oo.alignY(a1, r1.h);

  return new OoRect(x, y, r1.w, r1.h);
};

