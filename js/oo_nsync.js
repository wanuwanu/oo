// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.nsync = function (callback) {
  // setTimeout(callback, 0); は4msの制限があるため
  // gif 1x1
  var img = new Image();
  img.onload = callback;
  img.onerror = callback;
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
};

// oo.GenNode
//   Promiseの機能縮小版
// ex.
// var gn = new oo.GenNode(function (completion_callback) { });
oo.GenNode = class {
  constructor(executor) {
    this.done = false;
    this.result = void 0;
    this.target = void 0;
    // Promise.resolve に近い機能
    var callback = (result) => {
      this.done = true;
      this.result = result;
      if (this.target) this.connect(this.target);
    };
    this.value = executor(callback);
  }
  // Promise.then に近い機能だがチェーンは実装しない
  connect(target) {
    this.done ? target(this.result) : this.target = target;
  }
};

// oo.serial oo.parallel
//
// ex.
// oo.serial(function* () {
//   yield nsyncFunction1();
//   yield nsyncFunction2();
// }, () => {
// });
// 
// oo.parallel(function* () {
//   yield nsyncFunction1();
//   yield nsyncFunction2();
// }, () => {
// });
//
// var nsyncFunction = function () {
//   return new oo.GenNode(done => {
//     setTimeout(done, 0);
//   });
// };

oo.serial = function (generator, completion) {
  return new oo.GenNode(done => {
    var y = void 0;
    var g = generator();
    var proceed = () => {
      oo.nsync(() => {
        var r = g.next(y);
        y = (r.value instanceof oo.GenNode) ? (r.value.connect(proceed), r.value.value) : r.value;
        // y = oo.isObject(r.value) ? (r.value.connect(proceed), r.value.value) : r.value;
        if (r.done) {
          completion && completion();
          done();
        }
      });
    };
    proceed();
  });
};

oo.parallel = function (generator, completion) {
  return new oo.GenNode(done => {
    var n = 0;
    var g = generator();
    var proceed = () => {
      oo.nsync(() => {
        if (n-- !== 0) return;
        completion && completion();
        done();
      });
    };
    var y = void 0;
    do {
      var r = g.next(y);
      y = (r.value instanceof oo.GenNode) ? (n++ , r.value.connect(proceed), r.value.value) : r.value;
    } while (!r.done);
    proceed();
  });
};

oo.gnWait = function (time) {
  return new oo.GenNode(done => {
    setTimeout(done, time);
  });
};

oo.createImage = function (file, callback) {
  var img = new Image();
  img.onload = callback;
  img.onerror = callback;
  img.src = file;
  return img;
};

oo.gnCreateImage = function (file, callback) {
  return new oo.GenNode(done => {
    return oo.createImage(file, () => {
      callback && callback();
      done();
    });
  });
};

oo.appendScript = function (file, callback) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = callback;
  script.onerror = callback;
  document.body.appendChild(script);
};

oo.gnAppendScript = function (file, callback) {
  return new oo.GenNode(done => {
    oo.appendScript(file, () => {
      callback && callback();
      done();
    });
  });
};

oo.loadText = function (file, callback) {
  return oo.ajax('GET', file, null, null, callback);
};

oo.gnLoadText = function (file, callback) {
  return new oo.GenNode(done => {
    oo.loadText(file, () => {
      callback && callback();
      done();
    });
  });
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


// ここまで
// v async -> nsync
// oo.serial oo.parallel 仕様変更
// asyncCreateImage  -> gnCreateImage
// asyncAppendScript -> gnAppendScript
// asyncLoadText     -> gnLoadText
