// OoLibrary Copyright (c) wanu@nyagoya
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

