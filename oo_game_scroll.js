// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameScroll {
  constructor() {
    this.touch_pos = new Oo2DVector(0, 0);
    this.pos_delta = [];
    this.pos_delta[0] = new Oo2DVector(0, 0);
    this.pos_delta[1] = new Oo2DVector(0, 0);
    this.velocity = new Oo2DVector(0, 0);
    this.offset = new Oo2DVector(0, 0);
    // スクロール範囲
    this.y_min = 0;
    this.y_max = 1000;
    this.x_min = 0;
    this.x_max = 1000;

    // 範囲外への移動の抵抗力
    this.resistance = 3.0;
    // 離した時の速度減衰率
    this.attenuation = 0.95;
    // 離した時、範囲外での追加の速度減衰率
    this.attenuation_out = 0.95;
    // 範囲外からの復元力
    this.resilience = 0.9;
  }

  update(input) {
    // 押したとき
    if (input.isTouchStart()) {
      this.touch_pos = input.getTouchPosition();
    }
    // 押している間
    if (input.isTouch()) {
      this.pos_delta[1] = this.pos_delta[0];
      this.pos_delta[0] = Oo2DVector.sub(input.getTouchPosition(), this.touch_pos);
      this.touch_pos = input.getTouchPosition();
      this.velocity.x = (this.pos_delta[0].x + this.pos_delta[1].x) * 0.5;
      this.velocity.y = (this.pos_delta[0].y + this.pos_delta[1].y) * 0.5;
    }

    // スクロール位置
    var dx = this.velocity.x;
    var dy = this.velocity.y;
    if ((this.offset.x >= this.x_min) && (this.offset.x + dx <= this.x_min)) dx -= this.x_min - this.offset.x;
    if ((this.offset.x <= this.x_max) && (this.offset.x + dx >= this.x_max)) dx -= this.x_max - this.offset.x;
    if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) dx /= this.resistance;
    if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) dx /= this.resistance;

    if ((this.offset.y >= this.y_min) && (this.offset.y + dy <= this.y_min)) dy -= this.y_min - this.offset.y;
    if ((this.offset.y <= this.y_max) && (this.offset.y + dy >= this.y_max)) dy -= this.y_max - this.offset.y;
    if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) dy /= this.resistance;
    if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) dy /= this.resistance;
    this.offset.x += dx;
    this.offset.y += dy;

    // 離したとき
    if (!input.isTouch()) {
      // 速度減衰
      this.velocity.mulNum(this.attenuation);
      // 範囲外での追加の速度減衰
      if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) this.velocity.y *= this.attenuation_out;
      if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) this.velocity.y *= this.attenuation_out;
      // 範囲外からの復元力
      if (this.offset.x < this.x_min) this.offset.x = (this.offset.x - this.x_min) * this.resilience + this.x_min;
      if (this.offset.x > this.x_max) this.offset.x = (this.offset.x - this.x_max) * this.resilience + this.x_max;
      if (this.offset.y < this.y_min) this.offset.y = (this.offset.y - this.y_min) * this.resilience + this.y_min;
      if (this.offset.y > this.y_max) this.offset.y = (this.offset.y - this.y_max) * this.resilience + this.y_max;
    }

    return this.getOffset();
  }

  getOffset() {
    return this.offset;
  }

}