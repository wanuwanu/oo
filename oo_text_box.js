// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoTextBox extends OoDrawObject {
  constructor(context, text, font_size, line_space, color, x, y, w, h, align) {
    super();
    this.position = new Oo2DVector(x, y);
    this.size = new Oo2DVector(w, h);
    this.color = color || '#ffffff';
    this.text = text || '';
    this.font_size = font_size || 1;
    this.line_space = line_space || 0;
    this.align = align || 0;
    this.row = [''];
    this.row_width = [0];
    this.context = context || null;

    const ctx = this.context || oo.env.context;
    if (ctx) this.setText(ctx, this.text);
  }

  setText(context, text) {
    const ctx = context || this.context || oo.env.context;

    this.text = text || '';

    oo.setTextAttributes(ctx, this.font_size, this.color, 'left', 'top');

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

  draw(context) {
    if (!this.show) return;

    const ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {

      oo.setTextAttributes(ctx, this.font_size, this.color, 'left', 'top');

      var total_height = this.font_size * this.row.length;
      total_height += this.line_space * (this.row.length - 1);
      var dh = this.size.y - total_height;

      var y = dh * Math.floor((this.align % 10 - 1) / 3) / 2; // see oo.alignedRect

      for (var i = 0; i < this.row.length; i++) {
        var dw = this.size.x - this.row_width[i];
        var x = dw * ((this.align + 2) % 3) / 2; // see oo.alignedRect
        ctx.fillText(this.row[i], this.position.x + x, this.position.y + y);
        y += this.font_size + this.line_space;
      }

    });
  }
}

