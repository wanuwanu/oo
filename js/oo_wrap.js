// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.wrapBeforeAfter = function (func, before, after) {
  return function (...args) {
    before && before(...args);
    var result = func(...args);
    after && after(result);
    return result;
  };
};

// ex.
//  oo.wrap(func, type)
//  oo.wrap(func, befor, after)
// 
// func: function
// type: 'log' or 'inout' or 'time' or'check'
// before: function
// after: function
oo.wrap = function (func, ...args) {
  var f0 = args[0];
  var f1 = args[1];
  if ((typeof f0 === 'function') && (typeof f0 === 'function')) {
    return oo.wrapBeforeAfter(func, f0, f1);
  }
  var type = args[0];
  if (typeof type === 'string') {
    if (type === 'log') {
      return oo.wrapBeforeAfter(func,
        () => { oo.log('log:', func.name); },
        () => { }
      );
    }
    if (type === 'inout') {
      return oo.wrapBeforeAfter(func,
        () => { oo.log('in:', func.name); },
        () => { oo.log('out:', func.name); }
      );
    }
    if (type === 'time') {
      var start;
      return oo.wrapBeforeAfter(func,
        () => { start = performance.now(); },
        () => { oo.log('time:', func.name, ' ', '' + (performance.now() - start)); }
      );
    }
    if (type === 'check') {
      return oo.wrapBeforeAfter(func,
        (...args) => { oo.log('check:', func.name, ' ', 'args:', args); },
        (result) => { oo.log('check:', func.name, ' ', 'result:', result); }
      );
    }
  }
  return func;
};

