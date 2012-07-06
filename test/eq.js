
'use strict';

if (require) {
  var T = require('../src/tester'),
      runTests = T.runTests,
      testGroup = T.testGroup,

      expect = require('../src/expect').expect;
}

runTests(testGroup({
  '1 and 1.0 is same number':
    expect(1).to_be(1.0),
  '[1, 2, 3] and [1, 2, 3] is same array':
    expect([1, 2, 3]).to_be([1, 2, 3]),
  "[[1],[2,3]] and [[1,2],[3]] isn't same":
    expect([[1], [2, 3]]).not_to_be([[1, 2], [3]]),
  'two same function is same': function() {
    var i = function() {
      return 'test';
    };
    return expect(i).to_be(i);
  },
  'two same meaning functions is same': function() {
    var a = function() {
           return 'test';
        },
        b = function() { return 'test'; };
    return expect(a).to_be(b);
  }
}));
