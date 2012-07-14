'use strict';

var T, F, E, expect,
    S, subject, Topic, topic,
    R,
    async;

if (require) {
  T = require('../src/tester');
  F = require('../src/function');
  E = require('../src/expect');
  S = require('../src/subject');
  expect = E.expect;
  subject = S.subject;
  async = require('../src/async');
}

T.runTests(T.testGroup({
  'Async map(array, iterator, callback)': subject(async.map, {
    '([1, 2, 3], (x) -> x ^ 4) => [1, 16, 81]':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3],
        function(x, next) {
          next(null, Math.pow(x, 4));
        }).async_to_be([1, 16, 81]);
    },
    '([1, 2, 3], (x) -> 2 * x) => [2, 4, 6]':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3],
        function(x, next) {
          next(null, 2 * x);
        }).async_to_be([2, 4, 6]);
    },
    '([1, 2, 3], (x) -> x ^ 2) => [1, 4, 9]':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3],
        function(x, next) {
          next(null, x * x);
        }).async_to_be([1, 4, 9]);
    }
  }),
  'Async reduce(array, init, iterator, callback)': subject(async.reduce, {
    '([1, 2, 3, 4, 5], 0, (r, x) -> r + x) => 15':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3, 4, 5], 0,
        function(a, x, next) {
          next(null, a + x);
        }).async_to_be(15);
    },
    '([1, 2, 3, 4, 5], 1, (r, x) -> r * x) => 120':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3, 4, 5], 1,
        function(a, x, next) {
          next(null, a * x);
        }).async_to_be(120);
    }
  }),
  'Async filter(array, iterator, callback)': subject(async.filter, {
    '([1, 2, 3, 4, 5], (x) -> x % 2) => [1, 3, 5]':
    function(topic) {
      return expect(topic).when_apply(
        [1, 2, 3, 4, 5],
        function(x, next) {
          next(null, x % 2);
        }).async_to_be([1, 3, 5]);
    },
    '(["foo", "bar", "zoo", "bee"], (x) -> x.match /^.oo$/) => ["foo", "zoo"]':
      function(topic) {
        return expect(topic).when_apply(
          ['foo', 'bar', 'zoo', 'bee'],
          function(x, next) {
            next(null, x.match(/^.oo$/));
          }).async_to_be(['foo', 'zoo']);
      }
  }),
  'Async detect(array, iterator, callback)': subject(async.detect, {
    '(["hoge", "huga", "foo"], (x) -> "huga" === x, (x) -> x) => "huga"':
    function(topic) {
      return expect(topic).when_apply(
        ['hoge', 'huga', 'foo'],
        function(x, next) {
          next(null, x === 'huga');
        }).async_to_be('huga');
    },
    '([1, 2, 3, 4], (x) -> x > 5, (x) -> x) => undefined':
    function(topic) {
      var r;
      topic([1, 2, 3, 4],
        function(x, next) {
          next(null, x > 5);
        },
        function(err, actual) {
          r = expect([err, actual]).to_be([null, undefined]);
        });
      return r;
    }
  })
  /**,
  'Async auto(tasks, callback)': subject(async.auto, {
    'async task flow':
    function(topic) {
      var order = [],
          done = false,
          r = undefined;

      topic({
        task1: ['task2', function(callback) {
          console.log('( hey! )> task1');
          setTimeout(function() {
            order.push('task1');
            callback();
          }, 25);
        }],
        task2: function(callback) {
          console.log('( you! )> task2');
          setTimeout(function() {
            order.push('task2');
            callback();
          }, 50);
        },
        task5: ['task2', function(callback) {
          console.log('( come on! )> task5');
          order.push('task5');
          callback();
        }]
      },
      function(err) {
        r = expect(order).to_be(['task2', 'task5']);
        done = true;
      });

      setTimeout(function() {
        console.log('failed');
        r = R.result({
          success: false,
          expected: ['task2', 'task5'],
          actual: null,
          reason: 'loop has not finish'
        });
        done = true;
      }, 1);

      while (true) {
        if (done) {
          return r;
        }
      }
    }
  })
  **/
}));
