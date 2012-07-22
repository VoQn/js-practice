;(function(root) {
  var sort, ansi;
  if (require) {
    sort = require('../src/sort');
    ansi = require('../src/ansi');
  }

  var compare_num = function(a, b) {
    return a - b;
  };

  var _array = [], _array_index = 0;

  var make_random_value_array = function(length) {
    for (_array_index = 0; _array_index < length; _array_index++) {
      _array[_array_index] = Math.floor(Math.random() * length);
    }
    return _array;
  };

  var _argv = process.argv;
  var _array_length = _argv.length > 2 ? ~~_argv[2] : 1.0e+5;
  var _retry_count = _argv.length > 3 ? ~~_argv[3] : 100;

  var _time_expr = function(time) {
    if (time > 999) {
      return time / 1000 + 's';
    }
    return time + 'ms';
  };

  var logging = function(label, time, result) {
    var result_expr;
    if (Array.isArray(result)) {
      result_expr = (result.length > 10) ?
          '[' + result.slice(0, 9) + ' ...] (any[' + result.length + '])' :
          '[' + result + ']';
    } else {
      result_expr = result;
    }

    console.log(
        ansi.wrap(label + ':', ansi.COLOR.YELLOW) + ' ' +
        ansi.wrap('(' + _time_expr(time) + ')',
                  ansi.COLOR.YELLOW,
                  ansi.OPTION.BRIGHT) + '\n' +
        ansi.wrap(result_expr, ansi.COLOR.BLUE));
  };

  var benchmark = function(label, sorter) {
    var count = 0,
        score_time = 0,
        sample, start_time, result, end_time;
    while (count < _retry_count) {
      sample = make_random_value_array(_array_length);
      start_time = (new Date).getTime();
      result = sorter(sample);
      end_time = (new Date).getTime();
      score_time += end_time - start_time;
      count++;
    }
    logging(label, score_time / count, result || sample);
  };

  console.log([
      ansi.wrap(
        '-- sort benchmark :: prepare --',
        ansi.COLOR.GREEN,
        ansi.OPTION.BRIGHT),
      ansi.wrap(
        'array length: ' + _array_length,
        ansi.COLOR.GREEN),
      ansi.wrap(
        'retry count: ' + _retry_count,
        ansi.COLOR.GREEN)
      ].join('\n'));

  benchmark('builtin', function(array) {
    return array.sort(compare_num);
  });

  benchmark('quicksort', function(array) {
    return sort.nquick(array, compare_num);
  });

  console.log(ansi.wrap('-- sort benchmark :: finish --', ansi.COLOR.GREEN));

})(this);
