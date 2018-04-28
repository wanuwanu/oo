// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.context = null;
oo.env.font_family = "'Hiragino Kaku Gothic ProN', 'sans-serif'";

oo.blendMode = {
  kNormal: 0,
  kScreen: 1,
  kAdd: 2,
  kMul: 3,
};

oo.getCompositeOperationByBlendMode = function (blend_mode) {
  let operation = 'source-over';
  if (blend_mode === oo.blendMode.kScreen) operation = 'screen';
  if (blend_mode === oo.blendMode.kAdd) operation = 'lighter';
  if (blend_mode === oo.blendMode.kMul) operation = 'multiply';
  return operation;
};

oo.localAlpha = function (context, alpha, func) {
  if (alpha === 0) return;
  if (alpha === 1) return func();
  const a = context.globalAlpha;
  context.globalAlpha = a * alpha;
  func();
  context.globalAlpha = a;
};

oo.localComposite = function (context, composite_operation, func) {
  const co = context.globalCompositeOperation;
  context.globalCompositeOperation = composite_operation;
  func();
  context.globalCompositeOperation = co;
};

oo.drawImage = function (context, image, x, y, w, h) {
  if (!image) return;
  var iw = w || image.width;
  var ih = h || image.height;
  context.drawImage(image, x, y, iw, ih);
};

oo.drawImageCenter = function (context, image, x, y, w, h) {
  if (!image) return;
  var iw = w || image.width;
  var ih = h || image.height;
  context.drawImage(image, x - iw * 0.5, y - ih * 0.5, iw, ih);
};

// 可変枠の描画(縦横の中心2x2ドットが可変サイズとなる中部分)
oo.drawFrameImage = function (context, image, x, y, w, h) {
  if (!image) return;
  var mx = (image.width - 2) / 2;
  var my = (image.height - 2) / 2;

  var sx = [0, mx, mx + 2];
  var sy = [0, my, my + 2];
  var sw = [mx, 2, mx];
  var sh = [my, 2, my];

  var dx = [x, x + mx, x + w - mx];
  var dy = [y, y + my, y + h - my];
  var dw = [mx, w - mx * 2, mx];
  var dh = [my, h - my * 2, my];

  for (var j = 0; j < 3; j++) {
    for (var i = 0; i < 3; i++) {
      context.drawImage(image, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]);
    }
  }
};

oo.drawRoundRect = function (context, x, y, w, h, radius, fill, stroke) {
  var r = (radius === void 0) ? 5 : radius;
  if (stroke === void 0) stroke = true;

  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();

  if (fill) context.fill();
  if (stroke) context.stroke();
};

oo.setTextAttributes = function (context, fontSize, fillStyle, textAlign, textBaseline) {
  context.font = `${fontSize}px ` + oo.env.font_family;
  context.fillStyle = fillStyle;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
};
