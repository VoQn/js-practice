(function(root) {
  var async = {},
      previous_async = root.async;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = async;
  } else {
    root.async = async;
  }

  var O, isArray, asArray;
  if (require) {
    O = require('./object');
    isArray = O.isArray;
    asArray = O.asArray;
  }

  async.noConflift = function() {
    root.async = previous_async;
    return async;
  };

  var _each;
  if (Array.prototype.forEach) {
    _each = function(arr, iterator) {
      return arr.forEach(iterator);
    };
  } else {
    _each = function(arr, iterator) {
      for (var i = 0, l = arr.length; i < l; i++) {
        iterator(arr[i], i, arr);
      }
    };
  }

  var _map;
  if (Array.prototype.map) {
    _map = function(arr, iterator) {
      return arr.map(iterator);
    };
  } else {
    _map = function(arr, iterator) {
      var results = [];
      _each(arr, function(x, i, a) {
        results[i] = iterator(x, i, a);
      });
      return results;
    }
  }

  var _reduce;
  if (Array.prototype.reduce) {
    _reduce = function(arr, iterator, memo) {
      return arr.reduce(iterator);
    };
  } else {
    _reduce = function(arr, iterator, memo) {
      _each(arr, function(x, i, a) {
        memo = iterator(memo, x, i, a);
      });
    };
  }

  var _keys;
  if (Object.keys) {
    _keys = function(obj) {
      return Object.keys(obj);
    };
  } else {
    _keys = function(obj) {
      var keys = [], i = 0, k;
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
          keys[i] = k;
          i++;
        }
      }
      return keys;
    };
  }

  if (typeof process !== 'undefined' && process.nextTick) {
    async.next = process.nextTick;
  } else {
    async.next = function(fn) {
      setTimeout(fn, 0);
    };
  }

  var _nothing = function() {};

  async.each = function(arr, iterator, opt_callback) {
    var callback = opt_callback || _nothing;
    if (!arr.length) {
      return callback();
    }
    var completed = 0;
    _each(arr, function(x) {
      iterator(x, function(err) {
        if (err) {
          callback(err);
          callback = _nothing;
        } else {
          completed++;
          if (completed === arr.length) {
            callback(null);
          }
        }
      });
    });
  };

  async.eachSeries = function(arr, iterator, opt_callback) {
    var callback = opt_callback || _nothing;
    if (!arr.length) {
      return callback();
    }
    var completed = 0,
        to_stop = arr.length,
        iterate = function() {
          iterator(arr[completed], function(err) {
            if (err) {
              callback(err);
              callback = _nothing;
            } else {
              completed++;
              if (completed === to_stop) {
                callback(null);
              } else {
                iterate();
              }
            }
          });
        };
    iterate();
  };

  async.eachLimit = function(arr, limit, iterator, opt_callback) {
    var callback = opt_callback || _nothing;
    if (!arr.length) {
      return callback();
    }
    var completed = 0,
        started = 0,
        running = 0,
        to_stop = arr.length,
        replenish = function() {
          if (completed === to_stop) {
            return callback();
          }

          while (running < limit && started < to_stop) {
            started++;
            running++;
            iterator(arr[started - 1], function(err) {
              if (err) {
                callback(err);
                callback = _nothing;
              } else {
                completed++;
                running--;
                if (completed === to_stop) {
                  callback();
                } else {
                  replenish();
                }
              }
            });
          }
        };
    replenish();
  };

  var doPerallel = function(fn) {
    return function() {
      var args = asArray(arguments);
      return fn.apply(null, [async.each].concat(args));
    };
  };

  var doSeries = function(fn) {
    return function() {
      var args = asArray(arguments);
      return fn.apply(null, [async.eachSeries].concat(args));
    };
  }

  var _arrayToHash = function(arr) {
    return _map(arr, function(x, i) {
      return {
        index: i,
        value: x
      };
    });
  }

  var _asyncMap = function(eachFn, arr, iterator, callback) {
    var results = [],
        hash = _arrayToHash(arr);
    eachFn(hash, function(x, callback) {
      iterator(x.value, function(err, v) {
        results[x.index] = v;
        callback(err);
      });
    }, function(err) {
      callback(err, results);
    });
  };
  async.map = doPerallel(_asyncMap);
  async.mapSeries = doSeries(_asyncMap);

  async.reduce = function(arr, memo, iterator, callback) {
    async.eachSeries(arr, function(x, callback) {
      iterator(memo, x, function(err, v) {
        memo = v;
        callback(err);
      }, function(err) {
        callback(err, memo);
      });
    });
  };

  async.inject = async.reduce;
  async.foldl = async.reduce;

  async.reduceRight = function(arr, memo, iterator, callback) {
    var reversed = _map(arr, function(x) {
      return x;
    }).reverse();
    async.reduce(reversed, memo, iterator, callback);
  };

  async.foldr = async.reduceRight;

  var _sort_hash = function(hashed_list) {
    return _map(hashed_list.sort(function(a, b) {
      return a.index - b.index;
    }), function(x) {
      return x.value;
    });
  }

  var _filter = function(eachFn, arr, iterator, callback) {
    var results = [],
        i = 0,
        hash = _arrayToHash(arr);
    eachFn(hash, function(x, callback) {
      iterator(x.value, function(err, v) {
        if (v) {
          results[i] = x;
          i++;
        }
        callback(err);
      });
    }, function(err) {
      callback(err, _sort_hash(results));
    });
  };

  async.filter = doPerallel(_filter);
  async.filterSeries = doSeries(_filter);

  async.select = async.filter;
  async.selectSeries = async.filterSeries;

  var _reject = function(eachFn, arr, iterator, callback) {
    var results = [],
        i = 0,
        hash = _arrayToHash(arr);
    eachFn(arr, function(x, callback) {
      iterator(x.value, function(err, v) {
        if (!v) {
          results[i] = x;
          i++;
        }
        callback(err);
      });
    }, function(err) {
      callback(err, _sort_hash(results));
    });
  };
  async.reject = doPerallel(_reject);
  async.rejectSeries = doSeries(_reject);

  var _detect = function(eachFn, arr, iterator, main_callback) {
    eachFn(arr, function(x, callback) {
      iterator(x, function(err, result) {
        if (result) {
          main_callback(err, x);
          main_callback = _nothing;
        } else {
          callback(err);
        }
      });
    }, function(err) {
      main_callback(err);
    });
  };
  async.detect = doPerallel(_detect);
  async.detectSeries = doSeries(_detect);

  async.some = function(arr, iterator, main_callback) {
    async.each(arr, function(x, callback) {
      iterator(x, function(err, v) {
        if (v) {
          main_callback(err, true);
          main_callback = _nothing;
        }
        callback(err);
      });
    },
    function(err) {
      main_callback(err, false);
    });
  };
  async.any = async.some;

  async.every = function(arr, iterator, main_callback) {
    async.each(arr, function(x, callback) {
      iterator(x, function(err, v) {
        if (!v) {
          main_callback(err, false);
          main_callback = _nothing;
        }
        callback(err);
      });
    },
    function(err) {
      main_callback(err, true);
    });
  };
  async.all = async.every;

  async.sortBy = function(arr, iterator, callback) {
    async.map(arr, function(x, callback) {
      iterator(x, function(err, criteria) {
        if (err) {
          callback(err);
        } else {
          callback(null, {value: x, criteria: criteria});
        }
      });
    },
    function(err, results) {
      if (err) {
        return callback(err);
      } else {
        var fn = function(left, right) {
          var a = left.criteria,
              b = right.criteria;
          return a < b ? -1 : a > b ? 1 : 0;
        };
        callback(null, _map(results.sort(fn), function(x) {
          return x.value;
        }));
      }
    });
  };

  async.auto = function(tasks, opt_callback) {
    var callback = opt_callback || _nothing,
        keys = _keys(tasks);
    if (!keys.length) {
      return callback(null);
    }
    var results = {},
        listeners = [],
        addListener = function(fn) {
          listeners.unshift(fn);
        },
        removeListener = function(fn) {
          for (var i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i] === fn) {
              listeners.splice(i, 1);
              return;
            }
          }
        },
        taskComplete = function() {
          _each(listeners.slice(0), function(fn) {
            fn();
          });
        };
    addListener(function() {
      if (_keys(results).length === keys.length) {
        callback(null, results);
        callback = _nothing;
      }
    });

    _each(keys, function(k) {
      var task = (typeof tasks[k] === 'function') ? [tasks[k]] : tasks[k],
          taskCallback = function(err) {
            if (err) {
              callback(err);
              callback = _nothing;
            } else {
              var args = asArray(arguments, 1);
              if (args.length < 2) {
                args = args[0];
              }
              results[k] = args;
              taskComplete();
            }
          },
          requires = task.slice(0, Math.abs(task.length - 1)) || [],
          ready = function() {
            return _reduce(requires, function(a, x) {
              return (a && results.hasOwnProperty(x));
            }, true) && !results.hasOwnProperty(k);
          };
      if (ready()) {
        task[task.length - 1](taskCallback, results);
      } else {
        var listener = function() {
          if (ready()) {
            removeListener(listener);
            task[task.length - 1](taskCallback, results);
          }
        };
        addListener(listener);
      }
    });
  };

  async.waterfall = function(tasks, opt_callback) {
    var callback = opt_callback || _nothing;
    if (!task.length) {
      return callback();
    }
    var wrap = function(iterator) {
      return function(err) {
        if (err) {
          callback(err);
          callback = _nothing;
        } else {
          var args = asArray(arguments, 1),
              next = iterator.next();
          if (next) {
            args.push(wrap(iterator));
          } else {
            args.push(callback);
          }
          async.next(function() {
            iterator.apply(null, args);
          });
        }
      };
    };
    wrap(async.iterator(tasks))();
  };

  var _doTask = function(fn, next) {
    var acc = function(err) {
      var args = asArray(arguments, 1);
      if (args.length < 2) {
        args = args[0];
      }
      next.call(null, err, args);
    };
    if (fn) {
      fn(acc);
    }
  };

  var _doLabeldTask = function(tasks, results) {
    return function(k, next) {
      tasks[k](function(err) {
        var args = asArray(arguments, 1);
        if (args.length < 2) {
          args = args[0];
        }
        results[k] = args;
        next(err);
      });
    };
  }

  var _finish = function(results, next) {
    return function(err) {
      next(err, results);
    };
  }

  var _parallel = function(mapFn, eachFn) {
    return function(tasks, opt_callback) {
      var callback = opt_callback || _nothing;
      if (isArray(tasks)) {
        mapFn(tasks, _doTask, callback);
      } else {
        eachFn(_keys(tasks),
               _doLabeldTask(tasks, results),
               _finish(results, callback));
      }
    }
  };

  async.parallel = _parallel(async.map, async.each);
  async.series = _parallel(async.mapSeries, async.eachSeries);

  async.iterator = function(tasks) {
    var makeCallback = function(index) {
      var fn = function() {
        if (tasks.length) {
          tasks[index].apply(null, arguments);
        }
        return fn.next();
      };
      fn.next = function() {
        return (index < tasks.length - 1) ?
               makeCallback(index + 1) :
               null;
      };
      return fn;
    };
    return makeCallback(0);
  };

  async.apply = function(fn) {
    var args = asArray(arguments, 1);
    return function() {
      return fn.apply(null,
                      args.concat(asArray(arguments)));
    };
  };

  var _concat = function(eachFn, arr, fn, callback) {
    var r = [];
    eachFn(arr, function(x, next) {
      fn(x, function(err, y) {
        r = r.concat(y || []);
        next(err);
      });
    }, _finish(r, callback));
  };

  async.concat = doPerallel(_concat);
  async.concatSeries = doSeries(_concat);

  var _while = function(evalation) {
    return function(test, iterator, callback) {
      if (evaluation(test)) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          async.whilist(test, iterator, callback);
        });
      } else {
        callback();
      }
    };
  };

  async.whilist = _while(function(t) { return t(); });
  async.until = _while(function(t) { return !t(); });

  async.queue = function(worker, cc) {
    var workers = 0,
        q = {
          tasks: [],
          concurrency: cc,
          saturated: null,
          empty: null,
          drain: null,
          push: function(data, callback) {
            if (isArray(data)) {
              data = [data];
            }
            _each(data, function(task) {
              q.tasks.push({
                data: task,
                callback: typeof callback === 'function' ? callback : null
              });
              if (q.saturated && q.tasks.length === cc) {
                q.saturated();
              }
              async.next(q.process);
            });
          },
          process: function() {
            if (workers < q.concurrency && q.tasks.length) {
              var task = q.tasks.shift();
              if (q.empty && !q.tasks.length) {
                q.empty();
              }
              workers++;
              worker(task.data, function() {
                var args = asArray(arguments);
                workers--;
                if (task.callback) {
                  task.callback.apply(task, args);
                }
                if (q.drain && !(q.tasks.length + workers)) {
                  q.drain();
                }
                q.process();
              });
            }
          },
          length: function() {
            return q.tasks.length;
          },
          running: function() {
            return workers;
          }
        };
    return q;
  };

  var _console_fn = function(name) {
    var callback = function(fn) {
      var args = asArray(arguments, 1);
      fn.apply(null, args.concat([function(err) {
        var args = asArray(arguments, 1);
        if (typeof console !== 'undefined') {
          if (err && console.error) {
            console.error(err);
          } else if (console[name]) {
            _each(args, function(x) {
              console[name](x);
            });
          }
        }
      }]));
    };
    return callback;
  };
  async.log = _console_fn('log');
  async.dir = _console_fn('dir');

  async.memorize = function(fn, hasher) {
    var memo = {},
        queues = {},
        hasher = opt_hasher || function(x) { return x; },
        memorized = function(var_args) {
          var args = asArray(arguments),
              callback = args.pop(),
              key = hasher.apply(null, args);
          if (key in memo) {
            callback.apply(null, memo[key]);
          } else if (key in queues) {
            queues[key].push(callback);
          } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([function() {
              memo[key] = arguments;
              var q = queues[key];
              delete queues[key];
              for (var i = 0, l = q.length; i < l; i++) {
                q[i].apply(null, arguments);
              }
            }]));
          }
        };
    memorized.unmemorized = fn;
    return memorized;
  };

  async.unmemorize = function(fn) {
    return function() {
      return (fn.unmemorized || fn).apply(null, asArray(arguments));
    };
  };

})(this);
