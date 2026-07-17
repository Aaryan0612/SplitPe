<p align="center">
  <img src="./public/favicon.svg" width="88" height="88" alt="SPLITPE logo" />
</p>

<h1 align="center">SPLITPE</h1>

<p align="center">
  <strong>Split expenses. Not friendships.</strong>
</p>

<p align="center">
  A calm, mobile-first expense splitter for students sharing flats and PGs.
</p>

<p align="center">
  <a href="https://split-pe-neon.vercel.app/"><strong>Live Demo</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/Aaryan0612/SplitPe"><strong>Source Code</strong></a>
  &nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="./docs/SPLITPE_SRS_FINAL.pdf"><strong>Final SRS</strong></a>
</p>

---

## Overview

SPLITPE turns a shared bill into a clear settlement. Enter the expense, choose who participated and who paid, then immediately see who owes whom.

The experience is designed for the quick, everyday expenses that happen in student flats and PGs—groceries, utilities, food orders, and household supplies—without accounts, bank details, or payment processing.

## The Problem

Shared household purchases are easy to forget, and repayment conversations can become awkward when totals are unclear. Chat messages and mental notes rarely provide a reliable answer to three simple questions:

- What was the expense?
- Who was included?
- Who needs to pay whom?

## The Solution

SPLITPE keeps the journey focused:

| **Add** | **Split** | **Settle** |
|:---|:---|:---|
| Enter the bill and participants. | Choose equal, custom, or itemised splitting. | Copy or save a clear settlement summary. |

No onboarding. No speculative financial features. Just a precise split and an understandable result.

## Features

| Capability | As-built behaviour |
|---|---|
| **Flexible splitting** | Equal, custom-amount, and itemised split modes |
| **Participant controls** | Add or remove 2–6 people and choose the payer |
| **Itemised expenses** | Assign each item only to the people who shared it |
| **Exact calculations** | Integer-paise arithmetic with deterministic remainder distribution |
| **Clear settlements** | Explicit who-pays-whom sentences and total receivable |
| **Clipboard sharing** | Copy the active result or a saved settlement |
| **Expense history** | Save up to 20 browser-local entries, then restore, copy, or delete them |
| **Defensive validation** | Inline errors for amounts, names, custom shares, and item details |
| **Accessible interface** | Semantic labels, keyboard support, visible focus, live updates, and reduced motion |
| **Responsive layout** | Mobile-first presentation verified at 320px, 390px, and desktop widths |

## How It Works

1. **Add** the expense, participants, and payer.
2. **Split** equally, enter exact custom shares, or divide individual items.
3. **Settle** using the generated repayment sentences, then copy or save the result.

## Design Approach

The interface uses a restrained fintech visual system: ink navy, a controlled mint accent, light neutral surfaces, generous whitespace, precise borders, and decisive typography.

- **Hick’s Law** — equal split is the default, advanced modes appear only when selected, and each section has one clear purpose.
- **Fitts’s Law** — interactive controls use large touch targets with safe spacing and mobile gutters.
- **Jakob’s Law** — conventional navigation, labels, selects, buttons, and inline validation make the calculator predictable.
- **Accessibility** — semantic HTML, logical keyboard order, visible focus states, polite result announcements, and reduced-motion support.

## Tech Stack

Versions below are declared in `package.json`.

| Layer | Technology |
|---|---|
| UI | React `^19.0.0`, React DOM `^19.0.0` |
| Build | Vite `^6.0.5` |
| Styling | Tailwind CSS `^4.0.0`, `@tailwindcss/vite ^4.0.0` |
| Icons | Lucide React `^0.468.0` |
| Language | JavaScript, JSX, HTML, CSS |
| Deployment | Vercel static hosting |

## Getting Started

```bash
git clone https://github.com/Aaryan0612/SplitPe.git
cd SplitPe
npm install
npm run dev
```

The development server prints the local URL in the terminal.

### Verification commands

```bash
# Run calculation and local-storage tests
npm test

# Create the production bundle in dist/
npm run build

# Preview the production bundle locally
npm run preview
```

## Project Structure

```text
SPLITPE/
├── public/
│   └── favicon.svg                  # Browser icon and README brand mark
├── docs/
│   ├── SPLITPE_SRS_FINAL.md         # Maintainable as-built specification
│   └── SPLITPE_SRS_FINAL.pdf        # Submission-ready SRS
├── src/
│   ├── components/
│   │   ├── SplitCalculator.jsx      # Split modes, state, validation, and results
│   │   ├── HistoryPanel.jsx         # Restore, copy, and delete saved expenses
│   │   ├── Hero.jsx                 # Product promise and example split
│   │   ├── HowItWorks.jsx           # Add → Split → Settle explanation
│   │   ├── TrustStrip.jsx           # Honest privacy and prototype boundaries
│   │   └── Header.jsx / Footer.jsx  # Navigation and final CTA
│   ├── utils/
│   │   ├── split.js                 # Paise-safe split and formatting logic
│   │   ├── history.js               # Validated localStorage helpers
│   │   └── *.test.js                # Focused Node tests
│   ├── App.jsx                      # Single-page composition
│   ├── index.css                    # Design tokens and responsive styles
│   └── main.jsx                     # React entry point
├── index.html                       # Metadata and application mount
├── vite.config.js                   # Vite, React, and Tailwind configuration
└── package.json                     # Commands and dependencies
```

## Calculation Logic

All monetary calculations use integer paise rather than floating-point rupees.

- **Equal split:** divides the total by participant count and distributes remainder paise in stable participant order.
- **Custom split:** accepts the result only when entered shares equal the bill total exactly.
- **Itemised split:** divides every item among its selected participants, then accumulates each person’s exact share.
- **Formatting:** presents values with `Intl.NumberFormat` using `en-IN` and INR.

For example, ₹1,000 divided among three people becomes ₹333.34, ₹333.33, and ₹333.33—exactly ₹1,000.00.

## Privacy and Scope

> SPLITPE is a prototype. It does not process payments or collect bank and UPI credentials.

- Saved expense history remains in the current browser’s `localStorage`.
- Calculator and history data are not sent to a backend.
- Saved entries can be deleted individually from the history panel.
- There is no authentication, cloud sync, analytics, or payment API.

## Deployment

The production application is deployed on Vercel:

**[Open SPLITPE →](https://split-pe-neon.vercel.app/)**

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none
- Application route: `/`

## Internship Context

Built for **The Launchpad** during the **Not Your College internship — Fintech Brief 03/10**.

## Author

**[Aaryan Kuchekar](https://github.com/Aaryan0612)**
