// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};

oo.getArrayDiff = function (array1, array2) {
  var diff = [];
  for (let x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (let x of array2) {
    if (array1.indexOf(x) === -1) diff.push(x);
  }
  return diff;
};

oo.setupLogEnv = function () {
  var div = null;
  oo.log = function (...args) {
    // console
    console.log.apply(null, args);
    // dom
    if (div === null) {
      if (document.body) {
        div = document.createElement('div');
        document.body.appendChild(div);
      }
    }

    if (div) {
      for (var arg of args) {
        if (typeof arg === 'string') {
          div.innerHTML += arg;
        } else {
          if (typeof arg === 'object') {
            div.innerHTML += arg.constructor.name;
          }
          div.innerHTML += JSON.stringify(arg);
        }
      }
      div.innerHTML += '<br>';
    }
  };
};

oo.log = function (...args) {
  console.log.apply(null, args);
};

oo.appendScript = function (script_array, completion) {
  var array = script_array.slice();
  (function appendScriptCore() {
    var script = document.createElement('script');
    script.src = array.shift();
    script.onload = array.length ? appendScriptCore : completion;
    document.body.appendChild(script);
  }());
};

// 要素のdatasetの値を取得する
oo.getDataset = function (id, name) {
  var element = document.getElementById(id);
  if (element) return element.dataset[name];
};

oo.strReplace = function (src, before, after) {
  return src.split(before).join(after);
};

oo.strToInt = function (s) {
  // forbid octal integer
  var n = 0;
  if (s.substr(0, 2) === '0x' || s.substr(0, 2) === '0X') {
    n = Number.parseInt(s, 16);
  } else {
    n = Number.parseInt(s, 10);
  }
  return (Number.isInteger(n)) ? n : 0;
};

oo.dup = function (str, n) {
  var result = '';
  for (var i = 0; i < n; i++) result += str;
  return result;

  // var result = '';
  // oo.repeat(n, () => { result += str; });
  // return result;
};

oo.zeroPadding = function (num, length) {
  // Number.MAX_SAFE_INTEGER = 9007199254740991
  return ('00000000000000000000' + num).slice(- length);
};

// #rrggbb形式のカラー
oo.rgbColor = function (r, g, b) {
  var rgb = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  return '#' + ('000000' + rgb.toString(16)).slice(- 6);
};

oo.createImageFromFile = function (file) {
  var img = new Image();
  img.src = file;
  return img;
};

// 配列の要素の交換
oo.arraySwap = function (array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
};

oo.urlSearchParams = function (params) {
  var map = new Map();
  var array = params.split('&');
  for (var item of array) {
    var kv = item.split('=');
    if (kv.length === 1) map.set(kv[0], '');
    if (kv.length === 2) map.set(kv[0], kv[1]);
  }
  return map;
};