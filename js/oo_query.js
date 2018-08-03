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
  // $('#id', element, element, ...);

  // create element(node)
  // ('@text')
  // ('tag')
  // ({ tag, id, property, style })

  var $ = function (...args) {
    if (args.length === 0) return null;
    var element = $getElement(args[0]);
    if (element) {
      for (var i = 1; i < args.length; i++) {
        var child = $getElement(args[i]);
        if (child) element = element.appendChild(child);
      }
    }
    return element;
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

