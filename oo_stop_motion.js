// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoStopMotion {
  constructor() {
    this.fps = 60;
    this.image_base_path = '';
    this.image_files = [];
    this.images = [];
    this.total_frames = 0;
    this.current_frame = 0;
    this.frame60 = 0;
    this.elapsed_time = 0;
    this.time0 = (new Date()).getTime();
    this.position = new Oo2DVector(0);
  }

  asyncLoadImage(proceeder) {
    const n = this.image_files.length;
    this.total_frames = n;

    const self = this;
    oo.parallel(function* (p) {
      for (let i = 0; i < n; i++) {
        const path_name = oo.addPath(self.image_base_path, self.image_files[i]);
        self.images[i] = oo.asyncCreateImage(p, path_name);
        yield;
      }
    }, proceeder);
  }

  start() {
    this.current_frame = 0;
    this.frame60 = 0;
    this.elapsed_time = 0;
    this.time0 = (new Date()).getTime();
  }

  updateByTime() {
    const time1 = (new Date()).getTime();
    this.elapsed_time += time1 - this.time0;
    this.time0 = time1;
    this.current_frame = Math.floor((this.elapsed_time * this.fps) / 1000);
  }

  update() {
    this.frame60++;
    this.current_frame = Math.floor((this.frame60 * this.fps) / 60);
  }

  draw(context) {
    const frame = oo.clamp(this.current_frame, 0, this.images.length - 1);
    const image = this.images[frame];
    context.drawImage(image, this.position.x, this.position.y);
  }
}
