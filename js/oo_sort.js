// OoLibrary Copyright (c) wanu@nyagoya
// Released under the MIT license http://opensource.org/licenses/mit-license.php

var oo = oo || {};

oo.sort = function (array, compare_func) {

  var swap = function (swap_array, a, b) {
    var tmp = swap_array[a];
    swap_array[a] = swap_array[b];
    swap_array[b] = tmp;
  };

  var mergeSort = function (first, last) {
    if (first >= last) return;
    if (last - first == 1) {
      if (compare_func(array[first], array[last]) > 0) swap(array, first, last);
      return;
    }
    var middle = Math.floor((first + last) / 2);
    mergeSort(first, middle);
    mergeSort(middle + 1, last);

    var work = [];
    var p = 0;
    for (var i = first; i <= middle; i++) work[p++] = array[i];

    i = middle + 1;
    var j = 0;
    var k = first;
    while (i <= last && j < p) array[k++] = (compare_func(work[j], array[i]) <= 0) ? work[j++] : array[i++];
    while (j < p) array[k++] = work[j++];
  };

  mergeSort(0, array.length - 1);
};
