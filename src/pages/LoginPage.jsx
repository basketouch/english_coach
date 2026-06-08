import { useState } from 'react'
import { signInWithEmail } from '../lib/auth'

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100dvh',
    width: '100%',
    background: '#14151A',
    padding: '20px',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#1E2027',
    borderRadius: '18px',
    padding: '40px 24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.40)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  ball: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 38% 34%, #FF7B3E, #FF6B2C 60%, #E2541A)',
    margin: '0 auto 24px',
    boxShadow: '0 10px 40px rgba(255, 107, 44, 0.4)',
  },
  h1: {
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontSize: '32px',
    fontWeight: '600',
    color: '#F3F4F7',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  p: {
    color: '#A6ACB8',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#F3F4F7',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#262932',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontSize: '16px',
    color: '#F3F4F7',
    boxSizing: 'border-box',
  },
  button: {
    padding: '14px 24px',
    background: '#FF6B2C',
    color: '#16120C',
    border: 'none',
    borderRadius: '12px',
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  small: {
    fontSize: '12px',
    color: '#6C7382',
    margin: '0',
    textAlign: 'center',
  },
  success: {
    textAlign: 'center',
  },
  icon: {
    width: '64px',
    height: '64px',
    background: 'rgba(63, 176, 122, 0.1)',
    border: '2px solid #3FB07A',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#3FB07A',
    margin: '0 auto 24px',
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(255, 107, 92, 0.1)',
    border: '1px solid #FF6B5C',
    borderRadius: '8px',
    color: '#FF6B5C',
    fontSize: '14px',
    marginTop: '-4px',
  },
}

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
      await signInWithEmail(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.ball}></div>
          <h1 style={styles.h1}>English Coach</h1>
          <p style={styles.p}>Aprende inglés para entrenamientos de baloncesto</p>
        </div>

        {sent ? (
          <div style={styles.success}>
            <div style={styles.icon}>✓</div>
            <h2 style={{ ...styles.h1, fontSize: '24px' }}>¡Bienvenido!</h2>
            <p style={styles.p}>Entrando como <strong style={{ color: '#F3F4F7' }}>{email}</strong></p>
            <p style={styles.small}>Cargando la app...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <label htmlFor="email" style={styles.label}>Tu email</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
              style={styles.input}
            />
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading || !email} style={{ ...styles.button, opacity: loading || !email ? 0.6 : 1, cursor: loading || !email ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p style={styles.small}>Escribe tu email para entrar a la app.</p>
          </form>
        )}
      </div>
    </div>
  )
}
