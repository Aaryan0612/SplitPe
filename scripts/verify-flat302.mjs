import assert from 'node:assert/strict'
import {
  FLAT_302_EXPENSES,
  FLAT_302_MEMBERS,
  FLAT_302_RULES,
  createInitialProposal,
} from '../src/features/demo/data/flat302.js'
import {
  buildMemberBalances,
  buildRawRepayments,
  calculateExpenseAllocations,
  decideOnProposal,
  simplifyTransfers,
  splitByWeights,
} from '../src/features/demo/finance/index.js'

const allocations = calculateExpenseAllocations(FLAT_302_EXPENSES, FLAT_302_RULES)
const allocationById = Object.fromEntries(
  allocations.map((allocation) => [allocation.expense.id, allocation]),
)

assert.deepEqual(allocationById['expense-rent-july'].sharesById, {
  aaryan: 1_200_000,
  riya: 1_000_000,
  kabir: 800_000,
  meera: 800_000,
})
assert.equal(
  Object.values(allocationById['expense-rent-july'].sharesById).reduce((sum, value) => sum + value, 0),
  3_800_000,
)
assert.deepEqual(allocationById['expense-electricity-july'].sharesById, {
  aaryan: 100_000,
  riya: 100_000,
  kabir: 70_000,
  meera: 40_000,
})
assert.equal(
  Object.values(allocationById['expense-electricity-july'].sharesById)
    .reduce((sum, value) => sum + value, 0),
  310_000,
)
assert.deepEqual(allocationById['expense-internet-july'].sharesById, {
  aaryan: 30_000,
  riya: 30_000,
  kabir: 30_000,
  meera: 30_000,
})
assert.equal(
  Object.values(allocationById['expense-internet-july'].sharesById)
    .reduce((sum, value) => sum + value, 0),
  120_000,
)

const balances = buildMemberBalances(FLAT_302_MEMBERS, allocations)
const balanceById = Object.fromEntries(balances.map((balance) => [balance.memberId, balance]))
assert.equal(balanceById.kabir.totalSharePaise, 900_000)
assert.equal(balanceById.kabir.totalPaidPaise, 120_000)
assert.equal(balanceById.kabir.netBalancePaise, -780_000)
assert.equal(balanceById.aaryan.netBalancePaise, 2_470_000)
assert.equal(balanceById.riya.netBalancePaise, -820_000)
assert.equal(balanceById.meera.netBalancePaise, -870_000)
assert.equal(balances.reduce((sum, balance) => sum + balance.netBalancePaise, 0), 0)

const rawRepayments = buildRawRepayments(allocations)
assert.equal(rawRepayments.length, 9)

const simplified = simplifyTransfers(balances)
assert.equal(simplified.transfers.length, 3)
assert.deepEqual(simplified.transfers, [
  { fromMemberId: 'meera', toMemberId: 'aaryan', amountPaise: 870_000 },
  { fromMemberId: 'riya', toMemberId: 'aaryan', amountPaise: 820_000 },
  { fromMemberId: 'kabir', toMemberId: 'aaryan', amountPaise: 780_000 },
])
assert.ok(Object.values(simplified.residualsById).every((balance) => balance === 0))
assert.equal(
  simplified.transfers.reduce((sum, transfer) => sum + transfer.amountPaise, 0),
  balances.filter((balance) => balance.netBalancePaise > 0)
    .reduce((sum, balance) => sum + balance.netBalancePaise, 0),
)

const activatedAugustProposal = decideOnProposal(
  createInitialProposal(),
  'kabir',
  'approved',
)
assert.equal(activatedAugustProposal.status, 'active')
assert.deepEqual(
  calculateExpenseAllocations(FLAT_302_EXPENSES, [
    ...FLAT_302_RULES.filter((rule) => rule.id !== activatedAugustProposal.id),
    activatedAugustProposal,
  ]),
  allocations,
)
assert.deepEqual(
  splitByWeights(3_800_000, FLAT_302_MEMBERS.map((member) => member.id), activatedAugustProposal.weights),
  {
    aaryan: 1_200_000,
    riya: 1_000_000,
    kabir: 900_000,
    meera: 700_000,
  },
)

console.log('Flat 302 financial verification passed: 18 invariants confirmed.')
