// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.asyncCreateApng = function (url, callback) {
  var apng = new OoApng();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = () => {
    apng.create(xhr.response);
    callback();
  };
  xhr.onerror = () => { callback(); };
  xhr.onabort = xhr.onerror;
  xhr.ontimeout = xhr.onerror;
  xhr.send();
  return apng;
};

class OoApng extends OoDrawObject {
  constructor() {
    super();

    this.crc_table = [];
    this.makeCrcTable();
  }

  create(buffer) {
    this.buffer = new Uint8Array(buffer);
    var png_signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    for (var i = 0; i < png_signature.length; i++) {
      if (this.buffer[i] !== png_signature[i]) return false;
    }

    this.frames = [];

    var pos = 8;
    var data0 = [];
    var data1 = [];
    var table = {};

    table['IHDR'] = (pos) => {
      this.width = this.readUint32(pos + 8);
      this.height = this.readUint32(pos + 8 + 4);
    };
    table['acTL'] = (pos) => {
      this.num_frames = this.readUint32(pos + 8);
      this.num_plays = this.readUint32(pos + 8 + 4);
    };

    table['fcTL'] = (pos) => {
      var frame = {};
      frame.sequence_number = this.readUint32(pos + 8);
      frame.width = this.readUint32(pos + 8 + 4);
      frame.height = this.readUint32(pos + 8 + 8);
      frame.x_offset = this.readUint32(pos + 8 + 12);
      frame.y_offset = this.readUint32(pos + 8 + 16);
      frame.delay_num = this.readUint16(pos + 8 + 20);
      frame.delay_den = this.readUint16(pos + 8 + 22);
      frame.dispose_op = this.readUint8(pos + 8 + 24);
      frame.blend_op = this.readUint8(pos + 8 + 25);
      this.frames.push(frame);
    };
    table['fdAT'] = (pos) => {
      this.frames[this.frames.length - 1].data = { pos: pos + 8 + 4, length: length - 4 }
    };
    table['IDAT'] = (pos) => {
      this.frames[this.frames.length - 1].data = { pos: pos + 8, length };
    };
    table['IEND'] = (pos) => { data1.push({ pos: pos, length: 12 + length }); };
    table[''] = (pos) => { data0.push({ pos: pos, length: 12 + length }); };

    while (true) {
      var length = this.readUint32(pos);
      var type = this.readString(pos + 4, 4);
      if (table[type] === void 0) type = '';
      table[type](pos);
      if (type === 'IEND') break;
      pos += 12 + length;
      if (pos >= this.buffer.size) break;
    }

    for (var i = 0; i < this.frames.length; i++) {
      var frame = this.frames[i];
      var blob_array = [];
      blob_array.push(png_signature);

      var u8 = new Uint8Array(8);
      this.writeUint32(u8, 0, frame.width);
      this.writeUint32(u8, 4, frame.height);
      blob_array.push(this.makeChunk('IDAT', u8, 0, 8));
      

      blob_array.push(this.makeU8(data0));
      blob_array.push(this.makeChunk('IDAT', this.buffer, frame.data.pos, frame.data.length));
      blob_array.push(this.makeU8(data1));
      var blob = new Blob(blob_array, { 'type': 'image/png' });
      frame.img = new Image();
      frame.img.src = URL.createObjectURL(blob);
    }
  }

  makeU8(data) {
    var u8 = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) u8[i] = this.buffer[data.pos + i];
    return u8;
  }
  makeChunk(type, buffer, pos, length) {
    var total = type.length + length;
    var u8 = new Uint8Array(total + 8);
    this.writeUint32(u8, 0, length);
    this.writeString(u8, 4, type);
    var s = type.length + 4;
    for (var i = 0; i < length; i++) u8[s + i] = buffer[pos + i];
    var crc = this.getCrc(u8, 4, total);
    this.writeUint32(u8, total + 4, crc);
    return u8;
  }

  // CRC
  makeCrcTable() {
    var kCrcPoly = 0xedb88320;
    for (var i = 0; i < 256; i++) {
      var r = i;
      for (var j = 0; j < 8; j++) r = (r & 1) ? ((r >>> 1) ^ kCrcPoly) : (r >>> 1);
      this.crc_table[i] = r;
    }
  }
  getCrc(u8, pos, length) { return this.getCrcPlus(u8, pos, length, 0); }
  getCrcPlus(u8, pos, length, crc) {
    crc ^= 0xffffffff;
    for (var i = 0; i < length; i++) {
      crc = (crc >>> 8) ^ this.crc_table[(crc & 0xff) ^ u8[pos + i]];
    }
    return crc ^ 0xffffffff;
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

  readUint8(pos) { return this.buffer[pos]; }
  readUint16(pos) {
    return (this.buffer[pos] << 8) | this.buffer[pos + 1];
  }
  readUint32(pos) {
    return (this.readUint16(pos) << 16) | this.readUint16(pos + 2);
  }

  readString(pos, length) {
    var str = '';
    for (var i = 0; i < length; i++) {
      str += String.fromCharCode(this.buffer[pos + i]);
    }
    return str;
  }

  start() {

  }

  updateByTime() {
  }

  draw(context) {

    // var frame = oo.clamp(this.current_frame, 0, this.images.length - 1);
    // var image = this.images[frame];
    var image = this.frames[0].img;
    context.drawImage(image, this.position.x, this.position.y);
  }
}
