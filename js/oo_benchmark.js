// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

class OoBenchmark {
  constructor() {
    this.num_rounds = 10;
    this.num_times_digits = 8;

    this.test_function = [];
    this.test_function_name = [];
  }

  // 0   : 共通処理(通常空ループのみ)
  // 1   : 基準テスト
  // >=2 : 比較テスト
  addTestFunction(name, func) {
    this.test_function_name.push(name);
    this.test_function.push(func);
  }

  getTime(n, func) {
    var t0 = performance.now();
    func(n);
    var t1 = performance.now();
    return t1 - t0;
  }

  run() {
    var n = Math.pow(10, this.num_times_digits);

    var t = [];
    var m = [];

    oo.log('test count : ' + n);

    for (var r = 0; r < this.num_rounds; r++) {
      oo.log('round : ' + r);
      oo.each(this.test_function, (e, i) => {
        t[i] = this.getTime(n, e);
        m[i] = Math.min(m[i] || t[i], t[i]);
        oo.log('..' + this.test_function_name[i] + ' : ' + t[i].toFixed(1));
      });
    }

    oo.log('----');

    oo.log('weight');
    var w = [];
    oo.each(this.test_function, (e, i) => {
      w[i] = m[i] - m[0];
      oo.log('..' + this.test_function_name[i] + ' : ' + w[i].toFixed(1));
    });

    oo.log('----');

    oo.log('ratio');
    oo.each(this.test_function, (e, i) => {
      oo.log('..' + this.test_function_name[i] + ' : ' + (w[i] / w[1]).toFixed(1));
    });

    oo.log('----');
  }
}