;(function(root) {
  var trampoline = {},
      old_trampoline = root.trampoline,
      cps, sort;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = trampoline;
  } else {
    root.trampoline = trampoline;
  }

  if (typeof require === 'function') {
    cps = require('./cps');
    sort = require('./sort');
  } else {
    cps = root.cps;
    sort = root.sort;
  }

  trampoline.noComflict = function() {
    root.trampoline = old_trampoline;
    return trampoline;
  };

  trampoline.TIME_SLICE = 16;

  var _now = function() {
    return (new Date).getTime();
  };

  var __slice = Array.prototype.slice;

  var _trampoline = function(context) {
    var time_slice = _now() + trampoline.TIME_SLICE;
    while (context && _now() < time_slice) {
      context = context.func.apply(null, context.args || []);
    }
    if (context) {
      cps.next(_trampoline, context);
    }
  };

  trampoline.call = function(fn_context) {
    return function(var_args) {
      _trampoline({
        func: fn_context,
        args: __slice.call(arguments)
      });
    };
  };

  var _each_context = function(array, iterate, callback) {
    var array_index = 0,
        received_count = 0,
        limit = array.length,
        finished = false,
        received_error = undefined,
        received_somethings = undefined,

        accumulate = function(value, index) {
          array_index++;
          return iterate(value, index, function(error) {
            received_count++;
            if (error) {
              received_error = error;
            }
            if (arguments.length > 1) {
              received_somethings = __slice.call(arguments, 1);
            }
            return loop_context;
          }) || loop_context;
        },

        loop = function() {
          if (finished) {
            return;
          }
          if (received_error) {
            finished = true;
            return callback(received_error);
          }
          if (received_somethings) {
            finished = true;
            return callback.apply(undefined,
                [undefined].concat(received_somethings));
          }
          if (received_count >= limit) {
            finished = true;
            return callback();
          }
          if (array_index < limit) {
            accumulate_context.args[0] = array[array_index];
            accumulate_context.args[1] = array_index;
            return accumulate_context;
          }
          return loop_context;
        },

        accumulate_context = {func: accumulate, args: []},
        loop_context = {func: loop};

    return loop_context;
  };

  trampoline.each = trampoline.call(_each_context);

  var _nmap_context = function(array, iterate, callback) {
    return _each_context(array, function(value, index, next) {
      return iterate(value, index, function(error, result) {
        if (error) {
          return next(error);
        }
        array[index] = result;
        return index >= array.length - 1 ? next(undefined, array) : next();
      });
    }, callback);
  };

  var _map_context = function(arr, acc, callback) {
    return _nmap_context(arr.slice(), acc, callback);
  };

  trampoline.nmap = trampoline.call(_nmap_context);
  trampoline.map = trampoline.call(_map_context);

  var _compare_by_index = function(a, b) {
    return a.index - b.index;
  };

  var _pass_value = function(entry, index, next) {
    return next(undefined, entry.value);
  };

  var _filter_context = function(evaluate) {
    return function(array, iterate, callback) {
      var filtered = [];
      return _each_context(array, function(value, index, next) {
        return iterate(value, index, function(error, result) {
          if (error) {
            return next(error);
          }
          if (evaluate(result)) {
            filtered.push({index: index, value: value});
          }
          return index >= array.length - 1 ? next(undefined, filtered) : next();
        });
      }, function(error, results) {
        if (error) {
          return callback(error);
        }
        sort.nquick(results, _compare_by_index);
        return trampoline.nmap(results, _pass_value, callback);
      });
    };
  };

  var _id = function(x) { return x; }
  var _not = function(x) { return !x; }

  trampoline.filter = trampoline.call(_filter_context(_id));
  trampoline.reject = trampoline.call(_filter_context(_not));

  var _detect_context = function(array, iterate, callback) {
    return _each_context(array, function(value, index, next) {
      return iterate(value, index, function(error, result) {
        if (error) {
          return next(error);
        }
        return result ? next(undefined, value) : next();
      });
    }, callback);
  };

  trampoline.detect = trampoline.call(_detect_context);

  var _fromTo_context = function(param, iterate, callback) {
    var ini = Math.round(param[0]),
        end = Math.round(param[1]),
        incv = param.length > 2 ? Math.abs(param[2]) : 1,
        inc = (end - ini >= 0) ? incv : (-incv),
        memo = ini,

        array_index = 0,
        received_count = 0,
        limit = Math.abs(end - ini) / incv + 1,
        finished = false,

        received_error,
        array = [],

        accumulate = function(value, index) {
          memo += inc;
          array_index++;
          return iterate(value, index, function(error, result) {
            received_count++;
            if (error) {
              received_error = error;
            } else {
              array[index] = result;
            }
            return loop_context;
          }) || loop_context;
        },

        loop = function() {
          if (finished) {
            return;
          }
          if (received_error || received_count >= limit) {
            finished = true;
            return callback(received_error, array);
          }
          if (array_index < limit) {
            accumulate_context.args[0] = memo;
            accumulate_context.args[1] = array_index;
            return accumulate_context;
          }
          return loop_context;
        },

        accumulate_context = {func: accumulate, args: []},
        loop_context = {func: loop};

    return loop_context;
  };

  trampoline.fromTo = trampoline.call(_fromTo_context);

  var _nreduce_context = function(array, iterate, callback, opt_init) {
    if (arguments.length < 4 && array.length < 1) {
      return callback(new TypeError('Array length is 0 and no init value'));
    }
    var memo = arguments.length > 3 ? opt_init : array.shift();

    return _each_context(array, function(value, index, next) {
      return iterate(memo, value, index, function(error, result) {
        if (error) {
          return next(error);
        }
        memo = result;
        return index >= array.length - 1 ? next(undefined, memo) : next();
      });
    }, callback);
  };

  var _reduce_context = function(array, iterate, callback, opt_init) {
    return _nreduce_context.apply(
        undefined,
        [array.slice()].concat(__slice.call(arguments, 1)));
  };

  trampoline.nreduce = trampoline.call(_nreduce_context);
  trampoline.reduce = trampoline.call(_reduce_context);

})(this);
