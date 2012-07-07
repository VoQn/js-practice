'use strict';

var S, subject, topic,
    E, expect,
    T,
    TP, Tuple, tuple;

if (require) {
  S = require('../src/subject');
  E = require('../src/expect');
  T = require('../src/tester');
  TP = require('../src/tuple');

  subject = S.subject;
  topic = S.topic;

  expect = E.expect;

  Tuple = TP.Tuple;
  tuple = TP.tuple;
}

T.runTests(T.testGroup({
  'Tuple constructor': subject(tuple, {
    '(2, 3) => (2, 3)':
      topic(2, 3).to_be(new Tuple(2, 3)),
    '(2) => (2, null)':
      topic(2).to_be(new Tuple(2, null)),
    '() => (null, null)':
      topic().to_be(new Tuple(null, null))
  }),
  'example t:tuple(10, "test")': subject(tuple(10, 'test'), {
    't.fst => 10': function(t) {
      return expect(t.fst).to_be(10);
    },
    't.snd => "test"': function(t) {
      return expect(t.snd).to_be('test');
    },
    "t.toString() => '(10, \"test\")'": function(t) {
      return expect(t.toString()).to_be('(10, "test")');
    }
  })
}));
