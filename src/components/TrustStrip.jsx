import { Landmark, LockKeyhole, MonitorCheck } from 'lucide-react'

const trustItems = [
  { label: 'Made for UPI settlements', Icon: Landmark },
  { label: 'No bank details collected', Icon: LockKeyhole },
  { label: 'Your entries stay in this browser', Icon: MonitorCheck },
]

export default function TrustStrip() {
  return (
    <section className="trust-section" aria-labelledby="trust-title">
      <div className="page-shell">
        <h2 className="sr-only" id="trust-title">How SPLITPE handles your information</h2>
        <ul className="trust-list">
          {trustItems.map(({ label, Icon }) => (
            <li key={label}>
              <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <p>SPLITPE is a prototype and does not process payments.</p>
      </div>
    </section>
  )
}
