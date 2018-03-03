// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

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



// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

// 非同期関連

var oo = oo || {};

oo.async = function (callback) {
  var img = new Image();
  img.src = '';
  img.onerror = callback;
};

// oo.serial(function* (proceeder) {
//   yield asyncFunction1(proceeder);
//   yield asyncFunction2(proceeder);
// }, () => {
// });
// 
// oo.parallel(function* (proceeder) {
//   yield asyncFunction1(proceeder);
//   yield asyncFunction2(proceeder);
// }, () => {
// });

oo.serial = function (generator, completion) {
  function proceeder() {
    var result = g.next();
    if (result.done && completion) completion();
  }
  var g = generator(proceeder);
  proceeder();
};

oo.parallel = function (generator, completion) {
  var n = 0;
  function proceeder() {
    if ((n-- === 1) && completion) completion();
  }
  var g = generator(proceeder);
  while (!g.next().done) n++;
  if (n === 0 && completion) completion();
};

oo.createAsyncGeneratorWithList = function (async_function, list) {
  return function* (proceeder) {
    for (var x of list) yield async_function(proceeder, x);
  };
};

oo.createAsyncGeneratorWithImageList = function (target, base_path, image_list, extension) {
  return function* (proceeder) {
    var ext = (extension === undefined) ? '' : '.' + extension;
    var path = (base_path === undefined) ? '' : base_path + '/';
    for (var name of image_list) {
      if (Array.isArray(name)) {
        yield target[name] = oo.asyncCreateImage(proceeder, path + name + ext);
      } else {
        yield target[name] = oo.asyncCreateImage(proceeder, path + name + ext);
      }
    }
  };
};

oo.asyncCreateImage = function (proceeder, file) {
  var img = new Image();
  img.src = file;
  img.onload = proceeder;
  img.onerror = proceeder;
  return img;
};

oo.asyncAppendScript = function (proceeder, file) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = proceeder;
  script.onerror = proceeder;
  document.body.appendChild(script);
};

// 通常関数のasync化
oo.asyncFunction = function (proceeder, base_function) {
  base_function();
  oo.async(proceeder);
};

oo.createAsyncFunction = function (base_function) {
  return function (proceeder) {
    base_function();
    oo.async(proceeder);
  };
};




// 廃止予定
oo.createSyncGeneratorForImageList = function (target, image_list, base_path) {
  return function* (proceed) {
    for (var item of image_list) yield target[item[0]] = oo.syncCreateImage(proceed, item[1], base_path);
  };
};

// 廃止予定
oo.createSyncGeneratorForImageList2 = function (target, base_path, image_list, extension) {
  return function* (proceed) {
    for (var name of image_list) yield target[name] = oo.syncCreateImage(proceed, name + '.' + extension, base_path);
  };
};

// 廃止予定
oo.syncCreateImage = function (proceed, file, base_path) {
  var img = new Image();
  if (base_path) file = base_path + '/' + file;
  img.src = file;
  img.onload = proceed;
  img.onerror = proceed;
  return img;
};

// 廃止予定
oo.syncAppendScript = function (proceed, file) {
  var script = document.createElement('script');
  script.src = file;
  script.onload = proceed;
  document.body.appendChild(script);
};

// 廃止予定
// sync化
oo.sync = function (proceed, baseFunction) {
  setTimeout(proceed, 0);
  baseFunction();
};

// 廃止予定
// syncFunction化
oo.syncFunc = function (baseFunction) {
  return function (proceed) {
    setTimeout(proceed, 0);
    baseFunction();
  };
};

// 廃止予定
// syncGenerator化
oo.syncGen = function (baseFunction) {
  return function* (proceed) {
    baseFunction();
    yield setTimeout(proceed, 0);
  };
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};
oo.env = oo.env || {};
oo.env.debug_log = false;

oo.isValidObject = function (object) {
  return (typeof object === 'object') && (object !== null) && !Array.isArray(object);
};

oo.clone = function (obj) {
  return Object.assign({}, obj);
};

oo.deepClone = function (obj) {
  if (typeof obj !== 'object') return obj;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    var array = [];
    for (var x of obj) array.push(oo.deepClone(x));
    return array;
  } else {
    var object = {};
    var key_array = Object.keys(obj);
    for (var key of key_array) object[key] = oo.deepClone(obj[key]);
    return object;
  }
};

