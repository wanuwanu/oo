// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// Advanced Encryption Standard (AES) (FIPS PUB 197).
// http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf

var oo = oo || {};

oo.aesType = {
  kAes128: 0,
  kAes192: 1,
  kAes256: 2,
};

oo.aes = oo.aes || {};
// 有限体GF(2)上の既約多項式 p(x) = x^8 + x^4 + x^3 + x + 1
oo.aes.kPolynomial = 0x0000011b; // 0001_0001_1011 
// affine transformation for sub bytes
oo.aes.kAffineConstant0 = 0x1f;
oo.aes.kAffineConstant1 = 0x63;

// static
oo.aes.initialized = false;
// uint8
oo.aes.sub_bytes_table = new Array(256);
oo.aes.inv_sub_bytes_table = new Array(256);
// uint32
oo.aes.mix_column_3112_table = new Array(256);
oo.aes.mix_column_bd9e_table = new Array(256);
oo.aes.sub_byte_mix_column_3112_table = new Array(256);
oo.aes.inv_sub_byte_mix_column_bd9e_table = new Array(256);

class OoAes {
  constructor() {
    if (!oo.aes.initialized) {
      OoAes._makeSubBytesTable();
      OoAes._makeMixColumnTable();
      oo.aes.initialized = true;
    }
    this._type = 'aes128';
    this._key_length = 4;
    this._num_rounds = 10;
    this._encrypt_round_key = new Array((14 + 1) * 4); // (max_rounds  + 1) * block_size
    this._decrypt_round_key = new Array((14 + 1) * 4);
  }

  // rotate
  static _leftRotate32(n, bits) {
    return (n << bits) | (n >>> (32 - bits));
  }

  static _get32x4(dst, src) {
    for (var i = 0; i < 4; i++) {
      dst[i] = src[i * 4]
        | (src[i * 4 + 1] << 8)
        | (src[i * 4 + 2] << 16)
        | (src[i * 4 + 3] << 24);
    }
  }

  static _put32x4(dst, src) {
    for (var i = 0; i < 4; i++) {
      dst[i * 4] = src[i] & 0xff;
      dst[i * 4 + 1] = (src[i] >>> 8) & 0xff;
      dst[i * 4 + 2] = (src[i] >>> 16) & 0xff;
      dst[i * 4 + 3] = src[i] >>> 24;
    }
  }

  static _mulPolynomial(x, y) {
    var z = 0;
    for (var i = 0; i < 8; i++) z ^= ((y >>> i) & 1) ? (x << i) : 0;
    for (i = 14; i >= 8; i--) {
      if ((z >>> i) & 1) z ^= oo.aes.kPolynomial << (i - 8);
    }
    return z;
  }

  static _getMultiplicativeInverse(x) {
    // 有限体GF(2)上の既約多項式p(x)で定義される拡大体で、aの逆元a^-1を求める
    // a^255 = 1
    // a^-1  = a^-1 * a^255 = a^254
    // a^254 = a^2 * a^4 * a^8 * a^16 * a^32 * a^64 * a^128
    var y = 1;
    for (var i = 0; i < 7; i++) {
      x = OoAes._mulPolynomial(x, x);
      y = OoAes._mulPolynomial(y, x);
    }
    return y;
  }

  static _makeSubBytesTable() {
    for (var i = 0; i < 256; i++) {
      var x = OoAes._getMultiplicativeInverse(i);
      var y = 0;
      var a = oo.aes.kAffineConstant0;
      for (var j = 0; j < 8; j++) {
        if ((x >>> j) & 1) y ^= (a << j) | (a >>> (8 - j));
      }
      y = (y & 0xff) ^ oo.aes.kAffineConstant1;
      oo.aes.sub_bytes_table[i] = y;
      oo.aes.inv_sub_bytes_table[y] = i;
    }
  }

  static _makeMixColumnTable() {
    for (var i = 0; i < 256; i++) {
      oo.aes.mix_column_3112_table[i] = (OoAes._mulPolynomial(0x03, i) << 24)
        | (i << 16)
        | (i << 8)
        | OoAes._mulPolynomial(0x02, i);
      oo.aes.mix_column_bd9e_table[i] = (OoAes._mulPolynomial(0x0b, i) << 24)
        | (OoAes._mulPolynomial(0x0d, i) << 16)
        | (OoAes._mulPolynomial(0x09, i) << 8)
        | OoAes._mulPolynomial(0x0e, i);
    }

    for (i = 0; i < 256; i++) {
      var x = oo.aes.sub_bytes_table[i];
      oo.aes.sub_byte_mix_column_3112_table[i] = oo.aes.mix_column_3112_table[x];
      oo.aes.inv_sub_byte_mix_column_bd9e_table[x] = oo.aes.mix_column_bd9e_table[i];
    }
  }


  static _subBytes(buffer) {
    var p = buffer;
    for (var i = 0; i < 16; i++) p[i] = oo.aes.sub_bytes_table[p[i]];
  }

  static _invSubBytes(buffer) {
    var p = buffer;
    for (var i = 0; i < 16; i++) p[i] = oo.aes.inv_sub_bytes_table[p[i]];
  }

  static _shiftRows(x, offset) {
    var y = [0, 0, 0, 0];
    y[0] = (x[0] & 0x000000ff) ^ (x[1] & 0x0000ff00) ^ (x[2] & 0x00ff0000) ^ (x[3] & 0xff000000);
    y[1] = (x[1] & 0x000000ff) ^ (x[2] & 0x0000ff00) ^ (x[3] & 0x00ff0000) ^ (x[0] & 0xff000000);
    y[2] = (x[2] & 0x000000ff) ^ (x[3] & 0x0000ff00) ^ (x[0] & 0x00ff0000) ^ (x[1] & 0xff000000);
    y[3] = (x[3] & 0x000000ff) ^ (x[0] & 0x0000ff00) ^ (x[1] & 0x00ff0000) ^ (x[2] & 0xff000000);
    for (var i = 0; i < 4; i++) x[i] = y[i];
  }

  static _invShiftRows(x, offset) {
    var y = [0, 0, 0, 0];
    y[0] = (x[0] & 0x000000ff) ^ (x[3] & 0x0000ff00) ^ (x[2] & 0x00ff0000) ^ (x[1] & 0xff000000);
    y[1] = (x[1] & 0x000000ff) ^ (x[0] & 0x0000ff00) ^ (x[3] & 0x00ff0000) ^ (x[2] & 0xff000000);
    y[2] = (x[2] & 0x000000ff) ^ (x[1] & 0x0000ff00) ^ (x[0] & 0x00ff0000) ^ (x[3] & 0xff000000);
    y[3] = (x[3] & 0x000000ff) ^ (x[2] & 0x0000ff00) ^ (x[1] & 0x00ff0000) ^ (x[0] & 0xff000000);
    for (var i = 0; i < 4; i++) x[i] = y[i];
  }

  static _mixColumns(buffer, offset) {
    for (var i = 0; i < 4; i++) {
      var x = oo.aes.mix_column_3112_table[buffer[i] & 0xff];
      x ^= OoAes._leftRotate32(oo.aes.mix_column_3112_table[(buffer[i] >>> 8) & 0xff], 8);
      x ^= OoAes._leftRotate32(oo.aes.mix_column_3112_table[(buffer[i] >>> 16) & 0xff], 16);
      x ^= OoAes._leftRotate32(oo.aes.mix_column_3112_table[buffer[i] >>> 24], 24);
      buffer[i] = x;
    }
  }

  static _invMixColumns(buffer, offset) {
    for (var i = offset; i < offset + 4; i++) {
      var x = oo.aes.mix_column_bd9e_table[buffer[i] & 0xff];
      x ^= OoAes._leftRotate32(oo.aes.mix_column_bd9e_table[(buffer[i] >>> 8) & 0xff], 8);
      x ^= OoAes._leftRotate32(oo.aes.mix_column_bd9e_table[(buffer[i] >>> 16) & 0xff], 16);
      x ^= OoAes._leftRotate32(oo.aes.mix_column_bd9e_table[buffer[i] >>> 24], 24);
      buffer[i] = x;
    }
  }

  _addRoundKey(buffer, round) {
    for (var i = 0; i < 4; i++) buffer[i] ^= this._encrypt_round_key[round * 4 + i];
  }

  _keyExpansion(key) {
    for (var i = 0; i < this._key_length; i++) {
      this._encrypt_round_key[i] = key[i * 4]
        | (key[i * 4 + 1] << 8)
        | (key[i * 4 + 2] << 16)
        | (key[i * 4 + 3] << 24);
    }

    var rcon = 0x01;

    for (i = this._key_length; i < 4 * (this._num_rounds + 1); i++) {
      var x = this._encrypt_round_key[i - 1];
      if (i % this._key_length == 0) {
        x = oo.aes.sub_bytes_table[(x >>> 8) & 0xff]
          | (oo.aes.sub_bytes_table[(x >>> 16) & 0xff] << 8)
          | (oo.aes.sub_bytes_table[x >>> 24] << 16)
          | (oo.aes.sub_bytes_table[x & 0xff] << 24);
        x ^= rcon;
        rcon = OoAes._mulPolynomial(rcon, 2);
      } else if ((this._key_length > 6) && (i % this._key_length == 4)) {
        x = oo.aes.sub_bytes_table[x & 0xff]
          | (oo.aes.sub_bytes_table[(x >>> 8) & 0xff] << 8)
          | (oo.aes.sub_bytes_table[(x >>> 16) & 0xff] << 16)
          | (oo.aes.sub_bytes_table[x >>> 24] << 24);
      }
      this._encrypt_round_key[i] = this._encrypt_round_key[i - this._key_length] ^ x;
    }

    // invMixColumns の後に addRoundKey を行えるように decrypt round key を作成する
    for (var r = 0; r < this._num_rounds + 1; r++) {
      for (i = 0; i < 4; i++) {
        var dr = this._num_rounds - r;
        this._decrypt_round_key[dr * 4 + i] = this._encrypt_round_key[r * 4 + i];
      }
    }
    for (i = 1; i < this._num_rounds; i++) OoAes._invMixColumns(this._decrypt_round_key, i * 4);
  }

  // key : u8 array
  setKey(type, key) {
    this._type = type;

    if (type === oo.aesType.kAes128) {
      this._key_length = 4;
      this._num_rounds = 10;
    }
    if (type === oo.aesType.kAes192) {
      this._key_length = 6;
      this._num_rounds = 12;
    }
    if (type === oo.aesType.kAes256) {
      this._key_length = 8;
      this._num_rounds = 14;
    }

    this._keyExpansion(key);
  }

