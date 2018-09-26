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

class OoFxsLerpParam {
  constructor(a, b, p) {
    this.a = (a === void 0) ? 0 : a;
    this.b = (b === void 0) ? 0 : b;
    this.p = (p === void 0) ? 0.0 : p;
  }
}

class OoFxsEmitterFrame {
  constructor() {
    this.frame_num = 0;
    this.num_ppf = 0.0;
    this.life_time = 0;
    this.life_time_dist = 0;
    this.direction_type = oo.fxsDirectionType.kNormal;
    this.direction = new Oo3DVector(0);
    this.direction_dist = 0;
    this.velocity0 = 0.0; // dist min
    this.velocity1 = 0.0; // dist max
    this.distribution_type = oo.fxsDistributionType.kNone;
    this.position = new Oo3DVector(0);
    this.position_dist = new Oo3DVector(0);
    this.scale0 = 1; // dist min
    this.scale1 = 1; // dist max
    this.rotation0 = 0; // dist min
    this.rotation1 = 0; // dist max
    this.rotate_v0 = 0; // dist min
    this.rotate_v1 = 0; // dist max
    this.frame_offset_dist = 0;
  }
}

class OoFxsParticleFrame {
  constructor() {
    this.frame_num = 0;
    this.scale = new Oo2DVector(1);
    this.alpha = 1.0;
  }
}


class OoFxsTypeBase {
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
        var p = oo.linearStep(fn0, fn1, i);
        this.frame_lerp_array[i] = new OoFxsLerpParam(a, b, p);
      }
      a = b;
      b = Math.min(b + 1, n - 1);
    }
    this.frame_lerp_array[i] = new OoFxsLerpParam(b, b, 0.0);
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

class OoFxsParticleType extends OoFxsTypeBase {
  constructor(pt) {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.size = new Oo2DVector(1);
    this.center = new Oo2DVector(0); // min -0.5, max 0.5
    this.texture_file = '';
    this.world = false;

    if (oo.isObject(pt)) Object.assign(this, pt);
  }

  getFrameData(frame_num) {
    var lp = this.getFrameLerpParam(frame_num);
    var a = this.frame_data[lp.a];
    var b = this.frame_data[lp.b];

    var fd = new OoFxsParticleFrame();
    fd.frame_num = frame_num;
    fd.alpha = oo.lerp(a.alpha, b.alpha, lp.p);
    fd.scale.x = oo.lerp(a.scale.x, b.scale.x, lp.p);
    fd.scale.y = oo.lerp(a.scale.y, b.scale.y, lp.p);
    return fd;
  }
}

class OoFxsEmitterType extends OoFxsTypeBase {
  constructor(et) {
    super();
    this.id = '';
    this.loop = false;
    this.total_frames = 0;
    this.particle_name = '';
    this.max_particles = 0;

    if (oo.isObject(et)) Object.assign(this, et);
  }
}

class OoFxsEmitterStatus {
  constructor() {
    this.show = true;
    this.current_frame = -1;
    this.num_particles = 0;

    this.emitter_type = null;
    this.particle_type = null;

    this.particle_status_array = [];
  }
}

class OoFxsParticleStatus {
  constructor() {
    this.current_frame = 0;
    this.life_time = 0;
    this.position = new Oo3DVector(0);
    this.velocity = new Oo3DVector(0);
    this.size = new Oo2DVector(1);
    this.scale = new Oo2DVector(1);
    this.rotation = 0.0;
    this.rotate_v = 0.0;
  }

}

class OoFxs {
  constructor() {
    this.position = new Oo3DVector(0);
    this.random = new OoRandom();
  }

