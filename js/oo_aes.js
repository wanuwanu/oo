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
}