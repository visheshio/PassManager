import { useState } from 'react'
import { deriveVaultKey } from '../vaultCrypto'

const AuthPage = ({ existingUser, onAuthenticated, onNavigate }) => {
  const isUnlock = Boolean(existingUser)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState(existingUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (mode === 'signup' && password !== confirmation) {
      setError('The passwords do not match.')
      return
    }

    setBusy(true)
    try {
      let encryptionSalt
      let endpoint
      if (isUnlock) {
        endpoint = '/api/auth/unlock'
      } else if (mode === 'signup') {
        endpoint = '/api/auth/register'
        encryptionSalt = crypto.getRandomValues(new Uint8Array(16))
      } else {
        endpoint = '/api/auth/signin'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          ...(encryptionSalt ? { encryptionSalt: btoa(String.fromCharCode(...encryptionSalt)) } : {}),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Unable to access your account.')
      const key = await deriveVaultKey(password, result.user.encryptionSalt)
      onAuthenticated({ user: result.user, key })
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Could not reach the account service. Start the backend and configure MongoDB Atlas.'
        : requestError.message || 'Unable to access your account.')
    } finally {
      setBusy(false)
    }
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setPassword('')
    setConfirmation('')
    setError('')
  }

  return (
    <main className="account-page">
      <section className="account-panel" aria-labelledby="account-title">
        <div className="account-heading">
          <img className="account-mark" src="/favicon.svg" alt="" />
          <div>
            <h1 id="account-title">
              {isUnlock ? 'Unlock your vault' : mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
          </div>
        </div>
        <p className="account-intro">
          {isUnlock
            ? 'Enter your account password to unlock your encrypted vault on this device.'
            : mode === 'signup'
              ? 'One account for the credentials you choose to keep with you.'
              : 'Sign in to open your account-backed credential vault.'}
        </p>

        {!isUnlock && (
          <div className="auth-switch" role="group" aria-label="Account action">
            <button type="button" className={mode === 'signin' ? 'selected' : ''} aria-pressed={mode === 'signin'} onClick={() => selectMode('signin')}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'selected' : ''} aria-pressed={mode === 'signup'} onClick={() => selectMode('signup')}>Create account</button>
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <label className="field">
            <span>Email address</span>
            <input type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" readOnly={isUnlock} />
          </label>
          <label className="field">
            <span>Account password</span>
            <input type="password" name="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={12} maxLength={1024} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'signup' ? 'At least 12 characters' : 'Enter your password'} />
          </label>
          {mode === 'signup' && !isUnlock && (
            <label className="field">
              <span>Confirm password</span>
              <input type="password" name="passwordConfirmation" autoComplete="new-password" minLength={12} maxLength={1024} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter it again" />
            </label>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : isUnlock ? 'Unlock vault' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-recovery-note">Your password also unlocks vault encryption. If you forget it, encrypted vault entries cannot be recovered.</p>
        <div className="account-links">
          <a href="/home" onClick={(event) => { event.preventDefault(); onNavigate('/home') }}>Back to vault</a>
          <a href="/about" onClick={(event) => { event.preventDefault(); onNavigate('/about') }}>About PASSVAULT</a>
        </div>
      </section>
    </main>
  )
}

export default AuthPage