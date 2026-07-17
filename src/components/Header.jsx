import BrandMark from './BrandMark'

export default function Header() {
  return (
    <header className="site-header">
      <nav className="page-shell nav-row" aria-label="Primary navigation">
        <a className="wordmark focus-ring" href="#top" aria-label="SPLITPE home">
          <BrandMark />
          <span className="wordmark-text">
            SPLIT<span className="wordmark-accent">PE</span>
          </span>
        </a>
        <div className="nav-actions">
          <a className="nav-link focus-ring" href="#how-it-works">
            How it works
          </a>
          <a className="button button-small button-ink" href="#calculator">
            Try Splitpe
          </a>
        </div>
      </nav>
    </header>
  )
}
