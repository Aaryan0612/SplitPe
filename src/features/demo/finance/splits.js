function assertNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer.`)
  }
}

function assertParticipantIds(participantIds) {
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new TypeError('At least one participant is required.')
  }
  if (new Set(participantIds).size !== participantIds.length) {
    throw new TypeError('Participant IDs must be unique.')
  }
}

export function allocateProportionally(totalPaise, participantIds, weightsById) {
  assertNonNegativeInteger(totalPaise, 'Total paise')
  assertParticipantIds(participantIds)

  const weights = participantIds.map((id) => {
    const weight = weightsById[id]
    if (!Number.isSafeInteger(weight) || weight < 0) {
      throw new TypeError(`Weight for ${id} must be a non-negative integer.`)
    }
    return weight
  })
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) throw new TypeError('Total weight must be greater than zero.')

  const sharesById = {}
  let assignedPaise = 0

  participantIds.forEach((id, index) => {
    const sharePaise = Math.floor((totalPaise * weights[index]) / totalWeight)
    sharesById[id] = sharePaise
    assignedPaise += sharePaise
  })

  let remainderPaise = totalPaise - assignedPaise
  for (let index = 0; remainderPaise > 0; index = (index + 1) % participantIds.length) {
    const id = participantIds[index]
    if (weightsById[id] > 0) {
      sharesById[id] += 1
      remainderPaise -= 1
    }
  }

  return sharesById
}

export function splitEqually(totalPaise, participantIds) {
  return allocateProportionally(
    totalPaise,
    participantIds,
    Object.fromEntries(participantIds.map((id) => [id, 1])),
  )
}

export function splitByWeights(totalPaise, participantIds, weightsById) {
  return allocateProportionally(totalPaise, participantIds, weightsById)
}

export function splitFixedAndOccupancy({
  fixedChargePaise,
  usageChargePaise,
  participantIds,
  occupancyDays,
}) {
  assertNonNegativeInteger(fixedChargePaise, 'Fixed charge')
  assertNonNegativeInteger(usageChargePaise, 'Usage charge')
  const fixedSharesById = splitEqually(fixedChargePaise, participantIds)
  const usageSharesById = allocateProportionally(
    usageChargePaise,
    participantIds,
    occupancyDays,
  )
  const sharesById = Object.fromEntries(participantIds.map((id) => [
    id,
    fixedSharesById[id] + usageSharesById[id],
  ]))

  return {
    sharesById,
    fixedSharesById,
    usageSharesById,
    totalOccupancyDays: participantIds.reduce((sum, id) => sum + occupancyDays[id], 0),
  }
}
