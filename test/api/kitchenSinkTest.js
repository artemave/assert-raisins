import { test, it, beforeEach, beforeAll, cleanup } from '../../index.js'

beforeAll(function () {
  console.log('beforeAll')

  cleanup(function () {
    console.log('cleanup beforeAll')
  });
});

beforeEach(function () {
  console.log('beforeEach')

  cleanup(function () {
    console.log('cleanup beforeEach')
  });
});

test('works', function () {
  console.log('test')
});

it('also works', function () {
  console.log('it');
});
