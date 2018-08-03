// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.drawPointLightImage = function (target, color_pixel, size, intensity, attenuation_type) {
  var w = target.size.x;
  var h = target.size.y;

  var c = target.size.clone().mul(0.5).sub(0.5);
  var s = size.clone().div(target.size);
  var n = Oo2DVector.create(2, 2).div(target.size);

  var attenuation = function (d2) {
    var d = Math.sqrt(d2);
    var a = 1;
    if (attenuation_type === -1) a = 1 / Math.sqrt(d);
    if (attenuation_type === 1) a = 1 / d;
    if (attenuation_type === 2) a = 1 / d2;
    return a;
  };

  // 周囲(0)と連続にするための減算用定数
  var floor = attenuation(oo.square(Math.min(size.x, size.y) * 0.5));

  var r, g, b, a;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var v = Oo2DVector.create(x, y).sub(c);
      var sv = v.clone().mul(s);

      var fd = floor * v.clone().mul(n).getMagnitude();
      var i = (attenuation(sv.getMagnitudeSquared()) - fd) * intensity;

      r = color_pixel[0] * i;
      g = color_pixel[1] * i;
      b = color_pixel[2] * i;
      a = 255;
      target.setPixel(x, y, [r, g, b, a]);
    }
  }
};

