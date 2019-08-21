// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.patternGaussian = function (target, color_pixel, radius, intensity, sigma) {
  var w = target.size.x;
  var h = target.size.y;
  oo.generateGaussianDistribution(w, h, radius, sigma, true, (x, y, value) => {
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
// sigma σの値
// adjust_base_line 周囲(0)と連続にするための減算を適用
oo.generateGaussianDistribution = function (width, height, radius, sigma, adjust_base_line, output) {
  // 中心位置
  var cx = width * 0.5 - 0.5;
  var cy = height * 0.5 - 0.5;
  // 距離正規化係数
  var normalizer = 2 / Math.min(width, height);
  // 定数
  var s = 1 / (2 * sigma * sigma);
  var k = 1 / Math.sqrt(2 * Math.PI * sigma * sigma);
  var r2 = radius * radius;
  // 周囲(0)と連続にするための減算用定数
  var base_line = 0;
  if (adjust_base_line) base_line = k * Math.exp(- r2 * s);
  // 二次元分布生成
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      var vx = (x - cx) * normalizer;
      var vy = (y - cy) * normalizer;
      var d2 = vx * vx + vy * vy;
      var value = k * Math.exp(- d2 * r2 * s) - base_line;
      output(x, y, value);
    }
  }
};

