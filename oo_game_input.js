// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameInputStatus {
  constructor() {
    this.touch_press = false;
    this.touch_position = new Oo2DVector(0, 0);
  }
}

class OoGameInput {
  constructor() {
    this.status_array = [];
    this.status_array[0] = new OoGameInputStatus();
    this.status_array[1] = new OoGameInputStatus();
  }

  addStatus(status) {
    this.status_array.pop();
    this.status_array.unshift(status);
  }

  getTouchPosition() { return this.status_array[0].touch_position; }

  isTouch() { return this.status_array[0].touch_press === true; }
  isTouchStart() { return (this.status_array[0].touch_press === true && this.status_array[1].touch_press === false); }
  isTouchEnd() { return (this.status_array[0].touch_press === false && this.status_array[1].touch_press === true); }
}