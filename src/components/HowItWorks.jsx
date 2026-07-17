import { ArrowRight, CheckCircle2, ReceiptText, Users } from 'lucide-react'

const steps = [
  { number: '01', title: 'Add', copy: 'Enter the bill and who paid.', Icon: ReceiptText },
  { number: '02', title: 'Split', copy: 'Choose the flatmates included.', Icon: Users },
  { number: '03', title: 'Settle', copy: 'Get a clear who-pays-whom summary.', Icon: CheckCircle2 },
]

export default function HowItWorks() {
  return (
    <section className="how-section section-pad" id="how-it-works" aria-labelledby="how-title">
      <div className="page-shell">
        <div className="section-intro">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title">From bill to settled in three steps.</h2>
        </div>
        <ol className="steps-list">
          {steps.map(({ number, title, copy, Icon }, index) => (
            <li className="step" key={number}>
              <div className="step-topline">
                <span>{number}</span>
                <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
              {index < steps.length - 1 ? (
                <ArrowRight className="step-arrow" size={20} aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
