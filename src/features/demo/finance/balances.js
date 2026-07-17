import { splitByWeights, splitEqually, splitFixedAndOccupancy } from './splits.js'

export function calculateExpenseAllocation(expense, rules) {
  if (expense.category === 'rent') {
    const rule = rules.find((candidate) => candidate.id === expense.ruleId)
    if (!rule) throw new Error(`Missing rule ${expense.ruleId}.`)
    return {
      expense,
      rule,
      method: 'weighted',
      sharesById: splitByWeights(expense.amountPaise, expense.participantIds, rule.weights),
      totalWeight: expense.participantIds.reduce((sum, id) => sum + rule.weights[id], 0),
    }
  }

  if (expense.category === 'electricity') {
    const rule = rules.find((candidate) => candidate.id === expense.ruleId)
    if (!rule) throw new Error(`Missing rule ${expense.ruleId}.`)
    return {
      expense,
      rule,
      method: 'fixed_and_occupancy',
      ...splitFixedAndOccupancy(expense),
    }
  }

  if (expense.splitMethod === 'equal') {
    return {
      expense,
      rule: null,
      method: 'equal',
      sharesById: splitEqually(expense.amountPaise, expense.participantIds),
    }
  }

  throw new Error(`Unsupported split configuration for ${expense.id}.`)
}

export function calculateExpenseAllocations(expenses, rules) {
  return expenses.map((expense) => calculateExpenseAllocation(expense, rules))
}

export function buildMemberBalances(members, allocations) {
  const balancesById = Object.fromEntries(members.map((member) => [
    member.id,
    {
      memberId: member.id,
      name: member.name,
      totalSharePaise: 0,
      totalPaidPaise: 0,
      netBalancePaise: 0,
    },
  ]))

  allocations.forEach(({ expense, sharesById }) => {
    Object.entries(sharesById).forEach(([memberId, sharePaise]) => {
      balancesById[memberId].totalSharePaise += sharePaise
    })
    balancesById[expense.paidByMemberId].totalPaidPaise += expense.amountPaise
  })

  Object.values(balancesById).forEach((balance) => {
    balance.netBalancePaise = balance.totalPaidPaise - balance.totalSharePaise
  })

  return members.map((member) => balancesById[member.id])
}

export function buildMemberBreakdown(memberId, allocations) {
  return allocations.map((allocation) => ({
    expenseId: allocation.expense.id,
    title: allocation.expense.title,
    category: allocation.expense.category,
    amountPaise: allocation.expense.amountPaise,
    paidByMemberId: allocation.expense.paidByMemberId,
    sharePaise: allocation.sharesById[memberId],
    method: allocation.method,
    rule: allocation.rule,
    fixedSharePaise: allocation.fixedSharesById?.[memberId],
    usageSharePaise: allocation.usageSharesById?.[memberId],
    occupancyDays: allocation.expense.occupancyDays?.[memberId],
    totalOccupancyDays: allocation.totalOccupancyDays,
    weight: allocation.rule?.weights?.[memberId],
    totalWeight: allocation.totalWeight,
    participantCount: allocation.expense.participantIds.length,
  }))
}