oo.setupQuery = function () {
  var $elements = {};

  var $ = function (tag, args, style) {
    // get element by id
    // ex.
    // ('#id')
    var element;
    if (tag.charAt(0) === '#') {
      var id = tag.substr(1);
      element = document.getElementById(id);
      return element ? element : ($elements[id] ? $elements[id] : null);
    }
    // create & append
    // ex.
    // ('@text')
    // ('tag')
    // ('tag', 'id')
    // ('tag', 'id', style)
    // ('tag', {property, style})
    if (tag.charAt(0) === '@') {
      return document.createTextNode(tag.substr(1));
    } else {
      element = document.createElement(tag);
      if (typeof args !== 'undefined') {
        if (typeof args === 'string') {
          if (args) $elements[element.id = args] = element;
          if (oo.isValidObject(style)) Object.assign(element.style, style);
        } else {
          if (oo.isValidObject(args.property)) Object.assign(element, args.property);
          if (oo.isValidObject(args.style)) Object.assign(element.style, args.style);
          if (element.id) $elements[element.id] = element;
        }
      }
      return element;
    }
  };

  Node.prototype.$ = function (tag, id, style) {
    return this.appendChild($(tag, id, style));
  };

  return $;
};

oo.main = function (main_proc) {
  document.addEventListener('DOMContentLoaded', function () {
    main_proc();
  }, false);
};


// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.fxsRotationType = {
  kNormal: 0,
  kDirection: 1,
};

oo.fxsDirectionType = {
  kNormal: 0,
  kSphere: 1,
  kDist: 2,
  kCenter: 3,
};

oo.fxsDistributionType = {
  kNone: 0,
  kUniform: 1,
  kBall: 2,
  kSphere: 3,
};

class FxsLerpParam {
  constructor(a, b, p) {
    this.a = (a === undefined) ? 0 : a;
    this.b = (b === undefined) ? 0 : b;
    this.p = (p === undefined) ? 0.0 : p;
  }
}

class FxsEmitterFrame {
  constructor() {
    this.frame_num = 0;
    this.num_ppf = 0.0;
    this.life_time = 0;
    this.life_time_dist = 0;
    this.direction_type = oo.fxsDirectionType.kNormal;
    this.direction = new Oo2DVector(0, 0);
    this.direction_dist = 0;
    this.velocity0 = 0.0; // dist min
    this.velocity1 = 0.0; // dist max
    this.distribution_type = oo.fxsDistributionType.kNone;
    this.position = new Oo2DVector(0, 0);
    this.position_dist = new Oo2DVector(0, 0);
    this.scale0 = 1; // dist min
    this.scale1 = 1; // dist max
    this.rotation0 = 0; // dist min
    this.rotation1 = 0; // dist max
    this.rotation_v0 = 0; // dist min
    this.rotation_v1 = 0; // dist max
    this.frame_offset_dist = 0;
  }
}

class FxsParticleFrame {
  constructor() {
    this.frame_num = 0;
    this.scale = new Oo2DVector(1, 1);
    this.alpha = 1.0;
  }
}


class FxsTypeBase {
  constructor() {
    this.frame_data = [];
    this.frame_lerp_array = [];
  }

  createFrameLerpArray() {
    var n = this.frame_data.length;
    // var max_frames = this.frame_data[n - 1].frame_num;
    var i = 0;
    var a = 0;
    var b = 0;
    for (var j = 0; j < n; j++) {
      for (; i < this.frame_data[j].frame_num; i++) {
        var fn0 = this.frame_data[a].frame_num;
        var fn1 = this.frame_data[b].frame_num;
        var p = oo.smoothstep(fn0, fn1, i);
        this.frame_lerp_array[i] = new FxsLerpParam(a, b, p);
      }
      a = b;
      b = Math.min(b + 1, n - 1);
    }
    this.frame_lerp_array[i] = new FxsLerpParam(b, b, 0.0);
  }

  getFrameLerpParam(frame_num) {
    if (frame_num < 0) return this.frame_lerp_array[0];
    var n = this.frame_lerp_array.length;
    if (frame_num >= n) return this.frame_lerp_array[n - 1];
    return this.frame_lerp_array[frame_num];
  }

  getFrameData(frame_num) {
    var lp = this.getFrameLerpParam(frame_num);
    return this.frame_data[lp.a];
  }
}

class FxsParticleType extends FxsTypeBase {
  constructor() {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.size = new Oo2DVector(1, 1);
    this.center = new Oo2DVector(0, 0); // min -0.5, max 0.5
    this.texture_file = '';
    this.world = false;
  }

  getFrameData(frame_num) {
    var lp = this.getFrameLerpParam(frame_num);
    var a = this.frame_data[lp.a];
    var b = this.frame_data[lp.b];

    var fd = new FxsParticleFrame();
    fd.frame_num = frame_num;
    fd.alpha = oo.lerp(a.alpha, b.alpha, lp.p);
    fd.scale.x = oo.lerp(a.scale.x, b.scale.x, lp.p);
    fd.scale.y = oo.lerp(a.scale.y, b.scale.y, lp.p);
    return fd;
  }
}

class FxsEmitterType extends FxsTypeBase {
  constructor() {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.particle_name = '';
    this.max_particles = 0;
  }
}

