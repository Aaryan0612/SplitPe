import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import SplitCalculator from './components/SplitCalculator.jsx'
import TrustStrip from './components/TrustStrip.jsx'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="top" />
      <Header />
      <main id="main-content">
        <Hero />
        <HowItWorks />
        <SplitCalculator />
        <TrustStrip />
      </main>
      <Footer />
    </>
  )
}
