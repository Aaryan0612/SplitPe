const MAX_TOTAL_PAISE = 100_000_000

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const SPLIT_METHOD_LABELS = {
  equal: 'Equal split',
  custom: 'Custom amounts',
  itemised: 'Itemised split',
}

export function formatPaise(paise) {
  return INR_FORMATTER.format(paise / 100)
}

function parseDecimalToPaise(value, { allowZero = false, emptyMessage = 'Enter an amount.' } = {}) {
  const input = String(value).trim()

  if (!input) {
    return { error: emptyMessage }
  }

  if (!/^\d+(?:\.\d{0,2})?$/.test(input)) {
    return { error: 'Use a positive amount with no more than two decimal places.' }
  }

  const [rupeesPart, decimalPart = ''] = input.split('.')
  const totalPaise = Number(rupeesPart) * 100 + Number(decimalPart.padEnd(2, '0'))

  if (!Number.isSafeInteger(totalPaise) || totalPaise < 0 || (!allowZero && totalPaise === 0)) {
    return { error: allowZero ? 'Amount cannot be negative.' : 'Amount must be greater than ₹0.' }
  }

  if (totalPaise > MAX_TOTAL_PAISE) {
    return { error: 'Amount cannot exceed ₹10,00,000.' }
  }

  return { totalPaise }
}

export function parseAmountToPaise(value) {
  return parseDecimalToPaise(value)
}

export function parseShareToPaise(value) {
  return parseDecimalToPaise(value, {
    allowZero: true,
    emptyMessage: 'Enter this person’s share.',
  })
}

export function validateParticipants(participants) {
  const trimmedNames = participants.map((person) => person.name.trim())
  const counts = trimmedNames.reduce((map, name) => {
    const key = name.toLocaleLowerCase('en-IN')
    if (key) map.set(key, (map.get(key) || 0) + 1)
    return map
  }, new Map())

  const errors = trimmedNames.map((name) => {
    if (!name) return 'Enter a name.'
    if ((counts.get(name.toLocaleLowerCase('en-IN')) || 0) > 1) {
      return 'Names must be unique.'
    }
    return ''
  })

  return { errors, trimmedNames, isValid: errors.every((error) => !error) }
}

function allocateEvenly(totalPaise, participantIds) {
  const baseShare = Math.floor(totalPaise / participantIds.length)
  const remainder = totalPaise % participantIds.length
  const sharesById = Object.fromEntries(
    participantIds.map((id, index) => [id, baseShare + (index < remainder ? 1 : 0)]),
  )
  return { sharesById, baseShare, remainder }
}

export function splitWithShares(totalPaise, participants, payerId, sharesById, metadata = {}) {
  const shares = participants.map((person) => ({
    id: person.id,
    name: person.name.trim(),
    sharePaise: sharesById[person.id] || 0,
  }))

  const payer = shares.find((person) => person.id === payerId) || shares[0]
  const settlements = shares
    .filter((person) => person.id !== payer.id && person.sharePaise > 0)
    .map((person) => ({
      fromId: person.id,
      sentence: `${person.name} pays ${payer.name} ${formatPaise(person.sharePaise)}`,
      amountPaise: person.sharePaise,
    }))

  return {
    shares,
    settlements,
    payer,
    receivablePaise: totalPaise - payer.sharePaise,
    ...metadata,
  }
}

export function splitEvenly(totalPaise, participants, payerId) {
  const allocation = allocateEvenly(
    totalPaise,
    participants.map((person) => person.id),
  )
  return splitWithShares(totalPaise, participants, payerId, allocation.sharesById, {
    baseShare: allocation.baseShare,
    remainder: allocation.remainder,
  })
}

export function validateCustomShares(customShares, participants, totalPaise) {
  const errorsById = {}
  const sharesById = {}
  let assignedPaise = 0

  participants.forEach((person) => {
    const result = parseShareToPaise(customShares[person.id] ?? '')
    if (result.error) {
      errorsById[person.id] = result.error
      return
    }
    sharesById[person.id] = result.totalPaise
    assignedPaise += result.totalPaise
  })

  const hasFieldErrors = Object.keys(errorsById).length > 0
  const totalError = !hasFieldErrors && assignedPaise !== totalPaise
    ? `Shares total ${formatPaise(assignedPaise)}. They must equal ${formatPaise(totalPaise)}.`
    : ''

  return {
    errorsById,
    sharesById,
    assignedPaise,
    totalError,
    isValid: !hasFieldErrors && !totalError,
  }
}

export function calculateItemisedSplit(items, participants, payerId) {
  const validParticipantIds = new Set(participants.map((person) => person.id))
  const sharesById = Object.fromEntries(participants.map((person) => [person.id, 0]))
  const errorsById = {}
  const itemSummaries = []
  let totalPaise = 0

  items.forEach((item, itemIndex) => {
    const itemErrors = {}
    const label = item.label.trim()
    const amountResult = parseAmountToPaise(item.amount)
    const includedIds = participants
      .filter((person) => item.participantIds.includes(person.id) && validParticipantIds.has(person.id))
      .map((person) => person.id)

    if (!label) itemErrors.label = 'Enter an item name.'
    if (amountResult.error) itemErrors.amount = amountResult.error
    if (includedIds.length === 0) itemErrors.participants = 'Choose at least one person.'

    if (Object.keys(itemErrors).length > 0) {
      errorsById[item.id] = itemErrors
      return
    }

    totalPaise += amountResult.totalPaise
    const allocation = allocateEvenly(amountResult.totalPaise, includedIds)
    includedIds.forEach((id) => {
      sharesById[id] += allocation.sharesById[id]
    })
    itemSummaries.push({
      id: item.id,
      label,
      amountPaise: amountResult.totalPaise,
      participantCount: includedIds.length,
      itemNumber: itemIndex + 1,
    })
  })

  let totalError = ''
  if (Object.keys(errorsById).length === 0 && totalPaise === 0) {
    totalError = 'Add at least one item with a positive amount.'
  } else if (totalPaise > MAX_TOTAL_PAISE) {
    totalError = 'Item total cannot exceed ₹10,00,000.'
  }

  const isValid = Object.keys(errorsById).length === 0 && !totalError

  return {
    errorsById,
    totalError,
    totalPaise,
    itemSummaries,
    isValid,
    split: isValid
      ? splitWithShares(totalPaise, participants, payerId, sharesById, {
          itemCount: itemSummaries.length,
        })
      : null,
  }
}

export function formatPerPersonShare(baseShare, remainder) {
  return remainder > 0
    ? `${formatPaise(baseShare)}–${formatPaise(baseShare + 1)}`
    : formatPaise(baseShare)
}

export function buildShareText({ expenseLabel, totalPaise, split, method }) {
  const lines = [
    `SPLITPE — ${expenseLabel}`,
    `Total: ${formatPaise(totalPaise)} · Paid by ${split.payer.name}`,
    `Method: ${SPLIT_METHOD_LABELS[method]}`,
    '',
  ]

  if (split.settlements.length > 0) {
    lines.push(...split.settlements.map((settlement) => settlement.sentence))
  } else {
    lines.push('No repayments are needed.')
  }

  return lines.join('\n')
}
