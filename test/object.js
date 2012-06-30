'use strict';

if (require) {
  var object_util = require('../src/object'),
      isEmpty = object_util.isEmpty,
      isPrimitive = object_util.isPrimitive,
      supplement = object_util.supplement,
      expect_module = require('../src/expect'),
      expect = expect_module.expect,
      eq = expect_module.eq,
      test_module = require('../src/tester'),
      runTests = test_module.runTests,
      testGroup = test_module.testGroup;
}

runTests(testGroup({
  'Empty {Object}:x, isEmpty(x) should be true':
    function () {
      return expect(isEmpty({})).to(eq(true));
    },
  'Fill Something member {Object}:x, isEmpty(x) should be false':
    function () {
      return expect(isEmpty({hoge: 0})).to(eq(false));
    },
  '{undefined}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive(undefined)).to(eq(true));
    },
  '{null}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive(null)).to(eq(true));
    },
  '{number}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive(0)).to(eq(true));
    },
  '{boolean}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive(false)).to(eq(true));
    },
  '{string}:x, isPrimitive(x) should be true':
    function () {
      return expect(isPrimitive('')).to(eq(true));
    },
  'supplement(default) should return default':
    function () {
      return expect(supplement(10)).to(eq(10));
    },
  'supplement(default, value) should return value':
    function () {
      return expect(supplement(10, 5)).to(eq(5));
    },
  'supplement(default, value, callback) should return callback(default, value)':
    function () {
      return expect(supplement(1, -1, Math.max)).to(eq(1));
    }
}));
