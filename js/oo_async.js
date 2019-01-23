// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.async = function (callback) {
  // setTimeout(callback, 0);

  var img = new Image();

  // 動作するが、空だとパスが入ってリクエストが飛ぶ
  // img.onerror = callback;
  // img.src = '';

  // Data URI scheme
  // 動作するが、やや遅い
  // img.onerror = callback;
  // img.src = 'data:,';

  // gif 1x1
  img.onload = callback;
  img.onerror = callback;
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
};


// oo.serial oo.parallel
//
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
//
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
  return oo.ajax('GET', file, null, null, proceeder);
};


// send_objをJSONにして送り、
// 受け取ったJSONをresult.objにセットする
oo.ajaxJson = function (method, url, send_obj, callback) {
  var json = JSON.stringify(send_obj);
  return oo.ajax(method, url, json, 'application/json', (result) => {
    if (result.status === 'ok') {
      result.obj = JSON.parse(result.text);
    }
    callback(result);
  });

};

// method 'GET' or 'POST'
// content_type 'application/json', 'application/x-www-form-urlencoded', ...
// 
// 結果は、callbackの引数と、関数の返値の両方で渡される
//
// ex.
// oo.ajax('POST', 'http://www.nyagoya.net', {}, null, (result) => { });
// var result = oo.ajax('POST', 'http://www.nyagoya.net', {}, null);
//
oo.ajax = function (method, url, data, content_type, callback) {
  var result = {};
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);

  xhr.onload = () => {
    result.text = xhr.responseText;
    result.status = 'ok';
    callback && callback(result);
  };

  xhr.onerror = () => {
    result.status = 'error';
    callback && callback(result);
  };

  xhr.onabort = xhr.onerror;
  xhr.ontimeout = xhr.onerror;

  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', content_type || 'application/json');
    xhr.send(data);
  }
  if (method === 'GET') {
    xhr.send(null);
  }
  return result;
};
