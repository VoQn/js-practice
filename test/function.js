'use strict';

if (require) {
  var F = require('../src/function'),
      id = F.id,
      seq = F.seq,
      force = F.force,
      apply = F.apply,
      curry = F.curry,

      expect = require('../src/expect').expect,

      T = require('../src/tester'),
      runTests = T.runTests,
      testGroup = T.testGroup;
}

runTests(testGroup({
  'id(x) => x':
    function () {
      return expect(id(10)).to_eq(10);
    },
  'seq(x, y) => y':
    function () {
      return expect(seq(5, 10)).to_eq(10);
    },
  'force(promise) => promise()':
    function () {
      function p() {
        return 5 + 5; // 10
      }
      return expect(force(p)).to_eq(10);
    },
  'apply(-10)(Math.abs) => 10':
    function () {
      return expect(apply(-10)(Math.abs)).to_eq(10);
    },
  'apply(10, 2)(Math.pow) => 100':
    function () {
      return expect(apply(10, 2)(Math.pow)).to_eq(100);
    },
  'curry(function (x, y) { return x + y; })(3)(7) => 10':
    function () {
      function origin(x, y) {
        return x + y;
      }
      var curried = curry(origin);
      return expect(curried(3)(7)).to_eq(10);
    },
  'curry(function (x, y) { return x + y; })(3, 7) => 10':
    function () {
      function origin(x, y) {
        return x + y;
      }
      var curried = curry(origin);
      return expect(curried(3, 7)).to_eq(10);
    },
  'curry(function (x, y) { return x + y; }, 3)(7) => 10':
    function () {
      function origin(x, y) {
        return x + y;
      }
      var curried = curry(origin, 3);
      return expect(curried(7)).to_eq(10);
    },
  'curry(function (x, y) { return x + y; }, 3, 7) => 10':
    function () {
      function origin(x, y) {
        return x + y;
      }
      var applied = curry(origin, 3, 7);
      return expect(applied).to_eq(10);
    }
}));

// EOF
