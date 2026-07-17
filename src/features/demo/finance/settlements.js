export function buildRawRepayments(allocations) {
  return allocations.flatMap(({ expense, sharesById }) => (
    expense.participantIds
      .filter((memberId) => memberId !== expense.paidByMemberId && sharesById[memberId] > 0)
      .map((memberId) => ({
        expenseId: expense.id,
        fromMemberId: memberId,
        toMemberId: expense.paidByMemberId,
        amountPaise: sharesById[memberId],
      }))
  ))
}

function byAmountThenId(left, right) {
  return right.amountPaise - left.amountPaise || left.memberId.localeCompare(right.memberId)
}

export function simplifyTransfers(balances) {
  const creditors = balances
    .filter((balance) => balance.netBalancePaise > 0)
    .map((balance) => ({ memberId: balance.memberId, amountPaise: balance.netBalancePaise }))
    .sort(byAmountThenId)
  const debtors = balances
    .filter((balance) => balance.netBalancePaise < 0)
    .map((balance) => ({ memberId: balance.memberId, amountPaise: -balance.netBalancePaise }))
    .sort(byAmountThenId)

  const transfers = []
  let creditorIndex = 0
  let debtorIndex = 0

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    const amountPaise = Math.min(creditor.amountPaise, debtor.amountPaise)

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amountPaise,
    })

    creditor.amountPaise -= amountPaise
    debtor.amountPaise -= amountPaise
    if (creditor.amountPaise === 0) creditorIndex += 1
    if (debtor.amountPaise === 0) debtorIndex += 1
  }

  const residualsById = Object.fromEntries(balances.map((balance) => [
    balance.memberId,
    balance.netBalancePaise,
  ]))
  transfers.forEach((transfer) => {
    residualsById[transfer.fromMemberId] += transfer.amountPaise
    residualsById[transfer.toMemberId] -= transfer.amountPaise
  })

  return { transfers, residualsById }
}
