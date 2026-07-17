import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'

function formulaFor(item, viewerName) {
  if (item.method === 'weighted') {
    return `${viewerName}'s weight ${item.weight} of ${item.totalWeight} · ${formatPaise(item.sharePaise)}`
  }
  if (item.method === 'fixed_and_occupancy') {
    return `Fixed ${formatPaise(item.fixedSharePaise)} + ${item.occupancyDays}/${item.totalOccupancyDays} usage days ${formatPaise(item.usageSharePaise)}`
  }
  return `Equal share across ${item.participantCount} flatmates · ${formatPaise(item.sharePaise)}`
}

export default function BalanceBreakdown({ model }) {
  const balance = model.viewerBalance

  return (
    <div className="balance-breakdown">
      <div className="demo-summary-grid">
        <div>
          <span>Your assigned share</span>
          <strong>{formatPaise(balance.totalSharePaise)}</strong>
        </div>
        <div>
          <span>You already paid</span>
          <strong>{formatPaise(balance.totalPaidPaise)}</strong>
        </div>
      </div>
      <div className="demo-net-row">
        <span>Amount you owe</span>
        <strong>{formatPaise(-balance.netBalancePaise)}</strong>
      </div>
      <div className="demo-breakdown-list">
        {model.viewerBreakdown.map((item) => {
          const payer = model.membersById[item.paidByMemberId]
          return (
            <details key={item.expenseId} className="demo-breakdown-item">
              <summary>
                <span>
                  <strong>{item.title}</strong>
                  <small>{formulaFor(item, model.viewer.name)}</small>
                </span>
                <strong>{formatPaise(item.sharePaise)}</strong>
              </summary>
              <div className="demo-detail-copy">
                <p>Bill total: {formatPaise(item.amountPaise)} · Paid by {payer.name}.</p>
                <p>{formulaFor(item, model.viewer.name)}.</p>
              </div>
            </details>
          )
        })}
      </div>
      <p className="demo-explanation">
        Your balance is your assigned share across all three expenses, minus the internet bill you paid.
      </p>
    </div>
  )
}
