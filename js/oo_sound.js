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

