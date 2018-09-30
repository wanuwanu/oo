// OoLibrary Copyright (c) wanu@nyagoya
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