  encrypt(dst, src) {
    var buffer0 = [0, 0, 0, 0];
    var buffer1 = [0, 0, 0, 0];

    var x = buffer0;
    var y = buffer1;
    var t = oo.aes.sub_byte_mix_column_3112_table;
    var k = this._encrypt_round_key;
    var ki = 0;

    OoAes._get32x4(x, src);

    for (var i = 0; i < 4; i++) x[i] ^= k[ki++];
    for (var r = 1; r < this._num_rounds; r++) {
      // 4個のテーブルを用意するより、1個のテーブルをrotateした方が高速
      y[0] = t[x[0] & 0xff] ^ OoAes._leftRotate32(t[(x[1] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[2] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[3] >>> 24], 24) ^ k[ki++];
      y[1] = t[x[1] & 0xff] ^ OoAes._leftRotate32(t[(x[2] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[3] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[0] >>> 24], 24) ^ k[ki++];
      y[2] = t[x[2] & 0xff] ^ OoAes._leftRotate32(t[(x[3] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[0] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[1] >>> 24], 24) ^ k[ki++];
      y[3] = t[x[3] & 0xff] ^ OoAes._leftRotate32(t[(x[0] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[1] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[2] >>> 24], 24) ^ k[ki++];
      [x, y] = [y, x];
    }
    var u = oo.aes.sub_bytes_table;
    y[0] = u[x[0] & 0xff] ^ (u[(x[1] >>> 8) & 0xff] << 8) ^ (u[(x[2] >>> 16) & 0xff] << 16) ^ (u[x[3] >>> 24] << 24) ^ k[ki++];
    y[1] = u[x[1] & 0xff] ^ (u[(x[2] >>> 8) & 0xff] << 8) ^ (u[(x[3] >>> 16) & 0xff] << 16) ^ (u[x[0] >>> 24] << 24) ^ k[ki++];
    y[2] = u[x[2] & 0xff] ^ (u[(x[3] >>> 8) & 0xff] << 8) ^ (u[(x[0] >>> 16) & 0xff] << 16) ^ (u[x[1] >>> 24] << 24) ^ k[ki++];
    y[3] = u[x[3] & 0xff] ^ (u[(x[0] >>> 8) & 0xff] << 8) ^ (u[(x[1] >>> 16) & 0xff] << 16) ^ (u[x[2] >>> 24] << 24) ^ k[ki++];

    OoAes._put32x4(dst, y);
  }


  decrypt(dst, src) {
    var buffer0 = [0, 0, 0, 0];
    var buffer1 = [0, 0, 0, 0];

    var x = buffer0;
    var y = buffer1;
    var t = oo.aes.inv_sub_byte_mix_column_bd9e_table;
    var k = this._decrypt_round_key;
    var ki = 0;

    OoAes._get32x4(x, src);

    for (var i = 0; i < 4; i++) x[i] ^= k[ki++];
    for (var r = this._num_rounds - 1; r >= 1; r--) {
      y[0] = t[x[0] & 0xff] ^ OoAes._leftRotate32(t[(x[3] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[2] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[1] >>> 24], 24) ^ k[ki++];
      y[1] = t[x[1] & 0xff] ^ OoAes._leftRotate32(t[(x[0] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[3] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[2] >>> 24], 24) ^ k[ki++];
      y[2] = t[x[2] & 0xff] ^ OoAes._leftRotate32(t[(x[1] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[0] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[3] >>> 24], 24) ^ k[ki++];
      y[3] = t[x[3] & 0xff] ^ OoAes._leftRotate32(t[(x[2] >>> 8) & 0xff], 8) ^ OoAes._leftRotate32(t[(x[1] >>> 16) & 0xff], 16) ^ OoAes._leftRotate32(t[x[0] >>> 24], 24) ^ k[ki++];
      [x, y] = [y, x];
    }

    var u = oo.aes.inv_sub_bytes_table;
    y[0] = u[x[0] & 0xff] ^ (u[(x[3] >>> 8) & 0xff] << 8) ^ (u[(x[2] >>> 16) & 0xff] << 16) ^ (u[x[1] >>> 24] << 24) ^ k[ki++];
    y[1] = u[x[1] & 0xff] ^ (u[(x[0] >>> 8) & 0xff] << 8) ^ (u[(x[3] >>> 16) & 0xff] << 16) ^ (u[x[2] >>> 24] << 24) ^ k[ki++];
    y[2] = u[x[2] & 0xff] ^ (u[(x[1] >>> 8) & 0xff] << 8) ^ (u[(x[0] >>> 16) & 0xff] << 16) ^ (u[x[3] >>> 24] << 24) ^ k[ki++];
    y[3] = u[x[3] & 0xff] ^ (u[(x[2] >>> 8) & 0xff] << 8) ^ (u[(x[1] >>> 16) & 0xff] << 16) ^ (u[x[0] >>> 24] << 24) ^ k[ki++];

    OoAes._put32x4(dst, y);
  }

  encrypt_simple(dst, src) {
    var buffer = [0, 0, 0, 0];

    OoAes._get32x4(buffer, src);

    this._addRoundKey(buffer, 0);
    for (var r = 1; r < this._num_rounds; r++) {
      OoAes._subBytes(buffer);
      OoAes._shiftRows(buffer);
      OoAes._mixColumns(buffer);
      this._addRoundKey(buffer, r);
    }
    OoAes._subBytes(buffer);
    OoAes._shiftRows(buffer);
    this._addRoundKey(buffer, this._num_rounds);

    OoAes._put32x4(dst, buffer);
  }

  decrypt_simple(dst, src) {
    var buffer = [0, 0, 0, 0];

    OoAes._get32x4(buffer, src);

    this._addRoundKey(buffer, this._num_rounds);
    for (var r = this._num_rounds - 1; r >= 1; r--) {
      OoAes._invShiftRows(buffer);
      OoAes._invSubBytes(buffer);
      this._addRoundKey(buffer, r);
      OoAes._invMixColumns(buffer);
    }
    OoAes._invShiftRows(buffer);
    OoAes._invSubBytes(buffer);
    this._addRoundKey(buffer, 0);

    OoAes._put32x4(dst, buffer);
  }

  encode(uint8array){
    var array = [];

    var n = uint8array.length;
    var nb = (n + 15) / 16;

    var dst = new Array(16);
    for(var b = 0; b < nb; b++){
      var src = uint8array.slice(b * 16, (b + 1) * 16);
      this.encrypt(dst, src);
      for(var i = 0; i < 16; i++) array[b * 16 + i] = dst[i];
    }
    return array;
  }

  decode(aes8_array){
    var array = [];

    var n = aes8_array.length;
    var nb = n / 16;

    var dst = new Array(16);
    for(var b = 0; b < nb; b++){
      var src = aes8_array.slice(b * 16, (b + 1) * 16);
      this.decrypt(dst, src);
      for(var i = 0; i < 16; i++) array[b * 16 + i] = dst[i];
    }
    return array;
  }

}// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.apng = oo.apng || {};
oo.apng.png_signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

oo.asyncCreateApng = function (url, callback) {
  var apng = new OoApng();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = () => {
    apng.create(xhr.response, callback);
  };
  xhr.onerror = () => {
    oo.xx(callback);
  };
  xhr.onabort = xhr.onerror;
  xhr.ontimeout = xhr.onerror;
  xhr.send();
  return apng;
};

// class OoApng extends OoRenderSprite {
let OoApng = function (...arg) {
  new oo.RenderSprite();
  OoApng = class OoApng extends oo.RenderSprite {
    constructor() {
      super();

      this.image = null;
      this.is_apng = false;
      this.time0 = 0;
      this.current_frame = 0;
      this.frame_time0 = 0;
      this.play_counter = 0;
      this.frames = [];
    }

    _scanChunks(buffer, position, callback) {
      while (true) {
        var length = this.readUint32(buffer, position);
        var type = this.readString(buffer, position + 4, 4);
        callback(type, position, length);
        position += 8 + length + 4;
        if (position >= buffer.size) break;
        if (type === 'IEND') break;
      }
    }

    create(array_buffer, callback) {
      var buffer = new Uint8Array(array_buffer);

      // check png signature
      for (var i = 0; i < oo.apng.png_signature.length; i++) {
        if (buffer[i] !== oo.apng.png_signature[i]) {
          oo.xx(callback);
          return false;
        }
      }

      // scan chunk
      this._scanChunks(buffer, 8, (type, position, length) => {
        if (type === 'acTL') this.is_apng = true;
      });

      if (this.is_apng) {
        this._createApngImage(buffer, callback);
      } else {
        this._createPngImage(buffer, callback);
      }
    }

    _createPngImage(buffer, callback) {
      var blob = new Blob([buffer], { 'type': 'image/png' });
      this.image = new Image();
      this.image.src = URL.createObjectURL(blob);
      this.image.onload = function () {
        oo.xx(callback);
      };
      this.image.onerror = function () {
        oo.log('oo_apng : create error');
        oo.xx(callback);
      };

      // scan chunk
      this._scanChunks(buffer, 8, (type, position, length) => {
        if (type === 'IHDR') {
          this.width = this.readUint32(buffer, position + 8);
          this.height = this.readUint32(buffer, position + 8 + 4);
        }
      });
      this.size.set(this.width, this.height);
    }

    _createApngImage(buffer, callback) {
      var data = []; // buffer内での位置と長さの情報
      var func_table = {};

      func_table['IHDR'] = (pos, length) => {
        this.width = this.readUint32(buffer, pos + 8);
        this.height = this.readUint32(buffer, pos + 8 + 4);
        this.header = { pos: pos + 8, length: length };
      };
      func_table['acTL'] = (pos) => {
        this.num_frames = this.readUint32(buffer, pos + 8);
        this.num_plays = this.readUint32(buffer, pos + 8 + 4);
      };

      func_table['fcTL'] = (pos) => {
        var frame = {};
        frame.sequence_number = this.readUint32(buffer, pos + 8);
        frame.width = this.readUint32(buffer, pos + 8 + 4);
        frame.height = this.readUint32(buffer, pos + 8 + 8);
        frame.x_offset = this.readUint32(buffer, pos + 8 + 12);
        frame.y_offset = this.readUint32(buffer, pos + 8 + 16);
        frame.delay_num = this.readUint16(buffer, pos + 8 + 20);
        frame.delay_den = this.readUint16(buffer, pos + 8 + 22);
        frame.dispose_op = this.readUint8(buffer, pos + 8 + 24);
        frame.blend_op = this.readUint8(buffer, pos + 8 + 25);
        frame.data = [];
        this.frames.push(frame);
      };
      func_table['fdAT'] = (pos, length) => {
        var n = this.frames.length;
        if (n) this.frames[n - 1].data.push({ pos: pos + 8 + 4, length: length - 4 });
      };
      func_table['IDAT'] = (pos, length) => {
        var n = this.frames.length;
        if (n) this.frames[n - 1].data.push({ pos: pos + 8, length: length });
      };

      // scan chunk
      this._scanChunks(buffer, 8, (type, position, length) => {
        if (type === 'IEND') return;
        if (func_table[type]) {
          func_table[type](position, length);
        } else {
          data.push({ pos: position, length: 12 + length });
        }
      });

      this._createFrameImages(buffer, data, callback);
      super.create(this.width, this.height);
    }

    _createFrameImages(buffer, data, callback) {
      // 各イメージ作成が非同期処理であるため、
      // 全体としても非同期処理を行う
      var nnCreateFrameImage = (frame, callback) => {
        return oo.nn((frame, callback) => {
          var blob_array = [];
          // signature
          blob_array.push(oo.apng.png_signature);
          // IHDR chunk
          var u8 = this.makeU8(buffer, this.header);
          this.writeUint32(u8, 0, frame.width);
          this.writeUint32(u8, 4, frame.height);
          blob_array.push(this.makeChunk('IHDR', u8, 0, u8.length));
          // chunk
          for (let d of data) blob_array.push(this.makeU8(buffer, d));
          // IDAT chunk
          for (let d of frame.data) blob_array.push(this.makeChunk('IDAT', buffer, d.pos, d.length));
          // IEND chunk
          blob_array.push(this.makeChunk('IEND', null, 0, 0));
          // 画像生成
          var blob = new Blob(blob_array, { 'type': 'image/png' });
          frame.img = new Image();
          frame.img.src = URL.createObjectURL(blob);
          frame.img.onload = () => { oo.xx(callback); };
          frame.img.onerror = () => {
            oo.log('oo_apng : create error');
            oo.xx(callback);
          };
        }, frame, callback);
      };

      var self = this;
      oo.serial(function* () {
        for (let frame of self.frames) {
          yield nnCreateFrameImage(frame);
        }
      }, () => { oo.xx(callback); });
    }

    makeU8(buffer, data) {
      var u8 = new Uint8Array(data.length);
      for (var i = 0; i < data.length; i++) u8[i] = buffer[data.pos + i];
      return u8;
    }

    makeChunk(type, buffer, pos, length) {
      var total = type.length + length;
      var u8 = new Uint8Array(total + 8);
      this.writeUint32(u8, 0, length);
      this.writeString(u8, 4, type);
      var s = type.length + 4;
      for (var i = 0; i < length; i++) u8[s + i] = buffer[pos + i];
      this.writeUint32(u8, total + 4, OoCrc.get(u8, 4, total));
      return u8;
    }

    writeUint32(buffer, pos, n) {
      buffer[pos + 0] = (n >>> 24) & 0xff;
      buffer[pos + 1] = (n >>> 16) & 0xff;
      buffer[pos + 2] = (n >>> 8) & 0xff;
      buffer[pos + 3] = n & 0xff;
    }
    writeString(buffer, pos, str) {
      for (var i = 0; i < str.length; i++) buffer[pos + i] = str.charCodeAt(i);
    }

    readUint8(buffer, pos) { return buffer[pos]; }
    readUint16(buffer, pos) { return (buffer[pos] << 8) | buffer[pos + 1]; }
    readUint32(buffer, pos) { return (this.readUint16(buffer, pos) << 16) | this.readUint16(buffer, pos + 2); }

    readString(buffer, pos, length) {
      var str = '';
      for (var i = 0; i < length; i++) {
        str += String.fromCharCode(buffer[pos + i]);
      }
      return str;
    }

    start() {
      this.play_counter = 0;
      this.setStartFrame();
    }

    setStartFrame() {
      if (!this.is_apng) return;

      this.time0 = Date.now();
      this.current_frame = 0;
      this.frame_time0 = 0;

      this.canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      var frame = this.frames[0];
      if (frame.dispose_op === 2) this.pushCanvas();
      this.canvas_context.drawImage(frame.img, frame.x_offset, frame.y_offset);
    }

    pushCanvas() {
      this.image_data = this.canvas_context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    popCanvas() {
      this.canvas_context.putImageData(this.image_data, 0, 0);
    }

    update() {
      if (!this.is_apng) return;

      if (this.time0 === 0) this.start();

      if ((this.num_plays !== 0) && (this.play_counter >= this.num_plays)) return;

      var elapsed_time = Date.now() - this.time0;

      while (true) {
        var frame = this.frames[this.current_frame];
        var delay_num = frame.delay_num;
        var delay_den = frame.delay_den || 100;

        if (this.frame_time0 * delay_den + delay_num * 1000 > elapsed_time * delay_den) break;

        // フレーム更新    
        this.frame_time0 += 1000 * delay_num / delay_den;
        this.current_frame++;
        if (this.current_frame >= this.num_frames) {
          this.play_counter++;
          this.setStartFrame();
          break;
        } else {
          var frame2 = this.frames[this.current_frame];

          // dispose_op
          // 0 : APNG_DISPOSE_OP_NONE
          // 1 : APNG_DISPOSE_OP_BACKGROUND
          // 2 : APNG_DISPOSE_OP_PREVIOUS
          if (frame.dispose_op === 1) this.canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          if (frame.dispose_op === 2) {
            this.popCanvas();
          } else {
            if (frame2.dispose_op === 2) this.pushCanvas();
          }

          // blend_op
          // 0 : APNG_BLEND_OP_SOURCE
          // 1 : APNG_BLEND_OP_OVER
          if (frame2.blend_op === 0) {
            this.canvas_context.clearRect(frame2.x_offset, frame2.y_offset, frame2.width, frame2.height);
          }
          this.canvas_context.drawImage(frame2.img, frame2.x_offset, frame2.y_offset);
        }
      }
    }

  };
  return new OoApng(...arg);
};// OoLibrary Copyright (c) wanu@nyagoya
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

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoBenchmark {
  constructor() {
    this.num_rounds = 10;
    this.num_times_digits = 8;

    this.test_function = [];
    this.test_function_name = [];
  }

  // 0   : 共通処理(通常空ループのみ)
  // 1   : 基準テスト
  // >=2 : 比較テスト
  addTestFunction(name, func) {
    this.test_function_name.push(name);
    this.test_function.push(func);
  }

  getTime(n, func) {
    var t0 = performance.now();
    func(n);
    var t1 = performance.now();
    return t1 - t0;
  }

  run() {
    var n = Math.pow(10, this.num_times_digits);

    var t = [];
    var m = [];

    oo.log('test count : ' + n);

    for (var r = 0; r < this.num_rounds; r++) {
      oo.log('round : ' + r);
      oo.each(this.test_function, (e, i) => {
        t[i] = this.getTime(n, e);
        m[i] = Math.min(m[i] || t[i], t[i]);
        oo.log('..' + this.test_function_name[i] + ' : ' + t[i].toFixed(1));
      });
    }

    oo.log('----');

    oo.log('weight');
    var w = [];
    oo.each(this.test_function, (e, i) => {
      w[i] = m[i] - m[0];
      oo.log('..' + this.test_function_name[i] + ' : ' + w[i].toFixed(1));
    });

    oo.log('----');

    oo.log('ratio');
    oo.each(this.test_function, (e, i) => {
      oo.log('..' + this.test_function_name[i] + ' : ' + (w[i] / w[1]).toFixed(2));
    });

    oo.log('----');
  }
}// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoBuffer {
  constructor(size) {
    this.init();
    if (size) this.createFixed(size);
  }

  init() {
    this.buffer = null;
    this.buffer_size = 0;
    this.data_size = 0;
    this.position = 0;
    this.eos = false;
    this.auto_grow = false;
  }

  release() {
    this.init();
  }

  open(buffer, size) {
    this.init();
    this.buffer = buffer;
    this.buffer_size = size;
    this.position = 0;
    this.eos = false;
    return true;
  }

  create(size) {
    this.init();
    this.buffer = new Uint8Array(size);
    this.buffer_size = size;
    this.auto_grow = true;
    return true;
  }

  createFixed(size) {
    this.init();
    this.buffer = new Uint8Array(size);
    this.buffer_size = size;
    return true;
  }

  createFromBuffer(buffer, size) {
    this.create(size);
    if (this.write(buffer, size) != size) return false;
    return true;
  }

  growBuffer(addition_size) {
    if (this.auto_grow === false) return false;
    addition_size = addition_size || this.buffer_size;
    var new_buffer = new Uint8Array(this.buffer_size + addition_size);
    for (var i = 0; i < this.buffer_size; i++) new_buffer[i] = this.buffer[i];
    this.buffer = new_buffer;
    this.buffer_size += addition_size;
    return true;
  }

  write(buffer, size) {
    if (this.auto_grow) {
      if (size > this.buffer_size - this.position) {
        var addition_size = size - (this.buffer_size - this.position);
        this.growBuffer(Math.max(this.buffer_size, addition_size));
      }
    }
    var remain = this.buffer_size - this.position;
    var actual_write = (size < remain) ? size : remain;
    for (var i = this.position; i < this.position + actual_write; i++) {
      this.buffer[i] = buffer[i];
    }
    this.position += actual_write;
    if (this.position >= this.buffer_size) this.eos = true;
    return actual_write;
  }

  writeUint8(n, position) {
    if (position === void 0) position = this.position;
    this.buffer[position] = n & 0xff;
  }

  writeUint16(n, position) {
    if (position === void 0) position = this.position;
    this.buffer[position + 0] = (n >>> 8) & 0xff;
    this.buffer[position + 1] = n & 0xff;
  }

  writeUint32(n, position) {
    if (position === void 0) position = this.position;
    this.buffer[position + 0] = (n >>> 24) & 0xff;
    this.buffer[position + 1] = (n >>> 16) & 0xff;
    this.buffer[position + 2] = (n >>> 8) & 0xff;
    this.buffer[position + 3] = n & 0xff;
  }

  writeString(str, position) {
    if (position === void 0) position = this.position;
    for (var i = 0; i < str.length; i++) {
      this.buffer[position + i] = str.charCodeAt(i);
    }
  }

  readUint8(position) {
    if (position === void 0) position = this.position;
    return this.buffer[position];
  }

  readUint16(position) {
    if (position === void 0) position = this.position;
    return (this.buffer[position] << 8) | this.buffer[position + 1];
  }

  readUint32(position) {
    if (position === void 0) position = this.position;
    return (this.buffer[position + 3] << 24) | (this.buffer[position + 2] << 16) | (this.buffer[position] << 8) | this.buffer[position + 1];
  }

  readString(length, position) {
    if (position === void 0) position = this.position;
    var str = '';
    for (var i = 0; i < length; i++) {
      str += String.fromCharCode(this.buffer[position + i]);
    }
    return str;
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.context = null;
oo.env.font_family = "'Hiragino Kaku Gothic ProN', 'sans-serif'";

oo.blendMode = {
  kNormal: 0,
  kScreen: 1,
  kAdd: 2,
  kMul: 3,
};

oo.getCompositeOperationByBlendMode = function (blend_mode) {
  let operation = 'source-over';
  if (blend_mode === oo.blendMode.kScreen) operation = 'screen';
  if (blend_mode === oo.blendMode.kAdd) operation = 'lighter';
  if (blend_mode === oo.blendMode.kMul) operation = 'multiply';
  return operation;
};

oo.localAlpha = function (context, alpha, func) {
  if (alpha === 0) return;
  var a = context.globalAlpha;
  context.globalAlpha = a * alpha;
  func();
  context.globalAlpha = a;
};

oo.localComposite = function (context, composite_operation, func) {
  var co = context.globalCompositeOperation;
  context.globalCompositeOperation = composite_operation;
  func();
  context.globalCompositeOperation = co;
};

oo.drawImage = function (context, image, x, y, w, h) {
  if (!image) return;
  var iw = w || image.width;
  var ih = h || image.height;
  context.drawImage(image, x, y, iw, ih);
};

oo.drawImageCenter = function (context, image, x, y, w, h) {
  if (!image) return;
  var iw = w || image.width;
  var ih = h || image.height;
  context.drawImage(image, x - iw * 0.5, y - ih * 0.5, iw, ih);
};

// 可変枠の描画(縦横の中心2x2ドットが可変サイズとなる中部分)
oo.drawPatchImage = function (context, image, x, y, w, h) {
  if (!image) return;
  var mx = (image.width - 2) / 2;
  var my = (image.height - 2) / 2;

  var sx = [0, mx, mx + 2];
  var sy = [0, my, my + 2];
  var sw = [mx, 2, mx];
  var sh = [my, 2, my];

  var dx = [x, x + mx, x + w - mx];
  var dy = [y, y + my, y + h - my];
  var dw = [mx, w - mx * 2, mx];
  var dh = [my, h - my * 2, my];

  for (var j = 0; j < 3; j++) {
    for (var i = 0; i < 3; i++) {
      context.drawImage(image, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]);
    }
  }
};

oo.drawRoundRect = function (context, x, y, w, h, radius, fill, stroke) {
  var r = (radius === void 0) ? 5 : radius;
  if (stroke === void 0) stroke = true;

  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();

  if (fill) context.fill();
  if (stroke) context.stroke();
};

oo.setTextAttributes = function (context, fontSize, fillStyle, textAlign, textBaseline) {
  context.font = `${fontSize}px ` + oo.env.font_family;
  context.fillStyle = fillStyle;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
};

// 画像内の矩形サイズでcanvasをリサイズして描画
// rect: { x, y, w, h }
oo.resizeCanvasDrawImage = function (canvas_id, image, rect, scale) {
  var canvas = document.getElementById(canvas_id);
  canvas.width = rect.w * scale;
  canvas.height = rect.h * scale;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w * scale, rect.h * scale);
};

// ブラウザのダウンロード指定のフォルダに保存する
// ext 'jpg' || ' png'
oo.saveCanvasImage = function (canvas_id, file_name, ext, quality) {
  var canvas = document.getElementById(canvas_id);
  var link = document.createElement('a');
  if (ext === 'jpg') link.href = canvas.toDataURL('image/jpeg', quality);
  if (ext === 'png') link.href = canvas.toDataURL('image/png');
  link.download = file_name + '.' + ext;
  link.click();
};
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

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.copyright = 'OoLibrary Copyright (c) wanu@nyagoya';
oo.env = oo.env || {};
oo.env.debug_log = false;
oo.env.sample_text = 'The quick brown fox jumps over the lazy dog.';

oo.isObject = obj => { return (typeof obj === 'object') && (obj !== null) && !Array.isArray(obj); };
oo.isArray = obj => { return Array.isArray(obj); };
oo.isFunction = obj => { return typeof obj === 'function'; };
oo.isString = obj => { return typeof obj === 'string'; };
oo.qq = (v, value) => { return (v !== void 0) ? v : value; };
oo.xx = (func, ...args) => { func && func(...args); };
oo.array = (n, v) => { return (new Array(n)).fill(v); };
oo.arrayMap = (n, callback) => { return (new Array(n)).fill().map((e, i, a) => callback(e, i, a)); };

// ex.
// oo.each(array, 'method');
// oo.each(array, 'method', arg);
// oo.each(array, (e, i, a) => { });
oo.each = (array, func, ...args) => {
  if (!Array.isArray(array)) return;
  oo.isString(func) && array.forEach(e => e[func](...args));
  oo.isFunction(func) && array.forEach((e, i, a) => func(e, i, a));
};

oo.repeat = (n, func) => { for (var i = 0; i < n; i++) func(i); };

// ES2016: array.includes(value)
oo.find = (value, array) => { return (array.indexOf(value) >= 0) ? true : false; };

oo.clone = obj => { return Object.assign({}, obj); };

oo.deepClone = obj => {
  if (typeof obj !== 'object') return obj;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(x => oo.deepClone(x));
  return Object.fromEntries(Object.entries(obj).map(x => [x[0], oo.deepClone(x[1])]));
};

oo.main = callback => {
  const oo_env = { main: callback };
  if (document.currentScript) {
    document.currentScript.oo_env = oo_env;
    oo_env.src = document.currentScript.src;
  }
  document.addEventListener('DOMContentLoaded', () => {
    callback(oo_env);
  }, false);
};

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
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

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

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoDrawObject {
  constructor() {
    this.context = null;
    this.show = true;
    this.position = new Oo3DVector(0);
    this.rotation = new Oo3DVector(0);
    this.scale = new Oo3DVector(1);
    this.alpha = 1;
    this.blend_mode = oo.blendMode.kNormal;
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.backSlashToSlash = function (path) {
  var s = '';
  for (var i = 0; i < path.length; i++) {
    var c = path.charAt(i);
    s += (c === '\\') ? '/' : c;
  }
  return s;
};

oo.addPath = function (folder, filename) {
  if (folder.substr(-1) !== '/') folder += '/';
  return folder + filename;
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

oo.saveBlob = function (filename, blob) {
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

oo.saveBin = function (filename, array) {
  var u8a = new Uint8Array(array);
  oo.saveBlob(filename, new Blob([u8a]));
};

oo.saveText = function (filename, text) {
  oo.saveBlob(filename, new Blob([text], { type: 'text/plain' }));
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

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.fxs = oo.fxs || {};

oo.fxsRotationType = {
  kNormal: 0,
  kDirection: 1,
};

oo.fxsDirectionType = {
  kNormal: 0,
  kSphere: 1,
  kDist: 2,
  kCenter: 3,
  kCustom: -1,
};

oo.fxsDistributionType = {
  kNone: 0,
  kUniform: 1,
  kBall: 2,
  kSphere: 3,
  kCustom: -1,
};

oo.OoFxsLerpParam = class {
  constructor(a, b, p) {
    this.a = (a === void 0) ? 0 : a;
    this.b = (b === void 0) ? 0 : b;
    this.p = (p === void 0) ? 0 : p;
  }
};

oo.OoFxsEmitterFrame = class {
  constructor() {
    this.frame_num = 0;
    this.num_ppf = 0;
    this.life_time = 0;
    this.life_time_dist = 0;
    this.direction_type = oo.fxsDirectionType.kNormal;
    this.direction_func = null;
    this.direction = new Oo3DVector(0);
    this.direction_dist = 0;
    this.velocity0 = 0; // dist min
    this.velocity1 = 0; // dist max
    this.distribution_type = oo.fxsDistributionType.kNone;
    this.position = new Oo3DVector(0);
    this.position_dist = new Oo3DVector(0);
    this.scale0 = 1; // dist min
    this.scale1 = 1; // dist max
    this.rotation0 = 0; // dist min
    this.rotation1 = 0; // dist max
    this.rotate_v0 = 0; // dist min
    this.rotate_v1 = 0; // dist max
    this.frame_offset_dist = 0;
    // エミッタの放出
    this.num_generate_emitter = 0;
    this.generate_emitter_type = null;
    this.deceleration = 0; // 減速率
  }
};

oo.OoFxsParticleFrame = class {
  constructor() {
    this.frame_num = 0;
    this.scale = new Oo2DVector(1);
    this.deceleration = 0; // 減速率
    this.alpha = 1;
  }
};

oo.OoFxsTypeBase = class {
  constructor() {
    this.frame_data = [];
    this.frame_lerp_array = [];
  }

  createFrameLerpArray() {
    var n = this.frame_data.length;
    // var max_frames = this.frame_data[n - 1].frame_num;
    var i = 0;
    var a = 0;
    var b = 0;
    for (var j = 0; j < n; j++) {
      for (; i < this.frame_data[j].frame_num; i++) {
        var fn0 = this.frame_data[a].frame_num;
        var fn1 = this.frame_data[b].frame_num;
        var p = oo.linearStep(fn0, fn1, i);
        this.frame_lerp_array[i] = new oo.OoFxsLerpParam(a, b, p);
      }
      a = b;
      b = Math.min(b + 1, n - 1);
    }
    this.frame_lerp_array[i] = new oo.OoFxsLerpParam(b, b, 0);
  }

  getFrameLerpParam(frame_num) {
    if (frame_num < 0) return this.frame_lerp_array[0];
    var n = this.frame_lerp_array.length;
    if (frame_num >= n) return this.frame_lerp_array[n - 1];
    return this.frame_lerp_array[frame_num];
  }

  getFrameData(frame_num) {
    var lp = this.getFrameLerpParam(frame_num);
    return this.frame_data[lp.a];
  }
};

oo.OoFxsParticleType = class extends oo.OoFxsTypeBase {
  constructor(pt) {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.size = new Oo2DVector(1);
    this.center = new Oo2DVector(0); // min -0.5, max 0.5
    this.texture_file = '';
    this.texture_image = null;
    this.world = false;
    this.gravity = 0;

    if (oo.isObject(pt)) Object.assign(this, pt);
  }

  getFrameData(frame_num) {
    var lp = this.getFrameLerpParam(frame_num);
    var a = this.frame_data[lp.a];
    var b = this.frame_data[lp.b];

    var fd = new oo.OoFxsParticleFrame();
    fd.frame_num = frame_num;
    fd.alpha = oo.lerp(a.alpha, b.alpha, lp.p);
    fd.scale.x = oo.lerp(a.scale.x, b.scale.x, lp.p);
    fd.scale.y = oo.lerp(a.scale.y, b.scale.y, lp.p);
    fd.deceleration = oo.lerp(a.deceleration, b.deceleration, lp.p);
    return fd;
  }
};

oo.OoFxsEmitterType = class extends oo.OoFxsTypeBase {
  constructor(et) {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.particle_name = '';
    this.max_particles = 0;

    this.gravity = 0;

    if (oo.isObject(et)) Object.assign(this, et);
  }
};

oo.OoFxsEmitterStatus = class {
  constructor() {
    this.show = true;
    this.current_frame = -1;
    this.num_particles = 0;

    this.emitter_type = null;
    this.particle_type = null;

    this.particle_status_array = [];
    this.random = new OoRandom();

    // エミッターも動かせるようにする
    this.position = new Oo3DVector(0);
    this.velocity = new Oo3DVector(0);
  }

  createParticleStatusArray() {
    // パーティクルバッファ固定確保
    this.particle_status_array = [];
    for (var i = 0; i < this.emitter_type.max_particles; i++) {
      this.particle_status_array[i] = new oo.OoFxsParticleStatus();
    }
  }

  generateParticle(ps, ef, pt, root_position) {
    ps.current_frame = -1;
    ps.current_frame += Math.floor(ef.frame_offset_dist * Math.random());
    ps.life_time = ef.life_time;

    ps.position.set(ef.position);
    if (ef.distribution_type === oo.fxsDistributionType.kUniform) {
      ps.position.x += ef.position_dist.x * (Math.random() * 2.0 - 1.0);
      ps.position.y += ef.position_dist.y * (Math.random() * 2.0 - 1.0);
      ps.position.z += ef.position_dist.z * (Math.random() * 2.0 - 1.0);
    }
    if (ef.distribution_type === oo.fxsDistributionType.kBall) {
      var d = this.random.getBall();
      ps.position.x += ef.position_dist.x * d.x;
      ps.position.y += ef.position_dist.y * d.y;
      ps.position.z += ef.position_dist.z * d.z;
    }
    if (ef.distribution_type === oo.fxsDistributionType.kSphere) {
      var d = this.random.getSphere();
      ps.position.x += ef.position_dist.x * d.x;
      ps.position.y += ef.position_dist.y * d.y;
      ps.position.z += ef.position_dist.z * d.z;
    }

    if (pt.world) {
      ps.position.add(this.position);
      ps.position.add(root_position);
    }

    var v = oo.lerp(ef.velocity0, ef.velocity1, Math.random());
    if (ef.direction_type === oo.fxsDirectionType.kNormal) {
      ps.velocity.x = ef.direction.x * v;
      ps.velocity.y = ef.direction.y * v;
      ps.velocity.z = ef.direction.z * v;
    }
    if (ef.direction_type === oo.fxsDirectionType.kSphere) {
      var d = this.random.getSphere();
      ps.velocity.x = d.x * v;
      ps.velocity.y = d.y * v;
      ps.velocity.z = d.z * v;
    }
    if (ef.direction_type === oo.fxsDirectionType.kCustom) {
      if (ef.direction_func) {
        var d = ef.direction_func();
        ps.velocity.x = d.x * v;
        ps.velocity.y = d.y * v;
        ps.velocity.z = d.z * v;
      }
    }

    var s = oo.lerp(ef.scale0, ef.scale1, Math.random());
    ps.size.x = pt.size.x * s;
    ps.size.y = pt.size.y * s;

    ps.rotation = oo.lerp(ef.rotation0, ef.rotation1, Math.random());
    ps.rotate_v = oo.lerp(ef.rotate_v0, ef.rotate_v1, Math.random());
  }

  update(root_position) {
    var es = this;
    var et = es.emitter_type;
    var pt = es.particle_type;

    es.current_frame++;
    if (et.loop) es.current_frame %= et.total_frames;
    var ef = et.getFrameData(es.current_frame);

    // エミッタ移動
    es.position.add(es.velocity);
    es.velocity.mul(1 - ef.deceleration);
    es.velocity.y += et.gravity;

    let j = 0;
    for (let i = 0; i < es.num_particles; i++) {
      if (es.particle_status_array[i].life_time <= 0) continue;
      if (i !== j) {
        es.particle_status_array[j] = es.particle_status_array[i];
      }
      j++;
    }
    es.num_particles = j;
    es.particle_status_array.length = j;

    // パーティクル生成
    var np = es.num_particles;
    let ppf = ef.num_ppf;
    if (ppf < 1.0) {
      if (Math.random() < ppf) ppf = 1;
    }
    ppf = Math.floor(ppf);

    for (let i = 0; i < ppf; i++) {
      if (es.num_particles >= et.max_particles) break;
      es.particle_status_array[np + i] = new oo.OoFxsParticleStatus();
      this.generateParticle(es.particle_status_array[np + i], ef, es.particle_type, root_position);
      es.num_particles++;
    }

    // パーティクル移動
    for (let i = 0; i < es.num_particles; i++) {
      var ps = es.particle_status_array[i];

      ps.current_frame++;
      var pf = es.particle_type.getFrameData(ps.current_frame);

      ps.life_time--;
      ps.position.add(ps.velocity);
      ps.scale.set(pf.scale);
      ps.rotation += ps.rotate_v;
      // 減速率
      ps.velocity.mul(1 - pf.deceleration);
      ps.velocity.y += pt.gravity;
    }
  }

  draw(context, root_position, image) {
    var es = this;
    for (var i = 0; i < es.num_particles; i++) {
      var ps = es.particle_status_array[i];
      var pt = es.particle_type;

      if (ps.life_time < 0) continue;

      var sx = ps.size.x * ps.scale.x;
      var sy = ps.size.y * ps.scale.y;

      var px = ps.position.x;
      var py = ps.position.y;
      // var pz = ps.position.z;

      if (!pt.world) {
        px += root_position.x + this.position.x;
        py += root_position.y + this.position.y;
        // pz += root_position.z;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.translate(px, py);
      context.rotate(ps.rotation * Math.PI / 180);
      context.drawImage(pt.image,
        - sx * (0.5 + pt.center.x),
        - sy * (0.5 + pt.center.y),
        sx, sy);
    }
  }
};

oo.OoFxsParticleStatus = class {
  constructor() {
    this.current_frame = 0;
    this.life_time = 0;
    this.position = new Oo3DVector(0);
    this.velocity = new Oo3DVector(0);
    this.size = new Oo2DVector(1);
    this.scale = new Oo2DVector(1);
    this.rotation = 0;
    this.rotate_v = 0;
  }
};

oo.OoFxs = class {
  constructor() {
    this.position = new Oo3DVector(0);
    this.random = new OoRandom();
    this.emitter_status_array = [];
  }

  create(emitter_type, particle_type) {
    this.emitter_status_array = [];
    this.generateEmitter(emitter_type, particle_type);
  }

  generateEmitter(emitter_type, particle_type) {
    var es = new oo.OoFxsEmitterStatus();
    es.emitter_type = emitter_type;
    es.particle_type = particle_type;
    es.createParticleStatusArray();
    this.emitter_status_array.push(es);
  }

  update() {
    // エミッタの生成
    const n = this.emitter_status_array.length;
    for (let i = 0; i < n; i++) {
      const es = this.emitter_status_array[i];
      const et = es.emitter_type;
      const ef = et.getFrameData(es.current_frame);
      if (ef.num_generate_emitter && ef.generate_emitter_type) {
        for (let j = 0; j < ef.num_generate_emitter; j++) {
          // 暫定処置(パーティクルタイプは各エミッタ情報の中に置くべき)
          this.generateEmitter(ef.generate_emitter_type, es.particle_type);
          let xs = this.emitter_status_array[this.emitter_status_array.length - 1];
          // xs.position.set(ef.position);
          // xs.position.add(es.position);
          // xs.position.add(this.position);
          var v = oo.lerp(ef.velocity0, ef.velocity1, Math.random());
          if (ef.direction_type === oo.fxsDirectionType.kNormal) {
            xs.velocity.x = ef.direction.x * v;
            xs.velocity.y = ef.direction.y * v;
            xs.velocity.z = ef.direction.z * v;
          }
          if (ef.direction_type === oo.fxsDirectionType.kSphere) {
            var d = this.random.getSphere();
            xs.velocity.x = d.x * v;
            xs.velocity.y = d.y * v;
            xs.velocity.z = d.z * v;
          }
          if (ef.direction_type === oo.fxsDirectionType.kCustom) {
            if (ef.direction_func) {
              var d = ef.direction_func();
              xs.velocity.x = d.x * v;
              xs.velocity.y = d.y * v;
              xs.velocity.z = d.z * v;
            }
          }
        }
      }
    }

    for (let es of this.emitter_status_array) {
      es.update(this.position);
    }
  }

  draw(context) {
    context.save();
    for (var es of this.emitter_status_array) {
      es.draw(context, this.position, this.image);
    }
    context.restore();
  }
};// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameAnime {
  constructor() {
    this.times = 30;
    this.counter = -1;

    this.effects = new Set();
    this.overwrite_effect = false;
    this.overwrite_alpha = 0;
    this.overwrite_blend_mode = oo.blendMode.kNormal;
    this.tile_effect = false;
    this.tile_alpha = 0;
    this.tile_color = '#000000';
    this.scale = new Oo2DVector(1, 1);
  }

  init() {
    this.counter = -1;
    this.effects.clear();
    this.overwrite_effect = false;
    this.overwrite_alpha = 0;
    this.overwrite_blend_mode = oo.blendMode.kNormal;
    this.tile_effect = false;
    this.tile_alpha = 0;
    this.scale.set(1, 1);
  }

  start(effect_type) {
    this.counter = 0;
    this.effects.add(effect_type);
  }

  onCompletion() { }

  update() {
    if (this.counter >= 0) {
      for (var name of this.effects) this[name].call(this);

      this.counter++;
      if (this.counter >= this.times) {
        this.onCompletion();
        this.init();
      }
    }
  }

  pop() {
    this.scale.x = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.0, 0.1));
    this.scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.0, 0.1));
  }

  push() {
    this.scale.x = Math.pow(2.0, - oo.attenuatedSineWave(this.counter, 0, this.times, 1.5, 0.1));
    this.scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.counter, 0, this.times, 1.5, 0.2));
  }

  add() {
    this.overwrite_effect = true;
    this.overwrite_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
    this.overwrite_blend_mode = oo.blendMode.kAdd;
  }

  mul() {
    this.overwrite_effect = true;
    this.overwrite_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
    this.overwrite_blend_mode = oo.blendMode.kMul;
  }

  tile() {
    this.tile_effect = true;
    this.tile_alpha = oo.attenuatedSineWave(this.counter, 0, this.times, 0.5, 0.5);
  }

  light() { this.add(); }
  dark() { this.mul(); }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameButton {
  constructor(name, x, y, w, h, image) {
    this.context = null;
    this.show = true;
    this.name = name;
    this.enable = true;
    this.position = new Oo2DVector(x, y);
    this.size = new Oo2DVector(w, h);

    this.image = image;
    this.patch_image = false;

    this.anime = new OoGameAnime();
    this.anime.onCompletion = () => { this.onCompletion(); };

    // this.anime_times = 30;
    // this.anime_counter = -1;
    // this.animeCompletion = null;

    // this.anime_scale = new Oo2DVector(1, 1);
    // this.anime_overwrite_effect = false;
    // this.anime_overwrite_alpha = 0;

    // this.anime_effect_func = {};
    // this.anime_effect_func['pop'] = this.animePop;
    // this.anime_effect_func['push'] = this.animePush;
    // this.anime_effect_func['light'] = this.animeAdd;
    // this.anime_effect_func['add'] = this.animeAdd;
    // this.anime_effect_func['dark'] = this.animeMul;
    // this.anime_effect_func['mul'] = this.animeMul;
    // this.anime_effect_func['tile'] = this.animeTile;
    // this.anime_effect = new Set();

    // this.anime_tile_effect = false;
    // this.anime_tile_alpha = 0;
  }

  // プリセットアニメ
  // 継承先で変更する
  // animePop() {
  //   this.anime_scale.x = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.0, 0.1));
  //   this.anime_scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.0, 0.1));
  // }

  // animePush() {
  //   this.anime_scale.x = Math.pow(2.0, - oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.5, 0.1));
  //   this.anime_scale.y = Math.pow(2.0, oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 1.5, 0.2));
  // }

  // animeAdd() {
  //   this.anime_overwrite_effect = true;
  //   this.blend_mode = oo.blendMode.kAdd;
  //   this.anime_overwrite_alpha = oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 0.5, 0.5);
  // }

  // animeMul() {
  //   this.anime_overwrite_effect = true;
  //   this.blend_mode = oo.blendMode.kMul;
  //   this.anime_overwrite_alpha = oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 0.5, 0.5);
  // }

  // animeTile() {
  //   this.anime_tile_effect = true;
  //   this.anime_tile_alpha = oo.attenuatedSineWave(this.anime_counter, 0, this.anime_times, 0.5, 0.5);
  // }

  contains(point) {
    var dx = this.position.x - point.x;
    var dy = this.position.y - point.y;
    if (Math.abs(dx) > this.size.x * 0.5) return false;
    if (Math.abs(dy) > this.size.y * 0.5) return false;
    return true;
  }

  onClick() { }
  onCompletion() { }

  click(point) {
    if (this.contains(point)) {
      this.onClick();
      return true;
    } else {
      return false;
    }
  }

  // effect_type : 'pop', 'push', 'light'(add), 'dark'(mul), 'tile'
  startAnime(effect_type) {
    this.anime.start(effect_type);
    // this.anime_counter = 0;
    // this.anime_effect.add(effect_type);
  }

  update() {
    this.anime.update();
    // if (this.anime_counter >= 0) {
    //   for (var name of this.anime_effect) this.anime_effect_func[name].call(this);

    //   this.anime_counter++;
    //   if (this.anime_counter >= this.anime_times) {
    //     if (this.animeCompletion) this.animeCompletion();
    //     this.anime_effect.clear();
    //     this.anime_counter = -1;
    //     this.anime_overwrite_effect = false;
    //     this.anime_overwrite_alpha = 0;
    //     this.anime_tile_effect = false;
    //     this.anime_tile_alpha = 0;
    //     this.anime_scale.set(1, 1);
    //   }
    // }
  }

  _drawCore(ctx) {
    var sx = this.size.x * this.anime.scale.x;
    var sy = this.size.y * this.anime.scale.y;
    if (this.patch_image) {
      oo.drawPatchImage(ctx, this.image, this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
    } else {
      oo.drawImage(ctx, this.image, this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
    }
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    if (this.image) {
      this._drawCore(ctx);
      if (this.anime.overwrite_effect) {
        oo.localAlpha(ctx, this.anime.overwrite_alpha, () => {
          var co = oo.getCompositeOperationByBlendMode(this.anime.overwrite_blend_mode);
          oo.localComposite(ctx, co, () => {
            this._drawCore(ctx);
          });
        });
      }
    }

    if (this.anime.tile_effect) {
      oo.localAlpha(ctx, this.anime.tile_alpha, () => {
        ctx.fillStyle = this.anime.tile_color;
        var sx = this.size.x * this.anime.scale.x;
        var sy = this.size.y * this.anime.scale.y;
        ctx.fillRect(this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
      });
    }
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.os = '';

class OoGameFrame {
  constructor() {
    this.game_loop_type = 2;
    this.fps = 60;

    this.horizontal_scaling = false;
    this.vertical_scaling = false;

    this.screen_width = 1080;
    this.screen_height = 1920;
    this.scale = 1;

    this.canvas;
    this.context;
    this.scene_array = [];
    this.scene_map = new Map();

    this.click_on = false;
    this.click_position = new Oo2DVector(0);

    this.input = new OoGameInput();
    this.touch_on = false;
    this.touch_press = false;
    this.touch_position = new Oo2DVector(0);
    this.touch_delta = new Oo2DVector(0);

    try {
      // window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audio_context = new AudioContext();
    }
    catch (e) {
      console.log('oo:new AudioContext() exception');
    }
  }

  addScene(scene) {
    scene.frame = this;
    this.scene_array.push(scene);
    this.scene_map.set(scene.name, scene);
  }

  startScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kStart);
  }

  endScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kEnd);
  }

  getScene(name) {
    return this.scene_map.get(name);
  }

  setSceneStatus(name, scene_status) {
    var scene = this.getScene(name);
    if (scene) scene.scene_status = scene_status;
  }

  update() {
    var status = new OoGameInputStatus();
    status.touch_press = this.touch_press || this.touch_on;
    status.touch_position = this.touch_position.clone();
    this.input.addStatus(status);

    this.touch_on = false;
    this.touch_delta = new Oo2DVector(0);

    // this.input.update();
    // this.click_on = this.input.click_on;
    // this.click_position = this.input.click_position.clone();

    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.update();
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kEnd) {
        scene.release();
        scene.scene_status = oo.gameSceneStatus.kInactive;
      }
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kStart) {
        scene.create();
        scene.update();
        scene.scene_status = oo.gameSceneStatus.kActive;
      }
    }
  }

  render() {
    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.render();
    }

    this.click_on = false;
  }

  setHorizontalScaling() { this.horizontal_scaling = true; }
  setVerticalScaling() { this.vertical_scaling = true; }

  setCanvasScaleWH(canvas, base_w, base_h) {
    // 矩形内最大サイズのスケール
    this.scale = Math.min(base_w / this.screen_width, base_h / this.screen_height);
    // 水平方向に合わせる場合のスケール
    if (this.horizontal_scaling) this.scale = base_w / this.screen_width;
    // 垂直方向に合わせる場合のスケール
    if (this.vertical_scaling) this.scale = base_h / this.screen_height;
    // サイズ
    var width = this.screen_width;
    var height = this.screen_height;
    if (this.horizontal_scaling) height = Math.floor(this.screen_width * base_h / base_w);
    if (this.vertical_scaling) width = Math.floor(this.screen_height * base_w / base_h);
    canvas.width = width;
    canvas.height = height;
  }

  createDrawEnv(canvas) {

    if (canvas) {
      this.setCanvasScaleWH(canvas, canvas.clientWidth, canvas.clientHeight);
    } else {
      if (oo.env.debug_log) console.log('createDrawEnv:create canvas');

      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);

      this.setCanvasScaleWH(canvas, document.body.clientWidth, document.body.clientHeight);

      canvas.style.width = Math.floor(canvas.width * this.scale) + 'px';
      canvas.style.height = Math.floor(canvas.height * this.scale) + 'px';
      canvas.style.position = 'absolute';
      canvas.style.backgroundColor = '#000000';
      canvas.style.zIndex = 1;
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  clear() {
    if (oo.env.os === 'android') {
      this.context.clearRect(0, 0, this.canvas.width + 1, this.canvas.height + 1);
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setupInput() {
    // this.input.setup(this.canvas, 1 / this.scale);
    // return;

    var self = this;
    var canvas = this.canvas;

    // click
    function clickListener(event) {
      var rect = canvas.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.clientX - rect.left) / self.scale;
      self.click_position.y = (event.clientY - rect.top) / self.scale;
    }

    function tapListener(event) {
      var rect = canvas.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.changedTouches[0].pageX - rect.left) / self.scale;
      self.click_position.y = (event.changedTouches[0].pageY - rect.top) / self.scale;
    }

    if ('ontouchstart' in window) {
      canvas.addEventListener('touchend', tapListener, false);
    } else {
      canvas.addEventListener('click', clickListener, false);
    }


    function getEventPosition(event) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.clientX - rect.left) / self.scale;
      var y = (event.clientY - rect.top) / self.scale;
      return new Oo2DVector(x, y);
    }

    function getEventPositionTouch(event) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.changedTouches[0].pageX - rect.left) / self.scale;
      var y = (event.changedTouches[0].pageY - rect.top) / self.scale;
      return new Oo2DVector(x, y);
    }

    function onTouchStart(event) {
      event.preventDefault();
      event.stopPropagation();

      if (event.touches.length === 1) {
        self.touch_press = true;
        self.touch_on = true;
        self.touch_position = getEventPositionTouch(event);
        self.touch_delta.set(0, 0);
        self.touch_path_length = 0;
      } else {
        self.touch_press = false;
      }
    }

    function onTouchMove(event) {
      event.preventDefault();
      event.stopPropagation();

      if (self.touch_press) {
        var position = getEventPositionTouch(event);
        self.touch_delta.add(position).sub(self.touch_position);
        self.touch_position = position;

        if (position.x < 0) self.touch_press = false;
        if (position.y < 0) self.touch_press = false;
        if (position.x >= canvas.width) self.touch_press = false;
        if (position.y >= canvas.height) self.touch_press = false;
      }
    }

    function onTouchEnd(event) {
      event.preventDefault();
      event.stopPropagation();

      if (self.touch_press) {
        self.touch_position = getEventPositionTouch(event);
      }

      self.touch_press = false;
    }

    function onMouseDown(event) {
      self.touch_press = true;
      self.touch_on = true;
      self.touch_position = getEventPosition(event);
      self.touch_delta.set(0, 0);
      self.touch_path_length = 0;
    }

    function onMouseMove(event) {
      var position = getEventPosition(event);
      self.touch_delta.add(position).sub(self.touch_position);
      self.touch_position = position;
    }

    function onMouseUp(event) {
      self.touch_press = false;
      self.touch_position = getEventPosition(event);
    }

    if ('ontouchstart' in window) {
      canvas.addEventListener('touchstart', onTouchStart, false);
      canvas.addEventListener('touchmove', onTouchMove, false);
      canvas.addEventListener('touchend', onTouchEnd, false);
      canvas.addEventListener('touchcancel', onTouchEnd, false);
    } else {
      canvas.addEventListener('mousedown', onMouseDown, false);
      canvas.addEventListener('mousemove', onMouseMove, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
    }
  }


  setupGameLoop() {
    var self = this;
    var fps = this.fps;
    if (this.game_loop_type === 0) setInterval(
      function updateByInterval() {
        self.update();
        self.render();
      },
      1000 / fps
    );
    if (this.game_loop_type === 1) setTimeout(
      function updateByTimeout() {
        setTimeout(updateByTimeout, 1000 / fps);
        self.update();
        self.render();
      },
      1000 / fps
    );
    if (this.game_loop_type === 2) requestAnimationFrame(
      function updateAnimationFrame() {
        requestAnimationFrame(updateAnimationFrame);
        self.update();
        self.render();
      }
    );


    if (this.game_loop_type === 3) {
      var time0 = Date.now();
      var interval = 8;
      var enter = 0;

      var update = function () {
        var time1 = Date.now();
        var delta = time1 - time0;
        if (delta < 1000 / fps) return;
        time0 = time1 - Math.min(delta - 1000 / fps, interval);

        if (enter) {
          enter += 1;
          if (enter < 60) return;
          cancelAnimationFrame(raf);
        }

        enter = 1;
        var raf = requestAnimationFrame(() => {
          self.update();
          self.render();
          enter = 0;
        });
      };

      setInterval(update, interval);
    }

  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameInputStatus {
  constructor() {
    this.touch_press = false;
    this.touch_position = new Oo2DVector(0);
    this.touch_delta = new Oo2DVector(0);
  }
}

class OoGameInput {
  constructor() {
    this.click_on = false;
    this.click_position = new Oo2DVector(0);

    this.status_array = [];
    this.status_array[0] = new OoGameInputStatus();
    this.status_array[1] = new OoGameInputStatus();

    this._element = document;
    this._scale = 1;

    this._click_on = false;
    this._click_position = new Oo2DVector(0);

    this._touch_on = false;
    this._touch_press = false;
    this._touch_position = new Oo2DVector(0);
    this._touch_delta = new Oo2DVector(0);
    this._touch_path_length = 0;
  }

  addStatus(status) {
    this.status_array.pop();
    this.status_array.unshift(status);
  }

  getTouchPosition() { return this.status_array[0].touch_position; }
  getTouchDelta() { return this.status_array[0].touch_delta; }

  isTouch() { return this.status_array[0].touch_press === true; }
  isTouchStart() { return (this.status_array[0].touch_press === true && this.status_array[1].touch_press === false); }
  isTouchEnd() { return (this.status_array[0].touch_press === false && this.status_array[1].touch_press === true); }

  // ex. element = canvas
  //     scale = canvas pixels / canvas size
  // elementが、document, bodyの場合、iOSでは発火しない問題がある
  setup(element, scale) {
    if (element) this._element = element;
    if (scale) this._scale = scale;

    if ('ontouchstart' in window) {
      this._element.addEventListener('touchend', e => this._tapListener(e), false);
      this._element.addEventListener('touchstart', e => this._onTouchStart(e), false);
      this._element.addEventListener('touchmove', e => this._onTouchMove(e), false);
      this._element.addEventListener('touchend', e => this._onTouchEnd(e), false);
      this._element.addEventListener('touchcancel', e => this._onTouchEnd(e), false);
    } else {
      this._element.addEventListener('click', e => this._clickListener(e), false);
      this._element.addEventListener('mousedown', e => this._onMouseDown(e), false);
      this._element.addEventListener('mousemove', e => this._onMouseMove(e), false);
      this._element.addEventListener('mouseup', e => this._onMouseUp(e), false);
    }
  }

  update() {
    var status = new OoGameInputStatus();
    status.touch_press = this._touch_press || this._touch_on;
    status.touch_position = this._touch_position.clone();
    status.touch_delta = this._touch_delta.clone();

    this.addStatus(status);

    this.click_on = this._click_on;
    this.click_position = this._click_position.clone();

    this._touch_on = false;
    this._click_on = false;
    this._touch_delta = new Oo2DVector(0);
  }

  _getEventPositionMouse(event) {
    var r = this._element.getBoundingClientRect();
    var x = event.clientX - r.left;
    var y = event.clientY - r.top;
    return Oo2DVector.create(x, y).mul(this._scale);
  }

  _getEventPositionTouch(event) {
    var r = this._element.getBoundingClientRect();
    var x = (event.changedTouches[0].pageX - r.left) * this._scale;
    var y = (event.changedTouches[0].pageY - r.top) * this._scale;
    return new Oo2DVector(x, y);
  }

  _clickListener(event) {
    this._click_on = true;
    this._click_position = this._getEventPositionMouse(event);
  }

  _tapListener(event) {
    if (!this._touch_press) return;
    this._click_on = true;
    this._click_position = this._getEventPositionTouch(event);
  }

  _onTouchStart(event) {
    if (event.touches.length !== 1) {
      this._touch_press = false;
      return;
    }
    this._touch_press = true;
    this._touch_on = true;
    this._touch_position = this._getEventPositionTouch(event);
    this._touch_delta.set(0, 0);
    this._touch_path_length = 0;
  }

  _onTouchMove(event) {
    var r = this._element.getBoundingClientRect();
    var x = event.changedTouches[0].pageX;
    var y = event.changedTouches[0].pageY;
    if (x < r.left || x >= r.right || y < r.top || y >= r.bottom) {
      this._touch_press = false;
    }

    if (this._touch_press) {
      var p = this._getEventPositionTouch(event);
      this._touch_delta.add(p).sub(this._touch_position);
      this._touch_path_length += Oo2DVector.distance(p, this._touch_position);
      this._touch_position = p;
    }

    this._touch_position = new Oo2DVector(x, y);

    event.preventDefault();
    event.stopPropagation();
  }

  _onTouchEnd(event) {
    if (this._touch_press) {
      this._touch_press = false;
      this._touch_position = this._getEventPositionTouch(event);
    }
  }

  _onMouseDown(event) {
    this._touch_press = true;
    this._touch_on = true;
    this._touch_position = this._getEventPositionMouse(event);
    this._touch_delta.set(0, 0);
    this._touch_path_length = 0;
  }

  _onMouseMove(event) {
    var p = this._getEventPositionMouse(event);
    this._touch_delta.add(p).sub(this._touch_position);
    this._touch_path_length += Oo2DVector.distance(p, this._touch_position);
    this._touch_position = p;
  }

  _onMouseUp(event) {
    this._touch_press = false;
    this._touch_position = this._getEventPositionMouse(event);
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoGameLayoutCell {
  constructor() {
    this.show = true;
    this.name = '';
    this.parent = '';
    this.order = 0;
    this.alpha = 1.0;
    this.align = 0;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.border = false; // tool上での枠線表示

    this.text = '';
    this.fontsize = 0;
    this.color = '#000000';
    this.bold = false;
    this.wrap = false;

    this.image = '';

    // 作業用
    this.img = null;
    this.rect = new OoRect();
  }

  updateRect(layout) {
    if (!this.rect) {
      this.rect = new OoRect(0, 0, layout.screen_width, layout.screen_height);
    }
    var parent_cell = layout.cell_map.get(this.parent);
    if (parent_cell) {
      var aligned_rect = parent_cell.getAlignedRect(layout);
      if (aligned_rect) this.rect.set(aligned_rect);
    }
  }

  getAlignedRect(layout) {
    if (!this.rect) this.updateRect(layout);
    var inner_rect = new OoRect(this.x, this.y, this.w, this.h);
    return oo.alignedRect(this.rect, inner_rect, this.align);
  }

  getImageRect() {
    if (this.img) {
      var image_rect = new OoRect(this.x, this.y, this.img.width, this.img.height);
      var r = oo.alignedRect(this.rect, image_rect, this.align);
      return r;
    }
  }

  draw(ctx, ofx, ofy) {
    var x = (ofx === void 0) ? 0 : ofx;
    var y = (ofy === void 0) ? 0 : ofy;

    var a = ctx.globalAlpha;
    if (this.alpha < 1.0) ctx.globalAlpha = a * this.alpha;

    if (this.border) {
      var inner_rect = new OoRect(this.x, this.y, this.w, this.h);
      var r = oo.alignedRect(this.rect, inner_rect, this.align);
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.strokeRect(r.x + x, r.y + y, r.w, r.h);
    }

    if (this.img && this.img.width) {
      var image_rect = new OoRect(this.x, this.y, this.img.width, this.img.height);
      r = oo.alignedRect(this.rect, image_rect, this.align);
      ctx.drawImage(this.img, r.x + x, r.y + y);
    }

    if (this.text) {
      var font = '';
      if (this.bold) font += 'bold ';
      font += this.fontsize + 'px ';
      font += " ''";

      ctx.font = font;
      ctx.fillStyle = this.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      var align = oo.clamp(this.align, 1, 9);

      var text_rect = new OoRect(this.x, this.y, 0, 0);
      r = oo.alignedRect(this.rect, text_rect, align);

      var text_align = ['left', 'center', 'right'];
      var text_base_line = ['top', 'middle', 'bottom'];

      ctx.textAlign = text_align[(align + 2) % 3];
      ctx.textBaseline = text_base_line[Math.floor((align - 1) / 3)];

      ctx.fillText(this.text, r.x + x, r.y + y);
    }

    ctx.globalAlpha = a;
  }
}

class OoGameLayout {
  constructor() {
    this.layout_name = '';
    this.image_base_path = '';
    this.display_width = 108;
    this.display_height = 192;
    this.screen_width = 1080;
    this.screen_height = 1920;
    this.cells = [];
    this.cell_map = new Map();
    this.cell_order = [];

    this.offset = new Oo2DVector(0);
    this.context;
  }

  draw(context) {
    var ctx = context || this.context || oo.env.context;

    if (this.cell_order.length === 0) {
      this.cell_order = this.cells.slice();
    }
    for (var cell of this.cell_order) {
      if (!cell.rect) cell.updateRect(this);
      if (cell.show) cell.draw(ctx, this.offset.x, this.offset.y);
    }
  }

  drawCell(name, context) {
    var ctx = context || this.context || oo.env.context;

    var cell = this.getCell(name);
    if (!cell.rect) cell.updateRect(this);
    cell.draw(ctx, this.offset.x, this.offset.y);
  }

  updateCellMap() {
    this.cell_map.clear();
    for (var cell of this.cells) {
      if (cell.name) this.cell_map.set(cell.name, cell);
    }
  }

  // 位置再計算
  updateCoordinate() {
    for (var cell of this.cells) cell.rect = null;
    for (cell of this.cells) cell.updateRect(this);
  }

  // 描画順のソート
  updateOrder() {
    this.cell_order = this.cells.slice();
    oo.sort(this.cell_order, function (a, b) { return (a.order > b.order) ? 1 : 0; });
  }

  getCell(name) {
    return this.cell_map.get(name);
  }

  getCellImage(name) {
    return this.cell_map.get(name).img;
  }

  loadJson(text) {
    var obj = JSON.parse(text);
    this.loadJsonObj(obj);
  }

  loadJsonObj(obj) {
    this.layout_name = obj.layout_name;
    this.image_base_path = obj.image_base_path;
    this.display_width = obj.display_width;
    this.display_height = obj.display_height;
    this.screen_width = obj.screen_width;
    this.screen_height = obj.screen_height;

    for (var x of obj.cells) {
      var cell = new OoGameLayoutCell();
      Object.assign(cell, x);
      this.cells.push(cell);
    }

    this.updateCellMap();
    this.updateCoordinate();
    this.updateOrder();
  }

  asyncLoadImage() {
    var self = this;

    oo.parallel(function* () {
      for (var cell of self.cells) {
        if (cell['image']) {
          let path_name = oo.addPath(self.image_base_path, cell['image']);
          cell.img = yield oo.nnCreateImage(path_name);
        }
      }
    });
  }

  asyncSetupFromFile(proceed, layout_file) {
    var self = this;

    oo.serial(function* () {
      var obj = yield oo.nnLoadText(layout_file);
      self.loadJson(obj.text);
      yield self.asyncLoadImage();
    });
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.gameSceneStatus = {
  kInactive: 0,
  kActive: 1,
  kStart: 2,
  kEnd: 3,
};

class OoGameScene {
  constructor() {
    this.frame = null;
    this.name = '';
    this.scene_status = oo.gameSceneStatus.kInactive;
    this.next_scene = '';
    this.scene_end = false;
    this.fade_times = 60;
    this.fade_counter = 0;
    this.fade_alpha = 0.0;
  }

  release() { }
  preload() { }
  create() { }
  update() { }
  render() { }

  changeSceneOnFadeOut() {
    if (this.next_scene === '') return;
    this.frame.endScene(this.name);
    this.frame.startScene(this.next_scene);
  }

  fadeIn() {
    this.fade_counter = - this.fade_times;
    this.setFadeAlpha();
  }

  fadeOut() {
    this.fade_counter = 1;
    this.setFadeAlpha();
  }

  setFadeAlpha() {
    this.fade_alpha = oo.saturate(Math.abs(this.fade_counter / this.fade_times));
  }

  updateFade() {
    this.setFadeAlpha();
    if (this.fade_counter !== 0) this.fade_counter++;
    if (this.fade_counter === this.fade_times + 2) this.changeSceneOnFadeOut();
  }

  renderFade() {
    this.frame.canvas.style.opacity = 1.0 - this.fade_alpha;
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameScroll {
  constructor() {
    this.touch_pos = new Oo2DVector(0, 0);
    this.pos_delta = [];
    this.pos_delta[0] = new Oo2DVector(0, 0);
    this.pos_delta[1] = new Oo2DVector(0, 0);
    this.velocity = new Oo2DVector(0, 0);
    this.offset = new Oo2DVector(0, 0);
    // スクロール範囲
    this.y_min = 0;
    this.y_max = 1000;
    this.x_min = 0;
    this.x_max = 1000;

    // 範囲外への移動の抵抗力
    this.resistance = 3.0;
    // 離した時の速度減衰率
    this.attenuation = 0.95;
    // 離した時、範囲外での追加の速度減衰率
    this.attenuation_out = 0.95;
    // 範囲外からの復元力
    this.resilience = 0.9;
  }

  update(input) {
    // 押したとき
    if (input.isTouchStart()) {
      this.touch_pos = input.getTouchPosition();
    }
    // 押している間
    if (input.isTouch()) {
      this.pos_delta[1] = this.pos_delta[0];
      this.pos_delta[0] = Oo2DVector.sub(input.getTouchPosition(), this.touch_pos);
      this.touch_pos = input.getTouchPosition();
      this.velocity.x = (this.pos_delta[0].x + this.pos_delta[1].x) * 0.5;
      this.velocity.y = (this.pos_delta[0].y + this.pos_delta[1].y) * 0.5;
    }

    // スクロール位置
    var dx = this.velocity.x;
    var dy = this.velocity.y;
    if ((this.offset.x >= this.x_min) && (this.offset.x + dx <= this.x_min)) dx -= this.x_min - this.offset.x;
    if ((this.offset.x <= this.x_max) && (this.offset.x + dx >= this.x_max)) dx -= this.x_max - this.offset.x;
    if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) dx /= this.resistance;
    if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) dx /= this.resistance;

    if ((this.offset.y >= this.y_min) && (this.offset.y + dy <= this.y_min)) dy -= this.y_min - this.offset.y;
    if ((this.offset.y <= this.y_max) && (this.offset.y + dy >= this.y_max)) dy -= this.y_max - this.offset.y;
    if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) dy /= this.resistance;
    if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) dy /= this.resistance;
    this.offset.x += dx;
    this.offset.y += dy;

    // 離したとき
    if (!input.isTouch()) {
      // 速度減衰
      this.velocity.mul(this.attenuation);
      // 範囲外での追加の速度減衰
      if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) this.velocity.y *= this.attenuation_out;
      if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) this.velocity.y *= this.attenuation_out;
      // 範囲外からの復元力
      if (this.offset.x < this.x_min) this.offset.x = (this.offset.x - this.x_min) * this.resilience + this.x_min;
      if (this.offset.x > this.x_max) this.offset.x = (this.offset.x - this.x_max) * this.resilience + this.x_max;
      if (this.offset.y < this.y_min) this.offset.y = (this.offset.y - this.y_min) * this.resilience + this.y_min;
      if (this.offset.y > this.y_max) this.offset.y = (this.offset.y - this.y_max) * this.resilience + this.y_max;
    }

    return this.getOffset();
  }

  getOffset() {
    return this.offset;
  }

}// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.kPi = 3.14159265358979323846; // Pi
oo.k2Pi = 6.28318530717958647692; // 2 * Pi
oo.kPi2 = 1.57079632679489661923; // Pi / 2
oo.kInvPi = 0.31830988618379067153; // 1 / Pi
oo.kDeg2Rad = 0.01745329251994329576; // Degrees to Radians
oo.kRad2Deg = 57.29577951308232087679; // Radians to Degrees
oo.kE = 2.718281828459045235360287471352;  // e

oo.clamp = function (x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
};

oo.square = function (x) {
  return x * x;
};

oo.lerp = function (v0, v1, alpha) {
  return (1.0 - alpha) * v0 + alpha * v1;
};

oo.saturate = function (x) {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
};

oo.linearStep = function (v0, v1, v) {
  if (v0 === v1) return 0.0;
  return oo.saturate((v - v0) / (v1 - v0));
};

oo.smoothStep = function (v0, v1, v) {
  var x = oo.linearStep(v0, v1, v);
  return x * x * (3 - 2 * x);
};

// 標準シグモイド関数
oo.sigmoid = function (x) {
  return 1.0 / (1.0 + Math.exp(- x));
};

// シグモイド関数の区間[-1,1]を利用した補間パラメータ
// [-1,1]の範囲が、引数xでの範囲[0,1]になり、0.0～1.0を返す
// aは1以上を指定(6程度が通常、1では線形補間に近くなる)
oo.sigmoidStep = function (x, a) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  var t = 2 * x - 1;
  var s = 1 / (1 + Math.exp(- t * a));

  // 出力が[0,1]になるようにスケーリング
  var ea = Math.exp(- a);
  var k = (1 + ea) / (1 - ea);

  return k * (s - 0.5) + 0.5;
};

// 正弦波の区間[-π/2, π/2]のカーブを利用した補間パラメータ
oo.sineStep = function (x) {
  return 0.5 - Math.cos(x * Math.PI) * 0.5;
};

oo.attenuatedSineWave = function (t, t0, t1, frequency, amplitude) {
  var a = 1.0 - t / (t1 - t0);
  var x = frequency * oo.k2Pi * t / (t1 - t0);
  var y = a * Math.sin(x) * amplitude;
  return y;
};

oo.getIntersectionPoint = function (c0, r0, c1, r1) {
  var l = Oo2DVector.distance(c0, c1);
  if (l > r0 + r1) return;

  var p = Oo2DVector.lerp(c0, c1, r0 / (r0 + r1));
  var c0p = Oo2DVector.distance(c0, p);

  var h = Math.sqrt(r0 * r0 - c0p * c0p);
  var v = Oo2DVector.sub(c1, c0).rotate90().normalize().mul(h);

  var p0 = p.clone().add(v);
  var p1 = p.clone().sub(v);
  return [p0, p1];
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

// option : {func, labal_style, textbox_style, slider_style}
oo.htmlTextboxSlider = function (id, name, value, min, max, step, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text = document.createTextNode(name);
  var textbox = document.createElement('input');
  var slider = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  Object.assign(label.style, { textAlign: 'right', marginRight: '10px', width: '50px', float: 'left' });
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // テキストボックス
  Object.assign(textbox, { id, type: 'text', value });
  textbox.style.width = '50px';
  if (option && option.textbox_style) Object.assign(textbox.style, option.textbox_style);
  // スライダ
  Object.assign(slider, { id: id + '.range', type: 'range', min, max, step, value });
  slider.style.verticalAlign = 'middle';
  if (option && option.slider_style) Object.assign(slider.style, option.slider_style);
  // イベント対応
  textbox.oninput = () => {
    slider.value = textbox.value;
    func && func(textbox.value);
  };
  slider.oninput = () => {
    textbox.value = slider.value;
    func && func(slider.value);
  };
  label.appendChild(text);
  div.appendChild(label);
  div.appendChild(textbox);
  div.appendChild(slider);
  return div;
};

// option : {func, labal_style, checkbox_style}
oo.htmlCheckbox = function (id, text, checked, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text_node = document.createTextNode(text);
  var checkbox = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // チェックボックス
  if (option && option.checkbox_style) Object.assign(checkbox.style, option.checkbox_style);
  Object.assign(checkbox, { id, type: 'checkbox', checked: checked });
  checkbox.onchange = () => { func && func(checkbox.checked); };
  label.appendChild(checkbox);
  label.appendChild(text_node);
  div.appendChild(label);
  return div;
};

// option : {func, labal_style, radio_style}
oo.htmlRadio = function (id, text, name, value, checked, option) {
  var div = document.createElement('div');
  var label = document.createElement('label');
  var text_node = document.createTextNode(text);
  var radio = document.createElement('input');
  //
  var func = option ? option.func : null;
  // ラベル
  if (option && option.label_style) Object.assign(label.style, option.label_style);
  // チェックボックス
  if (option && option.radio_style) Object.assign(radio.style, option.radio_style);
  Object.assign(radio, { id, type: 'radio', name, value, checked });
  radio.onchange = () => { func && func(radio.value); };
  label.appendChild(radio);
  label.appendChild(text_node);
  div.appendChild(label);
  return div;
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.icosahedronPositions = [
  [0.0, 1.0, 0.0],
  [0.0, 0.447213595, 0.894427191],
  [0.850650808, 0.447213595, 0.276393202],
  [0.525731112, 0.447213595, - 0.723606797],
  [- 0.525731112, 0.447213595, -0.723606797],
  [- 0.850650808, 0.447213595, 0.276393202],
  [0.525731112, - 0.447213595, 0.723606797],
  [0.850650808, - 0.447213595, -0.276393202],
  [0.0, - 0.447213595, -0.894427191],
  [- 0.850650808, -0.447213595, -0.276393202],
  [- 0.525731112, -0.447213595, 0.723606797],
  [0.0, - 1.0, 0.0],
];

oo.icosahedronIndices = [
  0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1,
  1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 8, 3, 8, 4, 4, 8, 9, 4, 9, 5, 5, 9, 10, 5, 10, 1, 1, 10, 6,
  6, 11, 7, 7, 11, 8, 8, 11, 9, 9, 11, 10, 10, 11, 6,
];

oo.OoIcosahedron = class {
  constructor() {
    this.positions = [];
    this.indices = [];
  }

  create(level) {
    for (let i = 0; i < oo.icosahedronIndices.length; i++) {
      this.indices[i] = oo.icosahedronIndices[i];
    }
    for (let i = 0; i < oo.icosahedronPositions.length; i++) {
      var v = oo.icosahedronPositions[i];
      this.positions[i] = new Oo3DVector(v[0], v[1], v[2]);
    }

    for (let i = 0; i < level; i++) this.spherize();
  }

  spherize() {
    //     0
    //   3△4
    // 1△▽△2
    //     5
    var r_idx = [0, 3, 4, 4, 3, 5, 3, 1, 5, 4, 5, 2];

    var idx_num = [];

    var add = (a, b) => {
      if (a > b) [b, a] = [a, b];
      if (idx_num[a] !== void 0 && idx_num[a][b] !== void 0) return idx_num[a][b];
      if (idx_num[a] === void 0) idx_num[a] = [];
      var n = this.positions.length;
      // this.positions[n] = Oo3DVector.lerp(this.positions[a], this.positions[b], 0.5).normalize();
      this.positions[n] = Oo3DVector.add(this.positions[a], this.positions[b]).normalize();
      
      idx_num[a][b] = n;
      return n;
    };

    var new_indices = [];
    var n = this.indices.length;
    for (let i = 0; i < n; i += 3) {
      var v = [];
      v[0] = this.indices[i + 0];
      v[1] = this.indices[i + 1];
      v[2] = this.indices[i + 2];
      v[3] = add(v[0], v[1]);
      v[4] = add(v[0], v[2]);
      v[5] = add(v[1], v[2]);
      for (let j = 0; j < 12; j++) new_indices.push(v[r_idx[j]]);
    }
    this.indices = new_indices;
  }
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.filterGaussian = function (dst, src, sigma) {
  oo.filterGaussianHorizontal(dst, src, sigma);
  oo.filterGaussianVertical(dst, dst, sigma);
};

oo.filterGaussian_createWeightList = function (n, sigma) {
  var a = oo.array(n, 0);
  if (n) {
    if (sigma === 0) {
      a[0] = 1;
    } else {
      for (let i = 0; i < n; i++) a[i] = Math.exp(- i * i / (2 * sigma * sigma));
    }
  }
  return a;
};

oo.filterGaussian_createWeightSumList = function (weight_list, r) {
  var n = weight_list.length;
  var a = oo.array(n, 0);
  for (let i = 0; i < n; i++) {
    let i0 = Math.max(0, i - r);
    let i1 = Math.min(n, i + r + 1);
    for (let j = i0; j < i1; j++) a[j] += weight_list[Math.abs(i - j)];
  }
  return a;
};

oo.filterGaussianHorizontal = function (dst, src, sigma) {
  let w = src.size.x;
  let h = src.size.y;
  let k = oo.filterGaussian_createWeightList(w, sigma);
  let r = 0; // 有効距離(これ以上の距離では計算を行わない)
  for (let i = 0; i < w; i++) {
    if (k[i] >= (1 / 256) / w) r = i;
  }
  let s = oo.filterGaussian_createWeightSumList(k, r);
  // 作業バッファ
  let v = new Array(w * 4);
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < w * 4; i++) v[i] = 0;
    for (let x = 0; x < w; x++) {
      let p = src.getPixel(x, y);
      let x0 = Math.max(0, x - r);
      let x1 = Math.min(w, x + r + 1);
      for (let i = x0; i < x1; i++) {
        let t = k[Math.abs(x - i)];
        for (let j = 0; j < 4; j++) v[i * 4 + j] += p[j] * t;
      }
    }
    for (let x = 0; x < w; x++) {
      for (let i = 0; i < 4; i++) v[x * 4 + i] /= s[x];
      dst.setPixel(x, y, v.slice(x * 4, x * 4 + 4));
    }
  }
};

oo.filterGaussianVertical = function (dst, src, sigma) {
  let w = src.size.x;
  let h = src.size.y;
  let k = oo.filterGaussian_createWeightList(h, sigma);
  let r = 0; // 有効距離(これ以上の距離では計算を行わない)
  for (let i = 0; i < h; i++) {
    if (k[i] >= (1 / 256) / h) r = i;
  }
  let s = oo.filterGaussian_createWeightSumList(k, r);
  // 作業バッファ
  let v = new Array(h * 4);
  for (let x = 0; x < w; x++) {
    for (let i = 0; i < h * 4; i++) v[i] = 0;
    for (let y = 0; y < h; y++) {
      let p = src.getPixel(x, y);
      let y0 = Math.max(0, y - r);
      let y1 = Math.min(h, y + r + 1);
      for (let i = y0; i < y1; i++) {
        let t = k[Math.abs(y - i)];
        for (let j = 0; j < 4; j++) v[i * 4 + j] += p[j] * t;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let i = 0; i < 4; i++) v[y * 4 + i] /= s[y];
      dst.setPixel(x, y, v.slice(y * 4, y * 4 + 4));
    }
  }
};
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.patternGaussian = function (target, color_pixel, radius, intensity, sigma) {
  var w = target.size.x;
  var h = target.size.y;
  oo.generateGaussianDistribution(w, h, radius, sigma, true, (x, y, value) => {
    var r = color_pixel[0] * intensity * value;
    var g = color_pixel[1] * intensity * value;
    var b = color_pixel[2] * intensity * value;
    var a = color_pixel[3];
    target.setPixel(x, y, [r, g, b, a]);
  });
};

// width
// height
// radius 分布の半径サイズ
// sigma σの値
// adjust_base_line 周囲(0)と連続にするための減算を適用
oo.generateGaussianDistribution = function (width, height, radius, sigma, adjust_base_line, output) {
  // 中心位置
  var cx = width * 0.5 - 0.5;
  var cy = height * 0.5 - 0.5;
  // 距離正規化係数
  var normalizer = 2 / Math.min(width, height);
  // 定数
  var s = 1 / (2 * sigma * sigma);
  var k = 1 / Math.sqrt(2 * Math.PI * sigma * sigma);
  var r2 = radius * radius;
  // 周囲(0)と連続にするための減算用定数
  var base_line = 0;
  if (adjust_base_line) base_line = k * Math.exp(- r2 * s);
  // 二次元分布生成
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      var vx = (x - cx) * normalizer;
      var vy = (y - cy) * normalizer;
      var d2 = vx * vx + vy * vy;
      var value = k * Math.exp(- d2 * r2 * s) - base_line;
      output(x, y, value);
    }
  }
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};


// attenuation factor : 1 / pow(r, afp)
oo.patternLightSpot = function (target, color_pixel, radius, intensity, afp) {
  var w = target.size.x;
  var h = target.size.y;
  oo.generateLightSpot(w, h, radius, afp, true, (x, y, value) => {
    var r = color_pixel[0] * intensity * value;
    var g = color_pixel[1] * intensity * value;
    var b = color_pixel[2] * intensity * value;
    var a = color_pixel[3];
    target.setPixel(x, y, [r, g, b, a]);
  });
};

// width
// height
// radius 分布の半径サイズ
// attenuation factor : 1 / pow(r, afp)
// adjust_base_line 周囲(0)と連続にするための減算を適用
oo.generateLightSpot = function (width, height, radius, afp, adjust_base_line, output) {
  // 中心位置
  var cx = width * 0.5 - 0.5;
  var cy = height * 0.5 - 0.5;
  // 正規化係数
  var normalizer = 2 / Math.min(width, height);
  // 周囲(0)と連続にするための減算用定数
  var base_line = 0;
  if (adjust_base_line) base_line = 1 / Math.pow(radius, afp);
  // 二次元分布生成
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var vx = (x - cx) * normalizer;
      var vy = (y - cy) * normalizer;
      var d = Math.sqrt(vx * vx + vy * vy);
      var value = 1 / Math.pow(radius * d, afp) - base_line * d;
      output(x, y, value);
    }
  }
};
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo._$ = oo._$ || {};
oo._$._elements = {};
oo._$._getElement = function (obj) {
  if (!obj) return null;
  if (typeof obj === 'string') {
    if (obj.charAt(0) === '#') {
      var id = obj.substr(1);
      return document.getElementById(id) || oo._$._elements[id];
    }
    return document.createElement(obj);
  }
  if (typeof obj === 'object') {
    if (obj instanceof Node) return obj;
    if (obj.tag) {
      var element = document.createElement(obj.tag);
      if (element) {
        var key_array = Object.keys(obj);
        for (var key of key_array) {
          if (key !== 'tag' && key !== 'style') element[key] = obj[key];
          if (key === 'style') Object.assign(element.style, obj.style);
        }
        if (element.id) oo._$._elements[element.id] = element;
        return element;
      }
    }
  }
  return null;
};