class FxsEmitterStatus {
  constructor() {
    this.show = true;
    this.current_frame = -1;
    this.num_particles = 0;

    this.emitter_type = null;
    this.particle_type = null;

    this.particle_status_array = [];
  }
}

class FxsParticleStatus {
  constructor() {
    this.current_frame = 0;
    this.life_time = 0;
    this.position = new Oo2DVector(0, 0);
    this.velocity = new Oo2DVector(0, 0);
    this.size = new Oo2DVector(1, 1);
    this.scale = new Oo2DVector(1, 1);
    this.rotation = 0.0;
    this.rotation_v = 0.0;
  }

}

class OoFxs {
  constructor() {
    this.position = new Oo2DVector(0, 0);
  }

  generateParticle(ps, ef, pt) {
    ps.current_frame = -1;
    ps.current_frame += Math.floor(ef.frame_offset_dist * Math.random());
    ps.life_time = ef.life_time;

    ps.position.set(ef.position);
    if (ef.distribution_type === oo.fxsDistributionType.kUniform) {
      ps.position.x += ef.position_dist.x * (Math.random() * 2.0 - 1.0);
      ps.position.y += ef.position_dist.y * (Math.random() * 2.0 - 1.0);
    }
    if (pt.world) ps.position.add(this.position);

    var v = oo.lerp(ef.velocity0, ef.velocity1, Math.random());
    if (ef.direction_type === oo.fxsDirectionType.kNormal) {
      ps.velocity.x = ef.direction.x * v;
      ps.velocity.y = ef.direction.y * v;
    }

    // 置き換える
    var getDistributionSphere = function () {
      var z = Math.random() * 2.0 - 1.0;
      var r = Math.sqrt(1.0 - z * z);
      var p = Math.random() * Math.PI * 2;
      var x = r * Math.cos(p);
      var y = r * Math.sin(p);
      return new Oo2DVector(x, y);
    };

    if (ef.direction_type === oo.fxsDirectionType.kSphere) {
      var dir = getDistributionSphere();
      ps.velocity.x = dir.x * v;
      ps.velocity.y = dir.y * v;
    }

    var s = oo.lerp(ef.scale0, ef.scale1, Math.random());
    ps.size.x = pt.size.x * s;
    ps.size.y = pt.size.y * s;

    ps.rotation = oo.lerp(ef.rotation0, ef.rotation1, Math.random());
    ps.rotation_v = oo.lerp(ef.rotation_v0, ef.rotation_v1, Math.random());
  }

  update() {
    var es = this.emitter_status;
    var et = es.emitter_type;

    es.current_frame++;
    if (et.loop) es.current_frame %= et.total_frames;
    var ef = et.getFrameData(es.current_frame);

    var j = 0;
    for (var i = 0; i < es.num_particles; i++) {
      if (es.particle_status_array[i].life_time <= 0) continue;
      if (i !== j) es.particle_status_array[j] = es.particle_status_array[i];
      j++;
    }
    es.num_particles = j;

    // パーティクル生成
    var np = es.num_particles;
    for (i = 0; i < ef.num_ppf; i++) {
      if (es.num_particles >= et.max_particles) break;
      es.particle_status_array[np + i] = new FxsParticleStatus();
      this.generateParticle(es.particle_status_array[np + i], ef, es.particle_type);
      es.num_particles++;
    }

    // パーティクル移動
    for (i = 0; i < es.num_particles; i++) {
      var ps = es.particle_status_array[i];

      ps.current_frame++;
      var pf = es.particle_type.getFrameData(ps.current_frame);

      ps.life_time--;
      ps.position.add(ps.velocity);
      ps.scale.set(pf.scale);
      ps.rotation += ps.rotation_v;
    }
  }

