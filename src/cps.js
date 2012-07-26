;(function(root) {
  'use strict';
  var cps = {},
      old_cps = root.cps,
      sort;

  if (typeof module !== 'undefined') {
    module.exports = cps;
  } else {
    root.cps = cps;
  }

  if (typeof require === 'function') {
    sort = require('./sort');
  } else {
    sort = root.sort;
  }

  cps.noComflict = function() {
    root.cps = old_cps;
    return cps;
  };

  var __slice = Array.prototype.slice;

  var _next_process = function(fn, var_args) {
    var args = __slice.call(arguments, 1);
    if (args.length < 1) {
      process.nextTick(fn);
    } else {
      process.nextTick(function _next_tick() {
        fn.apply(null, args);
      });
    }
  };

  var _next_default = function(fn, var_args) {
    var args = __slice.call(arguments, 1);
    if (args.length < 1) {
      setTimeout(fn, 0);
    } else {
      setTimeout.apply(null, [fn, 0].concat(args));
    }
  };

  if (typeof process !== 'undefined' && process.nextTick == 'function') {
    cps.next = _next_process;
  } else {
    cps.next = _next_default;
  }

  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, *...))} iterate procedure.
   * @param {function(Error, *...)} callback next procedure.
   */
  cps.each = function(array, iterate, callback) {
    var LIMIT = array.length,
        count = 0,
        finished = LIMIT < 1,
        i;

    for (i = 0; !finished && i < LIMIT; i++) {
      (function(value, index) {
        iterate(value, index, function(error, var_args) {
          count++;
          if (finished) {
            // already iteration has finished
          } else if (error) {
            finished = true;
            callback(error);
          } else if (arguments.length > 1) {
            finished = true;
            callback.apply(undefined, __slice.call(arguments));
          } else if (count >= LIMIT) {
            finished = true;
            callback();
          }
        });
      })(array[i], i);
    }
  };

  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, *)} iterate procedure.
   * @param {function(Error, Array)} callback next procedure.
   */
  cps.nmap = function(array, mapping, callback) {
    cps.each(array, function(value, index, next) {
      mapping(value, index, function(error, mapped) {
        if (error) {
          // error has received
        } else {
          array[index] = mapped;
        }
        next(error);
      });
    }, function(error) {
      callback(error, array);
    });
  };

  /**
   * @param {function(Array, ...(*)} fn iterator.
   * @return {function(Array, ...(*)} iteration use coppied array.
   */
  var __apply_coppied_array = function(fn) {
    return function(array, var_args) {
      fn.apply(
          undefined,
          [array.slice()].concat(__slice.call(arguments, 1)));
    };
  };

  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, *)} iterate procedure.
   * @param {function(Error, Array)} callback next procedure.
   */
  cps.map = __apply_coppied_array(cps.nmap);

  /**
   * @param {function(*):boolean} test procedure.
   * @return {function(Array, function(*, number, function(Error, boolean), function(Error, Array))}
   * array filtering procedure.
   */
  var _filter_by = function(test) {
    return function _filter(array, matcher, callback) {
      var hash_stack = [];

      cps.each(array, function(value, index, next) {
        matcher(value, index, function(error, match) {
          if (error) {
            // error has received
          } else if (test(match)) {
            hash_stack.push({index: index, value: value});
          }
          next(error);
        });
      }, function(error) {
        if (error) {
          callback(error);
        } else {
          sort.nquick(hash_stack, function(a, b) {
            return a.index - b.index;
          });
          cps.nmap(hash_stack, function(hash, index, next) {
            next(undefined, hash.value);
          }, callback);
        }
      });
    };
  };


  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, boolean)} tester procedure.
   * @param {function(Error, Array)} callback next procedure.
   */
  cps.filter = _filter_by(function(x) {
    return x;
  });

  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, boolean)} tester procedure.
   * @param {function(Error, Array)} callback next procedure.
   */
  cps.reject = _filter_by(function(x) {
    return !x;
  });

  /**
   * @param {Array} array list.
   * @param {function(*, number, function(Error, *)} iterate procedure.
   * @param {function(Error, *)} callback next procedure.
   */
  cps.detect = function(array, finder, callback) {
    cps.each(array, function(value, index, next) {
      finder(value, index, function(error, exist) {
        if (exist) {
          next(error, value);
        } else {
          next(error);
        }
      });
    }, callback);
  };

  /**
   * @param {Array} array list.
   * @param {function(*, *, number, function(Error, *))} accumulate procedure.
   * @param {function(Error, *)} callback next procedure.
   * @param {(*)=} opt_init memorized value.
   */
  cps.nreduce = function(array, accumulate, callback, opt_init) {
    if (arguments.length < 4 && array.length < 1) {
      callback(new TypeError(
            'Array length is 0 and no init value'));
      return;
    }
    var memo = arguments.length > 3 ? opt_init : array.shift();

    cps.each(array, function(value, index, next) {
      accumulate(memo, value, index, function(error, result) {
        if (error) {
          // error has received
        } else {
          memo = result;
        }
        next(error);
      });
    }, function(error) {
      callback(error, memo);
    });
  };

  /**
   * @param {Array} array list.
   * @param {function(*, *, number, function(Error, *))} accumulate procedure.
   * @param {function(Error, *)} callback next procedure.
   * @param {(*)=} opt_init value for accumulation.
   */
  cps.reduce = __apply_coppied_array(cps.nreduce);

  /**
   * @param {Array.<number>} params [init_number, end_number, [step_number]].
   * @param {function(number, number, function(Error, *)} iterate procedure.
   * @param {function(Error, Array)} callback next procedure.
   */
  cps.fromTo = function(params, iterate, callback) {
    var init = params[0],
        end = params[1],
        unit = params.length > 2 ? Math.abs(params[2]) : 1,
        inc = (end - init >= 0) ? unit : (-unit),

        LIMIT = Math.abs(end - init) / unit + 1,
        count = 0,
        finished = LIMIT < 1,
        array = [],
        memo = init,
        i = 0;

    for (; !finished && i < LIMIT; i++, memo += inc) {
      (function(value, index) {
        iterate(value, index, function _receive(error, result) {
          count++;
          if (finished) {
            // already iteration has finished
          } else if (error) {
            finished = true;
            callback(error);
          } else {
            array[index] = result;
            if (count >= LIMIT) {
              finished = true;
              callback(undefined, array);
            }
          }
        });
      })(memo, i);
    }
  };

})(this);
