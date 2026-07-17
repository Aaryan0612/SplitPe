import {
  FLAT_302_EXPENSES,
  FLAT_302_HOME,
  FLAT_302_MEMBERS,
  FLAT_302_RULES,
  createInitialProposal,
} from './data/flat302.js'
import {
  buildMemberBalances,
  buildMemberBreakdown,
  buildRawRepayments,
  calculateExpenseAllocations,
  simplifyTransfers,
} from './finance/index.js'

export function buildFlat302Model(proposal = createInitialProposal()) {
  const rules = FLAT_302_RULES.map((rule) => (
    rule.id === proposal.id ? proposal : rule
  ))
  const allocations = calculateExpenseAllocations(FLAT_302_EXPENSES, rules)
  const balances = buildMemberBalances(FLAT_302_MEMBERS, allocations)
  const rawRepayments = buildRawRepayments(allocations)
  const { transfers: simplifiedTransfers } = simplifyTransfers(balances)
  const membersById = Object.fromEntries(FLAT_302_MEMBERS.map((member) => [member.id, member]))
  const balancesById = Object.fromEntries(balances.map((balance) => [balance.memberId, balance]))

  return {
    home: FLAT_302_HOME,
    members: FLAT_302_MEMBERS,
    membersById,
    expenses: FLAT_302_EXPENSES,
    rules,
    proposal,
    allocations,
    allocationsById: Object.fromEntries(
      allocations.map((allocation) => [allocation.expense.id, allocation]),
    ),
    balances,
    balancesById,
    rawRepayments,
    simplifiedTransfers,
    viewer: membersById[FLAT_302_HOME.viewerMemberId],
    viewerBalance: balancesById[FLAT_302_HOME.viewerMemberId],
    viewerBreakdown: buildMemberBreakdown(FLAT_302_HOME.viewerMemberId, allocations),
  }
}

export const FLAT_302_PREVIEW = buildFlat302Model()
