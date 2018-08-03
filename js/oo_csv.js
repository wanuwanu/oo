// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

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

