// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.kPi = 3.14159265358979323846; // Pi
oo.k2Pi = 6.28318530717958647692; // 2 * Pi
oo.kPi2 = 1.57079632679489661923; // Pi / 2
oo.kInvPi = 0.31830988618379067153; // 1 / Pi
oo.kDeg2Rad = 0.01745329251994329576; // Degrees to Radians
oo.kRad2Deg = 57.29577951308232087679; // Radians to Degrees
oo.kE = 2.718281828459045235360287471352;  // e

oo.clamp = function (x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
};

oo.lerp = function (v0, v1, alpha) {
  return (1.0 - alpha) * v0 + alpha * v1;
};

oo.saturate = function (x) {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
};

oo.linearStep = function (v0, v1, v) {
  if (v0 === v1) return 0.0;
  return oo.saturate((v - v0) / (v1 - v0));
};

oo.smoothStep = function (v0, v1, v) {
  var x = oo.linearStep(v0, v1, v);
  return x * x * (3 - 2 * x);
};

// 標準シグモイド関数
oo.sigmoid = function (x) {
  return 1.0 / (1.0 + Math.exp(- x));
};

// シグモイド関数の区間[-a,a]を利用した補間パラメータ
// [-a,a]の範囲が、xの範囲[0,1]になり、0.0～1.0を返す
// aは1以上を指定(6程度が通常、1では線形補間に近くなる)
oo.sigmoidStep = function (x, a) {
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;

  var t = 2.0 * x - 1.0;
  var s = 1.0 / (1.0 + Math.exp(- t * a));

  var ea = Math.exp(- a);
  var k = (1.0 + ea) / (1 - ea);

  return k * (s - 0.5) + 0.5;
};

// 正弦波の区間[-π/2, π/2]のカーブを利用した補間パラメータ
oo.sineStep = function (x) {
  return 0.5 - Math.cos(x * Math.PI) * 0.5;
};

oo.attenuatedSineWave = function (t, t0, t1, frequency, amplitude) {
  var a = 1.0 - t / (t1 - t0);
  var x = frequency * oo.k2Pi * t / (t1 - t0);
  var y = a * Math.sin(x) * amplitude;
  return y;
};

