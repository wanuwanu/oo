// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.gameSceneStatus = {
  kInactive: 0,
  kActive: 1,
  kStart: 2,
  kEnd: 3,
};

class OoGameScene {
  constructor() {
    this.frame = null;
    this.name = '';
    this.scene_status = oo.gameSceneStatus.kInactive;
    this.next_scene = '';
    this.scene_end = false;
    this.fade_times = 60;
    this.fade_counter = 0;
    this.fade_alpha = 0.0;
  }

  create() {
    this.scene_end = false;
  }
  release() { }

  update() { }
  render() { }

  changeSceneOnFadeOut() {
    if (this.next_scene === '') return;
    this.frame.endScene(this.name);
    this.frame.startScene(this.next_scene);
  }

  fadeIn() {
    this.fade_counter = - this.fade_times;
    this.setFadeAlpha();
  }

  fadeOut() {
    this.fade_counter = 1;
    this.setFadeAlpha();
  }

  setFadeAlpha() {
    this.fade_alpha = Math.abs(this.fade_counter / this.fade_times);
    if (this.fade_alpha < 0.0) this.fade_alpha = 0;
    if (this.fade_alpha > 1.0) this.fade_alpha = 1.0;
  }

  updateFade() {
    this.setFadeAlpha();
    if (this.fade_counter !== 0) this.fade_counter++;
    if (this.fade_counter === this.fade_times + 2) this.changeSceneOnFadeOut();
  }

  renderFade() {
    this.frame.canvas.style.opacity = 1.0 - this.fade_alpha;
  }
}
