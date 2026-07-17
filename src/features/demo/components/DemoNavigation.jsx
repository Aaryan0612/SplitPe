import { CircleDollarSign, FileCheck2, House, ReceiptText } from 'lucide-react'

const destinations = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'rules', label: 'Rules', icon: FileCheck2 },
  { id: 'settle', label: 'Settle', icon: CircleDollarSign },
]

export default function DemoNavigation({ activeTab, onChange }) {
  return (
    <nav className="demo-nav" aria-label="Flat 302 sections">
      <div className="demo-nav-inner" role="tablist" aria-label="Flat 302">
        {destinations.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`demo-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls="demo-panel"
            className="demo-nav-item"
            onClick={() => onChange(id)}
          >
            <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