  draw(context) {

    for (var i = 0; i < this.emitter_status.num_particles; i++) {
      var ps = this.emitter_status.particle_status_array[i];
      var pt = this.particle_type;

      context.save();

      var sx = ps.size.x * ps.scale.x;
      var sy = ps.size.y * ps.scale.y;

      var x = ps.position.x;
      var y = ps.position.y;

      if (!pt.world) {
        x += this.position.x;
        y += this.position.y;
      }

      context.translate(x, y);
      context.rotate(ps.rotation * Math.PI / 180);

      context.drawImage(this.image,
        - sx * (0.5 + pt.center.x),
        - sy * (0.5 + pt.center.y),
        sx, sy);

      context.restore();
    }
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameButton {
  constructor(name, x, y, w, h, image) {
    this.name = name;
    this.enable = true;
    this.position = new Oo2DVector(x, y);
    this.size = new Oo2DVector(w, h);
    this.image = new Image();
    this.image.src = image;
  }

  isInside(position) {
    var dx = this.position.x - position.x;
    var dy = this.position.y - position.y;
    if (Math.abs(dx) > this.size.x * 0.5) return false;
    if (Math.abs(dy) > this.size.y * 0.5) return false;
    return true;
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.position.x - this.size.x * 0.5,
      this.position.y - this.size.y * 0.5,
      this.size.x,
      this.size.y
    );
  }
}


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
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoGameLayoutCell {
  constructor() {
    this.show = true;
    this.name = '';
    this.parent = '';
    this.order = 0;
    this.alpha = 1.0;
    this.align = 0;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.tool = false; // tool上での表示のみ
    this.border = false; // tool上での枠線表示

    this.text = '';
    this.fontsize = 0;
    this.color = '#000000';
    this.bold = false;
    this.wrap = false;

    this.image = '';

    // 作業用
    this.img = null;
    this.rect = new OoRect();
  }

  updateRect(layout) {
    if (!this.rect) {
      this.rect = new OoRect();
      this.rect.setXYWH(0, 0, layout.screen_width, layout.screen_height);
    }
    var parent_cell = layout.cell_map.get(this.parent);
    if (parent_cell) {
      var aligned_rect = parent_cell.getAlignedRect(layout);
      if (aligned_rect) this.rect.setRect(aligned_rect);
    }
  }

  getAlignedRect(layout) {
    if (!this.rect) this.updateRect(layout);
    var inner_rect = oo.createOoRectWithXYWH(this.x, this.y, this.w, this.h);
    return oo.getAlignedRect(this.rect, inner_rect, this.align);
  }

  getImageRect() {
    if (this.img) {
      var image_rect = oo.createOoRectWithXYWH(this.x, this.y, this.img.width, this.img.height);
      var r = oo.getAlignedRect(this.rect, image_rect, this.align);
      return r;
    }
  }

  draw(ctx, ofx, ofy) {
    var x = (ofx === undefined) ? 0 : ofx;
    var y = (ofy === undefined) ? 0 : ofy;

    if (this.alpha < 1.0) ctx.globalAlpha = this.alpha;

    if (this.border) {
      var inner_rect = oo.createOoRectWithXYWH(this.x, this.y, this.w, this.h);
      var r = oo.getAlignedRect(this.rect, inner_rect, this.align);
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.strokeRect(r.x0 + x, r.y0 + y, r.getW(), r.getH());
    }

    if (this.img) {
      var image_rect = oo.createOoRectWithXYWH(this.x, this.y, this.img.width, this.img.height);
      r = oo.getAlignedRect(this.rect, image_rect, this.align);
      ctx.drawImage(this.img, r.x0 + x, r.y0 + y);
    }

    if (this.text) {
      var font = '';
      if (this.bold) font += 'bold ';
      font += this.fontsize + 'px ';
      font += " ''";

      ctx.font = font;
      ctx.fillStyle = this.color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      var a = oo.clamp(this.align, 1, 9);

      var text_rect = oo.createOoRectWithXYWH(this.x, this.y, 0, 0);
      r = oo.getAlignedRect(this.rect, text_rect, a);

      var text_align = ['left', 'center', 'right'];
      var text_base_line = ['top', 'middle', 'bottom'];

      ctx.textAlign = text_align[(a + 2) % 3];
      ctx.textBaseline = text_base_line[Math.floor((a - 1) / 3)];

      ctx.fillText(this.text, r.x0 + x, r.y0 + y);
    }

    ctx.globalAlpha = 1.0;
  }
}

class OoGameLayout {
  constructor() {
    this.layout_name = '';
    this.image_base_path = '';
    this.display_width = 108;
    this.display_height = 192;
    this.screen_width = 1080;
    this.screen_height = 1920;
    this.cells = [];
    this.cell_map = new Map();
    this.cell_order = [];
  }

  draw(ctx, offset) {
    var ofx = (offset === undefined) ? 0 : offset.x;
    var ofy = (offset === undefined) ? 0 : offset.y;

    if (this.cell_order.length === 0) {
      this.cell_order = this.cells.slice();
    }
    for (var cell of this.cell_order) {
      if (!cell.rect) cell.updateRect(this);
      if (cell.show) cell.draw(ctx, ofx, ofy);
    }
  }

  updateCellMap() {
    this.cell_map.clear();
    for (var cell of this.cells) {
      if (cell.name) this.cell_map.set(cell.name, cell);
    }
  }

  // 位置再計算
  updateCoordinate() {
    for (var cell of this.cells) cell.rect = null;
    for (cell of this.cells) cell.updateRect(this);
  }

  // 描画順のソート
  updateOrder() {
    this.cell_order = this.cells.slice();
    oo.sort(this.cell_order, function (a, b) { return (a.order > b.order) ? 1 : 0; });
  }

