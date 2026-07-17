import { useMemo, useState } from 'react'
import { Check, IndianRupee, Plus, ReceiptText, Trash2, Users } from 'lucide-react'
import {
  formatPaise,
  formatPerPersonShare,
  parseAmountToPaise,
  splitEvenly,
  validateParticipants,
} from '../utils/split.js'

const INITIAL_PARTICIPANTS = [
  { id: 'person-aaryan', name: 'Aaryan' },
  { id: 'person-riya', name: 'Riya' },
  { id: 'person-kabir', name: 'Kabir' },
  { id: 'person-meera', name: 'Meera' },
]

let participantSequence = INITIAL_PARTICIPANTS.length

export default function SplitCalculator() {
  const [expenseName, setExpenseName] = useState('Monthly groceries')
  const [amount, setAmount] = useState('2400')
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS)
  const [payerId, setPayerId] = useState(INITIAL_PARTICIPANTS[0].id)

  const calculation = useMemo(() => {
    const amountResult = parseAmountToPaise(amount)
    const participantResult = validateParticipants(participants)
    const isValid = !amountResult.error && participantResult.isValid

    if (!isValid) {
      return { amountResult, participantResult, isValid: false }
    }

    const cleanParticipants = participants.map((person, index) => ({
      ...person,
      name: participantResult.trimmedNames[index],
    }))

    return {
      amountResult,
      participantResult,
      isValid: true,
      split: splitEvenly(amountResult.totalPaise, cleanParticipants, payerId),
    }
  }, [amount, participants, payerId])

  function updateParticipant(id, name) {
    setParticipants((current) =>
      current.map((person) => (person.id === id ? { ...person, name } : person)),
    )
  }

  function addParticipant() {
    if (participants.length >= 6) return
    participantSequence += 1
    setParticipants((current) => [
      ...current,
      { id: `person-${Date.now()}-${participantSequence}`, name: '' },
    ])
  }

  function removeParticipant(id) {
    if (participants.length <= 2) return
    const remaining = participants.filter((person) => person.id !== id)
    setParticipants(remaining)
    if (payerId === id) setPayerId(remaining[0].id)
  }

  const expenseLabel = expenseName.trim() || 'Shared expense'

  return (
    <section className="calculator-section section-pad" id="calculator" aria-labelledby="calculator-title">
      <div className="page-shell">
        <div className="section-intro calculator-intro">
          <p className="eyebrow">Try it live</p>
          <h2 id="calculator-title">One bill. Zero confusion.</h2>
          <p>Edit the details and SPLITPE will keep every paise accounted for.</p>
        </div>

        <div className="calculator-shell">
          <div className="calculator-form" aria-label="Equal split calculator inputs">
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
            </fieldset>

            <fieldset className="field-group people-group">
              <legend>People</legend>
              <div className="people-list">
                {participants.map((person, index) => {
                  const error = calculation.participantResult.errors[index]
                  const inputId = `participant-${person.id}`
                  const errorId = `${inputId}-error`
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
          </div>

          <div className="result-panel" aria-live="polite" aria-atomic="true">
            {calculation.isValid ? (
              <ValidResult
                expenseLabel={expenseLabel}
                participantCount={participants.length}
                totalPaise={calculation.amountResult.totalPaise}
                split={calculation.split}
              />
            ) : (
              <InvalidResult />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ValidResult({ expenseLabel, participantCount, totalPaise, split }) {
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
        <span>Paid by {split.payer.name}</span>
      </div>
      <dl className="result-metrics">
        <div>
          <dt>Per person</dt>
          <dd>{formatPerPersonShare(split.baseShare, split.remainder)}</dd>
        </div>
        <div>
          <dt>People</dt>
          <dd>{participantCount}</dd>
        </div>
      </dl>
      <div className="settlement-block">
        <p className="settlement-label">Who pays whom</p>
        <ul>
          {split.settlements.map((settlement) => (
            <li key={settlement.fromId}>
              <span className="settlement-check" aria-hidden="true"><Check size={15} /></span>
              <span>{settlement.sentence}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="result-note">
        {split.payer.name} receives {formatPaise(split.receivablePaise)} in total.
      </p>
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
