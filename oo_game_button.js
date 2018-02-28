// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameButton {
  constructor(name, x, y, w, h, image) {
    this.name = name;
    this.enable = true;
    this.position = new Oo2DVector(x, y);
    this.size = new Oo2DVector(w, h);
    this.image = new Image();
    this.image.src = image;
  }

  isInside(position) {
    var dx = this.position.x - position.x;
    var dy = this.position.y - position.y;
    if (Math.abs(dx) > this.size.x * 0.5) return false;
    if (Math.abs(dy) > this.size.y * 0.5) return false;
    return true;
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.position.x - this.size.x * 0.5,
      this.position.y - this.size.y * 0.5,
      this.size.x,
      this.size.y
    );
  }
}

