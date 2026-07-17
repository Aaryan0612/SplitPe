import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  IndianRupee,
  ListChecks,
  Plus,
  ReceiptText,
  Save,
  Scale,
  SlidersHorizontal,
  Trash2,
  Users,
} from 'lucide-react'
import HistoryPanel from './HistoryPanel.jsx'
import {
  SPLIT_METHOD_LABELS,
  buildShareText,
  calculateItemisedSplit,
  formatPaise,
  formatPerPersonShare,
  parseAmountToPaise,
  splitEvenly,
  splitWithShares,
  validateCustomShares,
  validateParticipants,
} from '../utils/split.js'
import { addHistoryEntry, readHistory, writeHistory } from '../utils/history.js'

const INITIAL_PARTICIPANTS = [
  { id: 'person-aaryan', name: 'Aaryan' },
  { id: 'person-riya', name: 'Riya' },
  { id: 'person-kabir', name: 'Kabir' },
  { id: 'person-meera', name: 'Meera' },
]

const INITIAL_CUSTOM_SHARES = {
  'person-aaryan': '600',
  'person-riya': '600',
  'person-kabir': '600',
  'person-meera': '600',
}

const ALL_INITIAL_IDS = INITIAL_PARTICIPANTS.map((person) => person.id)

const INITIAL_ITEMS = [
  { id: 'item-staples', label: 'Rice & staples', amount: '1200', participantIds: ALL_INITIAL_IDS },
  { id: 'item-produce', label: 'Fresh produce', amount: '800', participantIds: ALL_INITIAL_IDS },
  { id: 'item-supplies', label: 'Household supplies', amount: '400', participantIds: ALL_INITIAL_IDS },
]

const SPLIT_METHODS = [
  { id: 'equal', label: 'Equal', Icon: Scale },
  { id: 'custom', label: 'Custom', Icon: SlidersHorizontal },
  { id: 'itemised', label: 'Itemised', Icon: ListChecks },
]

let participantSequence = INITIAL_PARTICIPANTS.length
let itemSequence = INITIAL_ITEMS.length

function inputValueFromPaise(paise) {
  return (paise / 100).toFixed(2).replace(/\.00$/, '')
}

function equalShareInputs(totalPaise, participants) {
  const split = splitEvenly(totalPaise, participants, participants[0].id)
  return Object.fromEntries(
    split.shares.map((person) => [person.id, inputValueFromPaise(person.sharePaise)]),
  )
}

function createHistoryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `history-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Use the browser fallback below when clipboard permission is unavailable.
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  } catch {
    return false
  }
}

export default function SplitCalculator() {
  const [expenseName, setExpenseName] = useState('Monthly groceries')
  const [amount, setAmount] = useState('2400')
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS)
  const [payerId, setPayerId] = useState(INITIAL_PARTICIPANTS[0].id)
  const [method, setMethod] = useState('equal')
  const [customShares, setCustomShares] = useState(INITIAL_CUSTOM_SHARES)
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [history, setHistory] = useState(() => (
    readHistory(typeof window === 'undefined' ? null : window.localStorage)
  ))
  const [resultStatus, setResultStatus] = useState('')
  const [historyStatus, setHistoryStatus] = useState('')

  useEffect(() => {
    writeHistory(typeof window === 'undefined' ? null : window.localStorage, history)
  }, [history])

  const calculation = useMemo(() => {
    const participantResult = validateParticipants(participants)
    const cleanParticipants = participants.map((person, index) => ({
      ...person,
      name: participantResult.trimmedNames[index],
    }))

    if (method === 'itemised') {
      const itemResult = calculateItemisedSplit(items, cleanParticipants, payerId)
      return {
        amountResult: {},
        participantResult,
        itemResult,
        customResult: null,
        isValid: participantResult.isValid && itemResult.isValid,
        totalPaise: itemResult.totalPaise,
        split: participantResult.isValid && itemResult.isValid ? itemResult.split : null,
      }
    }

    const amountResult = parseAmountToPaise(amount)
    if (amountResult.error || !participantResult.isValid) {
      return {
        amountResult,
        participantResult,
        itemResult: null,
        customResult: null,
        isValid: false,
      }
    }

    if (method === 'custom') {
      const customResult = validateCustomShares(
        customShares,
        cleanParticipants,
        amountResult.totalPaise,
      )
      return {
        amountResult,
        participantResult,
        itemResult: null,
        customResult,
        isValid: customResult.isValid,
        totalPaise: amountResult.totalPaise,
        split: customResult.isValid
          ? splitWithShares(
              amountResult.totalPaise,
              cleanParticipants,
              payerId,
              customResult.sharesById,
            )
          : null,
      }
    }

    return {
      amountResult,
      participantResult,
      itemResult: null,
      customResult: null,
      isValid: true,
      totalPaise: amountResult.totalPaise,
      split: splitEvenly(amountResult.totalPaise, cleanParticipants, payerId),
    }
  }, [amount, customShares, items, method, participants, payerId])

  const expenseLabel = expenseName.trim() || 'Shared expense'
  const shareText = calculation.isValid
    ? buildShareText({
        expenseLabel,
        totalPaise: calculation.totalPaise,
        split: calculation.split,
        method,
      })
    : ''

  function changeMethod(nextMethod) {
    if (nextMethod === 'custom') {
      const amountResult = parseAmountToPaise(amount)
      const participantResult = validateParticipants(participants)
      if (!amountResult.error && participantResult.isValid) {
        setCustomShares(equalShareInputs(amountResult.totalPaise, participants))
      }
    }
    setMethod(nextMethod)
    setResultStatus('')
  }

  function updateParticipant(id, name) {
    setParticipants((current) =>
      current.map((person) => (person.id === id ? { ...person, name } : person)),
    )
  }

  function addParticipant() {
    if (participants.length >= 6) return
    participantSequence += 1
    const person = {
      id: `person-${Date.now()}-${participantSequence}`,
      name: '',
    }
    const nextParticipants = [...participants, person]
    setParticipants(nextParticipants)
    setCustomShares((current) => ({ ...current, [person.id]: '0' }))
    setItems((current) => current.map((item) => ({
      ...item,
      participantIds: [...item.participantIds, person.id],
    })))
  }

  function removeParticipant(id) {
    if (participants.length <= 2) return
    const remaining = participants.filter((person) => person.id !== id)
    setParticipants(remaining)
    setCustomShares((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setItems((current) => current.map((item) => ({
      ...item,
      participantIds: item.participantIds.filter((participantId) => participantId !== id),
    })))
    if (payerId === id) setPayerId(remaining[0].id)
  }

  function updateItem(id, field, value) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  function toggleItemParticipant(itemId, participantId) {
    setItems((current) => current.map((item) => {
      if (item.id !== itemId) return item
      const included = item.participantIds.includes(participantId)
      return {
        ...item,
        participantIds: included
          ? item.participantIds.filter((id) => id !== participantId)
          : [...item.participantIds, participantId],
      }
    }))
  }

  function addItem() {
    if (items.length >= 12) return
    itemSequence += 1
    setItems((current) => [
      ...current,
      {
        id: `item-${Date.now()}-${itemSequence}`,
        label: '',
        amount: '',
        participantIds: participants.map((person) => person.id),
      },
    ])
  }

  function removeItem(id) {
    if (items.length <= 1) return
    setItems((current) => current.filter((item) => item.id !== id))
  }

  async function copyCurrentResult() {
    const copied = await copyToClipboard(shareText)
    setResultStatus(copied ? 'Settlement copied to clipboard.' : 'Copy failed. Please try again.')
  }

  function saveCurrentResult() {
    if (!calculation.isValid) return
    const entry = {
      id: createHistoryId(),
      savedAt: Date.now(),
      expenseLabel,
      totalPaise: calculation.totalPaise,
      payerName: calculation.split.payer.name,
      participantCount: participants.length,
      method,
      summaryText: shareText,
      snapshot: {
        expenseName,
        amount,
        participants: participants.map((person) => ({ ...person })),
        payerId,
        method,
        customShares: { ...customShares },
        items: items.map((item) => ({
          ...item,
          participantIds: [...item.participantIds],
        })),
      },
    }
    setHistory((current) => addHistoryEntry(current, entry))
    setResultStatus('Saved to expense history on this browser.')
  }

  function restoreHistoryEntry(entry) {
    const snapshot = entry.snapshot
    const restoredPayerId = snapshot.participants.some((person) => person.id === snapshot.payerId)
      ? snapshot.payerId
      : snapshot.participants[0].id
    setExpenseName(snapshot.expenseName ?? entry.expenseLabel)
    setAmount(snapshot.amount ?? inputValueFromPaise(entry.totalPaise))
    setParticipants(snapshot.participants)
    setPayerId(restoredPayerId)
    setMethod(snapshot.method ?? 'equal')
    setCustomShares(snapshot.customShares ?? {})
    setItems(snapshot.items?.length ? snapshot.items : INITIAL_ITEMS)
    setHistoryStatus(`${entry.expenseLabel} restored to the calculator.`)
  }

  async function copyHistoryEntry(entry) {
    const copied = await copyToClipboard(entry.summaryText)
    setHistoryStatus(copied ? 'Saved settlement copied.' : 'Copy failed. Please try again.')
  }

  function deleteHistoryEntry(id) {
    setHistory((current) => current.filter((entry) => entry.id !== id))
    setHistoryStatus('Expense removed from this browser.')
  }

  return (
    <section className="calculator-section section-pad" id="calculator" aria-labelledby="calculator-title">
      <div className="page-shell">
        <div className="section-intro calculator-intro">
          <p className="eyebrow">Try it live</p>
          <h2 id="calculator-title">One bill. Zero confusion.</h2>
          <p>Split equally, assign custom amounts, or divide individual items.</p>
        </div>

        <div className="calculator-shell">
          <div className="calculator-form" aria-label="Expense split calculator inputs">
            <fieldset className="field-group">
              <legend>Bill details</legend>
              <div className="field">
                <label htmlFor="expense-name">Expense label</label>
                <div className="input-wrap">
                  <ReceiptText size={19} aria-hidden="true" />
                  <input
                    id="expense-name"
                    maxLength={60}
                    type="text"
                    value={expenseName}
                    onChange={(event) => setExpenseName(event.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <fieldset className="split-method-field">
                <legend>Split method</legend>
                <div className="split-method-options">
                  {SPLIT_METHODS.map(({ id, label, Icon }) => (
                    <label className="split-method-option" key={id}>
                      <input
                        type="radio"
                        name="split-method"
                        value={id}
                        checked={method === id}
                        onChange={() => changeMethod(id)}
                      />
                      <span>
                        <Icon size={17} aria-hidden="true" />
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {method === 'itemised' ? (
                <div className="field amount-field">
                  <span className="field-label">Calculated total</span>
                  <div className="calculated-amount" role="status">
                    <IndianRupee size={23} strokeWidth={2} aria-hidden="true" />
                    <strong>
                      {calculation.itemResult?.isValid
                        ? formatPaise(calculation.itemResult.totalPaise)
                        : '—'}
                    </strong>
                  </div>
                  <p className="field-help">Built automatically from the item amounts below.</p>
                </div>
              ) : (
                <div className="field amount-field">
                  <label htmlFor="amount">Total amount</label>
                  <div className={`input-wrap amount-input ${calculation.amountResult.error ? 'is-invalid' : ''}`}>
                    <IndianRupee size={23} strokeWidth={2} aria-hidden="true" />
                    <input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      aria-invalid={Boolean(calculation.amountResult.error)}
                      aria-describedby={calculation.amountResult.error ? 'amount-error' : 'amount-help'}
                      autoComplete="off"
                    />
                  </div>
                  {calculation.amountResult.error ? (
                    <p className="field-error" id="amount-error" role="alert">
                      {calculation.amountResult.error}
                    </p>
                  ) : (
                    <p className="field-help" id="amount-help">Up to ₹10,00,000 · Max two decimals</p>
                  )}
                </div>
              )}
            </fieldset>

            <fieldset className="field-group people-group">
              <legend>People</legend>
              <div className="people-list">
                {participants.map((person, index) => {
                  const error = calculation.participantResult.errors[index]
                  const inputId = `participant-${person.id}`
                  const errorId = `${inputId}-error`
                  const shareError = calculation.customResult?.errorsById[person.id]
                  const shareId = `share-${person.id}`
                  return (
                    <div className="person-field" key={person.id}>
                      <label htmlFor={inputId}>Person {index + 1}</label>
                      <div className="person-row">
                        <div className={`input-wrap ${error ? 'is-invalid' : ''}`}>
                          <Users size={18} aria-hidden="true" />
                          <input
                            id={inputId}
                            type="text"
                            maxLength={24}
                            value={person.name}
                            onChange={(event) => updateParticipant(person.id, event.target.value)}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                            autoComplete="off"
                          />
                        </div>
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => removeParticipant(person.id)}
                          disabled={participants.length <= 2}
                          aria-label={`Remove ${person.name.trim() || `person ${index + 1}`}`}
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                      {error ? (
                        <p className="field-error" id={errorId} role="alert">{error}</p>
                      ) : null}

                      {method === 'custom' ? (
                        <div className="custom-share-field">
                          <label htmlFor={shareId}>
                            {person.name.trim() || `Person ${index + 1}`}’s share
                          </label>
                          <div className={`input-wrap compact-money-input ${shareError ? 'is-invalid' : ''}`}>
                            <IndianRupee size={17} aria-hidden="true" />
                            <input
                              id={shareId}
                              type="text"
                              inputMode="decimal"
                              value={customShares[person.id] ?? ''}
                              onChange={(event) => setCustomShares((current) => ({
                                ...current,
                                [person.id]: event.target.value,
                              }))}
                              aria-invalid={Boolean(shareError)}
                              aria-describedby={shareError ? `${shareId}-error` : undefined}
                              autoComplete="off"
                            />
                          </div>
                          {shareError ? (
                            <p className="field-error" id={`${shareId}-error`} role="alert">
                              {shareError}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <button
                className="add-person-button"
                type="button"
                onClick={addParticipant}
                disabled={participants.length >= 6}
              >
                <Plus size={18} aria-hidden="true" />
                Add a person
                <span>{participants.length}/6</span>
              </button>

              {method === 'custom' && calculation.customResult?.totalError ? (
                <p className="group-error" role="alert">{calculation.customResult.totalError}</p>
              ) : null}

              <div className="field payer-field">
                <label htmlFor="payer">Paid by</label>
                <select id="payer" value={payerId} onChange={(event) => setPayerId(event.target.value)}>
                  {participants.map((person, index) => (
                    <option key={person.id} value={person.id}>
                      {person.name.trim() || `Person ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            {method === 'itemised' ? (
              <ItemisedEditor
                items={items}
                participants={participants}
                errorsById={calculation.itemResult?.errorsById || {}}
                totalError={calculation.itemResult?.totalError}
                onUpdate={updateItem}
                onToggleParticipant={toggleItemParticipant}
                onAdd={addItem}
                onRemove={removeItem}
              />
            ) : null}
          </div>

          <div className="result-panel" aria-live="polite" aria-atomic="true">
            {calculation.isValid ? (
              <ValidResult
                expenseLabel={expenseLabel}
                participantCount={participants.length}
                totalPaise={calculation.totalPaise}
                split={calculation.split}
                method={method}
                onCopy={copyCurrentResult}
                onSave={saveCurrentResult}
                status={resultStatus}
              />
            ) : (
              <InvalidResult />
            )}
          </div>
        </div>

        <HistoryPanel
          entries={history}
          status={historyStatus}
          onRestore={restoreHistoryEntry}
          onCopy={copyHistoryEntry}
          onDelete={deleteHistoryEntry}
        />
      </div>
    </section>
  )
}