  loadJson(text) {
    var obj = JSON.parse(text);

    this.layout_name = obj.layout_name;
    this.image_base_path = obj.image_base_path;
    this.display_width = obj.display_width;
    this.display_height = obj.display_height;
    this.screen_width = obj.screen_width;
    this.screen_height = obj.screen_height;

    for (var x of obj.cells) {
      var cell = new OoGameLayoutCell();
      Object.assign(cell, x);
      this.cells.push(cell);
    }

    this.updateCellMap();
    this.updateCoordinate();
    this.updateOrder();
  }

  syncLoadImage(proceed) {
    var self = this;

    oo.parallel(function* (p) {
      for (var cell of self.cells) {
        if (cell['tool']) continue;
        if (cell['image']) {
          cell.img = oo.syncCreateImage(p, cell['image'], self.image_base_path);
          yield;
        }
      }
    }, proceed);
  }

  syncSetupFromFile(proceed, layout_file) {
    var self = this;

    oo.serial(function* (p) {
      var obj = oo.syncLoadText(p, layout_file);
      yield;
      self.loadJson(obj.text);
      self.syncLoadImage(p);
      yield;
    }, proceed);
  }
}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.gameSceneStatus = {
  kInactive: 0,
  kActive: 1,
  kStart: 2,
  kEnd: 3,
};

class OoGameScene {
  constructor() {
    this.name = '';
    this.scene_status = oo.gameSceneStatus.kInactive;
    this.next_scene = '';
    this.scene_end = false;
    this.fade_times = 60;
    this.fade_counter = 0;
    this.fade_alpha = 0.0;
  }

  create(frame) {
    this.scene_end = false;
  }
  release(frame) { }

  update(frame) { }
  render(frame) { }

  changeSceneOnFadeOut(frame) {
    if (this.next_scene === '') return;
    frame.endScene(this.name);
    frame.startScene(this.next_scene);
  }

  fadeIn() {
    this.fade_counter = - this.fade_times;
    this.setFadeAlpha();
  }

  fadeOut() {
    this.fade_counter = 1;
    this.setFadeAlpha();
  }

  setFadeAlpha() {
    this.fade_alpha = Math.abs(this.fade_counter / this.fade_times);
    if (this.fade_alpha < 0.0) this.fade_alpha = 0;
    if (this.fade_alpha > 1.0) this.fade_alpha = 1.0;
  }

  updateFade(frame) {
    this.setFadeAlpha();
    if (this.fade_counter !== 0) this.fade_counter++;
    if (this.fade_counter === this.fade_times + 2) this.changeSceneOnFadeOut(frame);
  }

  renderFade(frame) {
    frame.canvas.style.opacity = 1.0 - this.fade_alpha;
  }
}

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoGameScroll {
  constructor() {
    this.touch_pos = new Oo2DVector(0, 0);
    this.pos_delta = [];
    this.pos_delta[0] = new Oo2DVector(0, 0);
    this.pos_delta[1] = new Oo2DVector(0, 0);
    this.velocity = new Oo2DVector(0, 0);
    this.offset = new Oo2DVector(0, 0);
    // スクロール範囲
    this.y_min = 0;
    this.y_max = 1000;
    this.x_min = 0;
    this.x_max = 1000;

    // 範囲外への移動の抵抗力
    this.resistance = 3.0;
    // 離した時の速度減衰率
    this.attenuation = 0.95;
    // 離した時、範囲外での追加の速度減衰率
    this.attenuation_out = 0.95;
    // 範囲外からの復元力
    this.resilience = 0.9;
  }

  update(input) {
    // 押したとき
    if (input.isTouchStart()) {
      this.touch_pos = input.getTouchPosition();
    }
    // 押している間
    if (input.isTouch()) {
      this.pos_delta[1] = this.pos_delta[0];
      this.pos_delta[0] = Oo2DVector.sub(input.getTouchPosition(), this.touch_pos);
      this.touch_pos = input.getTouchPosition();
      this.velocity.x = (this.pos_delta[0].x + this.pos_delta[1].x) * 0.5;
      this.velocity.y = (this.pos_delta[0].y + this.pos_delta[1].y) * 0.5;
    }

    // スクロール位置
    var dx = this.velocity.x;
    var dy = this.velocity.y;
    if ((this.offset.x >= this.x_min) && (this.offset.x + dx <= this.x_min)) dx -= this.x_min - this.offset.x;
    if ((this.offset.x <= this.x_max) && (this.offset.x + dx >= this.x_max)) dx -= this.x_max - this.offset.x;
    if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) dx /= this.resistance;
    if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) dx /= this.resistance;

