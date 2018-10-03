// OoLibrary Copyright (c) wanu@nyagoya
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
    apng.create(xhr.response);
    if (callback) callback();
  };
  xhr.onerror = () => { if (callback) callback(); };
  xhr.onabort = xhr.onerror;
  xhr.ontimeout = xhr.onerror;
  xhr.send();
  return apng;
};

class OoApng extends OoRenderSprite {
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

  create(array_buffer) {
    var buffer = new Uint8Array(array_buffer);

    // check png signature
    for (var i = 0; i < oo.apng.png_signature.length; i++) {
      if (buffer[i] !== oo.apng.png_signature[i]) return false;
    }

    // scan chunk
    this._scanChunks(buffer, 8, (type, position, length) => {
      if (type === 'acTL') this.is_apng = true;
    });

    if (this.is_apng) {
      this._createApngImage(buffer);
    } else {
      this._createPngImage(buffer);
    }
  }

  _createPngImage(buffer) {
    var blob = new Blob([buffer], { 'type': 'image/png' });
    this.image = new Image();
    this.image.src = URL.createObjectURL(blob);
    this.image.onload = function () { };
    this.image.onerror = function () { oo.log('oo_apng : create error'); };

    // scan chunk
    this._scanChunks(buffer, 8, (type, position, length) => {
      if (type === 'IHDR') {
        this.width = this.readUint32(buffer, position + 8);
        this.height = this.readUint32(buffer, position + 8 + 4);
      }
    });
    this.size.set(this.width, this.height);
  }

  _createApngImage(buffer) {
    var data = [];
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

    // create images
    for (var i = 0; i < this.frames.length; i++) {
      var frame = this.frames[i];
      var blob_array = [];
      blob_array.push(oo.apng.png_signature);

      var u8 = this.makeU8(buffer, this.header);
      this.writeUint32(u8, 0, frame.width);
      this.writeUint32(u8, 4, frame.height);
      blob_array.push(this.makeChunk('IHDR', u8, 0, u8.length));

      for (var j = 0; j < data.length; j++) blob_array.push(this.makeU8(buffer, data[j]));
      for (var j = 0; j < frame.data.length; j++) {
        blob_array.push(this.makeChunk('IDAT', buffer, frame.data[j].pos, frame.data[j].length));
      }
      blob_array.push(this.makeChunk('IEND', null, 0, 0));
      var blob = new Blob(blob_array, { 'type': 'image/png' });

      frame.img = new Image();
      frame.img.src = URL.createObjectURL(blob);
      frame.img.onload = function () { };
      frame.img.onerror = function () { oo.log('oo_apng : create error'); };
    }

    super.create(this.width, this.height);
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
    if(!this.is_apng) return;

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
    if(!this.is_apng) return;

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

}
