;(function(root) {
  var trampoline = {},
      old_trampoline = root.trampoline,
      cps;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = trampoline;
  } else {
    root.trampoline = trampoline;
  }

  if (require) {
    cps = require('./cps');
  } else {
    cps = root.cps;
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
    var remain = context !== undefined &&
                 typeof context.func === 'function',
        time_stamp = _now(),
        limit = time_stamp + trampoline.TIME_SLICE;
    while (remain && time_stamp < limit) {
      context = context.args ?
        context.func.apply(null, context.args) :
        context.func();
      time_stamp = _now();
      remain = context !== undefined &&
               typeof context.func === 'function';
    }
    if (remain) {
      cps.next(_trampoline, context);
    }
  };

  trampoline.call = function(fn_context) {
    return function(var_args) {
      var args = __slice.call(arguments);
      _trampoline({func: fn_context, args: args});
    };
  };

  var _each_context = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length,
        context, err = undefined, finished = false,
        iter = function() {
          context = acc(arr[i], i, function(error) {
            c++;
            err = error;
            return loop_;
          });
          i++;
          return context || loop_;
        },
        loop = function() {
          if (finished) return;
          if (err) {
            finished = true;
            return callback(err);
          }
          if (c >= l) {
            finished = true;
            return callback();
          }
          if (i < l) return iter_;
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  trampoline.each = trampoline.call(_each_context);

  var _map_context = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length, context,
        err = undefined, finished = false, rs = [],
        iter = function() {
          var j = i;
          context = acc(arr[i], i, function(error, result) {
            if (error) {
              err = error;
            } else {
              rs[j] = result;
            }
            c++;
            return loop_;
          });
          i++;
          return context || loop_;
        },
        loop = function() {
          if (finished) return;
          if (err) {
            finished = true;
            return callback(err);
          }
          if (c >= l) {
            finished = true;
            return callback(err, rs);
          }
          if (i < l) return iter_;
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  trampoline.map = trampoline.call(_map_context);

  var _filter_context = function(evaluate) {
    return function(arr, acc, callback) {
      var i = 0, j = 0, c = 0, l = arr.length, context,
          err = undefined, finished = false, rs = [],
          byIndex = function(a, b) {
            return a.index - b.index;
          },
          passValue = function(x, k, next) {
            return next(null, x.value);
          },
          iter = function() {
            var x = {index: i, value: arr[i]};
            context = acc(x.value, x.index, function(error, result) {
              if (error) {
                err = error;
              } else if (evaluate(result)) {
                rs[j++] = x;
              }
              c++;
              return loop_;
            });
            i++;
            return context || loop_;
          },
          sort = function() {
            trampoline.map(rs.sort(byIndex), passValue, callback);
          },
          loop = function() {
            if (finished) return;
            if (err) {
              finished = true;
              return callback(err);
            }
            if (c >= l) {
              finished = true;
              return sort_;
            }
            if (i < l) return iter_;
            return loop_;
          },
          iter_ = {func: iter},
          sort_ = {func: sort},
          loop_ = {func: loop};
      return loop_;
    };
  };

  var _id = function(x) { return x; }
  var _not = function(x) { return !x; }

  trampoline.filter = trampoline.call(_filter_context(_id));
  trampoline.reject = trampoline.call(_filter_context(_not));

  var _detect_context = function(arr, acc, callback) {
    var i = 0, c = 0, l = arr.length,
        err = undefined, found = false, finished = false, res,
        iter = function() {
          var x = arr[i],
          context = acc(x, i, function(error, result) {
            if (error) {
              err = error;
            } else if (result) {
              found = true;
              res = x;
            }
            c++;
            return loop_;
          });
          i++;
          return context || loop_;
        },
        loop = function() {
          if (finished) return;
          if (err || found || c >= l) {
            finished = true;
            return callback(err, res);
          }
          if (i < l) return iter_;
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  trampoline.detect = trampoline.call(_detect_context);

  var _fromTo_context = function(arr, acc, callback) {
    var ini = Math.round(arr[0]),
        end = Math.round(arr[1]),
        incv = arr.length > 2 ? Math.abs(arr[2]) : 1,
        inc = (end - ini >= 0) ? incv : (-incv),
        i = 0, c = 0, l = Math.abs(end - ini) / incv + 1,
        err = undefined, finished = false, rs = [],
        x = ini,
        iter = function() {
          var j = i,
          context = acc(x, i, function(error, result) {
            if (error) {
              err = error;
            } else {
              rs[j] = result;
            }
            c++;
            return loop_;
          });
          i++;
          x += inc;
          return context || loop_;
        },
        loop = function() {
          if (finished) return;
          if (err) {
            finished = true;
            return callback(err);
          }
          if (c >= l) {
            finished = true;
            return callback(err, rs);
          }
          if (i < l) return iter_;
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  trampoline.fromTo = trampoline.call(_fromTo_context);

  var _reduce_context = function(arr, acc, callback, opt_init) {
    if (arguments.length < 4 && arr.length < 1) {
      return callback(new TypeError('Array length is 0 and no init value'));
    }
    var r = opt_init || arr.shift(),
        i = 0, c = 0, l = arr.length,
        err = undefined, finished = false,
        iter = function() {
          var context = acc(r, arr[i], i, function(error, result) {
            if (error) {
              err = error;
            } else {
              r = result;
            }
            c++;
            return loop_;
          });
          i++;
          if (context) {
            return context;
          }
          return loop_;
        },
        loop = function() {
          if (finished) return;
          if (err) {
            finished = true;
            return callback(err);
          }
          if (c >= l) {
            finished = true;
            return callback(err, r);
          }
          if (i < l) {
            return iter_;
          }
          return loop_;
        },
        iter_ = {func: iter},
        loop_ = {func: loop};
    return loop_;
  };

  trampoline.reduce = trampoline.call(_reduce_context);

})(this);
