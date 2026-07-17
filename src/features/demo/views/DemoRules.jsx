import { Check, Clock3, MessageSquareText, ShieldCheck, X } from 'lucide-react'
import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'
import { splitByWeights } from '../finance/index.js'

const decisionLabels = {
  approved: 'Approved',
  pending: 'Pending',
  changes_requested: 'Changes requested',
  declined: 'Declined',
}

const statusLabels = {
  awaiting_approval: 'Awaiting approval',
  active: 'Active for August',
  revision_required: 'Revision required',
  declined: 'Declined',
}

export default function DemoRules({ model, note, onNoteChange, onDecision }) {
  const proposal = model.proposal
  const electricity = model.expenses.find((expense) => expense.category === 'electricity')
  const augustShares = splitByWeights(
    3_800_000,
    model.members.map((member) => member.id),
    proposal.weights,
  )

  return (
    <section className="demo-view" aria-labelledby="demo-rules-title">
      <div className="demo-page-heading">
        <p className="demo-kicker">Agreements, not assumptions</p>
        <h1 id="demo-rules-title">House rules</h1>
        <p>See the rule behind a split and make future changes visible to everyone affected.</p>
      </div>

      <div className="demo-rule-grid">
        <article className="demo-rule-card">
          <div className="demo-rule-topline">
            <span className="demo-icon-tile"><ShieldCheck size={21} aria-hidden="true" /></span>
            <span className="demo-status demo-status-active">Active · July</span>
          </div>
          <p className="demo-card-label">Rent rule v1</p>
          <h2>Room-weight rent split</h2>
          <p>July rent uses agreed weights of 12, 10, 8 and 8 for Aaryan, Riya, Kabir and Meera.</p>
        </article>
        <article className="demo-rule-card">
          <div className="demo-rule-topline">
            <span className="demo-icon-tile"><ShieldCheck size={21} aria-hidden="true" /></span>
            <span className="demo-status demo-status-active">Active · July</span>
          </div>
          <p className="demo-card-label">Electricity rule v1</p>
          <h2>Fixed equally, usage by days present</h2>
          <p>The {formatPaise(electricity.fixedChargePaise)} fixed charge is equal. The {formatPaise(electricity.usageChargePaise)} usage charge follows days present.</p>
        </article>
      </div>

      <article className="demo-proposal-card">
        <div className="demo-proposal-heading">
          <div>
            <p className="demo-kicker">Proposed for 1 August</p>
            <h2>Updated room-weight rent split</h2>
          </div>
          <span className="demo-status">{statusLabels[proposal.status]}</span>
        </div>
        <p>Kabir’s room weight changes from 8 to 9 and Meera’s from 8 to 7. July remains unchanged.</p>

        <div className="demo-weight-grid" aria-label="August rent preview">
          {model.members.map((member) => (
            <div key={member.id}>
              <span>{member.name}</span>
              <strong>{proposal.weights[member.id]}</strong>
              <small>{formatPaise(augustShares[member.id])} preview</small>
            </div>
          ))}
        </div>

        <div className="demo-consent-list" aria-label="Member decisions">
          {proposal.decisions.map((item) => (
            <div key={item.memberId}>
              <span>
                <strong>{model.membersById[item.memberId].name}</strong>
                {item.note && <small>“{item.note}”</small>}
              </span>
              <span className={`demo-decision demo-decision-${item.decision}`}>
                {item.decision === 'approved' && <Check size={15} aria-hidden="true" />}
                {item.decision === 'pending' && <Clock3 size={15} aria-hidden="true" />}
                {item.decision === 'changes_requested' && <MessageSquareText size={15} aria-hidden="true" />}
                {item.decision === 'declined' && <X size={15} aria-hidden="true" />}
                {decisionLabels[item.decision]}
              </span>
            </div>
          ))}
        </div>

        <div className="demo-consent-box">
          <label htmlFor="proposal-note">Optional note</label>
          <textarea
            id="proposal-note"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows="3"
            placeholder="Add context for your flatmates"
          />
          <div className="demo-consent-actions">
            <button className="button button-primary" type="button" onClick={() => onDecision('approved')}>
              Approve
            </button>
            <button className="button button-secondary" type="button" onClick={() => onDecision('changes_requested')}>
              Request changes
            </button>
            <button className="demo-danger-action" type="button" onClick={() => onDecision('declined')}>
              Decline
            </button>
          </div>
        </div>
        <div className="demo-flat-pact">
          <strong>Flat Pact</strong>
          <p>This is a shared household agreement inside SPLITPE, not a legal contract.</p>
        </div>
        <p className="demo-clarification">This decision applies only to the proposed August rule. It cannot change the already calculated July ledger.</p>
      </article>
    </section>
  )
}
