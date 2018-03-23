// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

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

