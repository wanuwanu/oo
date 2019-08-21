// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoRenderSprite extends OoSprite {
  constructor(image) {
    super();
    if (image && image instanceof Image) {
      this.createFromImage(image);
    }
  }

  create(width, height) {
    this.createWithSize(width, height);
    console.log('OoRenderSprite.create is deprecated.');
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
}
