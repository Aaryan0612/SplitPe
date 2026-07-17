export default function Header() {
  return (
    <header className="site-header">
      <nav className="page-shell nav-row" aria-label="Primary navigation">
        <a className="wordmark focus-ring" href="#top" aria-label="SPLITPE home">
          SPLIT<span>PE</span>
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
