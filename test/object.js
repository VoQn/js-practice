'use strict';

var O,
    S, subject, topic,
    T;

if (require) {
  O = require('../src/object');
  S = require('../src/subject');
  T = require('../src/tester');

  subject = S.subject;
  topic = S.topic;
}

T.runTests(T.testGroup({
  'function isEmpty(any)':
    subject(O.isEmpty, {
      '({}) => true': topic({}).to_be(true),
      '({hoge: 0}) => false': topic({hoge: 0}).to_be(false)
    }),
  'function isPrimitive(any)':
    subject(O.isPrimitive, {
      '(undefined) => true': topic(undefined).to_be(true),
      '(null) => true': topic(null).to_be(true),
      '(0) => true': topic(0).to_be(true),
      '(false) => true': topic(false).to_be(true),
      "('') => true": topic('').to_be(true)
      }),
  'function isArray(any)':
    subject(O.isArray, {
      '([]) => true': topic([]).to_be(true),
      '({}) => false': topic({}).to_be(false)
    }),
  'function supplement(default, value, [callback])':
    subject(O.supplement, {
      '(default) => default': topic(10).to_be(10),
      '(default, value) => value': topic(10, 5).to_be(5),
      '(default, value, callback) => callback(default, value)':
        topic(1, -1, Math.max).to_be(1)
    }),
  'function asArray(any)':
    subject(O.asArray, {
      '() => []': topic().to_be([]),
      '(undefined) => []': topic(undefined).to_be([]),
      '(null) => []': topic(null).to_be([]),
      '(false) => [false]': topic(false).to_be([false]),
      '(0) => [0]': topic(0).to_be([0]),
      "('') => []": topic('').to_be([]),
      "('foo') => ['foo']": topic('foo').to_be(['foo']),
      '(function (x, y, ... ) { ... }) => []': topic(function(x, y) {
          return x + y;
        }).to_be([]),
      '(arguments) => [arg1, arg2, arg3, ... ]': (function() {
          return topic(arguments).to_be([1, 2, 3]);
        })(1, 2, 3),
      '([]) => []': topic([]).to_be([]),
      '([1,2,3]) => [1,2,3]': topic([1, 2, 3]).to_be([1, 2, 3])
    })
}));
