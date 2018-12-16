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
    this.linefeed_space = line_space || 0;
    this.wordwrap_space = line_space || 0;
    this.align = align || 0;

    this.content_height = 0;
    this.row = [];
    this.context = null;

    this.line_head_japanese_hyphenation = false;
    this.line_head_japanese_hyphenation_characters = '、。';
  }

  setRect(rect) {
    this.position = new Oo2DVector(rect.x + rect.w * 0.5, rect.y + rect.h * 0.5);
    this.size = new Oo2DVector(rect.w, rect.h);
  }

  _setTextAttributes(ctx) {
    oo.setTextAttributes(ctx, this.font_size, this.color, 'left', 'top');
  }

  createRow(context) {
    var ctx = context || this.context || oo.env.context;

    this._setTextAttributes(ctx);

    var t = { text: '', width: 0, line_space: 0 };

    this.row = [oo.clone(t)];

    [...this.text].forEach(c => {
      var last = this.row.length - 1;
      if (c === '\n') {
        this.row[last].line_space = this.linefeed_space;
        this.row.push(oo.clone(t));
      } else {
        var w = ctx.measureText(this.row[last].text + c).width;

        // 行頭禁則文字チェック
        var lhjh = false;
        if (this.line_head_japanese_hyphenation) {
          if(this.line_head_japanese_hyphenation_characters.indexOf(c) >= 0){
            lhjh = true;
          }
        }

        if (w > this.size.x && !lhjh) {
          this.row[last].line_space = this.wordwrap_space;
          this.row.push({ text: c, width: ctx.measureText(c).width, line_space: 0 });
        } else {
          this.row[last].text += c;
          this.row[last].width = w;
        }
      }
    });

    this.content_height = 0;
    this.row.forEach(e => {
      this.content_height += this.font_size;
      this.content_height += e.line_space;
    });
  }

  flush() {
    this.row = [];
  }

  getContentHeight() {
    return this.content_height;
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      var sx = this.size.x * this.scale.x;
      var sy = this.size.y * this.scale.y;

      if (this.row.length === 0) this.createRow(ctx);

      this._setTextAttributes(ctx);

      var y = oo.alignY(this.align, this.size.y - this.content_height);

      this.row.forEach(e => {
        var x = oo.alignX(this.align, this.size.x - e.width);
        ctx.fillText(e.text, this.position.x + x - sx * 0.5, this.position.y + y - sy * 0.5);
        y += this.font_size + e.line_space;
      });

    });
  }
}

