import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'

export default function ExpenseBreakdown({ model, expenseId }) {
  const allocation = model.allocationsById[expenseId]
  const { expense } = allocation
  const payer = model.membersById[expense.paidByMemberId]

  return (
    <div className="expense-breakdown">
      <div className="demo-net-row">
        <span>Bill total</span>
        <strong>{formatPaise(expense.amountPaise)}</strong>
      </div>
      <dl className="demo-definition-list">
        <div>
          <dt>Paid by</dt>
          <dd>{payer.name}</dd>
        </div>
        <div>
          <dt>Applied method</dt>
          <dd>
            {allocation.method === 'weighted' && `Room weights · rule v${allocation.rule.version}`}
            {allocation.method === 'fixed_and_occupancy' && 'Fixed equally + usage by days present'}
            {allocation.method === 'equal' && 'Equal split'}
          </dd>
        </div>
      </dl>
      <div className="demo-share-table" role="table" aria-label="Member shares">
        {model.members.map((member) => (
          <div key={member.id} role="row">
            <span role="cell">
              <strong>{member.name}</strong>
              {allocation.method === 'weighted' && <small>Weight {allocation.rule.weights[member.id]} of {allocation.totalWeight}</small>}
              {allocation.method === 'fixed_and_occupancy' && <small>{expense.occupancyDays[member.id]} days present</small>}
              {allocation.method === 'equal' && <small>1 of {expense.participantIds.length} equal shares</small>}
            </span>
            <strong role="cell">{formatPaise(allocation.sharesById[member.id])}</strong>
          </div>
        ))}
      </div>
      {allocation.method === 'fixed_and_occupancy' && (
        <p className="demo-explanation">
          The fixed {formatPaise(expense.fixedChargePaise)} is equal. The remaining {formatPaise(expense.usageChargePaise)} follows 90 recorded occupancy days.
        </p>
      )}
      {allocation.method === 'weighted' && (
        <p className="demo-explanation">
          The active July agreement uses a total room weight of {allocation.totalWeight}. Remainder paise are assigned deterministically.
        </p>
      )}
      {allocation.method === 'equal' && (
        <p className="demo-explanation">The total is divided equally in integer paise across all four flatmates.</p>
      )}
    </div>
  )
}
