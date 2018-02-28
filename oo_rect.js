// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoRect {
  constructor() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
  }
  setXYWH(x, y, w, h) {
    this.x0 = x;
    this.y0 = y;
    this.x1 = x + w;
    this.y1 = y + h;
  }
  setRect(r) {
    this.x0 = r.x0;
    this.y0 = r.y0;
    this.x1 = r.x1;
    this.y1 = r.y1;
  }

  getW() { return this.x1 - this.x0; }
  getH() { return this.y1 - this.y0; }

  isContains(position) {
    if (position.x < this.x0 || position.x >= this.x1) return false;
    if (position.y < this.y0 || position.y >= this.y1) return false;
    return true;
  }
}

oo.createOoRectWithXYWH = function (x, y, w, h) {
  var rect = new OoRect();
  rect.setXYWH(x, y ,w, h);
  return rect;
};

oo.getAlignedRect = function (base_rect, inner_rect, align) {
  var x = base_rect.x0;
  var y = base_rect.y0;
  var w = inner_rect.getW();
  var h = inner_rect.getH();

  if ((align === 1) || (align === 4) || (align === 7)) x = base_rect.x0;
  if ((align === 2) || (align === 5) || (align === 8)) x = (base_rect.x0 + base_rect.x1 - w) / 2;
  if ((align === 3) || (align === 6) || (align === 9)) x = base_rect.x1 - w;
  if ((align === 1) || (align === 2) || (align === 3)) y = base_rect.y0;
  if ((align === 4) || (align === 5) || (align === 6)) y = (base_rect.y0 + base_rect.y1 - h) / 2;
  if ((align === 7) || (align === 8) || (align === 9)) y = base_rect.y1 - h;

  var aligned_rect = new OoRect();
  aligned_rect = oo.createOoRectWithXYWH(x + inner_rect.x0, y + inner_rect.y0, w, h);
  return aligned_rect;
};

