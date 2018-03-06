// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.async = function (callback) {
  var img = new Image();
  img.src = '';
  img.onerror = callback;
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

// ex.
// var target_obj = {};
// var list1 = [
//   ['image_a'],
//   ['image_b'],
// ];
// oo.createAsyncGeneratorWithImageList(target_obj, 'iamge', list1, 'png');
//
// var list2 = [
//   ['image_a', 'image/image_a'],
//   ['image_b', 'image/image_b'],
// ];
// oo.createAsyncGeneratorWithImageList(target_obj, '', list2, 'png');

oo.createAsyncGeneratorWithImageList = function (target, base_path, image_list, extension) {
  return function* (proceeder) {
    var ext = '';
    var path = '';
    if (extension) ext = '.' + extension;
    if (base_path) path = base_path + '/';
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

oo.asyncLoadText = function (proceed, file) {
  var obj = {};
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        obj['text'] = xhr.response;
        proceed();
      }
    }
  };
  xhr.send('');
  return obj;
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