//
// oo.$
// get element by id
// $('#id');
//
// create element
// $('div');
// $({tag:'div', ...});
//
// append child elements
// $('#id', element1, element2, ...);
// $('#id', $(element1, $(element2, ...)));
//
// create text node
// $('#id', 'text');
//
oo.$ = function (...args) {
  if (args.length === 0) return null;
  var parent = oo._$._getElement(args[0]);
  if (!parent) return null;
  for (let i = 1; i < args.length; i++) {
    if (typeof args[i] === 'string') {
      parent.appendChild(document.createTextNode(args[i]));
    } else {
      parent.appendChild(oo._$._getElement(args[i]));
    }
  }
  return parent;
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// Xorshift RNGs
// https://en.wikipedia.org/wiki/Xorshift
// http://www.jstatsoft.org/v08/i14/paper

class OoRandom {
  constructor(seed) {
    this.init(seed);
  }

  init(seed) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = 88675123;

    if (seed !== void 0) this.seed = seed;
    if (this.seed !== void 0) this.w = this.seed;

    this.nd_idx = 0;
    this.nd_work = 0;
  }

  getUint32() {
    var t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    this.w = (this.w >>> 0);
    return this.w;
  }

  // half-closed interval [0,1)  0 <= x <  1
  get() { return this.getUint32() / 4294967296.0; }
  //      closed interval [0,1]  0 <= x <= 1
  get1() { return this.getUint32() / 4294967295.0; }
  // [-1,1)
  get2() { return this.getUint32() / (4294967296.0 / 2) - 1.0; }

  // normal distribution
  getND() {
    this.nd_idx ^= 1;
    if (this.nd_idx === 0) return this.nd_work;
    do {
      var r1 = this.get2();
      var r2 = this.get2();
      var s = r1 * r1 + r2 * r2;
    } while (s > 1.0 || s === 0.0);
    s = Math.sqrt(-2.0 * Math.log(s) / s);
    this.nd_work = r2 * s;
    return r1 * s;
  }

  getRange(a, b) { return a + this.get1() * (b - a); }

  getIntRange(a, b) { return a + this.roll0(b - a + 1); }

  roll0(num_faces) {
    num_faces = num_faces || 6;
    return (this.getUint32() % num_faces);
  }

  // roll a dice
  roll(num_faces) { return this.roll0(num_faces) + 1; }

  // distribution uniform3
  getUniform3() {
    var x = this.get2();
    var y = this.get2();
    var z = this.get2();
    return new Oo3DVector(x, y, z);
  }

  // distribution ball
  getBall() {
    do {
      var x = this.get2();
      var y = this.get2();
      var z = this.get2();
    } while (x * x + y * y + z * z > 1);
    return new Oo3DVector(x, y, z);
  }

  // distribution sphere
  getSphere() {
    var z = this.get2();
    var r = Math.sqrt(1.0 - z * z);
    var p = this.get() * Math.PI * 2;
    var x = r * Math.cos(p);
    var y = r * Math.sin(p);
    return new Oo3DVector(x, y, z);
  }

}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.OoRational = class {
  constructor(a, b) {
    this.a = a || 0;
    this.b = b || 1;
  }

  clone() {
    return new oo.OoRational(this.a, this.b);
  }

  set(a, b) {
    if (oo.isObject(a)) {
      this.a = a.a || 0;
      this.b = a.b || 1;
    } else {
      this.a = a || 0;
      this.b = b || 1;
    }
    return this;
  }

  mul(r) {
    this.a *= (oo.isObject(r) ? r.a : r) || 0;
    this.b *= (oo.isObject(r) ? r.b : 1) || 1;
    return this;
  }

  float() {
    return this.a / this.b;
  }

  static mul(r0, r1) {
    return r0.clone().mul(r1);
  }
};
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.default_align = 1;

