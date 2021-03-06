// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoTile extends OoDrawObject {
  constructor(color, width, height) {
    super();
    this.size = new Oo2DVector(1, 1);
    this.color = color || '#ffffff';
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      var sx = this.size.x * this.scale.x;
      var sy = this.size.y * this.scale.y;
      ctx.fillStyle = this.color;
      if (this.rotation.z === 0) {
        ctx.fillRect(this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
      } else {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation.z);
        ctx.fillRect(- sx * 0.5, - sy * 0.5, sx, sy);
        ctx.restore();
      }
    });
  }

  static create(color, width, height) {
    var o = new OoTile();
    o.color = color;
    o.size.set(width, height);
    return o;
  }
}
