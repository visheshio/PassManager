const Navbar = () => {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="logo">
        <img src="/favicon.svg" alt="PassManager" />
      </div>
      <ul className="nav-links">
        <li>
          <a href="/home">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a className="nav-login" href="/login">Login</a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar