;(function(root) {
  var sort = {},
      old_sort = root.sort;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sort;
  } else {
    root.sort = sort;
  }

  sort.noComflict = function() {
    root.sort = old_sort;
    return sort;
  }

  var _cmp_num = function(a, b) {
    return a - b;
  };

  sort.ninsert = function(arr, opt_cmp) {
    var cmp = opt_cmp || cps._cmp_num;
    for (var i = 1, l = arr.length; i < l; i++) {
      var v = arr[i];
      for (var j = i - 1; j >= 0; j--) {
        if (cmp(arr[j], v) > 0) {
          arr[j + 1] = arr[j];
        } else {
          break;
        }
      }
      arr[j + 1] = v;
    }
  };

  sort.nquick = function(arr, cmp) {
    if (arr.length < 2) return arr;
    var stack = [0, arr.length - 1], c = 2,
        tail, head, pivot, i, j, remain;
    while (c > 0) {
      tail = stack[--c];
      head = stack[--c];
      pivot = arr[head + ((tail - head) >>> 1)];
      i = head - 1;
      j = tail + 1;
      remain = true;
      while (remain) {
        while (cmp(arr[++i], pivot) < 0);
        while (cmp(arr[--j], pivot) > 0);
        if (i >= j) {
          remain = false;
        } else {
          tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
      }
      if (head < i - 1) {
        stack[c++] = head;
        stack[c++] = i - 1;
      }
      if (j + 1 < tail) {
        stack[c++] = j + 1;
        stack[c++] = tail;
      }
    }
    return arr;
  };

  sort.quick = function(arr, cmp) {
    return sort.nquick(arr.slice(), cmp);
  };

})(this);

