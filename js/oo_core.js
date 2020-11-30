// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.copyright = 'OoLibrary Copyright (c) wanu@nyagoya';
oo.env = oo.env || {};
oo.env.debug_log = false;
oo.env.sample_text = 'The quick brown fox jumps over the lazy dog.';

oo.isObject = obj => { return (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj); };
oo.isArray = obj => { return Array.isArray(obj); };
oo.isFunction = obj => { return typeof obj === 'function'; };
oo.isString = obj => { return typeof obj === 'string'; };
oo.qq = (v, value) => { return (v !== void 0) ? v : value; };
oo.xx = (func, ...args) => { func && func(...args); };
oo.array = (n, v) => { return (new Array(n)).fill(v); };
oo.arrayMap = (n, callback) => { return (new Array(n)).fill().map((e, i, a) => callback(e, i, a)); };

// ex.
// oo.each(array, 'method');
// oo.each(array, 'method', arg);
// oo.each(array, (e, i, a) => { });
oo.each = (array, func, ...args) => {
  if (!Array.isArray(array)) return;
  oo.isString(func) && array.forEach(e => e[func](...args));
  oo.isFunction(func) && array.forEach((e, i, a) => func(e, i, a));
};

oo.repeat = (n, func) => { for (var i = 0; i < n; i++) func(i); };

// ES2016: array.includes(value)
oo.find = (value, array) => { return (array.indexOf(value) >= 0) ? true : false; };

oo.clone = obj => { return Object.assign({}, obj); };

oo.deepClone = obj => {
  if (typeof obj !== 'object') return obj;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(x => oo.deepClone(x));
  return Object.fromEntries(Object.entries(obj).map(x => [x[0], oo.deepClone(x[1])]));
};

oo.main = callback => {
  const oo_env = { main: callback };
  if (document.currentScript) {
    document.currentScript.oo_env = oo_env;
    oo_env.src = document.currentScript.src;
  }
  document.addEventListener('DOMContentLoaded', () => {
    callback(oo_env);
  }, false);
};

