// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.async = function (callback) {
  setTimeout(callback, 0);

  // var img = new Image();

  // 動作するが、空だとパスが入ってリクエストが飛ぶ
  // img.onerror = callback;
  // img.src = '';

  // Data URI scheme
  // 動作するが、やや遅い
  // img.onerror = callback;
  // img.src = 'data:,';

  // gif 1x1
  // img.onload = callback;
  // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
};

// ex.
// oo.serial(function* (proceeder) {
//   yield asyncFunction1(proceeder);
//   yield asyncFunction2(proceeder);
// }, () => {
// });
// 
// oo.parallel(function* (proceeder) {
//   yield asyncFunction1(proceeder);
//   yield asyncFunction2(proceeder);
// }, () => {
// });

oo.serial = function (generator, completion) {
  function proceeder() {
    oo.async(() => {
      var result = g.next();
      if (result.done && completion) completion();
    });
  }
  var g = generator(proceeder);
  proceeder();
};

oo.parallel = function (generator, completion) {
  var n = 0;
  function proceeder() {
    oo.async(() => {
      if ((n-- === 0) && completion) completion();
    });
  }
  var g = generator(proceeder);
  while (!g.next().done) n++;
  proceeder();
};

oo.asyncCreateImage = function (file, proceeder) {
  var img = new Image();
  img.onload = proceeder;
  img.onerror = proceeder;
  img.src = file;
  return img;
};

oo.asyncAppendScript = function (file, proceeder) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = proceeder;
  script.onerror = proceeder;
  document.body.appendChild(script);
};

oo.asyncLoadText = function (file, proceeder) {
  var obj = {};
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file, true);
  xhr.onload = () => {
    obj['text'] = xhr.response;
    proceeder();
  };
  xhr.onerror = () => proceeder();
  xhr.onabort = () => proceeder();
  xhr.ontimeout = () => proceeder();
  xhr.send('');
  return obj;
};

