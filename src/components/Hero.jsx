import { ArrowDown, Check, ReceiptText } from 'lucide-react'

const previewRows = ['Riya', 'Kabir', 'Meera']

export default function Hero() {
  return (
    <section className="hero section-pad" aria-labelledby="hero-title">
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Built for shared flats &amp; PGs</p>
          <h1 id="hero-title">Split expenses. Not friendships.</h1>
          <p className="hero-lede">
            Track shared bills, see who owes whom, and settle without the awkward monthly chase.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#calculator">
              Split an expense
              <ArrowDown aria-hidden="true" size={18} strokeWidth={2} />
            </a>
            <a className="button button-secondary" href="#how-it-works">
              See how it works
            </a>
          </div>
          <p className="microcopy">No sign-up. No bank details. Just a clear split.</p>
        </div>

        <div className="split-preview" aria-label="Example expense split">
          <div className="preview-topline">
            <span className="icon-tile" aria-hidden="true">
              <ReceiptText size={21} strokeWidth={1.8} />
            </span>
            <span className="status-chip">
              <Check size={14} aria-hidden="true" /> Ready to settle
            </span>
          </div>
          <div className="preview-heading">
            <div>
              <p>Monthly groceries</p>
              <span>Paid by Aaryan</span>
            </div>
            <strong>₹2,400.00</strong>
          </div>
          <div className="preview-rule" />
          <div className="preview-share">
            <span>4 people · Equal split</span>
            <strong>₹600.00 each</strong>
          </div>
          <ul className="preview-list">
            {previewRows.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <span className="preview-pays">pays Aaryan</span>
                <strong>₹600.00</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
