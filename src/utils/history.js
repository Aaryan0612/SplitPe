export const HISTORY_STORAGE_KEY = 'splitpe:expense-history:v1'
export const MAX_HISTORY_ENTRIES = 20

function isHistoryEntry(value) {
  const participants = value?.snapshot?.participants
  const participantIds = Array.isArray(participants)
    ? participants.map((person) => person?.id)
    : []
  const hasValidParticipants = Array.isArray(participants)
    && participants.length >= 2
    && participants.length <= 6
    && participants.every((person) => (
      person
      && typeof person.id === 'string'
      && person.id
      && typeof person.name === 'string'
    ))
    && new Set(participantIds).size === participantIds.length
  const method = value?.snapshot?.method

  return Boolean(
    value
      && typeof value === 'object'
      && typeof value.id === 'string'
      && value.id
      && Number.isFinite(value.savedAt)
      && typeof value.expenseLabel === 'string'
      && Number.isSafeInteger(value.totalPaise)
      && value.totalPaise > 0
      && typeof value.payerName === 'string'
      && typeof value.summaryText === 'string'
      && value.snapshot
      && typeof value.snapshot.expenseName === 'string'
      && typeof value.snapshot.amount === 'string'
      && ['equal', 'custom', 'itemised'].includes(method)
      && hasValidParticipants
      && participantIds.includes(value.snapshot.payerId)
      && (method !== 'itemised' || Array.isArray(value.snapshot.items)),
  )
}

export function readHistory(storage) {
  if (!storage) return []
  try {
    const parsed = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY_ENTRIES)
  } catch {
    return []
  }
}

export function writeHistory(storage, entries) {
  if (!storage) return false
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY_ENTRIES)))
    return true
  } catch {
    return false
  }
}

export function addHistoryEntry(entries, entry) {
  return [entry, ...entries.filter((existing) => existing.id !== entry.id)]
    .slice(0, MAX_HISTORY_ENTRIES)
}
