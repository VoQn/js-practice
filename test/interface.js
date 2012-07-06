'use strict';

var T,
    S, subject, topic,
    Interface,
    HogeInterface, HugaInterface,
    hoge, piyo;

if (require) {
  T = require('../src/tester');
  S = require('../src/subject');

  subject = S.subject;
  topic = S.topic;

  Interface = require('../src/interface').Interface;
}

HogeInterface = new Interface('HogeInterface', ['hoge']);

HugaInterface = new Interface('HugaInterface', ['huga']);

hoge = {
  hoge: function() {
    return 'hoge';
  }
};

piyo = {
  hoge: function() {
    return 'hoge';
  },
  huga: function() {
    return 'huga';
  }
};

T.runTests(T.testGroup({
   'Interface.ensureImplements(object, [interfaces:)':
     subject(Interface.ensureImplements, {
       'check duck typing of a Interface':
         topic(hoge, HogeInterface).to_be(true),
       'check duck typing of two Interfaces':
         topic(piyo,
               HogeInterface,
               HugaInterface).to_be(true)
     })
}));
// EOF
