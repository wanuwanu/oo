// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.base16 = {};

oo.base16.encode = function (array) {
  var str = '';
  for (var u of array) {
    str += ('0' + u.toString(16)).slice(-2);
  }
  return str;
};

oo.base16.decode = function (base16str) {
  var array = [];
  var n = base16str.length / 2;
  for (var i = 0; i < n; i++) {
    array[i] = Number.parseInt(base16str.substr(i * 2, 2), 16);
  }
  return array;
};

oo.utf8bin = {};

oo.utf8bin.encode = function (str) {
  var array = [];

  var n = str.length;
  for (var i = 0; i < n; i++) {
    var c = str.charCodeAt(i);
    // サロゲートに対応
    if (c >= 0xd800 && c < 0xdc00) {
      i++;
      var c2 = str.charCodeAt(i);
      if (c2 >= 0xdc00 && c2 < 0xe000) {
        c = (((c - 0xd800) & 0x03fff) << 10) | ((c2 - 0xdc00) & 0x03fff);
        c += 0x00010000;
      }
    }
    if (c === 0) break;
    if (c < 0x00000080) {
      array.push(c);
    } else if (c < 0x00000800) {
      array.push((c >> 6) | 0xc0);
      array.push((c & 0x3f) | 0x80);
    } else if (c < 0x00010000) {
      array.push((c >> 12) | 0xe0);
      array.push(((c >> 6) & 0x3f) | 0x80);
      array.push((c & 0x3f) | 0x80);
    } else {
      array.push((c >> 18) | 0xf0);
      array.push(((c >> 12) & 0x3f) | 0x80);
      array.push(((c >> 6) & 0x3f) | 0x80);
      array.push((c & 0x3f) | 0x80);
    }
  }
  return array;
};

oo.utf8bin.decode = function (utf8array) {
  var str = '';

  var n = utf8array.length;
  for (var i = 0; i < n; i++) {
    var c = utf8array[i];
    if (c === 0) break;
    if (c < 0x80) {
      c = c & 0x7f;
    } else if (c < 0xe0) {
      c = (c & 0x1f) << 6;
      c |= utf8array[i + 1] & 0x3f;
      i += 1;
    } else if (c < 0xf0) {
      c = (c & 0x0f) << 12;
      c |= (utf8array[i + 1] & 0x3f) << 6;
      c |= utf8array[i + 2] & 0x3f;
      i += 2;
    } else {
      c = (c & 0x07) << 18;
      c |= (utf8array[i + 1] & 0x3f) << 12;
      c |= (utf8array[i + 2] & 0x3f) << 6;
      c |= utf8array[i + 3] & 0x3f;
      i += 3;
    }

    if (c < 0x00010000) {
      str += String.fromCharCode(c);
    } else {
      c -= 0x00010000;
      str += String.fromCharCode((c >>> 10) | 0xd800);
      str += String.fromCharCode((c & 0x3fff) | 0xdc00);
    }
  }
  return str;
};

