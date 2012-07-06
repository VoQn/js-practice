'use strict';

var O, supplement,
    E, expect,
    S, subject, topic,
    T;
if (require) {
  O = require('../src/object');
  E = require('../src/expect');
  S = require('../src/subject');
  T = require('../src/tester');

  supplement = O.supplement;
  expect = E.expect;
  subject = S.subject;
  topic = S.topic;
}

function Person(name, age) {
  this.name = name;
  this.age = supplement(0, age, Math.max);
}

Person.prototype = {
  toString: function() {
    return 'Person named ' + this.name +
           ', age ' + this.age;
  },
  greet: function() {
    return 'Hi, my name is ' + this.name + '.';
  },
  tellOwnAge: function() {
    return "I'm " + this.age + ' years old.';
  }
};

function person(name, age) {
  return new Person(name, age);
}

T.runTests(T.testGroup({
  'constructor': subject(person, {
    'new person': topic('Bob').to_be(new Person('Bob')),
    'different age': topic('Bob', 16).not_to_be(new Person('Bob', 23))
  }),
  'example person "toby"': subject(person('Tony', 15), {
    'he can greet': function(he) {
      return expect(he.greet()).to_be('Hi, my name is Tony.');
    },
    'he can tell us his age': function(he) {
      return expect(he.tellOwnAge()).to_be("I'm 15 years old.");
    }
  })
}));
