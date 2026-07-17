import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildShareText,
  calculateItemisedSplit,
  splitEvenly,
  validateCustomShares,
} from './split.js'

const participants = [
  { id: 'a', name: 'Aaryan' },
  { id: 'r', name: 'Riya' },
  { id: 'k', name: 'Kabir' },
]

test('equal split preserves every paise', () => {
  const split = splitEvenly(100_000, participants, 'a')
  assert.deepEqual(split.shares.map((person) => person.sharePaise), [33_334, 33_333, 33_333])
  assert.equal(split.shares.reduce((sum, person) => sum + person.sharePaise, 0), 100_000)
})

test('custom shares validate their exact total', () => {
  const valid = validateCustomShares({ a: '400', r: '350', k: '250' }, participants, 100_000)
  assert.equal(valid.isValid, true)
  assert.equal(valid.assignedPaise, 100_000)

  const invalid = validateCustomShares({ a: '400', r: '300', k: '250' }, participants, 100_000)
  assert.equal(invalid.isValid, false)
  assert.match(invalid.totalError, /must equal/)
})

test('itemised split assigns each line only to selected people', () => {
  const result = calculateItemisedSplit([
    { id: 'dinner', label: 'Dinner', amount: '900', participantIds: ['a', 'r', 'k'] },
    { id: 'dessert', label: 'Dessert', amount: '100', participantIds: ['a'] },
  ], participants, 'a')

  assert.equal(result.isValid, true)
  assert.equal(result.totalPaise, 100_000)
  assert.deepEqual(result.split.shares.map((person) => person.sharePaise), [40_000, 30_000, 30_000])
  assert.equal(result.split.receivablePaise, 60_000)
})

test('share text contains the method and settlement sentences', () => {
  const split = splitEvenly(90_000, participants, 'a')
  const text = buildShareText({
    expenseLabel: 'Dinner',
    totalPaise: 90_000,
    split,
    method: 'equal',
  })
  assert.match(text, /Method: Equal split/)
  assert.match(text, /Riya pays Aaryan ₹300.00/)
})