    if ((this.offset.y >= this.y_min) && (this.offset.y + dy <= this.y_min)) dy -= this.y_min - this.offset.y;
    if ((this.offset.y <= this.y_max) && (this.offset.y + dy >= this.y_max)) dy -= this.y_max - this.offset.y;
    if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) dy /= this.resistance;
    if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) dy /= this.resistance;
    this.offset.x += dx;
    this.offset.y += dy;

    // 離したとき
    if (!input.isTouch()) {
      // 速度減衰
      this.velocity.mulNum(this.attenuation);
      // 範囲外での追加の速度減衰
      if ((this.offset.x <= this.x_min) && (this.velocity.x < 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.x >= this.x_max) && (this.velocity.x > 0)) this.velocity.x *= this.attenuation_out;
      if ((this.offset.y <= this.y_min) && (this.velocity.y < 0)) this.velocity.y *= this.attenuation_out;
      if ((this.offset.y >= this.y_max) && (this.velocity.y > 0)) this.velocity.y *= this.attenuation_out;
      // 範囲外からの復元力
      if (this.offset.x < this.x_min) this.offset.x = (this.offset.x - this.x_min) * this.resilience + this.x_min;
      if (this.offset.x > this.x_max) this.offset.x = (this.offset.x - this.x_max) * this.resilience + this.x_max;
      if (this.offset.y < this.y_min) this.offset.y = (this.offset.y - this.y_min) * this.resilience + this.y_min;
      if (this.offset.y > this.y_max) this.offset.y = (this.offset.y - this.y_max) * this.resilience + this.y_max;
    }

    return this.getOffset();
  }

  getOffset() {
    return this.offset;
  }

}
// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

class OoRect {
  constructor() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 0;
    this.y1 = 0;
  }
  setXYWH(x, y, w, h) {
    this.x0 = x;
    this.y0 = y;
    this.x1 = x + w;
    this.y1 = y + h;
  }
  setRect(r) {
    this.x0 = r.x0;
    this.y0 = r.y0;
    this.x1 = r.x1;
    this.y1 = r.y1;
  }

  getW() { return this.x1 - this.x0; }
  getH() { return this.y1 - this.y0; }

  isContains(position) {
    if (position.x < this.x0 || position.x >= this.x1) return false;
    if (position.y < this.y0 || position.y >= this.y1) return false;
    return true;
  }
}

oo.createOoRectWithXYWH = function (x, y, w, h) {
  var rect = new OoRect();
  rect.setXYWH(x, y ,w, h);
  return rect;
};

oo.getAlignedRect = function (base_rect, inner_rect, align) {
  var x = base_rect.x0;
  var y = base_rect.y0;
  var w = inner_rect.getW();
  var h = inner_rect.getH();

  if ((align === 1) || (align === 4) || (align === 7)) x = base_rect.x0;
  if ((align === 2) || (align === 5) || (align === 8)) x = (base_rect.x0 + base_rect.x1 - w) / 2;
  if ((align === 3) || (align === 6) || (align === 9)) x = base_rect.x1 - w;
  if ((align === 1) || (align === 2) || (align === 3)) y = base_rect.y0;
  if ((align === 4) || (align === 5) || (align === 6)) y = (base_rect.y0 + base_rect.y1 - h) / 2;
  if ((align === 7) || (align === 8) || (align === 9)) y = base_rect.y1 - h;

  var aligned_rect = new OoRect();
  aligned_rect = oo.createOoRectWithXYWH(x + inner_rect.x0, y + inner_rect.y0, w, h);
  return aligned_rect;
};


// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoSound {
  constructor(audio_context, name) {
    if (!audio_context) return;

    this.context = audio_context;
    this.name = name;
    this.buffer;

    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open('GET', name, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 0 || xhr.status === 200) {
          self.context.decodeAudioData(xhr.response, function (buffer) {
            self.buffer = buffer;
          });
        }
      }
    };
    xhr.send('');
  }

  play() {
    if (!this.context) return;
    var source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.context.destination);
    //  source.loop = true;
    source.start();
  }
}


// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.syncLoadText = function (proceed, file) {
  var obj = {};
  var xhr = new XMLHttpRequest();
  xhr.open('GET', file, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        obj['text'] = xhr.response;
        proceed();
      }
    }
  };
  xhr.send('');
  return obj;
};


oo.backSlashToSlash = function (path) {
  var s = '';
  for (var i = 0; i < path.length; i++) {
    var c = path.charAt(i);
    s += (c === '\\') ? '/' : c;
  }
  return s;
};

oo.getFolder = function (path) {
  path = oo.backSlashToSlash(path);
  var pos = path.lastIndexOf('/');
  return path.substr(0, pos + 1);
};

oo.getFilename = function (path) {
  path = oo.backSlashToSlash(path);
  var pos = path.lastIndexOf('/');
  return path.substr(pos + 1);
};