function ItemisedEditor({
  items,
  participants,
  errorsById,
  totalError,
  onUpdate,
  onToggleParticipant,
  onAdd,
  onRemove,
}) {
  return (
    <fieldset className="field-group items-group">
      <legend>Items</legend>
      <p className="group-help">Add each line, then choose exactly who shared it.</p>
      <div className="items-list">
        {items.map((item, index) => {
          const errors = errorsById[item.id] || {}
          const labelId = `item-label-${item.id}`
          const amountId = `item-amount-${item.id}`
          return (
            <div className="item-card" key={item.id}>
              <div className="item-card-heading">
                <strong>Item {index + 1}</strong>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => onRemove(item.id)}
                  disabled={items.length <= 1}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="item-fields">
                <div className="field">
                  <label htmlFor={labelId}>Item name</label>
                  <div className={`input-wrap ${errors.label ? 'is-invalid' : ''}`}>
                    <ReceiptText size={17} aria-hidden="true" />
                    <input
                      id={labelId}
                      type="text"
                      maxLength={40}
                      value={item.label}
                      onChange={(event) => onUpdate(item.id, 'label', event.target.value)}
                      aria-invalid={Boolean(errors.label)}
                      aria-describedby={errors.label ? `${labelId}-error` : undefined}
                      autoComplete="off"
                    />
                  </div>
                  {errors.label ? (
                    <p className="field-error" id={`${labelId}-error`} role="alert">
                      {errors.label}
                    </p>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor={amountId}>Amount</label>
                  <div className={`input-wrap compact-money-input ${errors.amount ? 'is-invalid' : ''}`}>
                    <IndianRupee size={17} aria-hidden="true" />
                    <input
                      id={amountId}
                      type="text"
                      inputMode="decimal"
                      value={item.amount}
                      onChange={(event) => onUpdate(item.id, 'amount', event.target.value)}
                      aria-invalid={Boolean(errors.amount)}
                      aria-describedby={errors.amount ? `${amountId}-error` : undefined}
                      autoComplete="off"
                    />
                  </div>
                  {errors.amount ? (
                    <p className="field-error" id={`${amountId}-error`} role="alert">
                      {errors.amount}
                    </p>
                  ) : null}
                </div>
              </div>
              <fieldset className="item-participants-field">
                <legend>Shared by</legend>
                <div className={`item-participant-options ${errors.participants ? 'is-invalid-group' : ''}`}>
                  {participants.map((person, personIndex) => (
                    <label key={person.id}>
                      <input
                        type="checkbox"
                        checked={item.participantIds.includes(person.id)}
                        onChange={() => onToggleParticipant(item.id, person.id)}
                      />
                      <span>{person.name.trim() || `Person ${personIndex + 1}`}</span>
                    </label>
                  ))}
                </div>
                {errors.participants ? (
                  <p className="field-error" role="alert">{errors.participants}</p>
                ) : null}
              </fieldset>
            </div>
          )
        })}
      </div>
      <button
        className="add-person-button"
        type="button"
        onClick={onAdd}
        disabled={items.length >= 12}
      >
        <Plus size={18} aria-hidden="true" />
        Add an item
        <span>{items.length}/12</span>
      </button>
      {totalError ? <p className="group-error" role="alert">{totalError}</p> : null}
    </fieldset>
  )
}

function ValidResult({
  expenseLabel,
  participantCount,
  totalPaise,
  split,
  method,
  onCopy,
  onSave,
  status,
}) {
  const primaryMetric = method === 'equal'
    ? {
        label: 'Per person',
        value: formatPerPersonShare(split.baseShare, split.remainder),
      }
    : method === 'itemised'
      ? { label: 'Items', value: String(split.itemCount) }
      : { label: 'Method', value: 'Custom' }

  return (
    <>
      <div className="result-topline">
        <p>Your split</p>
        <span className="status-chip status-chip-light">
          <Check size={14} aria-hidden="true" /> Ready to settle
        </span>
      </div>
      <div className="result-heading">
        <p>{expenseLabel}</p>
        <h3>{formatPaise(totalPaise)}</h3>
        <span>Paid by {split.payer.name} · {SPLIT_METHOD_LABELS[method]}</span>
      </div>
      <dl className="result-metrics">
        <div>
          <dt>{primaryMetric.label}</dt>
          <dd>{primaryMetric.value}</dd>
        </div>
        <div>
          <dt>People</dt>
          <dd>{participantCount}</dd>
        </div>
      </dl>
      <div className="settlement-block">
        <p className="settlement-label">Who pays whom</p>
        {split.settlements.length > 0 ? (
          <ul>
            {split.settlements.map((settlement) => (
              <li key={settlement.fromId}>
                <span className="settlement-check" aria-hidden="true"><Check size={15} /></span>
                <span>{settlement.sentence}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-settlement">No repayments are needed.</p>
        )}
      </div>
      <p className="result-note">
        {split.receivablePaise > 0
          ? `${split.payer.name} receives ${formatPaise(split.receivablePaise)} in total.`
          : `${split.payer.name} has nothing to collect.`}
      </p>
      <div className="result-actions">
        <button className="result-action result-action-primary" type="button" onClick={onSave}>
          <Save size={17} aria-hidden="true" />
          Save split
        </button>
        <button className="result-action" type="button" onClick={onCopy}>
          <Copy size={17} aria-hidden="true" />
          Copy result
        </button>
      </div>
      {status ? <p className="result-action-status" role="status">{status}</p> : null}
    </>
  )
}

function InvalidResult() {
  return (
    <div className="invalid-result" role="status">
      <span className="invalid-icon" aria-hidden="true"><ReceiptText size={24} /></span>
      <p>Your split needs a quick check.</p>
      <h3>Fix the highlighted fields</h3>
      <span>Valid details will reveal an exact, paise-perfect settlement here.</span>
    </div>
  )
}
