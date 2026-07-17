# SPLITPE

<div align="center">
  <p><strong>Split expenses. Not friendships.</strong></p>
  <p>
    <a href="https://split-pe-neon.vercel.app/">Live Demo</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/Aaryan0612/SplitPe">GitHub Repository</a>
  </p>
</div>

## Overview

SPLITPE is a mobile-first expense-splitting experience for students sharing flats and PGs. It lets users enter a shared expense, manage the participating flatmates, select who paid, and immediately understand who owes whom.

## The Problem

Shared groceries, utilities, and household purchases are easy to lose track of. When the month ends, unclear totals and repeated repayment reminders can make an ordinary split feel awkward.

## The Solution

SPLITPE keeps the flow focused: **Add → Split → Settle**. Enter a bill, include the relevant people, choose the payer, and receive an equal-share settlement summary without sign-up or payment processing.

## Features

- Live equal-split calculator with sensible default data
- Editable expense label, amount, and participant names
- Support for 2–6 participants with payer selection
- Clear who-pays-whom settlement results
- Indian rupee formatting with Intl.NumberFormat
- Inline validation for amounts and required, unique participant names
- Responsive, mobile-first interface
- Semantic labels, visible focus states, live result announcements, and reduced-motion support

## How It Works

1. Add the expense and total amount.
2. Add the participating flatmates and select who paid.
3. View the equal share and settlement summary.

## Design Approach

SPLITPE uses a minimal, calm fintech interface built around clear typography, restrained colour, generous spacing, and a strong result state.

- **Hick’s Law:** limited choices and one clear primary action keep the experience focused.
- **Fitts’s Law:** large interaction targets and safe spacing support comfortable touch use.
- **Jakob’s Law:** familiar navigation, labels, buttons, validation messages, and form controls reduce the learning curve.
- **Responsive and accessible:** the layout adapts from mobile to desktop, supports keyboard navigation, and respects reduced-motion preferences.

## Tech Stack

Declared package versions are taken directly from **package.json**.

- React ^19.0.0
- React DOM ^19.0.0
- Vite ^6.0.5
- Tailwind CSS ^4.0.0
- @tailwindcss/vite ^4.0.0
- @vitejs/plugin-react ^4.3.4
- Lucide React ^0.468.0
- JavaScript, HTML, and CSS

## Getting Started

~~~bash
git clone https://github.com/Aaryan0612/SplitPe.git
cd SplitPe
npm install
npm run dev
~~~

Create a production build:

~~~bash
npm run build
~~~

Vite writes the deployable output to **dist/**. To preview that build locally:

~~~bash
npm run preview
~~~

## Project Structure

~~~text
SPLITPE/
├── public/
│   └── favicon.svg                 # Browser icon
├── src/
│   ├── components/
│   │   ├── SplitCalculator.jsx     # Calculator inputs, validation, and results
│   │   ├── Hero.jsx                # Hero and example split preview
│   │   ├── HowItWorks.jsx          # Add → Split → Settle steps
│   │   ├── TrustStrip.jsx          # Honest privacy and prototype messaging
│   │   └── Header.jsx / Footer.jsx # Primary navigation and final CTA
│   ├── utils/
│   │   └── split.js                # Parsing, validation, formatting, and split logic
│   ├── App.jsx                     # Single-page composition
│   ├── index.css                   # Design system and responsive styles
│   └── main.jsx                    # React entry point
├── index.html                      # Document metadata and app mount
├── vite.config.js                  # React and Tailwind Vite plugins
└── package.json                    # Scripts and dependencies
~~~

## Calculation Logic

Amounts are parsed and calculated as integer paise to avoid floating-point errors. The base share uses integer division, and any remainder paise are distributed deterministically in participant order so every assigned share adds up exactly to the original total.

## Privacy and Scope

- SPLITPE is a prototype and does not process payments.
- It does not collect bank details or UPI credentials.
- Calculator information remains client-side in browser memory and is not sent to a backend.

## Deployment

SPLITPE is deployed on Vercel: [https://split-pe-neon.vercel.app/](https://split-pe-neon.vercel.app/)

## Internship Context

Built for The Launchpad during the Not Your College internship — Fintech Brief 03/10.

## Author

[Aaryan Kuchekar](https://github.com/Aaryan0612)
