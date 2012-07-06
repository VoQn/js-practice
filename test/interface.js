'use strict';

var T, runTests, testGroup,
    E, expect, subject,
    Interface,
    HogeInterface, HugaInterface,
    hoge, piyo;

if (require) {
  T = require('../src/tester');
  runTests = T.runTests;
  testGroup = T.testGroup;

  E = require('../src/expect');
  expect = E.expect;
  subject = E.subject;

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

runTests(testGroup({
   'Interface.ensureImplements(object, [interfaces:)':
     subject(Interface.ensureImplements, {
       'check duck typing of a Interface':
         function(topic) {
           return topic(hoge, HogeInterface).to_be(true);
         },
       'check duck typing of two Interfaces':
         function(topic) {
           return topic(piyo,
                        HogeInterface,
                        HugaInterface).to_be(true);
         }
     })
}));
// EOF
