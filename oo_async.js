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
// 受け取ったJSONをrecv_objにセットする
oo.ajaxJson = function (method, url, send_obj, recv_obj, callback) {
  var json = JSON.stringify(send_obj);
  var obj = oo.ajax(method, url, json, 'application/json', () => {
    if (obj.status === 'ok') {
      Object.assign(recv_obj, JSON.parse(obj.text));
    }
    callback();
  });
  return obj;
};

// method 'GET' or 'POST'
// content_type 'application/json', 'application/x-www-form-urlencoded', ...
oo.ajax = function (method, url, data, content_type, callback) {
  var obj = {};
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);

  xhr.onload = () => {
    obj.text = xhr.responseText;
    obj.status = 'ok';
    callback();
  };

  xhr.onerror = () => {
    obj.status = 'error';
    callback();
  };

  xhr.onabort = xhr.onerror;
  xhr.ontimeout = xhr.onerror;

  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', content_type);
    xhr.send(data);
  }
  if (method === 'GET') {
    xhr.send(null);
  }
  return obj;
};
