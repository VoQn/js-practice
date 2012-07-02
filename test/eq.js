
'use strict';

if (require) {
  var expect = require('../src/expect').expect,

      test_module = require('../src/tester'),
      runTests = test_module.runTests,
      testGroup = test_module.testGroup;
}

runTests(testGroup({
  '1 and 1.0 is same number': function () {
    return expect(1).to_eq(1.0);
  },
  '[1, 2, 3] and [1, 2, 3] is same array': function () {
    return expect([1,2,3]).to_eq([1,2,3]);
  },
  "[[1],[2,3]] and [[1,2],[3]] isn't same": function () {
    return expect([[1],[2,3]]).not_to_eq([[1,2],[3]]);
  },
  'two same function is same': function () {
    var i = function () {
      return 'test';
    };
    return expect(i).to_eq(i);
  },
  'two same meaning functions is same': function () {
    var a = function () {
           return 'test';
        },
        b = function () { return 'test'; };
    return expect(a).to_eq(b);
  }
}));
