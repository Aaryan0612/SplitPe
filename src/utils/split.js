const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPaise(paise) {
  return INR_FORMATTER.format(paise / 100)
}

export function parseAmountToPaise(value) {
  const input = String(value).trim()

  if (!input) {
    return { error: 'Enter an amount.' }
  }

  if (!/^\d+(?:\.\d{0,2})?$/.test(input)) {
    return { error: 'Use a positive amount with no more than two decimal places.' }
  }

  const [rupeesPart, decimalPart = ''] = input.split('.')
  const totalPaise = Number(rupeesPart) * 100 + Number(decimalPart.padEnd(2, '0'))

  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
    return { error: 'Amount must be greater than ₹0.' }
  }

  if (totalPaise > 100_000_000) {
    return { error: 'Amount cannot exceed ₹10,00,000.' }
  }

  return { totalPaise }
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

export function splitEvenly(totalPaise, participants, payerId) {
  const participantCount = participants.length
  const baseShare = Math.floor(totalPaise / participantCount)
  const remainder = totalPaise % participantCount

  const shares = participants.map((person, index) => ({
    id: person.id,
    name: person.name.trim(),
    sharePaise: baseShare + (index < remainder ? 1 : 0),
  }))

  const payer = shares.find((person) => person.id === payerId) || shares[0]
  const settlements = shares
    .filter((person) => person.id !== payer.id)
    .map((person) => ({
      fromId: person.id,
      sentence: `${person.name} pays ${payer.name} ${formatPaise(person.sharePaise)}`,
      amountPaise: person.sharePaise,
    }))

  return {
    shares,
    settlements,
    payer,
    baseShare,
    remainder,
    receivablePaise: totalPaise - payer.sharePaise,
  }
}

export function formatPerPersonShare(baseShare, remainder) {
  return remainder > 0
    ? `${formatPaise(baseShare)}–${formatPaise(baseShare + 1)}`
    : formatPaise(baseShare)
}
