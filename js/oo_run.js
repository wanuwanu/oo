// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoRun {
  constructor() {
    this.done = false;
  }

  once(callback) {
    if (this.done) return;
    callback();
    this.done = true;
  }

}
