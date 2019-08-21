// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};


// attenuation factor : 1 / pow(r, afp)
oo.patternLightSpot = function (target, color_pixel, radius, intensity, afp) {
  var w = target.size.x;
  var h = target.size.y;
  oo.generateLightSpot(w, h, radius, afp, true, (x, y, value) => {
    var r = color_pixel[0] * intensity * value;
    var g = color_pixel[1] * intensity * value;
    var b = color_pixel[2] * intensity * value;
    var a = color_pixel[3];
    target.setPixel(x, y, [r, g, b, a]);
  });
};

// width
// height
// radius 分布の半径サイズ
// attenuation factor : 1 / pow(r, afp)
// adjust_base_line 周囲(0)と連続にするための減算を適用
oo.generateLightSpot = function (width, height, radius, afp, adjust_base_line, output) {
  // 中心位置
  var cx = width * 0.5 - 0.5;
  var cy = height * 0.5 - 0.5;
  // 正規化係数
  var normalizer = 2 / Math.min(width, height);
  // 周囲(0)と連続にするための減算用定数
  var base_line = 0;
  if (adjust_base_line) base_line = 1 / Math.pow(radius, afp);
  // 二次元分布生成
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var vx = (x - cx) * normalizer;
      var vy = (y - cy) * normalizer;
      var d = Math.sqrt(vx * vx + vy * vy);
      var value = 1 / Math.pow(radius * d, afp) - base_line * d;
      output(x, y, value);
    }
  }
};
