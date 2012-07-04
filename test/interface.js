'use strict';

if (require) {
  var T = require('../src/tester'),
      runTests = T.runTests,
      testGroup = T.testGroup,

      expect = require('../src/expect').expect,

      Interface = require('../src/interface').Interface;
}

var ensure = Interface.ensureImplements;

var HogeInterface = new Interface('HogeInterface', [
      'hoge'
    ]);

var HugaInterface = new Interface('HugaInterface', [
      'huga'
    ]);

runTests(testGroup({
   'duck typing of a Interface':
     function () {
       var hoge = {
         hoge: function () {
           return 'hoge';
         }
       };
       return expect(ensure(hoge, HogeInterface)).to_eq(true);
     },
  'duck typing of two Interfaces':
    function () {
      var piyo = {
        hoge: function () { return 'hoge'; },
        huga: function () { return 'huga'; }
      };
      return expect(ensure(piyo, HogeInterface, HugaInterface)).to_eq(true);
    }
}));
// EOF
