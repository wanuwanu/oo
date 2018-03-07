// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.getArrayDiff = function (array1, array2) {
  var diff = [];
  for (var x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (x of array2) {
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

// 配列の要素の交換
oo.arraySwap = function (array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
};
