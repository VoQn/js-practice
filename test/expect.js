'use strict';

var T, O, E, runTests, testGroup, asArray, expect;
if (require) {
  T = require('../src/tester');
  runTests = T.runTests;
  testGroup = T.testGroup;

  O = require('../src/object');
  asArray = O.asArray;

  E = require('../src/expect');
  expect = E.expect;
}

var throwError = function () {
  throw new Error('nice error!');
};

var makeArray = function (var_args) {
  return asArray(arguments);
};

runTests(testGroup({
  'when call as function subject (is not function), throw TypeError':
    function () {
      return expect(10).when_apply(0).to_throw(TypeError);
    },
  'assertion throws Error, can assert Error message is expected':
    function () {
      return expect(throwError).to_throw(Error, 'nice error!');
    },
  'when subject call as function with arguments, return result':
    function () {
      return expect(makeArray).when_apply(1, 2, 3).to_eq([1, 2, 3]);
    },
  'if not need seperate function and arguments, can direct call and assert':
    function () {
      return expect(makeArray(1, 2, 3)).to_eq([1, 2, 3]);
    }
}));