class OoRect {
  constructor(x, y, w, h) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
  }

  clone() {
    return new OoRect(this.x, this.y, this.w, this.h);
  }

  // set(x, y, w, h)
  // set(rect)
  set(x, y, w, h) {
    if (x instanceof OoRect) {
      // this.x = x.x;
      // this.y = x.y;
      // this.w = x.w;
      // this.h = x.h;
      Object.assign(this, x);
    } else {
      // this.x = x;
      // this.y = y;
      // this.w = w;
      // this.h = h;
      Object.assign(this, { x, y, w, h });
    }
  }

  // contains(x, y)
  // contains(point)
  contains(x, y) {
    if (x instanceof Oo2DVector) [x, y] = [x.x, x.y];
    if (x < this.x || x >= this.x + this.w) return false;
    if (y < this.y || y >= this.y + this.h) return false;
    return true;
  }

  alignRect(outer_rect, align) {
    this.set(oo.alignedRect(outer_rect, this, align));
  }
}

oo.alignX = function (align, width) {
  // if ((a === 1) || (a === 4) || (a === 7)) return 0;
  // if ((a === 2) || (a === 5) || (a === 8)) return width / 2;
  // if ((a === 3) || (a === 6) || (a === 9)) return width;
  if (align === 0) align = oo.env.default_align;
  return width * ((align + 2) % 3) / 2;
};

