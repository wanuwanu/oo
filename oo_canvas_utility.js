// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.context = null;

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

