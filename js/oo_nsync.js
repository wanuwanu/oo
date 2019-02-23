// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.postpone = function (callback) {
  // setTimeout(callback, 0); は4msの制限があるため
  // gif 1x1
  var img = new Image();
  img.onload = callback;
  img.onerror = callback;
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
};

// oo.UnitNode
//
// ex.
// var nn = new oo.UnitNode(function (completion_callback) { });
// 
oo.UnitNode = class {
  constructor(executor, auto_run = false) {
    this.value = void 0;  // 同期部分のreturnで返す値
    this.result = void 0; // 非同期部分のcallbackで返す値

    this._done = false;
    this._target = void 0;
    this._executor = executor;
    this._callback = (result) => {
      this._done = true;
      this.result = result;
      if (this._target) this.connect(this._target);
    };
    if (auto_run) this.run();
  }

  run() {
    this.value = this._executor(this._callback);
  }

  connect(target) {
    if (target instanceof oo.UnitNode) {
      var unit_node = target;
      target = () => { unit_node.run(); };
    }
    this._done ? target(this.result) : this._target = target;
  }
};

// 即実行タイプ
// oo.serial oo.parallel ではこちらを使うこと
oo.UnitNodeX = class extends oo.UnitNode {
  constructor(executor) {
    super(executor, true);
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
//   return new oo.UnitNode(done => {
//     setTimeout(done, 0);
//   });
// };

oo.serial = function (generator, completion) {
  return new oo.UnitNode(done => {
    var y = void 0;
    var g = generator();
    var proceed = () => {
      oo.postpone(() => {
        var r = g.next(y);
        y = (r.value instanceof oo.UnitNode) ? (r.value.connect(proceed), r.value.value) : r.value;
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
  return new oo.UnitNode(done => {
    var n = 0;
    var g = generator();
    var proceed = () => {
      oo.postpone(() => {
        if (n-- !== 0) return;
        completion && completion();
        done();
      });
    };
    var y = void 0;
    do {
      var r = g.next(y);
      y = (r.value instanceof oo.UnitNode) ? (n++ , r.value.connect(proceed), r.value.value) : r.value;
    } while (!r.done);
    proceed();
  });
};

oo.nnWait = function (time) {
  return new oo.UnitNode(done => {
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
  return new oo.UnitNode(done => {
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
  return new oo.UnitNode(done => {
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
  return new oo.UnitNode(done => {
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

