// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.async = function (callback) {
  var img = new Image();
  img.src = '';
  img.onerror = callback;
};

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
    var result = g.next();
    if (result.done && completion) completion();
  }
  var g = generator(proceeder);
  proceeder();
};

oo.parallel = function (generator, completion) {
  var n = 0;
  function proceeder() {
    if ((n-- === 1) && completion) completion();
  }
  var g = generator(proceeder);
  while (!g.next().done) n++;
  if (n === 0 && completion) completion();
};

oo.createAsyncGeneratorWithList = function (async_function, list) {
  return function* (proceeder) {
    for (var x of list) yield async_function(proceeder, x);
  };
};

oo.createAsyncGeneratorWithImageList = function (target, base_path, image_list, extension) {
  return function* (proceeder) {
    var ext = (extension === undefined) ? '' : '.' + extension;
    var path = (base_path === undefined) ? '' : base_path + '/';
    for (var name of image_list) {
      if (Array.isArray(name)) {
        yield target[name[0]] = oo.asyncCreateImage(proceeder, path + name[1] + ext);
      } else {
        yield target[name] = oo.asyncCreateImage(proceeder, path + name + ext);
      }
    }
  };
};

oo.asyncCreateImage = function (proceeder, file) {
  var img = new Image();
  img.src = file;
  img.onload = proceeder;
  img.onerror = proceeder;
  return img;
};

oo.asyncAppendScript = function (proceeder, file) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = proceeder;
  script.onerror = proceeder;
  document.body.appendChild(script);
};

// 通常関数のasync化
oo.asyncFunction = function (proceeder, base_function) {
  base_function();
  oo.async(proceeder);
};

oo.createAsyncFunction = function (base_function) {
  return function (proceeder) {
    base_function();
    oo.async(proceeder);
  };
};




// 廃止予定
oo.createSyncGeneratorForImageList = function (target, image_list, base_path) {
  return function* (proceed) {
    for (var item of image_list) yield target[item[0]] = oo.syncCreateImage(proceed, item[1], base_path);
  };
};

// 廃止予定
oo.createSyncGeneratorForImageList2 = function (target, base_path, image_list, extension) {
  return function* (proceed) {
    for (var name of image_list) yield target[name] = oo.syncCreateImage(proceed, name + '.' + extension, base_path);
  };
};

// 廃止予定
oo.syncCreateImage = function (proceed, file, base_path) {
  var img = new Image();
  if (base_path) file = base_path + '/' + file;
  img.src = file;
  img.onload = proceed;
  img.onerror = proceed;
  return img;
};

// 廃止予定
oo.syncAppendScript = function (proceed, file) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = proceed;
  document.body.appendChild(script);
};

// 廃止予定
// sync化
oo.sync = function (proceed, baseFunction) {
  setTimeout(proceed, 0);
  baseFunction();
};

// 廃止予定
// syncFunction化
oo.syncFunc = function (baseFunction) {
  return function (proceed) {
    setTimeout(proceed, 0);
    baseFunction();
  };
};

// 廃止予定
// syncGenerator化
oo.syncGen = function (baseFunction) {
  return function* (proceed) {
    baseFunction();
    yield setTimeout(proceed, 0);
  };
};
