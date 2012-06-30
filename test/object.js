'use strict';

if (require) {
  var object_util = require('../src/object'),
      isEmpty = object_util.isEmpty,
      isPrimitive = object_util.isPrimitive,
      isArray = object_util.isArray,
      supplement = object_util.supplement,

      expect_module = require('../src/expect'),
      expect = expect_module.expect,
      eq = expect_module.eq,

      test_module = require('../src/tester'),
      runTests = test_module.runTests,
      testGroup = test_module.testGroup;
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
    }
}));
