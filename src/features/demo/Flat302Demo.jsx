import { useEffect, useMemo, useState } from 'react'
import { LogOut, RotateCcw } from 'lucide-react'
import BrandMark from '../../components/BrandMark.jsx'
import { formatPaiseCompact as formatPaise } from '../../utils/split.js'
import { createInitialProposal } from './data/flat302.js'
import { decideOnProposal } from './finance/index.js'
import { buildFlat302Model } from './model.js'
import { createSettlementCardBlob, downloadSettlementCard } from './settlementCard.js'
import BalanceBreakdown from './components/BalanceBreakdown.jsx'
import DemoNavigation from './components/DemoNavigation.jsx'
import DemoSheet from './components/DemoSheet.jsx'
import ExpenseBreakdown from './components/ExpenseBreakdown.jsx'
import DemoExpenses from './views/DemoExpenses.jsx'
import DemoHome from './views/DemoHome.jsx'
import DemoRules from './views/DemoRules.jsx'
import DemoSettle from './views/DemoSettle.jsx'

export default function Flat302Demo({ onExit }) {
  const [activeTab, setActiveTab] = useState('home')
  const [proposal, setProposal] = useState(createInitialProposal)
  const [julyStatus, setJulyStatus] = useState('open')
  const [note, setNote] = useState('')
  const [sheet, setSheet] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const [toast, setToast] = useState('')
  const model = useMemo(() => buildFlat302Model(proposal), [proposal])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function resetDemo() {
    setActiveTab('home')
    setProposal(createInitialProposal())
    setJulyStatus('open')
    setNote('')
    setSheet(null)
    setAnnouncement('Demo reset. You are back on the Flat 302 home view.')
  }

  function makeDecision(decision) {
    const nextProposal = decideOnProposal(proposal, model.viewer.id, decision, note)
    setProposal(nextProposal)
    setAnnouncement(
      decision === 'approved'
        ? 'You approved the August rent rule. It is now active for August.'
        : decision === 'changes_requested'
          ? 'Changes requested. The August proposal now needs revision.'
          : 'You declined the August rent rule.',
    )
  }

  async function handleDownload() {
    try {
      await downloadSettlementCard(model)
      setAnnouncement('Settlement card downloaded.')
      setToast('Settlement card downloaded')
    } catch {
      setAnnouncement('The settlement card could not be generated. Please try again.')
    }
  }

  async function handleShare() {
    const transfer = model.simplifiedTransfers.find(
      (item) => item.fromMemberId === model.viewer.id,
    )
    const text = `Flat 302 · July settlement\n${model.viewer.name} pays ${model.membersById[transfer.toMemberId].name} ${formatPaise(transfer.amountPaise)}\nSPLITPE does not process payments.`
    try {
      const blob = await createSettlementCardBlob(model)
      const file = new File([blob], 'splitpe-flat-302-july-settlement.png', { type: 'image/png' })
      const payload = navigator.canShare?.({ files: [file] })
        ? { title: 'Flat 302 · July settlement', text, files: [file] }
        : { title: 'Flat 302 · July settlement', text }
      await navigator.share(payload)
      setAnnouncement('Settlement summary shared.')
      setToast('Settlement summary shared')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setAnnouncement('Sharing was not completed. You can download the settlement card instead.')
      }
    }
  }

  const selectedExpense = sheet?.type === 'expense'
    ? model.allocationsById[sheet.expenseId]
    : null

  return (
    <div className="demo-app">
      <a className="skip-link" href="#demo-panel">Skip to demo content</a>
      <header className="demo-topbar">
        <div className="page-shell demo-topbar-row">
          <span className="wordmark" aria-label="SPLITPE">
            <BrandMark />
            <span className="wordmark-text">SPLIT<span className="wordmark-accent">PE</span></span>
          </span>
          <span className="demo-viewer">Flat 302 · Viewing as Kabir</span>
        </div>
      </header>

      <div className="demo-banner">
        <div className="page-shell demo-banner-row">
          <p><strong>Interactive demo</strong> · You’re viewing as Kabir. Changes are temporary.</p>
          <div>
            <button type="button" onClick={resetDemo}>
              <RotateCcw size={17} aria-hidden="true" /> Reset demo
            </button>
            <button type="button" onClick={onExit}>
              <LogOut size={17} aria-hidden="true" /> Exit demo
            </button>
          </div>
        </div>
      </div>

      <DemoNavigation activeTab={activeTab} onChange={setActiveTab} />

      <main
        id="demo-panel"
        className="page-shell demo-main"
        role="tabpanel"
        aria-labelledby={`demo-tab-${activeTab}`}
      >
        {activeTab === 'home' && (
          <DemoHome
            model={model}
            onNavigate={setActiveTab}
            onOpenBalance={() => setSheet({ type: 'balance' })}
          />
        )}
        {activeTab === 'expenses' && (
          <DemoExpenses
            model={model}
            onOpenExpense={(expenseId) => setSheet({ type: 'expense', expenseId })}
          />
        )}
        {activeTab === 'rules' && (
          <DemoRules
            model={model}
            note={note}
            onNoteChange={setNote}
            onDecision={makeDecision}
          />
        )}
        {activeTab === 'settle' && (
          <DemoSettle
            model={model}
            julyStatus={julyStatus}
            onCloseMonth={() => {
              setJulyStatus('closed')
              setAnnouncement('July closed. Three final household transfers are ready.')
            }}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        )}
      </main>

      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      {toast && <div className="demo-toast" role="status">{toast}</div>}

      {sheet?.type === 'balance' && (
        <DemoSheet title={`Why you owe ${formatPaise(-model.viewerBalance.netBalancePaise)}`} onClose={() => setSheet(null)}>
          <BalanceBreakdown model={model} />
        </DemoSheet>
      )}
      {selectedExpense && (
        <DemoSheet title={selectedExpense.expense.title} onClose={() => setSheet(null)}>
          <ExpenseBreakdown model={model} expenseId={selectedExpense.expense.id} />
        </DemoSheet>
      )}
    </div>
  )
}
