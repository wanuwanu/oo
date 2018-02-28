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
    this.velocity = 0.0;
    this.velocity_dist = 0.0;
    this.distribution_type = oo.fxsDistributionType.kNone;
    this.position = new Oo2DVector(0, 0);
    this.position_dist = new Oo2DVector(0, 0);
  }
}

class FxsParticleFrame {
  constructor() {
    this.frame_num = 0;
    this.scale = new Oo2DVector(0, 0);
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
        var fn0 = this.frame_data[a]._frame_num;
        var fn1 = this.frame_data[b]._frame_num;
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
    this.size = new Oo2DVector(0, 0);
    this.texture_file = '';
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

  generateParticle(ps, ef, pt) {
    ps.current_frame = -1;
    ps.life_time = ef.life_time;
    ps.position.x = ef.position.x + Math.random() * 1080 - 100;
    ps.position.y = ef.position.y - 200;
    var v = ef.velocity;
    var direction = new Oo2DVector(0, 1 + Math.random());
    direction.mulNum(v);
    ps.velocity = direction;

    var s = (1 + Math.random()) * 25;
    ps.size.x = s;
    ps.size.y = s;

    ps.rotation = Math.random() * 360;
    ps.rotation_v = Math.random() * 3;
  }

  update() {
    this.current_frame++;
    if (this.emitter_type.loop) this.current_frame %= this.emitter_type.total_frames;
    var ef = this.emitter_type.getFrameData(this.current_frame);

    var j = 0;
    for (var i = 0; i < this.num_particles; i++) {
      if (this.particle_status_array[i].life_time <= 0) continue;
      if (i !== j) this.particle_status_array[j] = this.particle_status_array[i];
      j++;
    }
    this.num_particles = j;

    // パーティクル生成
    var np = this.num_particles;
    for (i = 0; i < ef.num_ppf; i++) {
      if (this.num_particles >= this.emitter_type.max_particles) break;
      this.particle_status_array[np + i] = new FxsParticleStatus();
      this.generateParticle(this.particle_status_array[np + i], ef, null);
      this.num_particles++;
    }

    // パーティクル移動
    for (i = 0; i < this.num_particles; i++) {
      var ps = this.particle_status_array[i];
      ps.life_time--;
      ps.position.add(ps.velocity);
      ps.rotation += ps.rotation_v;
      ps.current_frame++;
    }
  }

}

class FxsParticleStatus {
  constructor() {
    this.current_frame = 0;
    this.life_time = 0;
    this.position = new Oo2DVector(0, 0);
    this.velocity = new Oo2DVector(0, 0);
    this.size = new Oo2DVector(1, 1);
    this.rotation = 0.0;
    this.rotation_v = 0.0;
  }

}

class OoFxs {
  constructor() {
    this.position = new Oo2DVector(0, 0);
  }

  update() {
    this.emitter_status.update();
  }

  draw(context) {


    for (var i = 0; i < this.emitter_status.num_particles; i++) {
      var ps = this.emitter_status.particle_status_array[i];

      context.save();
      context.translate(ps.position.x - ps.size.x * 0.5, ps.position.y - ps.size.y * 0.5);
      context.rotate(ps.rotation * Math.PI / 180);

      context.drawImage(
        this.image,
        //ps.position.x - ps.size.x * 0.5,
        //ps.position.y - ps.size.y * 0.5,
        0, 0,
        ps.size.x, ps.size.y);

      context.restore();

    }

  }

}