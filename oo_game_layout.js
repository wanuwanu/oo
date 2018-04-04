// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoGameLayoutCell {
  constructor() {
    this.show = true;
    this.name = '';
    this.parent = '';
    this.order = 0;
    this.alpha = 1.0;
    this.align = 0;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.border = false; // tool上での枠線表示

    this.text = '';
    this.fontsize = 0;
    this.color = '#000000';
    this.bold = false;
    this.wrap = false;

    this.image = '';

    // 作業用
    this.img = null;
    this.rect = new OoRect();
  }

  updateRect(layout) {
    if (!this.rect) {
      this.rect = new OoRect();
      this.rect.setXYWH(0, 0, layout.screen_width, layout.screen_height);
    }
    var parent_cell = layout.cell_map.get(this.parent);
    if (parent_cell) {
      var aligned_rect = parent_cell.getAlignedRect(layout);
      if (aligned_rect) this.rect.setRect(aligned_rect);
    }
  }

  getAlignedRect(layout) {
    if (!this.rect) this.updateRect(layout);
    var inner_rect = oo.createOoRectWithXYWH(this.x, this.y, this.w, this.h);
    return oo.getAlignedRect(this.rect, inner_rect, this.align);
  }

  getImageRect() {
    if (this.img) {
      var image_rect = oo.createOoRectWithXYWH(this.x, this.y, this.img.width, this.img.height);
      var r = oo.getAlignedRect(this.rect, image_rect, this.align);
      return r;
    }
  }

  draw(ctx, ofx, ofy) {
    var x = (ofx === undefined) ? 0 : ofx;
    var y = (ofy === undefined) ? 0 : ofy;

    const a = ctx.globalAlpha;
    if (this.alpha < 1.0) ctx.globalAlpha = a * this.alpha;

    if (this.border) {
      var inner_rect = oo.createOoRectWithXYWH(this.x, this.y, this.w, this.h);
      var r = oo.getAlignedRect(this.rect, inner_rect, this.align);
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.strokeRect(r.x0 + x, r.y0 + y, r.getW(), r.getH());
    }

    if (this.img && this.img.width) {
      var image_rect = oo.createOoRectWithXYWH(this.x, this.y, this.img.width, this.img.height);
      r = oo.getAlignedRect(this.rect, image_rect, this.align);
      ctx.drawImage(this.img, r.x0 + x, r.y0 + y);
    }

    if (this.text) {
      var font = '';
      if (this.bold) font += 'bold ';
      font += this.fontsize + 'px ';
      font += " ''";

      ctx.font = font;
      ctx.fillStyle = this.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      var align = oo.clamp(this.align, 1, 9);

      var text_rect = oo.createOoRectWithXYWH(this.x, this.y, 0, 0);
      r = oo.getAlignedRect(this.rect, text_rect, align);

      var text_align = ['left', 'center', 'right'];
      var text_base_line = ['top', 'middle', 'bottom'];

      ctx.textAlign = text_align[(align + 2) % 3];
      ctx.textBaseline = text_base_line[Math.floor((align - 1) / 3)];

      ctx.fillText(this.text, r.x0 + x, r.y0 + y);
    }

    ctx.globalAlpha = a;
  }
}

class OoGameLayout {
  constructor() {
    this.layout_name = '';
    this.image_base_path = '';
    this.display_width = 108;
    this.display_height = 192;
    this.screen_width = 1080;
    this.screen_height = 1920;
    this.cells = [];
    this.cell_map = new Map();
    this.cell_order = [];

    this.offset = new Oo2DVector(0);
    this.context;
  }

  draw(context) {
    const ctx = context || this.context || oo.env.context;

    if (this.cell_order.length === 0) {
      this.cell_order = this.cells.slice();
    }
    for (var cell of this.cell_order) {
      if (!cell.rect) cell.updateRect(this);
      if (cell.show) cell.draw(ctx, this.offset.x, this.offset.y);
    }
  }

  drawCell(name, context) {
    const ctx = context || this.context || oo.env.context;

    const cell = this.getCell(name);
    if (!cell.rect) cell.updateRect(this);
    cell.draw(ctx, this.offset.x, this.offset.y);
  }

  updateCellMap() {
    this.cell_map.clear();
    for (var cell of this.cells) {
      if (cell.name) this.cell_map.set(cell.name, cell);
    }
  }

  // 位置再計算
  updateCoordinate() {
    for (var cell of this.cells) cell.rect = null;
    for (cell of this.cells) cell.updateRect(this);
  }

  // 描画順のソート
  updateOrder() {
    this.cell_order = this.cells.slice();
    oo.sort(this.cell_order, function (a, b) { return (a.order > b.order) ? 1 : 0; });
  }

  getCell(name) {
    return this.cell_map.get(name);
  }

  getCellImage(name) {
    return this.cell_map.get(name).img;
  }

  loadJson(text) {
    var obj = JSON.parse(text);
    this.loadJsonObj(obj);
  }

  loadJsonObj(obj) {
    this.layout_name = obj.layout_name;
    this.image_base_path = obj.image_base_path;
    this.display_width = obj.display_width;
    this.display_height = obj.display_height;
    this.screen_width = obj.screen_width;
    this.screen_height = obj.screen_height;

    for (var x of obj.cells) {
      var cell = new OoGameLayoutCell();
      Object.assign(cell, x);
      this.cells.push(cell);
    }

    this.updateCellMap();
    this.updateCoordinate();
    this.updateOrder();
  }

  asyncLoadImage(proceeder) {
    var self = this;

    oo.parallel(function* (p) {
      for (var cell of self.cells) {
        if (cell['image']) {
          let path_name = oo.addPath(self.image_base_path, cell['image']);
          cell.img = oo.asyncCreateImage(p, path_name);
          yield;
        }
      }
    }, proceeder);
  }

  asyncSetupFromFile(proceed, layout_file) {
    var self = this;

    oo.serial(function* (p) {
      var obj = oo.asyncLoadText(p, layout_file);
      yield;
      self.loadJson(obj.text);
      self.asyncLoadImage(p);
      yield;
    }, proceed);
  }
}
