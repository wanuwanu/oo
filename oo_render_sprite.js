// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoRenderSprite extends OoSprite {
  constructor(image) {
    super();
    if (image && image instanceof Image) {
      this.size.set(image.width, image.height);

      this.canvas = document.createElement('canvas');
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.canvas_context = this.canvas.getContext('2d');
      this.canvas_context.drawImage(image, 0, 0);
      this.image_data = this.canvas_context.getImageData(0, 0, image.width, image.height);
      this.pixel = this.image_data.data;
      this.image = this.canvas;
    }
  }

  updateCanvas() {
    this.canvas_context.putImageData(this.image_data, 0, 0);
  }
}
