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