import test from 'node:test'
import assert from 'node:assert/strict'
import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ENTRIES,
  addHistoryEntry,
  readHistory,
  writeHistory,
} from './history.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

function entry(index) {
  return {
    id: `entry-${index}`,
    savedAt: index,
    expenseLabel: `Expense ${index}`,
    totalPaise: 100,
    payerName: 'Aaryan',
    summaryText: 'Riya pays Aaryan ₹0.50',
    snapshot: {
      expenseName: `Expense ${index}`,
      amount: '1',
      method: 'equal',
      payerId: 'person-aaryan',
      participants: [
        { id: 'person-aaryan', name: 'Aaryan' },
        { id: 'person-riya', name: 'Riya' },
      ],
    },
  }
}

test('history persists and restores valid entries', () => {
  const storage = createStorage()
  const entries = [entry(1), entry(2)]
  assert.equal(writeHistory(storage, entries), true)
  assert.equal(storage.getItem(HISTORY_STORAGE_KEY) !== null, true)
  assert.deepEqual(readHistory(storage), entries)
})

test('history is capped at the most recent entries', () => {
  let entries = []
  for (let index = 0; index < MAX_HISTORY_ENTRIES + 5; index += 1) {
    entries = addHistoryEntry(entries, entry(index))
  }
  assert.equal(entries.length, MAX_HISTORY_ENTRIES)
  assert.equal(entries[0].id, `entry-${MAX_HISTORY_ENTRIES + 4}`)
})

test('malformed storage safely returns an empty history', () => {
  const storage = createStorage()
  storage.setItem(HISTORY_STORAGE_KEY, '{bad json')
  assert.deepEqual(readHistory(storage), [])
})

test('structurally unsafe snapshots are ignored', () => {
  const storage = createStorage()
  const unsafe = {
    ...entry(1),
    snapshot: {
      ...entry(1).snapshot,
      participants: [],
    },
  }
  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([unsafe]))
  assert.deepEqual(readHistory(storage), [])
})
