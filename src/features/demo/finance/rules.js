export const MEMBER_DECISIONS = ['pending', 'approved', 'changes_requested', 'declined']

export function deriveProposalStatus(decisions) {
  if (decisions.some((decision) => decision.decision === 'declined')) return 'declined'
  if (decisions.some((decision) => decision.decision === 'changes_requested')) {
    return 'revision_required'
  }
  if (decisions.every((decision) => decision.decision === 'approved')) return 'active'
  return 'awaiting_approval'
}

export function decideOnProposal(proposal, memberId, decision, note = '') {
  if (!MEMBER_DECISIONS.includes(decision) || decision === 'pending') {
    throw new TypeError('Choose an explicit consent decision.')
  }
  const decisions = proposal.decisions.map((memberDecision) => (
    memberDecision.memberId === memberId
      ? { ...memberDecision, decision, note: note.trim() }
      : { ...memberDecision }
  ))
  if (!decisions.some((memberDecision) => memberDecision.memberId === memberId)) {
    throw new Error(`Member ${memberId} is not affected by this proposal.`)
  }
  return {
    ...proposal,
    decisions,
    status: deriveProposalStatus(decisions),
  }
}
