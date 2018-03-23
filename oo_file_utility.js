// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.backSlashToSlash = function (path) {
  var s = '';
  for (var i = 0; i < path.length; i++) {
    var c = path.charAt(i);
    s += (c === '\\') ? '/' : c;
  }
  return s;
};

oo.addPath = function (folder, filename) {
  if (folder.substr(-1) !== '/') folder += '/';
  return folder + filename;
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
