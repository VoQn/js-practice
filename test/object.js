'use strict';

if (require) {
  var O = require('../src/object'),
      isEmpty = O.isEmpty,
      isPrimitive = O.isPrimitive,
      isArray = O.isArray,
      supplement = O.supplement,
      asArray = O.asArray,

      E = require('../src/expect'),
      expect = E.expect,
      eq = E.eq,

      T = require('../src/tester'),
      runTests = T.runTests,
      testGroup = T.testGroup;
}

runTests(testGroup({
  'Empty {Object}:x, isEmpty(x) => true':
    function () {
      return expect(isEmpty({})).to(eq(true));
    },
  'Fill Something member {Object}:x, isEmpty(x) => false':
    function () {
      return expect(isEmpty({hoge: 0})).to(eq(false));
    },
  '{undefined}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(undefined)).to(eq(true));
    },
  '{null}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(null)).to(eq(true));
    },
  '{number}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(0)).to(eq(true));
    },
  '{boolean}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(false)).to(eq(true));
    },
  '{string}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive('')).to(eq(true));
    },
  '{Array}:x, isArray(x) => true':
    function () {
      return expect(isArray([])).to(eq(true));
    },
  '{Object}:x, isArray(x) => false':
    function () {
      return expect(isArray({})).to(eq(false));
    },
  'supplement(default) => default':
    function () {
      return expect(supplement(10)).to(eq(10));
    },
  'supplement(default, value) => value':
    function () {
      return expect(supplement(10, 5)).to(eq(5));
    },
  'supplement(default, value, callback) => callback(default, value)':
    function () {
      return expect(supplement(1, -1, Math.max)).to(eq(1));
    },
  'asArray() => []':
    function () {
      return expect(asArray()).to(eq([]));
    },
  'asArray(null) => []':
    function () {
      return expect(asArray(null)).to(eq([]));
    },
  'asArray(false) => [false]':
    function () {
      return expect(asArray(false)).to(eq([false]));
    },
  'asArray(0) => [0]':
    function () {
      return expect(asArray(0)).to(eq([0]));
    },
  "asArray('') => []":
    function () {
      return expect(asArray('')).to(eq([]));
    },
  "asArray('foo') => ['foo']":
    function () {
      return expect(asArray('foo')).to(eq(['foo']));
    },
  'asArray(function (x, y, ... ) { ... }) => []':
    function () {
      return expect(asArray(function (x, y) {
        return x + y;
      })).to(eq([]));
    },
  'asArray(arguments) => [arg1, arg2, arg3, ... ]':
    function () {
      function argumentsAsArray() {
        return expect(asArray(arguments)).to(eq([1, 2, 3]));
      }
      return argumentsAsArray(1,2,3);
    },
}));
