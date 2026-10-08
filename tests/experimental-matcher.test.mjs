import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createExperimentalMatcher,
  compareExperimentalMatchers,
} from '../src/api/experimental-matcher.ts'

const matcher = (path, options = {}) =>
  createExperimentalMatcher({ path, applyOptions: false }, options)

test('static routes resolve before dynamic routes', () => {
  const routes = [matcher('/:page'), matcher('/home')].sort(
    compareExperimentalMatchers
  )
  assert.equal(
    routes.find((route) => route.re.test('/home')).record.path,
    '/home'
  )
})

test('optional parameters match the root and decode present values', () => {
  const route = matcher('/:first?/:second?')
  assert.deepEqual(route.parse('/'), { first: null, second: null })
  assert.deepEqual(route.parse('/hello%20world/two'), {
    first: 'hello world',
    second: 'two',
  })
})

test('repeatable parameters produce arrays', () => {
  assert.deepEqual(matcher('/users/:ids+').parse('/users/one/two'), {
    ids: ['one', 'two'],
  })
})

test('options control case and trailing slash matches', () => {
  assert.equal(matcher('/home').re.test('/HOME/'), true)
  assert.equal(matcher('/home', { strict: true }).re.test('/home/'), false)
  assert.equal(matcher('/home', { sensitive: true }).re.test('/HOME'), false)
  assert.equal(
    createExperimentalMatcher(
      { path: '/home', strict: false, sensitive: false, applyOptions: true },
      { strict: true, sensitive: true }
    ).re.test('/HOME/'),
    true
  )
})

test('invalid parameter patterns report an error', () => {
  assert.throws(() => matcher('/:id('), /Invalid segment/)
})

test('catch-all routes resolve after specific routes', () => {
  const routes = [matcher('/home/:all(.*)'), matcher('/home')].sort(
    compareExperimentalMatchers
  )
  assert.equal(
    routes.find((route) => route.re.test('/home')).record.path,
    '/home'
  )
})

test('repeatable catch-all routes match and decode nested paths', () => {
  assert.deepEqual(matcher('/files/:all(.*)*').parse('/files/a/b'), {
    all: ['a', 'b'],
  })
})
