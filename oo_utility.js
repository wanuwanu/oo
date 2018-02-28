// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.syncLoadText = function (proceed, file) {
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


oo.backSlashToSlash = function (path) {
  var s = '';
  for (var i = 0; i < path.length; i++) {
    var c = path.charAt(i);
    s += (c === '\\') ? '/' : c;
  }
  return s;
};

oo.getFolder = function (path) {
  path = oo.backSlashToSlash(path);
  var pos = path.lastIndexOf('/');
  return path.substr(0, pos + 1);
};

oo.getFilename = function (path) {
  path = oo.backSlashToSlash(path);
  var pos = path.lastIndexOf('/');
  return path.substr(pos + 1);
};

oo.getNonExtension = function (filename) {
  filename = oo.backSlashToSlash(filename);
  var pos = filename.lastIndexOf('.');
  if (pos < 0) return filename;
  return filename.substr(0, pos);
};

oo.saveText = function (filename, text) {
  var blob = new Blob([text], { type: 'text/plain' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename + '.txt';
  link.click();
};

oo.loadText = function (filename, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        callback(xhr.response);
      }
    }
  };
  xhr.send('');
};

oo.getArrayDiff = function (array1, array2) {
  var diff = [];
  for (var x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (  x of array2) {
    if (array1.indexOf(x) === -1) diff.push(x);
  }
  return diff;
};

// oo.getGlobalPropertyDiff = function () {
//   var a0 = ["postMessage", "blur", "focus", "close", "frames", "self", "window", "parent", "opener", "top", "length", "closed", "location", "document", "origin", "name", "history", "locationbar", "menubar", "personalbar", "scrollbars", "statusbar", "toolbar", "status", "frameElement", "navigator", "applicationCache", "customElements", "external", "screen", "innerWidth", "innerHeight", "scrollX", "pageXOffset", "scrollY", "pageYOffset", "screenX", "screenY", "outerWidth", "outerHeight", "devicePixelRatio", "clientInformation", "screenLeft", "screenTop", "defaultStatus", "defaultstatus", "styleMedia", "onanimationend", "onanimationiteration", "onanimationstart", "onsearch", "ontransitionend", "onwebkitanimationend", "onwebkitanimationiteration", "onwebkitanimationstart", "onwebkittransitionend", "isSecureContext", "onabort", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting", "onwheel", "onauxclick", "ongotpointercapture", "onlostpointercapture", "onpointerdown", "onpointermove", "onpointerup", "onpointercancel", "onpointerover", "onpointerout", "onpointerenter", "onpointerleave", "onafterprint", "onbeforeprint", "onbeforeunload", "onhashchange", "onlanguagechange", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onstorage", "onunhandledrejection", "onunload", "performance", "stop", "open", "alert", "confirm", "prompt", "print", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "captureEvents", "releaseEvents", "getComputedStyle", "matchMedia", "moveTo", "moveBy", "resizeTo", "resizeBy", "getSelection", "find", "getMatchedCSSRules", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "btoa", "atob", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "createImageBitmap", "scroll", "scrollTo", "scrollBy", "onappinstalled", "onbeforeinstallprompt", "caches", "crypto", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "indexedDB", "webkitStorageInfo", "sessionStorage", "localStorage", "fetch", "visualViewport", "speechSynthesis", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "openDatabase", "chrome"];
//   var a1 = Object.keys(window);
//   var diff = oo.getArrayDiff(a0, a1);
//   return diff;
// };

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

oo.drawRoundRect = function (ctx, x, y, w, h, radius, fill, stroke) {
  var r = (radius === undefined) ? 5 : radius;
  if (stroke === undefined) stroke = true;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
};

oo.setTextAttributes = function (context, fontSize, fillStyle, textAlign, textBaseline) {
  context.font = `${fontSize}px ''`;
  context.fillStyle = fillStyle;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
};

oo.strToInt = function (s) {
  var n = Number.parseInt(s);
  return (Number.isInteger(n)) ? n : 0;
};

oo.createImageFromFile = function (file) {
  var img = new Image();
  img.src = file;
  return img;
};

oo.clamp = function (x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
};

oo.lerp = function (v0, v1, alpha) {
  return (1.0 - alpha) * v0 + alpha * v1;
};

oo.saturate = function (x) {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
};

oo.smoothstep = function (v0, v1, v) {
  if (v0 === v1) return 0.0;
  return oo.saturate((v - v0) / (v1 - v0));
};

// 配列の要素の交換
oo.arraySwap = function (array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
};

// マージソート
oo.sort = function (data, compare) {

  var mergeSort = function (first, last) {
    if (first >= last) return;
    if (last - first == 1) {
      if (compare(data[first], data[last]) > 0) oo.arraySwap(data, first, last);
      return;
    }
    var middle = Math.floor((first + last) / 2);
    mergeSort(first, middle);
    mergeSort(middle + 1, last);

    var work = [];
    var p = 0;
    for (var i = first; i <= middle; i++) work[p++] = data[i];

    var i = middle + 1;
    var j = 0;
    var k = first;
    while (i <= last && j < p) data[k++] = (compare(work[j], data[i]) <= 0) ? work[j++] : data[i++];
    while (j < p) data[k++] = work[j++];
  };

  mergeSort(0, data.length - 1);
};

// csvをマトリックス(array * array)に変換
oo.csvToArray2 = function (csv) {
  var n = csv.length;
  var dq = false;
  var item = '';
  var array = [];
  var line = [];

  for (var i = 0; i < n; i++) {
    var c = csv.charAt(i);

    if (c === '"') {
      if (!dq) {
        dq = true;
      } else {
        if (i + 1 < n && csv.charAt(i + 1) === '"') {
          item += '"';
          i += 1;
        } else {
          dq = false;
        }
      }
      continue;
    }

    if (!dq) {
      if (c === ',') {
        line.push(item);
        item = '';
        continue;
      }
      if (c === '\n') {
        if (item.length || line.length) {
          line.push(item);
          item = '';
        }
        if (line.length) {
          array.push(line);
          line = [];
        }
        continue;
      }
    }
    item += c;
  }
  if (item.length) line.push(item);
  if (line.length) array.push(line);
  return array;
};

// csvをオブジェクトの配列に変換
oo.csvToObjectArray = function (csv) {
  var array = [];
  var lines = oo.csvToArray2(csv);
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    for (var j = 0; j < lines[i].length; j++) obj[lines[0][j]] = lines[i][j];
    array.push(obj);
  }
  return array;
};
