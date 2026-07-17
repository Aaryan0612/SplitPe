import { ArrowRight, Check, Download, Share2 } from 'lucide-react'
import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'

export default function DemoSettle({ model, julyStatus, onCloseMonth, onDownload, onShare }) {
  const viewerTransfer = model.simplifiedTransfers.find(
    (transfer) => transfer.fromMemberId === model.viewer.id,
  )

  if (julyStatus === 'open') {
    return (
      <section className="demo-view" aria-labelledby="demo-settle-title">
        <div className="demo-page-heading">
          <p className="demo-kicker">Month close</p>
          <h1 id="demo-settle-title">Settle July clearly</h1>
          <p>Review the household result before closing the month. No payment is made here.</p>
        </div>
        <article className="demo-close-card">
          <p className="demo-card-label">All 3 expenses ready</p>
          <h2>{model.rawRepayments.length} repayments become {model.simplifiedTransfers.length} transfers.</h2>
          <p>Every member’s final balance stays exactly the same; only the number of transfers is reduced.</p>
          <div className="demo-transfer-preview">
            {model.simplifiedTransfers.map((transfer) => (
              <div key={`${transfer.fromMemberId}-${transfer.toMemberId}`}>
                <span>{model.membersById[transfer.fromMemberId].name} pays {model.membersById[transfer.toMemberId].name}</span>
                <strong>{formatPaise(transfer.amountPaise)}</strong>
              </div>
            ))}
          </div>
          <button className="button button-primary demo-primary-wide" type="button" onClick={onCloseMonth}>
            Review and close July
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="demo-action-note">Closing July is a demo state change. SPLITPE does not process payments.</p>
        </article>
      </section>
    )
  }

  return (
    <section className="demo-view" aria-labelledby="demo-settle-title">
      <div className="demo-page-heading">
        <p className="demo-kicker">Month closed</p>
        <h1 id="demo-settle-title">July is clear.</h1>
        <p>The final household transfers are ready to share. This is a settlement plan, not payment confirmation.</p>
      </div>
      <article className="demo-recommendation-card">
        <span className="demo-success-mark"><Check size={22} aria-hidden="true" /></span>
        <p className="demo-card-label">July closed · Recommended transfer</p>
        <strong>{formatPaise(viewerTransfer.amountPaise)}</strong>
        <p>Pay {model.membersById[viewerTransfer.toMemberId].name}</p>
      </article>
      <div className="demo-route-grid">
        <article>
          <p className="demo-card-label">Your balance</p>
          <h2>You owe {formatPaise(-model.viewerBalance.netBalancePaise)}</h2>
          <p>Based on your July expense shares and payments.</p>
        </article>
        <article>
          <p className="demo-card-label">Recommended transfer</p>
          <h2>Pay {model.membersById[viewerTransfer.toMemberId].name} {formatPaise(viewerTransfer.amountPaise)}</h2>
          <p>This is the simplest route for your unchanged balance.</p>
        </article>
      </div>
      <div className="demo-final-transfers">
        {model.simplifiedTransfers.map((transfer) => (
          <div key={`${transfer.fromMemberId}-${transfer.toMemberId}`}>
            <span>
              <strong>{model.membersById[transfer.fromMemberId].name}</strong>
              <small>pays {model.membersById[transfer.toMemberId].name}</small>
            </span>
            <strong>{formatPaise(transfer.amountPaise)}</strong>
          </div>
        ))}
      </div>
      <div className="demo-export-actions">
        <button className="button button-primary" type="button" onClick={onDownload}>
          <Download size={18} aria-hidden="true" />
          Download settlement card
        </button>
        {typeof navigator.share === 'function' && (
          <button className="button button-secondary" type="button" onClick={onShare}>
            <Share2 size={18} aria-hidden="true" />
            Share summary
          </button>
        )}
      </div>
      <p className="demo-route-explanation">SPLITPE reduced the household from {model.rawRepayments.length} repayments to {model.simplifiedTransfers.length} transfers. This changes the payment route, not your balance.</p>
      <details className="demo-simplification">
        <summary>See how this was simplified</summary>
        <div>
          <p><strong>Raw relationships · {model.rawRepayments.length}</strong></p>
          {model.rawRepayments.map((repayment, index) => (
            <p key={`${repayment.expenseId}-${repayment.fromMemberId}-${index}`}>
              {model.membersById[repayment.fromMemberId].name} → {model.membersById[repayment.toMemberId].name} · {formatPaise(repayment.amountPaise)}
            </p>
          ))}
          <p><strong>Final routes · {model.simplifiedTransfers.length}</strong></p>
          {model.simplifiedTransfers.map((transfer) => (
            <p key={`final-${transfer.fromMemberId}-${transfer.toMemberId}`}>
              {model.membersById[transfer.fromMemberId].name} → {model.membersById[transfer.toMemberId].name} · {formatPaise(transfer.amountPaise)}
            </p>
          ))}
        </div>
      </details>
      <p className="demo-context-note">This settlement plan does not confirm payment. SPLITPE does not verify payment completion.</p>
    </section>
  )
}
