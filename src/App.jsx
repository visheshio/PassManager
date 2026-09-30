import './App.css'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import AuthPage from './components/AuthPage'
import AboutPage from './components/AboutPage'
import { useEffect, useState } from 'react'

function App() {
  const [path, setPath] = useState(window.location.pathname === '/' ? '/home' : window.location.pathname)
  const [account, setAccount] = useState(null)
  const [vaultKey, setVaultKey] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const navigate = (nextPath) => {
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setAuthChecked(nextPath !== '/home' && nextPath !== '/')
  }

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname
      setPath(nextPath)
      setAuthChecked(nextPath !== '/home' && nextPath !== '/')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (path !== '/home' && path !== '/') return
    let active = true
    fetch('/api/auth/me')
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => { if (active && result?.user) setAccount(result.user) })
      .catch(() => {})
      .finally(() => { if (active) setAuthChecked(true) })
    return () => { active = false }
  }, [path])

  const handleAuthenticated = ({ user, key }) => {
    setAccount(user)
    setVaultKey(key)
    navigate('/home')
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } finally {
      setAccount(null)
      setVaultKey(null)
      navigate('/home')
    }
  }

  let page
  if (path === '/about') {
    page = <AboutPage onNavigate={navigate} />
  } else if (path === '/login' || (path === '/home' && account && !vaultKey)) {
    page = <AuthPage existingUser={path === '/home' ? account : null} onAuthenticated={handleAuthenticated} onNavigate={navigate} />
  } else if (!authChecked && path === '/home') {
    page = <div className="app-loading" role="status">Checking account…</div>
  } else {
    page = <Manager key={account?.id || 'guest'} account={account} vaultKey={vaultKey} />
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        <Navbar path={path} account={account} onNavigate={navigate} onSignOut={handleSignOut} />
        {page}
      </div>
    </div>
  )
}

export default App
