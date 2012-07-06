'use strict';

var O, isEmpty, isPrimitive, isArray, supplement, asArray,
    E, expect, subject,
    T, runTests, testGroup;

if (require) {
  O = require('../src/object');
  isEmpty = O.isEmpty;
  isPrimitive = O.isPrimitive;
  isArray = O.isArray;
  supplement = O.supplement;
  asArray = O.asArray;

  E = require('../src/expect');
  subject = E.subject;

  T = require('../src/tester');
  runTests = T.runTests;
  testGroup = T.testGroup;
}

runTests(testGroup({
  'function isEmpty(any)':
    subject(O.isEmpty, {
      '({}) => true': function(topic) {
          return topic({}).to_be(true);
        },
      '({hoge: 0}) => false': function(topic) {
          return topic({hoge: 0}).to_be(false);
        }
    }),
  'function isPrimitive(any)':
    subject(O.isPrimitive, {
      '(undefined) => true': function(topic) {
          return topic(undefined).to_be(true);
        },
      '(null) => true': function(topic) {
          return topic(null).to_be(true);
        },
      '(0) => true': function(topic) {
          return topic(0).to_be(true);
        },
      '(false) => true': function(topic) {
          return topic(false).to_be(true);
        },
      "('') => true": function(topic) {
          return topic('').to_be(true);
        }
      }),
  'function isArray(any)':
    subject(O.isArray, {
      '([]) => true': function(topic) {
          return topic([]).to_be(true);
        },
      '({}) => false': function(topic) {
          return topic({}).to_be(false);
        }
    }),
  'function supplement(default, value, [callback])':
    subject(O.supplement, {
      '(default) => default': function(topic) {
          return topic(10).to_be(10);
        },
      '(default, value) => value': function(topic) {
          return topic(10, 5).to_be(5);
        },
      '(default, value, callback) => callback(default, value)':
        function(topic) {
          return topic(1, -1, Math.max).to_be(1);
        }
    }),
  'function asArray(any)':
    subject(O.asArray, {
      '(undefined) => []': function(topic) {
        return topic(undefined).to_be([]);
      },
      '(null) => []': function(topic) {
        return topic(null).to_be([]);
      },
      '(false) => [false]': function(topic) {
        return topic(false).to_be([false]);
      },
      '(0) => [0]': function(topic) {
        return topic(0).to_be([0]);
      },
      "('') => []": function(topic) {
        return topic('').to_be([]);
      },
      "('foo') => ['foo']": function(topic) {
        return topic('foo').to_be(['foo']);
      },
      '(function (x, y, ... ) { ... }) => []': function(topic) {
        return topic(function(x, y) {
          return x + y;
        }).to_be([]);
      },
      '(arguments) => [arg1, arg2, arg3, ... ]': function(topic) {
        function argumentsAsArray() {
          return topic(arguments).to_be([1, 2, 3]);
        }
        return argumentsAsArray(1, 2, 3);
      }
    })
}));
