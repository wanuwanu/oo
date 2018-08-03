// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.debug_log = false;

oo.qq = function (v, value) { return (v !== void 0) ? v : value; };
oo.isObject = function (obj) { return (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj); };

// ex.
// oo.each(array, 'method');
// oo.each(array, 'method', arg);
// oo.each(array, (e, i, a) => { });
oo.each = function (array, func, ...args) {
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

oo.setupQuery = function () {
  var $elements = {};

  var $ = function (tag, args, style) {
    // get element by id
    // ex.
    // ('#id')
    var element;
    if (tag.charAt(0) === '#') {
      var id = tag.substr(1);
      element = document.getElementById(id);
      return element ? element : ($elements[id] ? $elements[id] : null);
    }
    // create & append
    // ex.
    // ('@text')
    // ('tag')
    // ('tag', 'id')
    // ('tag', 'id', style)
    // ('tag', {property, style})
    if (tag.charAt(0) === '@') {
      return document.createTextNode(tag.substr(1));
    } else {
      element = document.createElement(tag);
      if (typeof args !== 'undefined') {
        if (typeof args === 'string') {
          if (args) $elements[element.id = args] = element;
          if (oo.isObject(style)) Object.assign(element.style, style);
        } else {
          if (oo.isObject(args.property)) Object.assign(element, args.property);
          if (oo.isObject(args.style)) Object.assign(element.style, args.style);
          if (element.id) $elements[element.id] = element;
        }
      }
      return element;
    }
  };

  Node.prototype.$ = function (tag, id, style) {
    return this.appendChild($(tag, id, style));
  };

  return $;
};

oo.main = function (main_proc) {
  document.addEventListener('DOMContentLoaded', function () {
    main_proc();
  }, false);
};

