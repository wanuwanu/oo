// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameAnime {
  constructor() {
    this.times = 30;
    this.counter = -1;

    this.effects = new Set();
    this.overwrite_effect = false;
    this.overwrite_alpha = 0;
    this.overwrite_blend_mode = oo.blendMode.kNormal;
    this.tile_effect = false;
    this.tile_alpha = 0;
    this.tile_color = '#000000';
    this.scale = new Oo2DVector(1, 1);
  }

  init() {
    this.counter = -1;
    this.effects.clear();
    this.overwrite_effect = false;
    this.overwrite_alpha = 0;
    this.overwrite_blend_mode = oo.blendMode.kNormal;
    this.tile_effect = false;
    this.tile_alpha = 0;
    this.scale.set(1, 1);
  }

  start(effect_type) {
    this.counter = 0;
    this.effects.add(effect_type);
  }

  onCompletion() { }

  update() {
    if (this.counter >= 0) {
      for (var name of this.effects) this[name].call(this);

      this.counter++;
      if (this.counter >= this.times) {
        this.onCompletion();
        this.init();
      }
    }
  }

  pop() {
    this.scale.x = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.0, 0.1));
    this.scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.0, 0.1));
  }

  push() {
    this.scale.x = Math.pow(2.0, - oo.attenuatedSineWave(this.counter, 0, this.times, 1.5, 0.1));
    this.scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.5, 0.2));
  }

  add() {
    this.overwrite_effect = true;
    this.overwrite_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
    this.overwrite_blend_mode = oo.blendMode.kAdd;
  }

  mul() {
    this.overwrite_effect = true;
    this.overwrite_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
    this.overwrite_blend_mode = oo.blendMode.kMul;
  }

  tile() {
    this.tile_effect = true;
    this.tile_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
  }

  light() { this.add(); }
  dark() { this.mul(); }
}
