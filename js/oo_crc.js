// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.crc = oo.crc || {};
oo.crc.kPolynomial = 0xedb88320;

// static
oo.crc.initialized = false;
oo.crc.table = new Array(256);

class OoCrc {
  constructor() {
    if (!oo.crc.initialized) {
      OoCrc._makeCrcTable();
      oo.crc.initialized = false;
    }
  }

  static _makeCrcTable() {
    for (var i = 0; i < 256; i++) {
      var r = i;
      for (var j = 0; j < 8; j++) r = (r & 1) ? ((r >>> 1) ^ oo.crc.kPolynomial) : (r >>> 1);
      oo.crc.table[i] = r;
    }
  }

  getCrc(buffer, position, length, crc) {
    if (crc === void 0) crc = 0;
    crc ^= 0xffffffff;
    for (var i = 0; i < length; i++) {
      crc = (crc >>> 8) ^ oo.crc.table[(crc & 0xff) ^ buffer[position + i]];
    }
    return crc ^ 0xffffffff;
  }

  static get(buffer, position, length) {
    var crc = new OoCrc();
    return crc.getCrc(buffer, position, length, 0);
  }
}
