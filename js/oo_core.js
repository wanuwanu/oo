// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.debug_log = false;
oo.env.main_proc = null;
oo.env.sample_text = 'The quick brown fox jumps over the lazy dog.';

oo.isObject = function (obj) { return (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj); };
oo.isArray = function (obj) { return Array.isArray(obj); };
oo.isFunction = function (obj) { return typeof obj === 'function'; };
oo.qq = function (v, value) { return (v !== void 0) ? v : value; };
oo.xx = function (func, ...args) { func && func(...args); };

// ex.
// oo.each(array, 'method');
// oo.each(array, 'method', arg);
// oo.each(array, (e, i, a) => { });
oo.each = function (array, func, ...args) {
  if (!Array.isArray(array)) return;
  if (typeof func === 'string') {
    for (var x of array) x[func].apply(x, args);
  }
  if (typeof func === 'function') {
    for (var i = 0; i < array.length; i++) func.call({}, array[i], i, array);
  }
};

oo.repeat = function (n, func) {
  for (var i = 0; i < n; i++) func(i);
};

oo.find = function (value, array) {
  return (array.indexOf(value) >= 0) ? true : false;
};

oo.clone = function (obj) {
  return Object.assign({}, obj);
};

oo.deepClone = function (obj) {
  if (typeof obj !== 'object') return obj;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    var array = [];
    for (var x of obj) array.push(oo.deepClone(x));
    return array;
  } else {
    var object = {};
    var key_array = Object.keys(obj);
    for (var key of key_array) object[key] = oo.deepClone(obj[key]);
    return object;
  }
};

oo.main = function (main_proc) {
  oo.env.main_proc = main_proc;
  document.addEventListener('DOMContentLoaded', function () {
    main_proc();
  }, false);
};

