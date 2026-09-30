const Navbar = ({ path, account, onNavigate, onSignOut }) => {
  const navigate = (event, target) => {
    event.preventDefault()
    onNavigate(target)
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <a className="logo" href="/home" onClick={(event) => navigate(event, '/home')} aria-label="PASSVAULT home">
        <img src="/favicon.svg" alt="" />
      </a>
      <ul className="nav-links">
        <li>
          <a className={path === '/home' || path === '/' ? 'nav-active' : ''} href="/home" onClick={(event) => navigate(event, '/home')}>Home</a>
        </li>
        <li>
          <a className={path === '/about' ? 'nav-active' : ''} href="/about" onClick={(event) => navigate(event, '/about')}>About</a>
        </li>
        <li>
          {account ? (
            <button className="nav-login" type="button" onClick={onSignOut}>Sign out</button>
          ) : (
            <a className={`nav-login ${path === '/login' ? 'nav-active' : ''}`} href="/login" onClick={(event) => navigate(event, '/login')}>Login</a>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Navbar