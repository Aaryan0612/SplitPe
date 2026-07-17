import { ArrowRight, CalendarCheck2, FileWarning, ReceiptText } from 'lucide-react'
import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'

export default function DemoHome({ model, onNavigate, onOpenBalance }) {
  const owedPaise = -model.viewerBalance.netBalancePaise

  return (
    <section className="demo-view" aria-labelledby="demo-home-title">
      <div className="demo-page-heading">
        <p className="demo-kicker">Your shared home</p>
        <h1 id="demo-home-title">Flat 302 · July</h1>
        <p>One clear view of this month’s expenses, agreements and settlement.</p>
      </div>

      <div className="demo-home-grid">
        <article className="demo-balance-card">
          <span className="demo-card-label">Your balance</span>
          <strong>{formatPaise(owedPaise)}</strong>
          <p>You owe this month</p>
          <button className="demo-text-action demo-text-action-on-dark" type="button" onClick={onOpenBalance}>
            See why this amount
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </article>

        <article className="demo-attention-card">
          <span className="demo-icon-tile"><FileWarning size={21} aria-hidden="true" /></span>
          <div>
            <span className="demo-card-label">Needs your attention</span>
            <h2>August rent rule</h2>
            <p>Your flatmates have approved the updated room weights. Your decision is pending.</p>
            <button className="demo-text-action" type="button" onClick={() => onNavigate('rules')}>
              Review the proposal
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>

      <div className="demo-section-heading">
        <div>
          <p className="demo-kicker">July activity</p>
          <h2>Three shared expenses</h2>
        </div>
        <button className="demo-text-action" type="button" onClick={() => onNavigate('expenses')}>
          View expenses
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="demo-mini-list">
        {model.allocations.map(({ expense, sharesById }) => (
          <div key={expense.id}>
            <span className="demo-icon-tile demo-icon-tile-small"><ReceiptText size={18} aria-hidden="true" /></span>
            <span>
              <strong>{expense.title}</strong>
              <small>Your share {formatPaise(sharesById[model.viewer.id])}</small>
            </span>
            <strong>{formatPaise(expense.amountPaise)}</strong>
          </div>
        ))}
      </div>

      <article className="demo-close-preview">
        <span className="demo-icon-tile"><CalendarCheck2 size={21} aria-hidden="true" /></span>
        <div>
          <p className="demo-kicker">Ready when the flat is</p>
          <h2>Close July with fewer transfers.</h2>
          <p>SPLITPE simplifies {model.rawRepayments.length} expense-level repayments into {model.simplifiedTransfers.length} household transfers without changing anyone’s balance.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={() => onNavigate('settle')}>
          Review month close
        </button>
      </article>
    </section>
  )
}
