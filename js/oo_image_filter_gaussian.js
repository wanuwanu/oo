// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.filterGaussian = function (dst, src, sigma) {
  oo.filterGaussianHorizontal(dst, src, sigma);
  oo.filterGaussianVertical(dst, dst, sigma);
};

oo.filterGaussian_createWeightList = function (n, sigma) {
  var a = oo.array(n, 0);
  if (n) {
    if (sigma === 0) {
      a[0] = 1;
    } else {
      for (let i = 0; i < n; i++) a[i] = Math.exp(- i * i / (2 * sigma * sigma));
    }
  }
  return a;
};

oo.filterGaussian_createWeightSumList = function (weight_list, r) {
  var n = weight_list.length;
  var a = oo.array(n, 0);
  for (let i = 0; i < n; i++) {
    let i0 = Math.max(0, i - r);
    let i1 = Math.min(n, i + r + 1);
    for (let j = i0; j < i1; j++) a[j] += weight_list[Math.abs(i - j)];
  }
  return a;
};

oo.filterGaussianHorizontal = function (dst, src, sigma) {
  let w = src.size.x;
  let h = src.size.y;
  let k = oo.filterGaussian_createWeightList(w, sigma);
  let r = 0; // 有効距離(これ以上の距離では計算を行わない)
  for (let i = 0; i < w; i++) {
    if (k[i] >= (1 / 256) / w) r = i;
  }
  let s = oo.filterGaussian_createWeightSumList(k, r);
  // 作業バッファ
  let v = new Array(w * 4);
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < w * 4; i++) v[i] = 0;
    for (let x = 0; x < w; x++) {
      let p = src.getPixel(x, y);
      let x0 = Math.max(0, x - r);
      let x1 = Math.min(w, x + r + 1);
      for (let i = x0; i < x1; i++) {
        let t = k[Math.abs(x - i)];
        for (let j = 0; j < 4; j++) v[i * 4 + j] += p[j] * t;
      }
    }
    for (let x = 0; x < w; x++) {
      for (let i = 0; i < 4; i++) v[x * 4 + i] /= s[x];
      dst.setPixel(x, y, v.slice(x * 4, x * 4 + 4));
    }
  }
};

oo.filterGaussianVertical = function (dst, src, sigma) {
  let w = src.size.x;
  let h = src.size.y;
  let k = oo.filterGaussian_createWeightList(h, sigma);
  let r = 0; // 有効距離(これ以上の距離では計算を行わない)
  for (let i = 0; i < h; i++) {
    if (k[i] >= (1 / 256) / h) r = i;
  }
  let s = oo.filterGaussian_createWeightSumList(k, r);
  // 作業バッファ
  let v = new Array(h * 4);
  for (let x = 0; x < w; x++) {
    for (let i = 0; i < h * 4; i++) v[i] = 0;
    for (let y = 0; y < h; y++) {
      let p = src.getPixel(x, y);
      let y0 = Math.max(0, y - r);
      let y1 = Math.min(h, y + r + 1);
      for (let i = y0; i < y1; i++) {
        let t = k[Math.abs(y - i)];
        for (let j = 0; j < 4; j++) v[i * 4 + j] += p[j] * t;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let i = 0; i < 4; i++) v[y * 4 + i] /= s[y];
      dst.setPixel(x, y, v.slice(y * 4, y * 4 + 4));
    }
  }
};
