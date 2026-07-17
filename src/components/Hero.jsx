import { ArrowDown, ArrowRight, ReceiptText } from 'lucide-react'
import { FLAT_302_PREVIEW } from '../features/demo/model.js'
import { formatPaiseCompact as formatPaise } from '../utils/split.js'

export default function Hero({ onOpenDemo }) {
  const preview = FLAT_302_PREVIEW
  const breakdown = Object.fromEntries(
    preview.viewerBreakdown.map((item) => [item.category, item.sharePaise]),
  )
  return (
    <section className="hero section-pad" aria-labelledby="hero-title">
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Built for shared flats &amp; PGs</p>
          <h1 id="hero-title">Shared living, without money arguments.</h1>
          <p className="hero-lede">
            Split today’s bill instantly. Then explore how shared homes can agree on rules, understand every balance and close the month clearly.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#calculator">
              Split an expense
              <ArrowDown aria-hidden="true" size={18} strokeWidth={2} />
            </a>
            <a className="button button-secondary" href="?demo=flat-302" onClick={onOpenDemo}>
              Explore Flat 302
              <ArrowRight aria-hidden="true" size={18} />
            </a>
          </div>
          <p className="microcopy">No account needed for your first split or the demo.</p>
        </div>

        <div className="split-preview" aria-label="Example expense split">
          <div className="preview-topline">
            <span className="icon-tile" aria-hidden="true">
              <ReceiptText size={21} strokeWidth={1.8} />
            </span>
            <span className="status-chip">Flat 302 · July</span>
          </div>
          <div className="preview-heading">
            <div>
              <p>Kabir owes</p>
              <span>Across 3 shared expenses</span>
            </div>
            <strong>{formatPaise(-preview.viewerBalance.netBalancePaise)}</strong>
          </div>
          <div className="preview-rule" />
          <div className="preview-share">
            <span>Transparent calculation</span>
            <strong>You owe</strong>
          </div>
          <ul className="preview-list">
            {[
              ['Rent share', breakdown.rent],
              ['Electricity share', breakdown.electricity],
              ['Internet share', breakdown.internet],
              ['Already paid', -preview.viewerBalance.totalPaidPaise],
            ].map(([label, amount]) => (
              <li key={label}>
                <span>{label}</span>
                <span className="preview-pays">{amount < 0 ? 'reduces balance' : 'assigned share'}</span>
                <strong>{amount < 0 ? '−' : ''}{formatPaise(Math.abs(amount))}</strong>
              </li>
            ))}
          </ul>
          <a className="preview-link focus-ring" href="?demo=flat-302" onClick={onOpenDemo}>
            Why this amount?
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
