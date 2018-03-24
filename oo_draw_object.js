// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoDrawObject {
  constructor() {
    this.context = null;
    this.show = true;
    this.position = new Oo3DVector(0);
    this.rotation = new Oo3DVector(0);
    this.scale = new Oo3DVector(1);
    this.alpha = 1;
    this.blend_mode = oo.blendMode.kNormal;
  }
}

