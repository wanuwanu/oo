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
    this.offset = new Oo2DVector(0);

    this.screen_width = 1080;
    this.screen_height = 1920;
    this.canvas_width = this.screen_width;
    this.canvas_height = this.screen_height;
    this.scale = 1;

    this.canvas;
    this.context;
    this.scene_array = [];
    this.scene_map = new Map();

    this.click_on = false;
    this.click_position = new Oo2DVector(0);

    this.input = new OoGameInput();
    this.touch_on = false;
    this.touch_press = false;
    this.touch_position = new Oo2DVector(0);

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

  addScene(scene) {
    scene.frame = this;
    this.scene_array.push(scene);
    this.scene_map.set(scene.name, scene);
  }

  startScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kStart);
  }

  endScene(name) {
    this.setSceneStatus(name, oo.gameSceneStatus.kEnd);
  }

  getScene(name) {
    return this.scene_map.get(name);
  }

  setSceneStatus(name, scene_status) {
    const scene = this.getScene(name);
    if (scene) scene.scene_status = scene_status;
  }

  update() {
    var status = new OoGameInputStatus();
    status.touch_press = this.touch_press || this.touch_on;
    status.touch_position = this.touch_position.clone();
    this.input.addStatus(status);

    this.touch_on = false;

    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.update();
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kEnd) {
        scene.release();
        scene.scene_status = oo.gameSceneStatus.kInactive;
      }
    }
    for (scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kStart) {
        scene.create();
        scene.update();
        scene.scene_status = oo.gameSceneStatus.kActive;
      }
    }
  }

  render() {
    for (var scene of this.scene_array) {
      if (scene.scene_status === oo.gameSceneStatus.kActive) scene.render();
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
      canvas.style.backgroundColor = '#000000';
      canvas.style.zIndex = 1;
    }

    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  clear() {
    this.context.clearRect(0, 0, this.screen_width, this.screen_height);
  }

  setupInput() {
    var self = this;
    var canvas = this.canvas;

    // click
    function clickListener(event) {
      var rect = canvas.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.clientX - rect.left) / self.scale;
      self.click_position.y = (event.clientY - rect.top) / self.scale;
    }

    function tapListener(event) {
      var rect = canvas.getBoundingClientRect();
      self.click_on = true;
      self.click_position.x = (event.changedTouches[0].pageX - rect.left) / self.scale;
      self.click_position.y = (event.changedTouches[0].pageY - rect.top) / self.scale;
    }

    if ('ontouchstart' in window) {
      canvas.addEventListener('touchend', tapListener, false);
    } else {
      canvas.addEventListener('click', clickListener, false);
    }


    function getEventPosition(event) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.clientX - rect.left) / self.scale;
      var y = (event.clientY - rect.top) / self.scale;
      return new Oo2DVector(x, y);
    }

    function getEventPositionTouch(event) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.changedTouches[0].pageX - rect.left) / self.scale;
      var y = (event.changedTouches[0].pageY - rect.top) / self.scale;
      return new Oo2DVector(x, y);
    }

    function onTouchStart(event) {
      self.touch_press = true;
      self.touch_on = true;
      self.touch_position = getEventPositionTouch(event);
    }
    function onTouchMove(event) {
      self.touch_position = getEventPositionTouch(event);

      event.preventDefault();
      event.stopPropagation();
    }
    function onTouchEnd(event) {
      self.touch_press = false;
      self.touch_position = getEventPositionTouch(event);
    }

    function onMouseDown(event) {
      self.touch_press = true;
      self.touch_on = true;
      self.touch_position = getEventPosition(event);
    }
    function onMouseMove(event) {
      self.touch_position = getEventPosition(event);
    }
    function onMouseUp(event) {
      self.touch_press = false;
      self.touch_position = getEventPosition(event);
    }

    if ('ontouchstart' in window) {
      canvas.addEventListener('touchstart', onTouchStart, false);
      canvas.addEventListener('touchmove', onTouchMove, false);
      canvas.addEventListener('touchend', onTouchEnd, false);
      canvas.addEventListener('touchcancel', onTouchEnd, false);
    } else {
      canvas.addEventListener('mousedown', onMouseDown, false);
      canvas.addEventListener('mousemove', onMouseMove, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
    }
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


    if (this.game_loop_type === 3) {
      var time0 = Date.now();
      var interval = 8;
      var enter = 0;

      var update = function () {
        var time1 = Date.now();
        var delta = time1 - time0;
        if (delta < 1000 / fps) return;
        time0 = time1 - Math.min(delta - 1000 / fps, interval);

        if (enter) {
          enter += 1;
          if (enter < 60) return;
          cancelAnimationFrame(raf);
        }

        enter = 1;
        var raf = requestAnimationFrame(() => {
          self.update();
          self.render();
          enter = 0;
        });
      };

      setInterval(update, interval);
    }

  }
}

