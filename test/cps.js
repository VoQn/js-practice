;(function(root) {
  var tester,
      E, expect,
      S, subject,
      cps;
  if (require) {
    tester = require('../src/tester');
    E = require('../src/expect');
    S = require('../src/subject');
    subject = S.subject;
    cps = require('../src/cps');
    expect = E.expect;
  } else {
    tester = root.tester;
    E = root.expect;
    S = root.subject;
    subject = S.subject;
    expect = E.expect;
  }

  tester.runTests(tester.testGroup({
    'cps each(array, iterator, callback)': subject(cps.each, {
      'xs = [], ([1, 2, 3], (x) -> xs.push x + 1) => xs is [2, 3, 4]':
      function(topic) {
        var xs = [], r;
        topic([1, 2, 3],
          function(x, i, next) {
            xs.push(x + 1);
            next(null);
          },
          function(err) {
            r = expect(xs).to_be([2, 3, 4]);
          });
        return r;
      }
    })
  }));
})(this);
