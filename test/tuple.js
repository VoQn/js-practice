'use strict';

var S, subject, topic,
    T,
    TP, Tuple, tuple;

if (require) {
  S = require('../src/subject');
  T = require('../src/tester');
  TP = require('../src/tuple');

  subject = S.subject;
  topic = S.topic;

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
  })
}));
