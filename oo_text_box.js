// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoTextBox extends OoDrawObject {
  constructor(text, font_size, line_space, color, x, y, w, h, align) {
    super();
    this.size = new Oo2DVector(w || 0, h || 0);
    this.position = Oo2DVector.create(x || 0, y || 0).add(this.size.clone().mul(0.5));
    this.color = color || '#000000';
    this.text = text || '';
    this.font_size = font_size || 0;
    this.line_space = line_space || 0;
    this.align = align || 0;
    this.row = [];
    this.row_width = [];
    this.context = null;
  }

  setRect(rect) {
    this.position = new Oo2DVector(rect.x + rect.w * 0.5, rect.y + rect.h * 0.5);
    this.size = new Oo2DVector(rect.w, rect.h);
  }

  createRow(context) {
    const ctx = context || this.context || oo.env.context;

    this.row = [''];

    for (let i = 0; i < this.text.length; i++) {
      var c = this.text.charAt(i);
      if (c === '\n' || ctx.measureText(this.row[this.row.length - 1] + c).width > this.size.x) this.row.push('');
      if (c !== '\n') this.row[this.row.length - 1] += c;
    }

    for (let i = 0; i < this.row.length; i++) {
      this.row_width[i] = ctx.measureText(this.row[i]).width;
    }
  }

  flush() {
    this.row = [];
  }

  draw(context) {
    if (!this.show) return;

    const ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      const sx = this.size.x * this.scale.x;
      const sy = this.size.y * this.scale.y;

      oo.setTextAttributes(ctx, this.font_size, this.color, 'left', 'top');

      if (this.row.length === 0) this.createRow(ctx);

      var h = this.font_size * this.row.length;
      h += this.line_space * (this.row.length - 1);

      var y = oo.alignY(this.align, this.size.y - h);

      for (var i = 0; i < this.row.length; i++) {
        var x = oo.alignX(this.align, this.size.x - this.row_width[i]);
        ctx.fillText(this.row[i], this.position.x + x - sx * 0.5, this.position.y + y - sy * 0.5);
        y += this.font_size + this.line_space;
      }

    });
  }
}

