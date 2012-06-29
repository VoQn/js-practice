'use strict';

if (require) {
  var deepEq = require('./eq').deepEq;
}

function Result(success, expected, actual) {
  this.success = success;
  this.expected = expected;
  this.actual = actual;
}

Result.prototype.toString = function () {
  return 'Result { success:' + this.success +
                ', expected:' + this.expected +
                ', actual:' + this.actual + '}';
};

function result(stub) {
  return new Result(stub.success, stub.expected, stub.actual);
}

function Expect(subject) {
  this.subject = subject;
}

Expect.prototype.toString = function () {
  return 'Expected<{' + typeof this.subject + '}: ' + this.subject + '>';
};

Expect.prototype.to = function(should) {
  return should(this.subject);
};

Expect.prototype.not_to = function(should) {
  var r = should(this.subject);
  r.success = !r.success;
  return r;
};

function eq(actual) {
  function evaluate(expected) {
    var is_eq = deepEq(expected, actual);
    return result({
      success: is_eq,
      expected: expected,
      actual: actual
    });
  }
  return evaluate;
}

function expect(subject) {
  return new Expect(subject);
}

if (typeof exports !== 'undefined') {
  exports.expect = expect;
  exports.eq = eq;
}
// EOF
