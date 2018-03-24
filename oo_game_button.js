// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameButton {
  constructor(name, x, y, w, h, image) {
    this.name = name;
    this.enable = true;
    this.position = new Oo2DVector(x, y);
    this.size = new Oo2DVector(w, h);
    this.image = image;

    this.anime_times = 30;
    this.anime_counter = -1;
    this.anime_completion = null;

    this.anime_scale = new Oo2DVector(1);
    this.anime_overwrite_effect = false;
    this.anime_overwrite_alpha = 0;

    this.anime_effect_func = {};
    this.anime_effect_func['pop'] = this.animePop;
    this.anime_effect_func['push'] = this.animePush;
    this.anime_effect_func['light'] = this.animeLight;
    this.anime_effect = new Set();
  }

  // プリセットアニメ
  // 継承先で変更する
  animePop() {
    this.anime_scale.x = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.0, 0.1));
    this.anime_scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.0, 0.1));
  }

  animePush() {
    this.anime_scale.x = Math.pow(2.0, - oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.5, 0.1));
    this.anime_scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.5, 0.2));
  }

  animeLight() {
    this.anime_overwrite_effect = true;
    this.blend_mode = oo.blendMode.kAdd;
    this.anime_overwrite_alpha = oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 0.5, 0.5);
  }

  isInside(position) {
    var dx = this.position.x - position.x;
    var dy = this.position.y - position.y;
    if (Math.abs(dx) > this.size.x * 0.5) return false;
    if (Math.abs(dy) > this.size.y * 0.5) return false;
    return true;
  }

  // effect_type : 'pop', 'push', 'light'
  startAnime(effect_type) {
    this.anime_counter = 0;
    this.anime_effect.add(effect_type);
  }

  update() {
    if (this.anime_counter >= 0) {
      for (const name of this.anime_effect) this.anime_effect_func[name].call(this);

      this.anime_counter++;
      if (this.anime_counter >= this.anime_times) {
        if (this.anime_completion) this.anime_completion();
        this.anime_effect.clear();
        this.anime_counter = -1;
        this.anime_overwrite_effect = false;
        this.anime_overwrite_alpha = 0;
        this.anime_scale.set(1, 1);
      }
    }
  }

  draw(context) {

    const local_draw = () => {
      context.drawImage(
        this.image,
        this.position.x - this.size.x * 0.5 * this.anime_scale.x,
        this.position.y - this.size.y * 0.5 * this.anime_scale.y,
        this.size.x * this.anime_scale.x,
        this.size.y * this.anime_scale.y
      );
    };

    local_draw();

    if (this.anime_overwrite_effect) {
      oo.localAlpha(context, this.anime_overwrite_alpha, () => {
        const co = oo.getCompositeOperationByBlendMode(this.blend_mode);
        oo.localComposite(context, co, () => {
          local_draw();
        });
      });
    }
  }
}

