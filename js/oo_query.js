// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo._$ = oo._$ || {};
oo._$._elements = {};
oo._$._getElement = function (obj) {
  if (!obj) return null;
  if (typeof obj === 'string') {
    if (obj.charAt(0) === '#') {
      const id = obj.substr(1);
      return document.getElementById(id) || oo._$._elements[id];
    }
    return document.createElement(obj);
  }
  if (typeof obj === 'object') {
    if (obj instanceof Node) return obj;
    if (obj.tag) {
      const element = document.createElement(obj.tag);
      if (element) {
        const key_array = Object.keys(obj);
        for (let key of key_array) {
          if (key !== 'tag' && key !== 'style') element[key] = obj[key];
          if (key === 'style') Object.assign(element.style, obj.style);
        }
        if (element.id) oo._$._elements[element.id] = element;
        return element;
      }
    }
  }
  return null;
};

//
// oo.$
// get element by id
// $('#id');
//
// create element
// $('div');
// $({tag:'div', ...});
//
// append child elements
// $('#id', element1, element2, ...);
// $('#id', $(element1, $(element2, ...)));
//
// create text node
// $('#id', 'text');
//
oo.$ = function (...args) {
  if (args.length === 0) return null;
  const parent = oo._$._getElement(args[0]);
  if (!parent) return null;
  for (let i = 1; i < args.length; i++) {
    if (typeof args[i] === 'string') {
      parent.appendChild(document.createTextNode(args[i]));
    } else {
      parent.appendChild(oo._$._getElement(args[i]));
    }
  }
  return parent;
};

