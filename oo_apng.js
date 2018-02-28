// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoApng {
  constructor(file) {
    this.img = new Image();
    this.img.src = file;
    this.img.id = file;
    
    this.file = file;
    this.frame_scale = 1.0;
    this.position = new Oo2DVector(0, 0);
    this.size = new Oo2DVector(this.img.width, this.img.height);

    this.img.style.position = 'absolute';
    this.img.style.zIndex = 0;
    this.img.style.opacity = 1.0;
    this.img.style.userSelect = 'none';
    this.updateStyle();
  }

  setImageId(id){
    this.img.id = id;
  }

  restart() {
    this.img.src = this.file;
  }
  append() {
    document.body.appendChild(this.img);
  }
  remove() {
    document.body.removeChild(this.img);
  }

  setXY(x, y){
    this.position.x = x;
    this.position.y = y;
    this.updateStyle();
  }
    
  setXYWH(x, y, w, h){
    this.position.x = x;
    this.position.y = y;
    this.size.x = w;
    this.size.y = h;
    this.updateStyle();
  }

  setFrameScale(frame_scale) {
    this.frame_scale = frame_scale;
    this.updateStyle();
  }

  updateStyle() {
    this.img.style.left = this.frame_scale * this.position.x + 'px';
    this.img.style.top = this.frame_scale * this.position.y + 'px';
    this.img.style.width = this.frame_scale * this.size.x + 'px';
    this.img.style.height = this.frame_scale * this.size.y + 'px';
  }
}


