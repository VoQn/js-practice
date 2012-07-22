;(function(root) {
  'use strict';
  var cps = {},
      old_cps = root.cps,
      sort;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = cps;
  } else {
    root.cps = cps;
  }

  if (require) {
    sort = require('./sort');
  } else {
    sort = root.sort;
  }

  cps.noComflict = function() {
    root.cps = old_cps;
    return cps;
  };

  var __slice = Array.prototype.slice;

  var _next_process = (typeof process !== 'undefined' && process.nextTick) &&
    function(fn, var_args) {
      var args = __slice.call(arguments, 1);
      if (args.length) {
        process.nextTick(function() {
          fn.apply(null, args);
        });
        return;
      }
      process.nextTick(fn);
    };

  var _next_default = function(fn, var_args) {
    var args = __slice.call(arguments, 1);
    if (args.length) {
      setTimeout.apply(null, [fn, 0].concat(args));
      return;
    }
    setTimeout(fn, 0);
  };

  cps.next = _next_process || _next_default;

  cps.each = function(array, iterate, callback) {
    var LIMIT = array.length,
        receive_count = 0,
        finished = false,
        i = 0;

    for (; !finished && i < LIMIT; i++) {
      iterate(array[i], i, array, function(error) {
        receive_count++;
        if (finished) {
          return;
        }
        if (error) {
          finished = true;
          callback(error);
        } else if (receive_count >= LIMIT) {
          finished = true;
          callback();
        }
      });
    }
  };

  cps.nmap = function(array, iterate, callback) {
    cps.each(array, function(value, index, iterable, next) {
      iterate(value, index, iterable, function(error, result) {
        if (error) {
          next(error);
        } else {
          iterable[index] = result;
          next();
        }
      });
    }, function(error) {
      callback(error, array);
    });
  };

  cps.map = function(array, iterate, callback) {
    cps.nmap(array.slice(), iterate, callback);
  };

  var _filter = function(evaluate) {
    return function(array, iterate, callback) {
      var hash_stack = [];
      cps.each(array, function(value, index, iterable, next) {
        iterate(value, index, iterable, function(error, result) {
          if (error) {
            next(error);
          } else {
            if (evaluate(result)) {
              hash_stack.push({index: index, value: value});
            }
            next();
          }
        });
      }, function(error) {
        if (error) {
          callback(error);
          return;
        }
        cps.nmap(sort.nquick(hash_stack, function(a, b) {
            return a.index - b.index;
        }), function(entry, index, iterable, next) {
            next(undefined, entry.value);
        }, callback);
      });
    };
  };

  cps.filter = _filter(function(x) { return x; });

  cps.reject = _filter(function(x) { return !x; });

  cps.detect = function(array, iterate, callback) {
    var LIMIT = array.length,
        receive_count = 0,
        finished = false,
        i = 0;

    for (; !finished && i < LIMIT; i++) {
      (function lookup(value, index, iterable) {
        iterate(value, index, iterable, function(error, result) {
          receive_count++;
          if (finished) {
            return;
          }
          if (error) {
            finished = true;
            callback(error);
          } else if (result) {
            finished = true;
            callback(undefined, value);
          } else if (receive_count >= LIMIT) {
            finished = true;
            callback();
          }
        });
      })(array[i], i, array);
    }
  };

  cps.nreduce = function(array, accumulate, callback, opt_init) {
    if (arguments.length < 4 && array.length < 1) {
      callback(new TypeError(
            'Array length is 0 and no init value'));
      return;
    }
    var memo = arguments.length > 3 ? opt_init : array.shift();

    cps.each(array, function(value, index, iterable, next) {
      accumulate(memo, value, index, iterable, function(error, result) {
        if (error) {
          next(error);
        } else {
          memo = result;
          next();
        }
      });
    }, function(error) {
      callback(error, memo);
    });
  };

  cps.reduce = function(array, accumulate, callback, opt_init) {
    cps.nreduce.apply(
        undefined,
        [array.slice()].concat(__slice.call(arguments, 1)));
  };

  cps.fromTo = function(params, iterate, callback) {
    var init = Math.round(params[0]),
        end = Math.round(params[1]),
        unit = params.length > 2 ? Math.abs(params[2]) : 1,
        inc = (end - init >= 0) ? unit : (-unit),

        LIMIT = Math.abs(end - init) / unit + 1,
        receive_count = 0,
        finished = false,
        array = [],
        i = 0,
        x = init;

    for (; !finished && i < LIMIT; i++, x += inc) {
      iterate(x, i, array, function(error, result) {
        receive_count++;
        if (finished) {
          return;
        }
        if (error) {
          finished = true;
          callback(error);
          return;
        }
        array.push(result);
        if (receive_count >= LIMIT) {
         finished = true;
         callback(undefined, array);
        }
      });
    }
  };

})(this);
