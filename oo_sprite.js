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
      if (this.rotation.z === 0) {
        ctx.drawImage(this.image, this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
      } else {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation.z);
        ctx.drawImage(this.image, - sx * 0.5, - sy * 0.5, sx, sy);
        ctx.restore();
      }
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
