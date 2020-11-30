// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期処理関連

var oo = oo || {};

oo.postpone = function (callback) {
  // setTimeout(callback, 0); は4msの制限があるため
  // gif 1x1
  var img = new Image();
  img.onload = callback;
  img.onerror = callback;
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
};

// serial/parallel用クラス
oo.Transmitter = class {
  constructor(executor) { // executor = callback => {...};
    this.value = void 0;  // 同期部分のreturnで返す値
    this.result = void 0; // 非同期部分のcallbackで返す値
    this._callback = result => {
      this.result = result;
      this._callback = void 0;
    };
    this.value = executor(result => { this._callback(result); });
  }
  connect(callback) {
    this._callback || callback(this.result);
    this._callback = callback;
    return this.value;
  }
};

// serial/parallel用ヘルパ関数
// 最後の引数がコールバック関数となる関数のみ使用可能
// 仮のコールバック関数を強制設定する
oo.nn = (func, ...args) => {
  return new oo.Transmitter(callback => {
    if (func.length === 0) oo.postpone(callback);
    if (func.length > 0) {
      const org = args[func.length - 1];
      if (typeof org === 'function') {
        args[func.length - 1] = () => { org(); callback(); };
      } else if (org === void 0 || org === null) {
        args[func.length - 1] = callback;
      } else {
        oo.postpone(callback);
      }
    }
    return func(...args);
  });
};

oo.serial = (generator, completion) => {
  return new oo.Transmitter(callback => {
    let y = void 0;
    const proceed = () => {
      oo.postpone(() => {
        const r = g.next(y);
        if (!r.done) {
          y = (r.value instanceof oo.Transmitter) ? r.value.connect(proceed) : r.value;
        } else {
          completion && completion();
          callback();
        }
      });
    };
    const g = generator(proceed);
    proceed();
  });
};

oo.parallel = (generator, completion) => {
  return new oo.Transmitter(callback => {
    let n = 0;
    const proceed = () => {
      oo.postpone(() => {
        if (n-- !== 0) return;
        completion && completion();
        callback();
      });
    };
    const g = generator(proceed);
    oo.postpone(() => {
      let y = void 0;
      for (let r = g.next(y); !r.done; r = g.next(y), n++) {
        y = (r.value instanceof oo.Transmitter) ? r.value.connect(proceed) : r.value;
      }
      proceed();
    });
  });
};






/*
// oo.NNode
// oo.XNode
// ex. var x = new oo.XNode(function (completion_callback) { });
oo.NNode = class {
  constructor(executor) {
    this.value = void 0;  // 同期部分のreturnで返す値
    this.result = void 0; // 非同期部分のcallbackで返す値
    this._done = false;
    this._target = [];
    this._executor = executor;
    this._callback = (result) => {
      this.result = result; // executorの返す値を保存
      this._done = true;
      for (var t of this._target) this._transmit(t);
    };
  }
  _transmit(target) {
    if (target instanceof oo.NNode) target.exec();
    if (typeof target === 'function') target(this.result);
  }
  connect(target) {
    if (this._target.indexOf(target) < 0) this._target.push(target);
    this._done && this._transmit(target);
  }
  exec() {
    this.value = this._executor(this._callback);
  }
};

oo.XNode = class extends oo.NNode {
  constructor(...args) {
    super(...args);
    this.exec();
  }
};

// NNode作成用
// マニュアル実行用
oo.nn = function (executor) { return new oo.NNode(executor); };

// XNode作成用
// 即時実行用
oo.xn = function (func, ...args) {
  return new oo.XNode(pass => {
    var n = func.length;
    if (n > 0) {
      var arg = args[n - 1];
      if (typeof arg === 'function') {
        args[n - 1] = () => { arg(); pass(); };
      } else if (arg === void 0 || arg === null) {
        args[n - 1] = () => { pass(); };
      } else {
        oo.postpone(pass);
      }
    } else {
      oo.postpone(pass);
    }
    return func(...args);
  });
};
*/

// oo.serial oo.parallel
//
// ex.
// oo.serial(function* () {
//   yield xnFunction1();
//   yield xnFunction2();
// }, () => {
// });
// 
// oo.parallel(function* () {
//   yield xnFunction1();
//   yield xnFunction2();
// }, () => {
// });
//
// var xnFunction = function () {
//   return new oo.XNode(pass => {
//     setTimeout(pass, 0);
//   });
// };
/*
oo.serial = function (generator, completion) {
  return new oo.XNode(pass => {
    var y = void 0;
    var g = generator();
    var proceed = () => {
      oo.postpone(() => {
        var r = g.next(y);
        y = (r.value instanceof oo.XNode) ? (r.value.connect(proceed), r.value.value) : r.value;
        if (r.done) {
          completion && completion();
          pass();
        }
      });
    };
    proceed();
  });
};

oo.parallel = function (generator, completion) {
  return new oo.XNode(pass => {
    var n = 0;
    var g = generator();
    var proceed = () => {
      oo.postpone(() => {
        if (n-- !== 0) return;
        completion && completion();
        pass();
      });
    };
    var y = void 0;
    do {
      var r = g.next(y);
      y = (r.value instanceof oo.XNode) ? (n++ , r.value.connect(proceed), r.value.value) : r.value;
    } while (!r.done);
    proceed();
  });
};
*/

oo.nnWait = function (time) {
  return new oo.Transmitter(callback => { setTimeout(callback, time); });
};

oo.createImage = function (file, callback) {
  var img = new Image();
  img.onload = callback;
  img.onerror = callback;
  img.src = file;
  return img;
};

oo.nnCreateImage = function (file, callback) {
  return oo.nn(oo.createImage, file, callback);
};

oo.appendScript = function (file, callback) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = callback;
  script.onerror = callback;
  document.body.appendChild(script);
};

oo.nnAppendScript = function (file, callback) {
  return oo.nn(oo.appendScript, file, callback);
};

oo.loadText = function (file, callback) {
  return oo.ajax('GET', file, null, null, callback);
};

oo.nnLoadText = function (file, callback) {
  return oo.nn(oo.loadText, file, callback);
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

