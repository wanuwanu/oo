// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoSprite extends OoDrawObject {
  constructor() {
    super();
    this.size = new Oo2DVector(1);
    this.image = null;
  }

  draw(context) {
    if (!this.show) return;

    const ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      const sx = this.size.x * this.scale.x;
      const sy = this.size.y * this.scale.y;
      ctx.save();
      ctx.rotate(this.rotation.z);
      ctx.translate(- sx * 0.5, - sy * 0.5);
      ctx.drawImage(this.image, this.position.x, this.position.y, sx, sy);
      ctx.restore();
    });
  }

  static create(image) {
    const o = new OoSprite();
    if (image instanceof Image) {
      o.image = image;
      o.size.set(image.width, image.height);
    }
    return o;
  }
}