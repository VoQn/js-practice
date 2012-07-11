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
}));
