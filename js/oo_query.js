// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

// setup oo query
// var $ = oo.$();

oo.$ = function () {
  var $elements = {};

  // get element by id
  // $('#id')

  // append child elements(nodes)
  // $('#id', element1, element2, ...);
  // #id - element1 - element2 - ...

  // append child elements(nodes)
  // $('#id', [element1, element2, ...]);
  // #id -+- element1
  //      +- element2
  //      +- ...

  // create element(node)
  // ('@text')
  // ('tag')
  // ({ tag, id, property, style })

  var $ = function (...args) {
    if (args.length === 0) return null;
    var root = $getElement(args[0]);
    if (root) {
      var element = root;
      for (var i = 1; i < args.length; i++) {
        var child = null;
        var a = args[i];
        if (Array.isArray(a)) {
          for (var j = 0; j < a.length; j++) {
            child = $getElement(a[j]);
            if (child) element.appendChild(child);
          }
        } else {
          child = $getElement(a);
          if (child) element = element.appendChild(child);
        }
      }
    }
    return root;
  };

  var $getElement = function (obj) {
    if (!obj) return null;

    if (typeof obj === 'string') {
      if (obj.charAt(0) === '#') {
        var id = obj.substr(1);
        return document.getElementById(id) || $elements[id];
      }
      if (obj.charAt(0) === '@') {
        return document.createTextNode(obj.substr(1));
      }
      return document.createElement(obj);
    }

    if (typeof obj === 'object') {
      if (obj instanceof Node) return obj;
      if (obj.tag) {
        var element = document.createElement(obj.tag);
        if (element) {
          if (obj.property) Object.assign(element, obj.property);
          if (obj.style) Object.assign(element.style, obj.style);
          if (obj.id) element.id = obj.id;
          if (element.id) $elements[element.id] = element;
          return element;
        }
      }
    }
    return null;
  };

  return $;
};

