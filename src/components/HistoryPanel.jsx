import { Copy, History, RotateCcw, Trash2 } from 'lucide-react'
import { formatPaise, SPLIT_METHOD_LABELS } from '../utils/split.js'

const DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default function HistoryPanel({
  entries,
  status,
  onRestore,
  onCopy,
  onDelete,
}) {
  return (
    <section className="history-panel" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Saved on this device</p>
          <h3 id="history-title">Expense history</h3>
        </div>
        <span>{entries.length}/20 saved</span>
      </div>

      {entries.length === 0 ? (
        <div className="history-empty">
          <span aria-hidden="true"><History size={22} /></span>
          <div>
            <strong>No saved expenses yet</strong>
            <p>Use “Save split” when a result is ready. It will stay in this browser.</p>
          </div>
        </div>
      ) : (
        <ul className="history-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="history-summary">
                <div>
                  <strong>{entry.expenseLabel}</strong>
                  <span>
                    {SPLIT_METHOD_LABELS[entry.method] || 'Equal split'} · Paid by {entry.payerName}
                  </span>
                </div>
                <div className="history-amount">
                  <strong>{formatPaise(entry.totalPaise)}</strong>
                  <span>{DATE_FORMATTER.format(new Date(entry.savedAt))}</span>
                </div>
              </div>
              <div className="history-actions">
                <button type="button" onClick={() => onRestore(entry)}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Restore
                </button>
                <button type="button" onClick={() => onCopy(entry)}>
                  <Copy size={16} aria-hidden="true" />
                  Copy
                </button>
                <button
                  className="history-delete"
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  aria-label={`Delete ${entry.expenseLabel} from history`}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {status ? <p className="history-status" role="status">{status}</p> : null}
      <p className="history-note">
        History uses this browser’s local storage. SPLITPE does not send it to a server.
      </p>
    </section>
  )
}
