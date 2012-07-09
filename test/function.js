'use strict';

var F, apply, curry,
    E, expect,
    S, subject, topic,
    T;

if (require) {
  F = require('../src/function');
  apply = F.apply;
  curry = F.curry;

  E = require('../src/expect');
  expect = E.expect;
  S = require('../src/subject');
  subject = S.subject;
  topic = S.topic;

  T = require('../src/tester');
}

function add2Number(x, y) {
  return x + y;
}

T.runTests(T.testGroup({
  'id(x) => x': subject(F.id, {
      '(10) => 10': topic(10).to_be(10)
    }),
  'seq(x, y) => y': subject(F.seq, {
      '(5, 10) => 10': topic(5, 10).to_be(10)
    }),
  'force(promise) => promise()': subject(F.force, {
      '(() -> 5 + 5) => 10': topic(function() {
          return 5 + 5;
        }).to_be(10)
    }),
  'function apply(arg, ...var_args)':
    subject(apply, {
      '(-10)(Math.abs) => 10':
        expect(apply(-10)(Math.abs)).to_be(10),
      '(10, 2)(Math.pow) => 100':
        expect(apply(10, 2)(Math.pow)).to_be(100)
    }),
  'function curry(function, ...var_args)': subject(curry,
    {
      '((x, y) -> x + y)(3)(7) => 10':
        expect(curry(add2Number)(3)(7)).to_be(10),
      '((x, y) -> x + y)(3, 7) => 10':
        expect(curry(add2Number)(3, 7)).to_be(10),
      '(((x, y) -> x + y), 3)(7) => 10':
        expect(curry(add2Number, 3)(7)).to_be(10),
      '(((x, y) -> x + y), 3, 7) => 10':
        expect(curry(add2Number, 3, 7)).to_be(10)
    })/**,
  'わざとテストコケさした場合(x) -> x': subject(F.id,
    {
      'アサーションでコケてる(1) => 0': topic(1).to_be(0),
      '実行時でエラー': function(f) {
        return expect(f(undefined_identifier)).to_be(true);
      }
    })
  */
}));

// EOF