oo.alignY = function (align, height) {
  // if ((a === 1) || (a === 2) || (a === 3)) return 0;
  // if ((a === 4) || (a === 5) || (a === 6)) return height / 2;
  // if ((a === 7) || (a === 8) || (a === 9)) return height;
  if (align === 0) align = oo.env.default_align;
  return height * Math.floor((align - 1) / 3) / 2;
};

oo.alignedRect = function (outer_rect, inner_rect, align) {
  var r0 = outer_rect;
  var r1 = inner_rect;

  var a0 = Math.floor(align / 10) % 10;
  var a1 = align % 10;
  if (a1 === 0) a1 = oo.env.default_align;
  if (a0 === 0) a0 = a1;

  var x = r0.x + r1.x + oo.alignX(a0, r0.w) - oo.alignX(a1, r1.w);
  var y = r0.y + r1.y + oo.alignY(a0, r0.h) - oo.alignY(a1, r1.h);

  return new OoRect(x, y, r1.w, r1.h);
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.RenderSprite = function (...arg) {
  new OoSprite();
  oo.RenderSprite = class extends OoSprite {
    constructor(image) {
      super();
      if (image && image instanceof Image) {
        this.createFromImage(image);
      }
    }

    create(width, height) {
      this.createWithSize(width, height);
      console.log('oo.RenderSprite.create is deprecated.');
    }

    createWithSize(width, height) {
      this.size.set(width, height);
      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas_context = this.canvas.getContext('2d');
      this.image_data = this.canvas_context.createImageData(width, height);
      this.pixel = this.image_data.data;
      this.image = this.canvas;
    }

    createFromImage(image) {
      this.createWithSize(image.width, image.height);
      this.canvas_context.drawImage(image, 0, 0);
      this.image_data = this.canvas_context.getImageData(0, 0, image.width, image.height);
      this.pixel = this.image_data.data;
      this.image = this.canvas;
    }

    getCanvasImageData() {
      return this.canvas_context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    getPixel(x, y) {
      if (!this.pixel) return;
      if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) return;
      var n = (y * this.size.x + x) * 4;
      var r = this.pixel[n + 0];
      var g = this.pixel[n + 1];
      var b = this.pixel[n + 2];
      var a = this.pixel[n + 3];
      return [r, g, b, a];
    }

    setPixel(x, y, pixel) {
      if (!this.pixel) return;
      if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) return;
      var n = (y * this.size.x + x) * 4;
      this.pixel[n + 0] = pixel[0];
      this.pixel[n + 1] = pixel[1];
      this.pixel[n + 2] = pixel[2];
      this.pixel[n + 3] = pixel[3];
    }

    updateCanvas() {
      this.canvas_context.putImageData(this.image_data, 0, 0);
    }
  };
  return new oo.RenderSprite(...arg);
};// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoSha256 {
  constructor() {
    this._k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    this._buffer = new Array(16 * 4); // num_blocks * 4
    this._w = new Array(64); // num_works
    this.init();
  }

  static _rotate(n, bits) { return (n >>> bits) | (n << (32 - bits)); }
  static _ch(x, y, z) { return (x & (y ^ z)) ^ z; }
  static _maj(x, y, z) { return (x & (y | z)) | (y & z); }
  static _si0(x) { return OoSha256._rotate(x, 2) ^ OoSha256._rotate(x, 13) ^ OoSha256._rotate(x, 22); }
  static _si1(x) { return OoSha256._rotate(x, 6) ^ OoSha256._rotate(x, 11) ^ OoSha256._rotate(x, 25); }
  static _s0(x) { return OoSha256._rotate(x, 7) ^ OoSha256._rotate(x, 18) ^ (x >>> 3); }
  static _s1(x) { return OoSha256._rotate(x, 17) ^ OoSha256._rotate(x, 19) ^ (x >>> 10); }

  static _uint8a(x) { return [x >>> 24, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff]; }

  init() {
    this._h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    this._num_bits_h = 0;
    this._num_bits_l = 0;
    this._position = 0;
  }

  load(array) {
    if (array.length === 0) return;
    var size = array.length;

    this._num_bits_l += (size << 3) >>> 0;
    this._num_bits_h += size >>> 29;
    if (this._num_bits_l >= 0x100000000) this._num_bits_h++;
    this._num_bits_l >>>= 0;

    for (var i = 0; i < size; i++) {
      this._buffer[this._position++] = array[i];
      if (this._position === 64) this._generate();
      this._position &= 0x3f;
    }
  }

  final() {
    var h = this._num_bits_h;
    var l = this._num_bits_l;
    this.load([0x80]);
    while (this._position != 64 - 8) this.load([0]);
    this.load(OoSha256._uint8a(h));
    this.load(OoSha256._uint8a(l));
  }

  _generate() {
    var i, j;

    for (i = 0, j = 0; i < 16; i++ , j += 4) { // 16 num_blocks
      this._w[i] = (this._buffer[j] << 24) | (this._buffer[j + 1] << 16) | (this._buffer[j + 2] << 8) | this._buffer[j + 3];
    }

    for (i = 16; i < 64; i++) {
      this._w[i] = (OoSha256._s1(this._w[i - 2]) + this._w[i - 7] + OoSha256._s0(this._w[i - 15]) + this._w[i - 16]) >>> 0;
    }

    var h0 = this._h[0], h1 = this._h[1], h2 = this._h[2], h3 = this._h[3];
    var h4 = this._h[4], h5 = this._h[5], h6 = this._h[6], h7 = this._h[7];

    for (i = 0; i < 64; i++) {
      var t1 = h7 + OoSha256._si1(h4) + OoSha256._ch(h4, h5, h6) + this._k[i] + this._w[i];
      var t2 = OoSha256._si0(h0) + OoSha256._maj(h0, h1, h2);
      h7 = h6, h6 = h5, h5 = h4, h4 = (h3 + t1) >>> 0;
      h3 = h2, h2 = h1, h1 = h0, h0 = (t1 + t2) >>> 0;
    }

    this._h[0] += h0, this._h[1] += h1, this._h[2] += h2, this._h[3] += h3;
    this._h[4] += h4, this._h[5] += h5, this._h[6] += h6, this._h[7] += h7;
    for (i = 0; i < 8; i++) this._h[i] >>>= 0;
  }

  getDigest(array) {
    if (array) {
      this.init();
      this.load(array);
      this.final();
    }

    var digest = '';
    for (var i = 0; i < 8; i++) {
      digest += ('00000000' + this._h[i].toString(16)).slice(-8);
    }
    return digest;
  }

  static get(array) {
    var sha = new OoSha256();
    return sha.getDigest(array);
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.sort = function (array, compare_func) {

  var swap = function (swap_array, a, b) {
    var tmp = swap_array[a];
    swap_array[a] = swap_array[b];
    swap_array[b] = tmp;
  };

  var mergeSort = function (first, last) {
    if (first >= last) return;
    if (last - first == 1) {
      if (compare_func(array[first], array[last]) > 0) swap(array, first, last);
      return;
    }
    var middle = Math.floor((first + last) / 2);
    mergeSort(first, middle);
    mergeSort(middle + 1, last);

    var work = [];
    var p = 0;
    for (var i = first; i <= middle; i++) work[p++] = array[i];

    i = middle + 1;
    var j = 0;
    var k = first;
    while (i <= last && j < p) array[k++] = (compare_func(work[j], array[i]) <= 0) ? work[j++] : array[i++];
    while (j < p) array[k++] = work[j++];
  };

  mergeSort(0, array.length - 1);
};
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoSound {
  constructor(audio_context, name) {
    if (!audio_context) return;

    this.context = audio_context;
    this.name = name;
    this.buffer;

    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open('GET', name, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          self.context.decodeAudioData(xhr.response, function (buffer) {
            self.buffer = buffer;
          });
        }
      }
    };
    xhr.send('');
  }

  play() {
    if (!this.context) return;
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.context.destination);
    //  source.loop = true;
    source.start();
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoSprite extends OoDrawObject {
  constructor(image) {
    super();
    this.size = new Oo2DVector(1);
    this.image = null;

    if (image && image instanceof Image) {
      this.image = image;
      this.size.set(image.width, image.height);
    }
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      var sx = this.size.x * this.scale.x;
      var sy = this.size.y * this.scale.y;
      if (this.rotation.z === 0) {
        ctx.drawImage(this.image, this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
      } else {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation.z);
        ctx.drawImage(this.image, - sx * 0.5, - sy * 0.5, sx, sy);
        ctx.restore();
      }
    });
  }

  static create(image) {
    var o = new OoSprite();
    if (image instanceof Image) {
      o.image = image;
      o.size.set(image.width, image.height);
    }
    return o;
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoStopMotion {
  constructor() {
    this.fps = 60;
    this.image_base_path = '';
    this.image_files = [];
    this.images = [];
    this.total_frames = 0;
    this.current_frame = 0;
    this.frame60 = 0;
    this.elapsed_time = 0;
    this.time0 = Date.now();
    this.position = new Oo2DVector(0);
  }

  asyncLoadImage(callback) {
    var n = this.image_files.length;
    this.total_frames = n;

    var self = this;
    oo.parallel(function* () {
      for (let i = 0; i < n; i++) {
        var path_name = oo.addPath(self.image_base_path, self.image_files[i]);
        self.images[i] = yield oo.nnCreateImage(path_name);
      }
    }, callback);
  }

  start() {
    this.current_frame = 0;
    this.frame60 = 0;
    this.elapsed_time = 0;
    this.time0 = Date.now();
  }

  updateByTime() {
    var time1 = Date.now();
    this.elapsed_time += time1 - this.time0;
    this.time0 = time1;
    this.current_frame = Math.floor((this.elapsed_time * this.fps) / 1000);
  }

  update() {
    this.frame60++;
    this.current_frame = Math.floor((this.frame60 * this.fps) / 60);
  }

  draw(context) {
    var frame = oo.clamp(this.current_frame, 0, this.images.length - 1);
    var image = this.images[frame];
    context.drawImage(image, this.position.x, this.position.y);
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoTextBox extends OoDrawObject {
  constructor(text, font_size, line_space, color, x, y, w, h, align) {
    super();
    this.size = new Oo2DVector(w || 0, h || 0);
    this.position = Oo2DVector.create(x || 0, y || 0).add(this.size.clone().mul(0.5));
    this.color = color || '#000000';
    this.text = text || '';
    this.font_size = font_size || 0;
    this.linefeed_space = line_space || 0;
    this.wordwrap_space = line_space || 0;
    this.align = align || 0;

    this.content_height = 0;
    this.row = [];
    this.context = null;

    this.line_head_japanese_hyphenation = false;
    this.line_head_japanese_hyphenation_characters = '、。';
  }

  setRect(rect) {
    this.position = new Oo2DVector(rect.x + rect.w * 0.5, rect.y + rect.h * 0.5);
    this.size = new Oo2DVector(rect.w, rect.h);
  }

  _setTextAttributes(ctx) {
    oo.setTextAttributes(ctx, this.font_size, this.color, 'left', 'top');
  }

  createRow(context) {
    var ctx = context || this.context || oo.env.context;

    this._setTextAttributes(ctx);

    var t = { text: '', width: 0, line_space: 0 };

    this.row = [oo.clone(t)];

    [...this.text].forEach(c => {
      var last = this.row.length - 1;
      if (c === '\n') {
        this.row[last].line_space = this.linefeed_space;
        this.row.push(oo.clone(t));
      } else {
        var w = ctx.measureText(this.row[last].text + c).width;

        // 行頭禁則文字チェック
        var lhjh = false;
        if (this.line_head_japanese_hyphenation) {
          if(this.line_head_japanese_hyphenation_characters.indexOf(c) >= 0){
            lhjh = true;
          }
        }

        if (w > this.size.x && !lhjh) {
          this.row[last].line_space = this.wordwrap_space;
          this.row.push({ text: c, width: ctx.measureText(c).width, line_space: 0 });
        } else {
          this.row[last].text += c;
          this.row[last].width = w;
        }
      }
    });

    this.content_height = 0;
    this.row.forEach(e => {
      this.content_height += this.font_size;
      this.content_height += e.line_space;
    });
  }

  flush() {
    this.row = [];
  }

  getContentHeight() {
    return this.content_height;
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      var sx = this.size.x * this.scale.x;
      var sy = this.size.y * this.scale.y;

      if (this.row.length === 0) this.createRow(ctx);

      this._setTextAttributes(ctx);

      var y = oo.alignY(this.align, this.size.y - this.content_height);

      this.row.forEach(e => {
        var x = oo.alignX(this.align, this.size.x - e.width);
        ctx.fillText(e.text, this.position.x + x - sx * 0.5, this.position.y + y - sy * 0.5);
        y += this.font_size + e.line_space;
      });

    });
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoTile extends OoDrawObject {
  constructor(color, width, height) {
    super();
    this.size = new Oo2DVector(1, 1);
    this.color = color || '#ffffff';
  }

  draw(context) {
    if (!this.show) return;

    var ctx = context || this.context || oo.env.context;

    oo.localAlpha(ctx, this.alpha, () => {
      var sx = this.size.x * this.scale.x;
      var sy = this.size.y * this.scale.y;
      ctx.fillStyle = this.color;
      if (this.rotation.z === 0) {
        ctx.fillRect(this.position.x - sx * 0.5, this.position.y - sy * 0.5, sx, sy);
      } else {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation.z);
        ctx.fillRect(- sx * 0.5, - sy * 0.5, sx, sy);
        ctx.restore();
      }
    });
  }

  static create(color, width, height) {
    var o = new OoTile();
    o.color = color;
    o.size.set(width, height);
    return o;
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};

oo.getArrayDiff = function (array1, array2) {
  var diff = [];
  for (let x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (let x of array2) {
    if (array1.indexOf(x) === -1) diff.push(x);
  }
  return diff;
};

oo.setupLogEnv = function () {
  var div = null;
  oo.log = function (...args) {
    // console
    console.log.apply(null, args);
    // dom
    if (div === null) {
      if (document.body) {
        div = document.createElement('div');
        document.body.appendChild(div);
      }
    }

    if (div) {
      for (var arg of args) {
        if (typeof arg === 'string') {
          div.innerHTML += arg;
        } else {
          if (typeof arg === 'object') {
            div.innerHTML += arg.constructor.name;
          }
          div.innerHTML += JSON.stringify(arg);
        }
      }
      div.innerHTML += '<br>';
    }
  };
};

oo.log = function (...args) {
  console.log.apply(null, args);
};

// 要素のdatasetの値を取得する
oo.getDataset = function (id, name) {
  var element = document.getElementById(id);
  if (element) return element.dataset[name];
};

oo.strReplace = function (src, before, after) {
  return src.split(before).join(after);
};

oo.strToInt = function (s) {
  // forbid octal integer
  var n = 0;
  if (s.substr(0, 2) === '0x' || s.substr(0, 2) === '0X') {
    n = Number.parseInt(s, 16);
  } else {
    n = Number.parseInt(s, 10);
  }
  return (Number.isInteger(n)) ? n : 0;
};

oo.dup = function (str, n) {
  var result = '';
  for (var i = 0; i < n; i++) result += str;
  return result;

  // var result = '';
  // oo.repeat(n, () => { result += str; });
  // return result;
};

oo.zeroPadding = function (num, length) {
  // Number.MAX_SAFE_INTEGER = 9007199254740991
  return ('00000000000000000000' + num).slice(- length);
};

// #rrggbb形式のカラー
oo.rgbColor = function (r, g, b) {
  var rgb = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  return '#' + ('000000' + rgb.toString(16)).slice(- 6);
};

// 配列の要素の交換
oo.arraySwap = function (array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
};

oo.urlSearchParams = function (params) {
  var map = new Map();
  var array = params.split('&');
  for (var item of array) {
    var kv = item.split('=');
    if (kv.length === 1) map.set(kv[0], '');
    if (kv.length === 2) map.set(kv[0], kv[1]);
  }
  return map;
};

oo.urlSearchParams2 = function (params) {
  params = params || document.location.search;
  if (params.charAt(0) === '?') params = params.substr(1);
  var obj = {};
  var array = params.split('&');
  for (var item of array) {
    var kv = item.split('=');
    obj[kv[0]] = kv[1] || '';
  }
  return obj;
};

oo.uint32ToUint8ArrayBE = function (x) {
  return [x >>> 24, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff];
};

oo.uint32ToUint8ArrayLE = function (x) {
  return [x & 0xff, (x >>> 8) & 0xff, (x >>> 16) & 0xff, x >>> 24];
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class Oo2DVector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = (y !== void 0) ? y : this.x;
  }

  clone() {
    return new Oo2DVector(this.x, this.y);
  }

  set(x, y) {
    if (oo.isObject(x)) {
      this.x = x.x || 0;
      this.y = x.y || 0;
    } else {
      this.x = x || 0;
      this.y = (y !== void 0) ? y : this.x;
    }
    return this;
  }

  // v.add(vector)  v    += vector
  // v.add(scalar)  v.xy += scalar
  add(v) {
    this.x += (oo.isObject(v) ? v.x : v) || 0;
    this.y += (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  // v.addSV(vector, scalar)  v += vector * scalar
  addSV(v, s) {
    this.x += (v.x || 0) * s;
    this.y += (v.y || 0) * s;
    return this;
  }

  sub(v) {
    this.x -= (oo.isObject(v) ? v.x : v) || 0;
    this.y -= (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  mul(v) {
    this.x *= (oo.isObject(v) ? v.x : v) || 0;
    this.y *= (oo.isObject(v) ? v.y : v) || 0;
    return this;
  }

  div(v) {
    this.x /= (oo.isObject(v) ? v.x : v) || 1;
    this.y /= (oo.isObject(v) ? v.y : v) || 1;
    return this;
  }

  clamp(min, max) {
    if (this.x < min) this.x = min;
    if (this.y < min) this.y = min;
    if (this.x > max) this.x = max;
    if (this.y > max) this.y = max;
    return this;
  }

  negate() {
    this.x = - this.x;
    this.y = - this.y;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  rotate90() {
    [this.x, this.y] = [-this.y, this.x];
    return this;
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    return this;
  }

  getNegation() {
    return this.clone().negate();
  }

  getRound() {
    return this.clone().round();
  }

  getNormal() {
    return this.clone().normalize();
  }

  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  getAtan2() {
    return Math.atan2(this.y, this.x);
  }

  getDegree() {
    return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
  }

  static add(v0, v1) {
    return v0.clone().add(v1);
  }

  static sub(v0, v1) {
    return v0.clone().sub(v1);
  }

  static mul(v0, v1) {
    return v0.clone().mul(v1);
  }

  static div(v0, v1) {
    return v0.clone().div(v1);
  }

  static angle(v0, v1) {
    return Math.acos(Oo2DVector.dot(v1, v0) / (v1.getMagnitude() * v0.getMagnitude()));
  }

  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y;
  }

  static cross(v0, v1) {
    return v0.x * v1.y - v0.y * v1.x;
  }

  static distance(v0, v1) {
    return Oo2DVector.sub(v0, v1).getMagnitude();
  }

  static lerp(v0, v1, alpha) {
    return new Oo2DVector(
      (1.0 - alpha) * v0.x + alpha * v1.x,
      (1.0 - alpha) * v0.y + alpha * v1.y
    );
  }

  static cubicBezierCurves(v0, v1, v2, v3, alpha) {
    var t = alpha;
    var s = 1.0 - t;
    var k0 = s * s * s;
    var k1 = 3.0 * s * s * t;
    var k2 = 3.0 * s * t * t;
    var k3 = t * t * t;
    var v = new Oo2DVector(0, 0);
    v.addSV(v0, k0);
    v.addSV(v1, k1);
    v.addSV(v2, k2);
    v.addSV(v3, k3);
    return v;
  }

  static create(x, y) {
    return new Oo2DVector(x, y);
  }
}

class Oo3DVector {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = (y === void 0) ? this.x : y;
    this.z = (z === void 0) ? this.y : z;
  }

  clone() {
    return new Oo3DVector(this.x, this.y, this.z);
  }

  set(x, y, z) {
    if (oo.isObject(x)) {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
    } else {
      this.x = x || 0;
      this.y = (y !== void 0) ? y : this.x;
      this.z = (z !== void 0) ? z : this.y;
    }
    return this;
  }

  add(v) {
    this.x += (oo.isObject(v) ? v.x : v) || 0;
    this.y += (oo.isObject(v) ? v.y : v) || 0;
    this.z += (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  addSV(v, s) {
    this.x += (v.x || 0) * s;
    this.y += (v.y || 0) * s;
    this.z += (v.z || 0) * s;
    return this;
  }

  sub(v) {
    this.x -= (oo.isObject(v) ? v.x : v) || 0;
    this.y -= (oo.isObject(v) ? v.y : v) || 0;
    this.z -= (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  mul(v) {
    this.x *= (oo.isObject(v) ? v.x : v) || 0;
    this.y *= (oo.isObject(v) ? v.y : v) || 0;
    this.z *= (oo.isObject(v) ? v.z : v) || 0;
    return this;
  }

  div(v) {
    this.x /= (oo.isObject(v) ? v.x : v) || 1;
    this.y /= (oo.isObject(v) ? v.y : v) || 1;
    this.z /= (oo.isObject(v) ? v.z : v) || 1;
    return this;
  }

  clamp(min, max) {
    if (this.x < min) this.x = min;
    if (this.y < min) this.y = min;
    if (this.z < min) this.z = min;
    if (this.x > max) this.x = max;
    if (this.y > max) this.y = max;
    if (this.z > max) this.z = max;
    return this;
  }

  negate() {
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  getNegation() {
    return this.clone().negate();
  }

  getRound() {
    return this.clone().round();
  }

  getNormal() {
    return this.clone().normalize();
  }

  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  getMagnitude() {
    return Math.sqrt(this.getMagnitudeSquared());
  }

  getAtan2() {
    return Math.atan2(this.y, this.x);
  }

  getDegree() {
    return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
  }

  static add(v0, v1) {
    return v0.clone().add(v1);
  }

  static sub(v0, v1) {
    return v0.clone().sub(v1);
  }

  static mul(v0, v1) {
    return v0.clone().mul(v1);
  }

  static div(v0, v1) {
    return v0.clone().div(v1);
  }

  static angle(v0, v1) {
    return Math.acos(Oo3DVector.dot(v1, v0) / (v1.getMagnitude() * v0.getMagnitude()));
  }

  static dot(v0, v1) {
    return v0.x * v1.x + v0.y * v1.y + v0.z * v1.z;
  }

  static cross(v0, v1) {
    // if v0 = x and v1 = y, then v = z
    return new Oo3DVector(
      v0.y * v1.z - v0.z * v1.y,
      v0.z * v1.x - v0.x * v1.z,
      v0.x * v1.y - v0.y * v1.x
    );
  }

  static distance(v0, v1) {
    return Oo3DVector.sub(v0, v1).getMagnitude();
  }

  static lerp(v0, v1, alpha) {
    return new Oo3DVector(
      (1.0 - alpha) * v0.x + alpha * v1.x,
      (1.0 - alpha) * v0.y + alpha * v1.y,
      (1.0 - alpha) * v0.z + alpha * v1.z
    );
  }

  static cubicBezierCurves(v0, v1, v2, v3, alpha) {
    var t = alpha;
    var s = 1.0 - t;
    var k0 = s * s * s;
    var k1 = 3.0 * s * s * t;
    var k2 = 3.0 * s * t * t;
    var k3 = t * t * t;

    var v = new Oo3DVector(0, 0, 0);
    v.addSV(v0, k0);
    v.addSV(v1, k1);
    v.addSV(v2, k2);
    v.addSV(v3, k3);
    return v;
  }

  static rotateX(rotation_x, v) {
    var s = Math.sin(rotation_x);
    var c = Math.cos(rotation_x);
    var r = new Oo3DVector(0, 0, 0);
    r.x = v.x;
    r.y = c * v.y - s * v.z;
    r.z = s * v.y + c * v.z;
    return r;
  }

  static rotateY(rotation_y, v) {
    var s = Math.sin(rotation_y);
    var c = Math.cos(rotation_y);
    var r = new Oo3DVector(0, 0, 0);
    r.x = c * v.x + s * v.z;
    r.y = v.y;
    r.z = - s * v.x + c * v.z;
    return r;
  }

  static rotateZ(rotation_z, v) {
    var s = Math.sin(rotation_z);
    var c = Math.cos(rotation_z);
    var r = new Oo3DVector(0, 0, 0);
    r.x = c * v.x - s * v.y;
    r.y = s * v.x + c * v.y;
    r.z = v.z;
    return r;
  }

  static create(x, y, z) {
    return new Oo3DVector(x, y);
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.wrapBeforeAfter = function (func, before, after) {
  return function (...args) {
    before && before(...args);
    var result = func(...args);
    after && after(result);
    return result;
  };
};

// ex.
//  oo.wrap(func, type)
//  oo.wrap(func, befor, after)
// 
// func: function
// type: 'log' or 'inout' or 'time' or'check'
// before: function
// after: function
oo.wrap = function (func, ...args) {
  var f0 = args[0];
  var f1 = args[1];
  if ((typeof f0 === 'function') && (typeof f0 === 'function')) {
    return oo.wrapBeforeAfter(func, f0, f1);
  }
  var type = args[0];
  if (typeof type === 'string') {
    if (type === 'log') {
      return oo.wrapBeforeAfter(func,
        () => { oo.log('log:', func.name); },
        () => { }
      );
    }
    if (type === 'inout') {
      return oo.wrapBeforeAfter(func,
        () => { oo.log('in:', func.name); },
        () => { oo.log('out:', func.name); }
      );
    }
    if (type === 'time') {
      var start;
      return oo.wrapBeforeAfter(func,
        () => { start = performance.now(); },
        () => { oo.log('time:', func.name, ' ', '' + (performance.now() - start)); }
      );
    }
    if (type === 'check') {
      return oo.wrapBeforeAfter(func,
        (...args) => { oo.log('check:', func.name, ' ', 'args:', args); },
        (result) => { oo.log('check:', func.name, ' ', 'result:', result); }
      );
    }
  }
  return func;
};

