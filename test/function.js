'use strict';

var F, id, seq, force, apply, curry,
    E, expect, subject,
    T, runTests, testGroup;

if (require) {
  F = require('../src/function');
  id = F.id;
  seq = F.seq;
  force = F.force;
  apply = F.apply;
  curry = F.curry;

  E = require('../src/expect');
  expect = E.expect;
  subject = E.subject;

  T = require('../src/tester');
  runTests = T.runTests;
  testGroup = T.testGroup;
}

function add2Number(x, y) {
  return x + y;
}

runTests(testGroup({
  'id(x) => x': function () {
      return expect(id(10)).to_be(10);
    },
  'seq(x, y) => y': function () {
      return expect(seq(5, 10)).to_be(10);
    },
  'force(promise) => promise()': function () {
      function p() {
        return 5 + 5; // 10
      }
      return expect(force(p)).to_be(10);
    },
  'function apply(arg, ...var_args)': subject(apply,
    {
      '(-10)(Math.abs) => 10': function () {
        return expect(apply(-10)(Math.abs)).to_be(10);
      },
      '(10, 2)(Math.pow) => 100': function (topic) {
        return expect(apply(10, 2)(Math.pow)).to_be(100);
      }
    }),
  'function curry(function, ...var_args)': subject(curry,
    {
      '((x, y) -> x + y)(3)(7) => 10': function () {
        return expect(curry(add2Number)(3)(7)).to_be(10);
      },
      '((x, y) -> x + y)(3, 7) => 10': function () {
        return expect(curry(add2Number)(3, 7)).to_be(10);
      },
      '(((x, y) -> x + y), 3)(7) => 10': function () {
        return expect(curry(add2Number, 3)(7)).to_be(10);
      },
      '(((x, y) -> x + y), 3, 7) => 10': function () {
        return expect(curry(add2Number, 3, 7)).to_be(10);
      }
    })
}));

// EOF
