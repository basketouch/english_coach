import { useState } from 'react'
import { signInWithMagicLink } from '../lib/auth'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithMagicLink(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Error enviando magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-ball"></div>
          <h1>English Coach</h1>
          <p>Aprende inglés para entrenamientos de baloncesto</p>
        </div>

        {sent ? (
          <div className="login-success">
            <div className="success-icon">✓</div>
            <h2>Revisa tu email</h2>
            <p>Enviamos un link a <strong>{email}</strong></p>
            <p className="text-small">Haz clic en el link para entrar a la app</p>
            <button onClick={() => { setSent(false); setEmail(''); }}>
              Usar otro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Tu email</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading || !email}>
              {loading ? 'Enviando...' : 'Enviar magic link'}
            </button>
            <p className="text-small">No necesitas contraseña. Te enviaremos un link seguro por email.</p>
          </form>
        )}
      </div>
    </div>
  )
}