  generateParticle(ps, ef, pt) {
    ps.current_frame = -1;
    ps.current_frame += Math.floor(ef.frame_offset_dist * Math.random());
    ps.life_time = ef.life_time;

    ps.position.set(ef.position);
    if (ef.distribution_type === oo.fxsDistributionType.kUniform) {
      ps.position.x += ef.position_dist.x * (Math.random() * 2.0 - 1.0);
      ps.position.y += ef.position_dist.y * (Math.random() * 2.0 - 1.0);
      ps.position.z += ef.position_dist.z * (Math.random() * 2.0 - 1.0);
    }
    if (pt.world) ps.position.add(this.position);

    var v = oo.lerp(ef.velocity0, ef.velocity1, Math.random());
    if (ef.direction_type === oo.fxsDirectionType.kNormal) {
      ps.velocity.x = ef.direction.x * v;
      ps.velocity.y = ef.direction.y * v;
      ps.velocity.z = ef.direction.z * v;
    }

    if (ef.direction_type === oo.fxsDirectionType.kSphere) {
      var d = this.random.getSphere();
      ps.velocity.x = d.x * v;
      ps.velocity.y = d.y * v;
      ps.velocity.z = d.z * v;
    }

    var s = oo.lerp(ef.scale0, ef.scale1, Math.random());
    ps.size.x = pt.size.x * s;
    ps.size.y = pt.size.y * s;

    ps.rotation = oo.lerp(ef.rotation0, ef.rotation1, Math.random());
    ps.rotate_v = oo.lerp(ef.rotate_v0, ef.rotate_v1, Math.random());
  }

  create(emitter_type, particle_type) {
    var es = new OoFxsEmitterStatus();
    es.emitter_type = emitter_type;
    es.particle_type = particle_type;
    this.emitter_status = es;

    // パーティクルバッファ固定確保
    es.particle_status_array = [];
    for (var i = 0; i < emitter_type.max_particles; i++) {
      es.particle_status_array[i] = new OoFxsParticleStatus();
    }
  }

  update() {
    var es = this.emitter_status;
    var et = es.emitter_type;

    es.current_frame++;
    if (et.loop) es.current_frame %= et.total_frames;
    var ef = et.getFrameData(es.current_frame);

    let j = 0;
    for (let i = 0; i < es.num_particles; i++) {
      if (es.particle_status_array[i].life_time <= 0) continue;
      if (i !== j) {
        es.particle_status_array[j] = es.particle_status_array[i];
      }
      j++;
    }
    es.num_particles = j;
    es.particle_status_array.length = j;

    // パーティクル生成
    var np = es.num_particles;
    let ppf = ef.num_ppf;
    if (ppf < 1.0) {
      if (Math.random() < ppf) ppf = 1;
    }
    ppf = Math.floor(ppf);

    for (let i = 0; i < ppf; i++) {
      if (es.num_particles >= et.max_particles) break;
      es.particle_status_array[np + i] = new OoFxsParticleStatus();
      this.generateParticle(es.particle_status_array[np + i], ef, es.particle_type);
      es.num_particles++;
    }

    // パーティクル移動
    for (let i = 0; i < es.num_particles; i++) {
      var ps = es.particle_status_array[i];

      ps.current_frame++;
      var pf = es.particle_type.getFrameData(ps.current_frame);

      ps.life_time--;
      ps.position.add(ps.velocity);
      ps.scale.set(pf.scale);
      ps.rotation += ps.rotate_v;
    }
  }

  draw(context) {

    context.save();

    for (var i = 0; i < this.emitter_status.num_particles; i++) {
      var ps = this.emitter_status.particle_status_array[i];
      var pt = this.particle_type;

      var sx = ps.size.x * ps.scale.x;
      var sy = ps.size.y * ps.scale.y;

      var x = ps.position.x;
      var y = ps.position.y;
      // var z = ps.position.z;

      if (!pt.world) {
        x += this.position.x;
        y += this.position.y;
        // z += this.position.z;
      }

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.translate(x, y);
      context.rotate(ps.rotation * Math.PI / 180);
      context.drawImage(this.image,
        - sx * (0.5 + pt.center.x),
        - sy * (0.5 + pt.center.y),
        sx, sy);
    }

    context.restore();
  }
}