import { useEffect, useState } from 'react'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SplitCalculator from './components/SplitCalculator.jsx'
import TrustStrip from './components/TrustStrip.jsx'
import Flat302Demo from './features/demo/Flat302Demo.jsx'

function isDemoUrl() {
  return new URLSearchParams(window.location.search).get('demo') === 'flat-302'
}

export default function App() {
  const [showDemo, setShowDemo] = useState(isDemoUrl)

  useEffect(() => {
    const handlePopState = () => setShowDemo(isDemoUrl())
    window.addEventListener('popstate', handlePopState)
    document.title = showDemo
      ? 'Flat 302 Interactive Demo · SPLITPE'
      : 'SPLITPE · Split expenses. Not friendships.'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => window.removeEventListener('popstate', handlePopState)
  }, [showDemo])

  function openDemo(event) {
    event.preventDefault()
    window.history.pushState({}, '', '?demo=flat-302')
    setShowDemo(true)
  }

  function exitDemo() {
    window.history.pushState({}, '', window.location.pathname)
    setShowDemo(false)
  }

  if (showDemo) return <Flat302Demo onExit={exitDemo} />

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="top" />
      <Header />
      <main id="main-content">
        <Hero onOpenDemo={openDemo} />
        <HowItWorks />
        <SplitCalculator />
        <TrustStrip />
      </main>
      <Footer />
    </>
  )
}
