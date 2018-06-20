// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameInputStatus {
  constructor() {
    this.touch_press = false;
    this.touch_position = new Oo2DVector(0, 0);
    this.touch_delta = new Oo2DVector(0, 0);
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

    this.addStatus(status);
    // this.status_array.pop();
    // this.status_array.unshift(status);

  
    this.click_on = this._click_on;
    this.click_position = this._click_position.clone();

    this._touch_on = false;
    this._click_on = false;
  }

  _getEventPositionMouse(event) {
    var r = this._element.getBoundingClientRect();
    var x = event.clientX - r.left;
    var y = event.clientY - r.top;
    return Oo2DVector.create(x, y).mul(this._scale);
  }

  _getEventPositionTouch(event) {
    var r = this._element.getBoundingClientRect();
    // var x = event.changedTouches[0].pageX - r.left;
    // var y = event.changedTouches[0].pageY - r.top;
    // return Oo2DVector.create(x, y).mul(this._scale);
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
  }

  _onTouchMove(event) {
    var r = this._element.getBoundingClientRect();
    var x = event.changedTouches[0].pageX;
    var y = event.changedTouches[0].pageY;
    if (x < r.left || x >= r.right || y < r.top || y >= r.bottom) {
      this._touch_press = false;
    }

    if (this._touch_press) {
      this._touch_position = this._getEventPositionTouch(event);
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
  }

  _onMouseMove(event) {
    this._touch_position = this._getEventPositionMouse(event);
  }

  _onMouseUp(event) {
    this._touch_press = false;
    this._touch_position = this._getEventPositionMouse(event);
  }
}