oo.getNonExtension = function (filename) {
  filename = oo.backSlashToSlash(filename);
  var pos = filename.lastIndexOf('.');
  if (pos < 0) return filename;
  return filename.substr(0, pos);
};

oo.saveText = function (filename, text) {
  var blob = new Blob([text], { type: 'text/plain' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename + '.txt';
  link.click();
};

oo.loadText = function (filename, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        callback(xhr.response);
      }
    }
  };
  xhr.send('');
};

oo.getArrayDiff = function (array1, array2) {
  var diff = [];
  for (var x of array1) {
    if (array2.indexOf(x) === -1) diff.push(x);
  }
  for (  x of array2) {
    if (array1.indexOf(x) === -1) diff.push(x);
  }
  return diff;
};

// oo.getGlobalPropertyDiff = function () {
//   var a0 = ["postMessage", "blur", "focus", "close", "frames", "self", "window", "parent", "opener", "top", "length", "closed", "location", "document", "origin", "name", "history", "locationbar", "menubar", "personalbar", "scrollbars", "statusbar", "toolbar", "status", "frameElement", "navigator", "applicationCache", "customElements", "external", "screen", "innerWidth", "innerHeight", "scrollX", "pageXOffset", "scrollY", "pageYOffset", "screenX", "screenY", "outerWidth", "outerHeight", "devicePixelRatio", "clientInformation", "screenLeft", "screenTop", "defaultStatus", "defaultstatus", "styleMedia", "onanimationend", "onanimationiteration", "onanimationstart", "onsearch", "ontransitionend", "onwebkitanimationend", "onwebkitanimationiteration", "onwebkitanimationstart", "onwebkittransitionend", "isSecureContext", "onabort", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting", "onwheel", "onauxclick", "ongotpointercapture", "onlostpointercapture", "onpointerdown", "onpointermove", "onpointerup", "onpointercancel", "onpointerover", "onpointerout", "onpointerenter", "onpointerleave", "onafterprint", "onbeforeprint", "onbeforeunload", "onhashchange", "onlanguagechange", "onmessage", "onmessageerror", "onoffline", "ononline", "onpagehide", "onpageshow", "onpopstate", "onrejectionhandled", "onstorage", "onunhandledrejection", "onunload", "performance", "stop", "open", "alert", "confirm", "prompt", "print", "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback", "cancelIdleCallback", "captureEvents", "releaseEvents", "getComputedStyle", "matchMedia", "moveTo", "moveBy", "resizeTo", "resizeBy", "getSelection", "find", "getMatchedCSSRules", "webkitRequestAnimationFrame", "webkitCancelAnimationFrame", "btoa", "atob", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "createImageBitmap", "scroll", "scrollTo", "scrollBy", "onappinstalled", "onbeforeinstallprompt", "caches", "crypto", "ondevicemotion", "ondeviceorientation", "ondeviceorientationabsolute", "indexedDB", "webkitStorageInfo", "sessionStorage", "localStorage", "fetch", "visualViewport", "speechSynthesis", "webkitRequestFileSystem", "webkitResolveLocalFileSystemURL", "openDatabase", "chrome"];
//   var a1 = Object.keys(window);
//   var diff = oo.getArrayDiff(a0, a1);
//   return diff;
// };

oo.setupLogEnv = function () {
  var div = null;
  oo.log = function (log) {
    // console
    console.log(log);
    // dom
    if (div === null) {
      if (document.body) {
        div = document.createElement('div');
        document.body.appendChild(div);
      }
    }
    if (div) div.innerHTML += log + '<br>';
  };
};

oo.log = function (log) {
  console.log(log);
};

oo.appendScript = function (script_array, completion) {
  var array = script_array.slice();
  (function appendScriptCore() {
    var script = document.createElement('script');
    script.src = array.shift();
    script.onload = array.length ? appendScriptCore : completion;
    document.body.appendChild(script);
  }());
};

// 要素のdatasetの値を取得する
oo.getDataset = function (id, name) {
  var element = document.getElementById(id);
  if (element) return element.dataset[name];
};

oo.drawRoundRect = function (ctx, x, y, w, h, radius, fill, stroke) {
  var r = (radius === undefined) ? 5 : radius;
  if (stroke === undefined) stroke = true;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
};

oo.setTextAttributes = function (context, fontSize, fillStyle, textAlign, textBaseline) {
  context.font = `${fontSize}px ''`;
  context.fillStyle = fillStyle;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
};

oo.strToInt = function (s) {
  var n = Number.parseInt(s);
  return (Number.isInteger(n)) ? n : 0;
};

oo.createImageFromFile = function (file) {
  var img = new Image();
  img.src = file;
  return img;
};

oo.clamp = function (x, a, b) {
  if (x < a) return a;
  if (x > b) return b;
  return x;
};

