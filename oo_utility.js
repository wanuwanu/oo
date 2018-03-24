// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};

oo.getArrayDiff = function (array1, array2) {
  const diff = [];
  for (const x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (const x of array2) {
    if (array1.indexOf(x) === -1) diff.push(x);
  }
  return diff;
};

oo.setupLogEnv = function () {
  var div = null;
  oo.log = function (log) {
    // console
    console.log(log);
    // dom
    if (div === null) {
      if (document.body) {
        div = document.createElement('div');
        document.body.appendChild(div);
      }
    }
    if (div) div.innerHTML += log + '<br>';
  };
};

oo.log = function (log) {
  console.log(log);
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

oo.strToInt = function (s) {
  var n = Number.parseInt(s);
  return (Number.isInteger(n)) ? n : 0;
};

oo.zeroPadding = function (num, length) {
  // Number.MAX_SAFE_INTEGER = 9007199254740991
  return ('00000000000000000000' + num).slice(- length);
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
