import { ArrowRight, ReceiptText } from 'lucide-react'
import { formatPaiseCompact as formatPaise } from '../../../utils/split.js'

const methodLabels = {
  weighted: 'Room weights',
  fixed_and_occupancy: 'Fixed + days present',
  equal: 'Equal split',
}

export default function DemoExpenses({ model, onOpenExpense }) {
  return (
    <section className="demo-view" aria-labelledby="demo-expenses-title">
      <div className="demo-page-heading">
        <p className="demo-kicker">The shared ledger</p>
        <h1 id="demo-expenses-title">July expenses</h1>
        <p>Each bill shows who paid, which agreement applied and your resulting share.</p>
      </div>
      <div className="demo-expense-list">
        {model.allocations.map((allocation) => {
          const { expense } = allocation
          const payer = model.membersById[expense.paidByMemberId]
          return (
            <article key={expense.id} className="demo-expense-card">
              <span className="demo-icon-tile"><ReceiptText size={21} aria-hidden="true" /></span>
              <div className="demo-expense-main">
                <p className="demo-card-label">{expense.category} · {methodLabels[allocation.method]}</p>
                <h2>{expense.title}</h2>
                <p>Paid by {payer.name} · Your share {formatPaise(allocation.sharesById[model.viewer.id])}</p>
              </div>
              <div className="demo-expense-amount">
                <strong>{formatPaise(expense.amountPaise)}</strong>
                <button className="demo-text-action" type="button" onClick={() => onOpenExpense(expense.id)}>
                  See calculation
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <p className="demo-context-note">This demo ledger is fixed. It is designed to explain how real household rules change each person’s share.</p>
    </section>
  )
}
