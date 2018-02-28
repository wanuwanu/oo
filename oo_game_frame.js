// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoGameFrame {
  constructor() {
    this.game_loop_type = 2;
    this.fps = 60;

    this.horizontal_scaling = false;
    this.vertical_scaling = false;
    this.bottom_origin = false;
    this.offset = new Oo2DVector(0, 0);

    this.screen_width = 1080;
    this.screen_height = 1920;
    this.canvas_width = this.screen_width;
    this.canvas_height = this.screen_height;
    this.scale = 1;

    this.canvas;
    this.context;
    this.scene_array = [];

    this.click_on = false;
    this.click_position = new Oo2DVector(0, 0);

    this.input = new OoGameInput();
    this.touch_on = false;
    this.touch_press = false;

    try {
      // window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audio_context = new AudioContext();
    }
    catch (e) {
      console.log('oo:new AudioContext() exception');
    }
  }

  getOffsetClickPosition() {
    return Oo2DVector.sub(this.click_position, this.offset);
  }

  addGameScene(scene) {
    this.scene_array.push(scene);
  }

  startScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kStart);
  }

  endScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kEnd);
  }

  setSceneStatus(name, scene_status) {
    for (var scene of this.scene_array) {
      if (scene.name === name) scene.scene_status = scene_status;
    }
  }

  update() {
    var status = new OoGameInputStatus();
    status.touch_press = this.touch_press || this.touch_on;
    status.touch_position = this.touch_position;
    this.input.addStatus(status);

    this.touch_on = false;

    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.update(this);
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kEnd) {
        scene.release();
        scene.scene_status = oo.gameSceneStatus.kInactive;
      }
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kStart) {
        scene.create(this);
        scene.update(this);
        scene.scene_status = oo.gameSceneStatus.kActive;
      }
    }
  }

  render() {
    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.render(this);
    }

    this.click_on = false;
  }

  setHorizontalScaling() { this.horizontal_scaling = true; }
  setVerticalScaling() { this.vertical_scaling = true; }
  setBottomOrigin() { this.bottom_origin = true; }

  setCanvasScaleWH(canvas, base_w, base_h) {
    // 矩形内最大サイズのスケール
    this.scale = Math.min(base_w / this.screen_width, base_h / this.screen_height);
    // 水平方向に合わせる場合のスケール
    if (this.horizontal_scaling) this.scale = base_w / this.screen_width;
    // 垂直方向に合わせる場合のスケール
    if (this.vertical_scaling) this.scale = base_h / this.screen_height;
    // サイズ
    var width = this.screen_width;
    var height = this.screen_height;
    if (this.horizontal_scaling) height = this.screen_width * base_h / base_w;
    if (this.vertical_scaling) width = this.screen_height * base_w / base_h;
    this.canvas_width = width;
    this.canvas_height = height;
    canvas.width = width;
    canvas.height = height;
    // 下を基準とする場合のオフセット
    if (this.bottom_origin) this.offset.y = height - this.screen_height;
  }

  createDrawEnv(canvas) {

    if (canvas) {
      this.setCanvasScaleWH(canvas, canvas.clientWidth, canvas.clientHeight);
    } else {
      if (oo.env.debug_log) console.log('createDrawEnv:create canvas');

      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);

      this.setCanvasScaleWH(canvas, window.innerWidth, window.innerHeight);

      canvas.style.width = canvas.width * this.scale + 'px';
      canvas.style.height = canvas.height * this.scale + 'px';
      canvas.style.position = 'absolute';
      canvas.style.background = '#666666';
      canvas.style.zIndex = 1;
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  clear() {
    this.context.clearRect(0, 0, this.screen_width, this.screen_height);
  }

  drawImage(image, x, y, w, h) {
    if (!image) return;
    var iw = (w === undefined) ? image.width : w;
    var ih = (h === undefined) ? image.height : h;
    this.context.drawImage(image, x, y, iw, ih);
  }

  drawImageCenter(image, x, y, w, h) {
    if (!image) return;
    var iw = (w === undefined) ? image.width : w;
    var ih = (h === undefined) ? image.height : h;
    this.context.drawImage(image, x - iw * 0.5, y - ih * 0.5, iw, ih);
  }

  // 可変枠の描画(縦横の中心2x2ドットが可変サイズとなる中部分)
  drawFrameImage(image, x, y, w, h) {
    if (!image) return;
    var mx = (image.width - 2) / 2;
    var my = (image.height - 2) / 2;

    var sx = [0, mx, mx + 2];
    var sy = [0, my, my + 2];
    var sw = [mx, 2, mx];
    var sh = [my, 2, my];

    var dx = [x, x + mx, x + w - mx];
    var dy = [y, y + my, y + h - my];
    var dw = [mx, w - mx * 2, mx];
    var dh = [my, h - my * 2, my];

    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        this.context.drawImage(image, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]);
      }
    }
  }

  setupInput() {
    var self = this;
    function clickListener(event) {
      var rect = event.target.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.clientX - rect.left) / self.scale;
      self.click_position.y = (event.clientY - rect.top) / self.scale;
      //        event.preventDefault();
    }
    document.addEventListener('click', clickListener, false);

    function tapListener(event) {
      var rect = event.target.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.changedTouches[0].pageX - rect.left) / self.scale;
      self.click_position.y = (event.changedTouches[0].pageY - rect.top) / self.scale;
      //       event.preventDefault();
    }
    document.addEventListener('touchend', tapListener, false);

    function getEventPosition(event) {
      var rect = event.target.getBoundingClientRect();
      var v = new Oo2DVector();
      v.x = (event.clientX - rect.left) / self.scale;
      v.y = (event.clientY - rect.top) / self.scale;
      return v;
    }

    function onMouseDown(event) {
      self.touch_press = true;
      self.touch_on = true;
      self.touch_position = getEventPosition(event);
    }
    function onMouseMove(event) {
      //self.touch_press = true;
      //self.touch_on = true;
      self.touch_position = getEventPosition(event);
    }
    function onMouseUp(event) {
      self.touch_press = false;
      self.touch_position = getEventPosition(event);
    }

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
  }


  setupGameLoop() {
    var self = this;
    var fps = this.fps;
    if (this.game_loop_type === 0) setInterval(
      function updateByInterval() {
        self.update();
        self.render();
      },
      1000 / fps
    );
    if (this.game_loop_type === 1) setTimeout(
      function updateByTimeout() {
        setTimeout(updateByTimeout, 1000 / fps);
        self.update();
        self.render();
      },
      1000 / fps
    );
    if (this.game_loop_type === 2) requestAnimationFrame(
      function updateAnimationFrame() {
        requestAnimationFrame(updateAnimationFrame);
        self.update();
        self.render();
      }
    );
  }
}

