import { useContext } from 'react'
import { AuthContext, AuthProvider } from './context/AuthContext'
import MainApp from './MainApp'
import LoginPage from './pages/LoginPage'
import NOCHE from './theme'

function AppContent() {
  const auth = useContext(AuthContext)

  if (auth.loading) {
    return (
      <div style={{
        height: '100dvh',
        background: NOCHE.vars['--bg'],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: NOCHE.vars['--ink'],
        fontFamily: NOCHE.vars['--font-text'],
      }}>
        <div>Cargando...</div>
      </div>
    )
  }

  return auth.user ? <MainApp /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
