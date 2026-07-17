export const FLAT_302_HOME = {
  id: 'flat-302',
  name: 'Flat 302',
  currentCycle: '2026-07',
  viewerMemberId: 'kabir',
  demo: true,
}

export const FLAT_302_MEMBERS = [
  { id: 'aaryan', name: 'Aaryan' },
  { id: 'riya', name: 'Riya' },
  { id: 'kabir', name: 'Kabir' },
  { id: 'meera', name: 'Meera' },
]

export const FLAT_302_RULES = [
  {
    id: 'rent-rule-v1',
    category: 'rent',
    version: 1,
    name: 'Room-weight rent split',
    effectiveFrom: '2026-07-01',
    status: 'active',
    weights: {
      aaryan: 12,
      riya: 10,
      kabir: 8,
      meera: 8,
    },
  },
  {
    id: 'electricity-rule-v1',
    category: 'electricity',
    version: 1,
    name: 'Fixed equally, usage by days present',
    effectiveFrom: '2026-07-01',
    status: 'active',
  },
  {
    id: 'rent-rule-v2',
    category: 'rent',
    version: 2,
    name: 'Updated room-weight rent split',
    effectiveFrom: '2026-08-01',
    status: 'awaiting_approval',
    supersedesRuleId: 'rent-rule-v1',
    weights: {
      aaryan: 12,
      riya: 10,
      kabir: 9,
      meera: 7,
    },
    decisions: [
      { memberId: 'aaryan', decision: 'approved', note: '' },
      { memberId: 'riya', decision: 'approved', note: '' },
      { memberId: 'kabir', decision: 'pending', note: '' },
      { memberId: 'meera', decision: 'approved', note: '' },
    ],
  },
]

export const FLAT_302_EXPENSES = [
  {
    id: 'expense-rent-july',
    cycle: '2026-07',
    title: 'July rent',
    category: 'rent',
    amountPaise: 3_800_000,
    paidByMemberId: 'aaryan',
    participantIds: ['aaryan', 'riya', 'kabir', 'meera'],
    ruleId: 'rent-rule-v1',
  },
  {
    id: 'expense-electricity-july',
    cycle: '2026-07',
    title: 'July electricity',
    category: 'electricity',
    amountPaise: 310_000,
    fixedChargePaise: 40_000,
    usageChargePaise: 270_000,
    paidByMemberId: 'riya',
    participantIds: ['aaryan', 'riya', 'kabir', 'meera'],
    occupancyDays: {
      aaryan: 30,
      riya: 30,
      kabir: 20,
      meera: 10,
    },
    ruleId: 'electricity-rule-v1',
  },
  {
    id: 'expense-internet-july',
    cycle: '2026-07',
    title: 'July internet',
    category: 'internet',
    amountPaise: 120_000,
    paidByMemberId: 'kabir',
    participantIds: ['aaryan', 'riya', 'kabir', 'meera'],
    splitMethod: 'equal',
  },
]

export function createInitialProposal() {
  const proposal = FLAT_302_RULES.find((rule) => rule.id === 'rent-rule-v2')
  return {
    ...proposal,
    weights: { ...proposal.weights },
    decisions: proposal.decisions.map((decision) => ({ ...decision })),
  }
}
