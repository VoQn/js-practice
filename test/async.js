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
    '([1, 2, 3], (x) -> x ^ 4) => [1, 16, 81]': function(topic) {
      var r;
      topic([1, 2, 3],
        function(x, next) {
          next(null, Math.pow(x, 4));
        },
        function(err, actual) {
          r = expect(actual).to_be([1, 16, 81]);
        });
      return r;
    },
    '([1, 2, 3], (x) -> 2 * x) => [2, 4, 6]': function(topic) {
      var r;
      topic([1, 2, 3],
        function(x, next) {
          next(null, 2 * x);
        },
        function(err, actual) {
          r = expect(actual).to_be([2, 4, 6]);
        });
      return r;
    },
    '([1, 2, 3], (x) -> x ^ 2) => [1, 4, 9]': function(topic) {
      var r;
      topic([1, 2, 3],
        function(x, next) {
          next(null, x * x);
        },
        function(err, actual) {
          r = expect(actual).to_be([1, 4, 9]);
        });
      return r;
    }
  }),
  'Async filter(array, iterator, callback)': subject(async.filter, {
    '([1, 2, 3, 4, 5], (x) -> x % 2) => [1, 3, 5]': function(topic) {
      var r;
      topic([1, 2, 3, 4, 5],
        function(x, next) {
          next(null, x % 2);
        },
        function(err, actual) {
          r = expect(actual).to_be([1, 3, 5]);
        });
      return r;
    },
    '(["foo", "bar", "baz", "zoo"], (x) -> x.match /^.oo$/) => ["foo", "zoo"]':
      function(topic) {
        var r;
        topic(['foo', 'bar', 'baz', 'zoo'],
          function(x, next) {
            next(null, x.match(/^.oo$/));
          },
          function(err, actual) {
            r = expect(actual).to_be(['foo', 'zoo']);
          });
        return r;
      }
  }),
  'Async detect(array, iterator, callback)': subject(async.detect, {
    '(["hoge", "huga", "foo"], (x) -> "huga" === x, (x) -> x) => "huga"':
    function(topic) {
      var r;
      topic(['hoge', 'huga', 'foo'],
        function(x, next) {
          next(null, x === 'huga');
        },
        function(err, actual) {
          r = expect(actual).to_be('huga');
        });
      return r;
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
}));
