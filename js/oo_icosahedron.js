// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

oo.icosahedronPositions = [
  [0.0, 1.0, 0.0],
  [0.0, 0.447213595, 0.894427191],
  [0.850650808, 0.447213595, 0.276393202],
  [0.525731112, 0.447213595, - 0.723606797],
  [- 0.525731112, 0.447213595, -0.723606797],
  [- 0.850650808, 0.447213595, 0.276393202],
  [0.525731112, - 0.447213595, 0.723606797],
  [0.850650808, - 0.447213595, -0.276393202],
  [0.0, - 0.447213595, -0.894427191],
  [- 0.850650808, -0.447213595, -0.276393202],
  [- 0.525731112, -0.447213595, 0.723606797],
  [0.0, - 1.0, 0.0],
];

oo.icosahedronIndices = [
  0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1,
  1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 8, 3, 8, 4, 4, 8, 9, 4, 9, 5, 5, 9, 10, 5, 10, 1, 1, 10, 6,
  6, 11, 7, 7, 11, 8, 8, 11, 9, 9, 11, 10, 10, 11, 6,
];

oo.OoIcosahedron = class {
  constructor() {
    this.positions = [];
    this.indices = [];
  }

  create(level) {
    for (let i = 0; i < oo.icosahedronIndices.length; i++) {
      this.indices[i] = oo.icosahedronIndices[i];
    }
    for (let i = 0; i < oo.icosahedronPositions.length; i++) {
      var v = oo.icosahedronPositions[i];
      this.positions[i] = new Oo3DVector(v[0], v[1], v[2]);
    }

    for (let i = 0; i < level; i++) this.spherize();
  }

  spherize() {
    //     0
    //   3△4
    // 1△▽△2
    //     5
    var r_idx = [0, 3, 4, 4, 3, 5, 3, 1, 5, 4, 5, 2];

    var idx_num = [];

    var add = (a, b) => {
      if (a > b) [b, a] = [a, b];
      if (idx_num[a] !== void 0 && idx_num[a][b] !== void 0) return idx_num[a][b];
      if (idx_num[a] === void 0) idx_num[a] = [];
      var n = this.positions.length;
      // this.positions[n] = Oo3DVector.lerp(this.positions[a], this.positions[b], 0.5).normalize();
      this.positions[n] = Oo3DVector.add(this.positions[a], this.positions[b]).normalize();
      
      idx_num[a][b] = n;
      return n;
    };

    var new_indices = [];
    var n = this.indices.length;
    for (let i = 0; i < n; i += 3) {
      var v = [];
      v[0] = this.indices[i + 0];
      v[1] = this.indices[i + 1];
      v[2] = this.indices[i + 2];
      v[3] = add(v[0], v[1]);
      v[4] = add(v[0], v[2]);
      v[5] = add(v[1], v[2]);
      for (let j = 0; j < 12; j++) new_indices.push(v[r_idx[j]]);
    }
    this.indices = new_indices;
  }
};

