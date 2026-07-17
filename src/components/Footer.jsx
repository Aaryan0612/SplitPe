import { ArrowUpRight } from 'lucide-react'
import BrandMark from './BrandMark'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell footer-cta">
        <div>
          <p className="eyebrow eyebrow-light">Ready when the next bill lands</p>
          <h2>Keep the flat fair.</h2>
        </div>
        <a className="button button-mint" href="#calculator">
          Split an expense
          <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
      <div className="page-shell footer-bottom">
        <a className="wordmark wordmark-light focus-ring" href="#top" aria-label="Back to top">
          <BrandMark />
          <span className="wordmark-text">
            SPLIT<span className="wordmark-accent">PE</span>
          </span>
        </a>
        <p>SPLITPE · Built for shared living.</p>
      </div>
    </footer>
  )
}