oo.lerp = function (v0, v1, alpha) {
  return (1.0 - alpha) * v0 + alpha * v1;
};

oo.saturate = function (x) {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
};

oo.smoothstep = function (v0, v1, v) {
  if (v0 === v1) return 0.0;
  return oo.saturate((v - v0) / (v1 - v0));
};

// 配列の要素の交換
oo.arraySwap = function (array, a, b) {
  var tmp = array[a];
  array[a] = array[b];
  array[b] = tmp;
};

// マージソート
oo.sort = function (data, compare) {

  var mergeSort = function (first, last) {
    if (first >= last) return;
    if (last - first == 1) {
      if (compare(data[first], data[last]) > 0) oo.arraySwap(data, first, last);
      return;
    }
    var middle = Math.floor((first + last) / 2);
    mergeSort(first, middle);
    mergeSort(middle + 1, last);

    var work = [];
    var p = 0;
    for (var i = first; i <= middle; i++) work[p++] = data[i];

    var i = middle + 1;
    var j = 0;
    var k = first;
    while (i <= last && j < p) data[k++] = (compare(work[j], data[i]) <= 0) ? work[j++] : data[i++];
    while (j < p) data[k++] = work[j++];
  };

  mergeSort(0, data.length - 1);
};

// csvをマトリックス(array * array)に変換
oo.csvToArray2 = function (csv) {
  var n = csv.length;
  var dq = false;
  var item = '';
  var array = [];
  var line = [];

  for (var i = 0; i < n; i++) {
    var c = csv.charAt(i);

    if (c === '"') {
      if (!dq) {
        dq = true;
      } else {
        if (i + 1 < n && csv.charAt(i + 1) === '"') {
          item += '"';
          i += 1;
        } else {
          dq = false;
        }
      }
      continue;
    }

    if (!dq) {
      if (c === ',') {
        line.push(item);
        item = '';
        continue;
      }
      if (c === '\n') {
        if (item.length || line.length) {
          line.push(item);
          item = '';
        }
        if (line.length) {
          array.push(line);
          line = [];
        }
        continue;
      }
    }
    item += c;
  }
  if (item.length) line.push(item);
  if (line.length) array.push(line);
  return array;
};

// csvをオブジェクトの配列に変換
oo.csvToObjectArray = function (csv) {
  var array = [];
  var lines = oo.csvToArray2(csv);
  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    for (var j = 0; j < lines[i].length; j++) obj[lines[0][j]] = lines[i][j];
    array.push(obj);
  }
  return array;
};

// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class Oo2DVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Oo2DVector(this.x, this.y);
  }

  set(x, y) {
    if (x instanceof Oo2DVector) {
      this.x = x.x;
      this.y = x.y;
    } else {
      if (y === undefined) {
        this.x = x;
        this.y = x;
      } else {
        this.x = x;
        this.y = y;
      }
    }
    return this;
  }

  add(v) {
    if (v instanceof Oo2DVector) {
      this.x += v.x;
      this.y += v.y;
    } else {
      this.x += v;
      this.y += v;
    }
    return this;
  }

  sub(v) {
    if (v instanceof Oo2DVector) {
      this.x -= v.x;
      this.y -= v.y;
    } else {
      this.x -= v;
      this.y -= v;
    }
    return this;
  }

  mul(v) {
    if (v instanceof Oo2DVector) {
      this.x *= v.x;
      this.y *= v.y;
    } else {
      this.x *= v;
      this.y *= v;
    }
    return this;
  }

  div(v) {
    if (v instanceof Oo2DVector) {
      if (v.x !== 0) this.x /= v.x;
      if (v.y !== 0) this.y /= v.y;
    } else {
      if (v !== 0) {
        this.x /= v;
        this.y /= v;
      }
    }
    return this;
  }

  getSquareMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  getMagnitude() {
    return Math.sqrt(this.getSquareMagnitude());
  }

  normalize() {
    var s = this.getMagnitude();
    if (s > 0.0) s = 1.0 / s;
    this.x *= s;
    this.y *= s;
    return this;
  }

  getNormal() {
    return this.clone().normalize();

    // var r = new Oo2DVector();
    // r.set(this);
    // r.normalize();
    // return r;
  }

  static add(a, b) {
    return new Oo2DVector(a.x + b.x, a.y + b.y);
  }
  static sub(a, b) {
    return new Oo2DVector(a.x - b.x, a.y - b.y);
  }
  static mul(a, b) {
    return new Oo2DVector(a.x * b.x, a.y * b.y);
  }
  static div(a, b) {
    return new Oo2DVector(a.x / b.x, a.y / b.y);
  }

  static dot(a, b){
    return a.x * b.x + a.y * b.y;
  }
  static cross(a, b){
    return a.x * b.y - a.y * b.x;
  }
  
}
