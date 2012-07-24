;(function(root) {
  'use strict';
  var cps;

  if (require) {
    cps = require('../src/cps');
  } else {
    cps = root.cps;
  }

  var _limit = process.argv.length > 2 ? ~~process.argv[2] : 1e+3,
      _plot_mode = false;

  var _quoter = _limit / 4,
      _date = new Date(),
      _start_t = _date.valueOf(),
      _interval_t = _start_t,
      _time_stamp = _start_t,
      _now = function() {
        return new Date().valueOf();
      },
      _id = function(x) { return x; },
      _random = function(a, b) {
        var nMax = Math.max(a, b),
            nMin = Math.min(a, b),
            n = nMax - nMin + 1;
        return Math.floor(Math.random() * n) + nMin;
      },
      _time_expr = function(t) {
        if (t > 999) {
          return t / 1000 + 's';
        }
        return t + 'ms';
      },
      print_cloud = function(label, time, i, d) {
        cps.next(console.log,
            '\u001b[1m\u2601\u001b[0m' +
            '  <- \u001b[34m' + label +
            ' [' + i + ']\u001b[0m' +
            (d ? (' \u2708  ' + _time_expr(d) + ' ') : ' '));
      },
      print_rain = function(label, time, i, d) {
        console.log('\u001b[36m\u001b[1m\u2602\u001b[0m' +
            '  -> \u001b[36m' + label +
            ' [' + i + ']\u001b[0m' +
            (d ? (' \u2708  ' + _time_expr(d) + ' ') : ' '));
      },
      print_sun = function(label, time, data) {
        var expr = isArray(data) && data.length > 9 ?
          data.length + ' length array [ ' +
          data.slice(0, 5) + ', ... ]' :
          data;
        console.log('\u001b[33m\u001b[1m\u2600\u001b[0m  -> ' +
              '\u001b[33m' + label + ' done\u001b[0m' +
              ' time: ' + _time_expr(time - _start_t) +
              (data ?
               '\n\u001b[33mresult: \u001b[1m' + expr + '\u001b[0m' :
               ' '));
        _interval_t = time;
      },
      prints = function(printer, label, time, index, delay) {
        if (!_plot_mode) return;
        if (time - _time_stamp > 16) {
          printer(label, time, index, delay);
          _time_stamp = time;
        }
      },
      printItr = function(label, value, i, next) {
        prints(print_rain, label, _now(), i);
        next(null, value);
      },
      sampleItr = function(label, f) {
        return function(x, i, next) {
          printItr(label, f(x, i), i, next);
        };
      },
      isArray = function(any) {
        return Object.prototype.toString.call(any) === '[object Array]';
      },
      sampleAft = function(label) {
        return function(err, results) {
          print_sun(label, _now(), results);
        };
      },
      _even = function(x) {
        return x % 2 < 1;
      },
      _odd = function(x) {
        return !_even(x);
      };

  var parallel_label = function(label) {
    console.log('\u001b[32m\u001b[1m\u2708\u001b[0m' +
        '  -> \u001b[32m\u001b[1m' +
        label + ' flight\u001b[0m time: ' + _time_expr(_now() - _start_t));
  };

  console.log('test ' + _limit + ' length array loop, ready ...');
  _start_t = _now();
  _interval_t = _start_t;
  _time_stamp = _start_t;

  parallel_label('fromTo');

  cps.fromTo([1, _limit],
    sampleItr('fromTo', _id),
    function(err, arr) {

      print_sun('fromTo', _now(), arr);

      parallel_label('each  ');

      cps.each(arr,
          function(value, index, next) {
            prints(print_rain, 'each  ', _now(), index);
            next();
          },
          sampleAft('each  '));

      parallel_label('map   ');

      cps.map(arr,
        sampleItr('map   ', _id),
        sampleAft('map   '));

      parallel_label('filter');

      cps.filter(arr,
        sampleItr('filter', _even),
        sampleAft('filter'));

      parallel_label('reject');

      cps.reject(arr,
        sampleItr('reject', _even),
        sampleAft('reject'));

      parallel_label('detect');

      cps.detect(arr,
          sampleItr('detect', function(x, i) {
            return i >= arr.length / 2 && _odd(x);
          }),
          sampleAft('detect'));

      parallel_label('reduce');

      cps.reduce(arr, function(r, x, i, next) {
            printItr('reduce', r + 1 / x, i, next);
          }, function(error, results) {
            print_sun('reduce', _now(), results);
          });

    });
})(this);
