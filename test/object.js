'use strict';

if (require) {
  var O = require('../src/object'),
      isEmpty = O.isEmpty,
      isPrimitive = O.isPrimitive,
      isArray = O.isArray,
      supplement = O.supplement,
      asArray = O.asArray,

      expect = require('../src/expect').expect,

      T = require('../src/tester'),
      runTests = T.runTests,
      testGroup = T.testGroup;
}

runTests(testGroup({
  'Empty {Object}:x, isEmpty(x) => true':
    function () {
      return expect(isEmpty({})).to_eq(true);
    },
  'Fill Something member {Object}:x, isEmpty(x) => false':
    function () {
      return expect(isEmpty({hoge: 0})).to_eq(false);
    },
  '{undefined}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(undefined)).to_eq(true);
    },
  '{null}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(null)).to_eq(true);
    },
  '{number}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(0)).to_eq(true);
    },
  '{boolean}:x, isPrimitive(x) => true':
    function () {
      return expect(isPrimitive(false)).to_eq(true);
    },
  '{string}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive('')).to_eq(true);
    },
  '{Array}:x, isArray(x) => true':
    function () {
      return expect(isArray([])).to_eq(true);
    },
  '{Object}:x, isArray(x) => false':
    function () {
      return expect(isArray({})).to_eq(false);
    },
  'supplement(default) => default':
    function () {
      return expect(supplement(10)).to_eq(10);
    },
  'supplement(default, value) => value':
    function () {
      return expect(supplement(10, 5)).to_eq(5);
    },
  'supplement(default, value, callback) => callback(default, value)':
    function () {
      return expect(supplement(1, -1, Math.max)).to_eq(1);
    },
  'asArray() => []':
    function () {
      return expect(asArray()).to_eq([]);
    },
  'asArray(null) => []':
    function () {
      return expect(asArray(null)).to_eq([]);
    },
  'asArray(false) => [false]':
    function () {
      return expect(asArray(false)).to_eq([false]);
    },
  'asArray(0) => [0]':
    function () {
      return expect(asArray(0)).to_eq([0]);
    },
  "asArray('') => []":
    function () {
      return expect(asArray('')).to_eq([]);
    },
  "asArray('foo') => ['foo']":
    function () {
      return expect(asArray('foo')).to_eq(['foo']);
    },
  'asArray(function (x, y, ... ) { ... }) => []':
    function () {
      return expect(asArray(function (x, y) {
        return x + y;
      })).to_eq([]);
    },
  'asArray(arguments) => [arg1, arg2, arg3, ... ]':
    function () {
      function argumentsAsArray() {
        return expect(asArray(arguments)).to_eq([1, 2, 3]);
      }
      return argumentsAsArray(1,2,3);
    },
}));
