import { type SubmitEvent, useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router'
import { CreateTicketForm } from '../tickets/create-ticket-form'
import { TicketDetailScreen } from '../tickets/ticket-detail'
import { TicketListScreen } from '../tickets/ticket-list'
import { getSession, login, logout, type SessionProfile, SessionRequestError } from './session-api'

const roleLabels: Record<SessionProfile['role'], string> = {
  requester: 'Peticionario',
  agent: 'Operador',
  supervisor: 'Supervisor',
}

export function SessionScreen() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<SessionProfile | null>()
  const [restoreFailed, setRestoreFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const restoring = profile === undefined && !restoreFailed

  useEffect(() => {
    if (!restoring) return

    const controller = new AbortController()
    void getSession(controller.signal)
      .then((session) => {
        if (!controller.signal.aborted) setProfile(session)
      })
      .catch(() => {
        if (!controller.signal.aborted) setRestoreFailed(true)
      })
    return () => controller.abort()
  }, [restoring])

  async function signIn(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setError('')
    setBusy(true)
    try {
      setProfile(await login(String(fields.get('email')), String(fields.get('password'))))
    } catch (cause) {
      setError(
        cause instanceof SessionRequestError
          ? cause.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setError('')
    setBusy(true)
    try {
      await logout()
      setProfile(null)
      void navigate('/', { replace: true })
    } catch {
      setError('No se pudo cerrar sesión. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const expireSession = useCallback(() => {
    setProfile(null)
    setError('La sesión ha caducado. Vuelve a iniciar sesión.')
  }, [])

  if (restoreFailed) {
    return (
      <>
        <p role="alert">No se pudo consultar la sesión.</p>
        <button type="button" onClick={() => setRestoreFailed(false)}>
          Reintentar
        </button>
      </>
    )
  }

  if (profile === undefined) return <p role="status">Comprobando la sesión…</p>

  if (profile) {
    const canCreate = profile.role === 'requester' || profile.role === 'supervisor'
    return (
      <>
        <section aria-labelledby="session-title">
          <h2 id="session-title">{profile.fullName}</h2>
          <p>{roleLabels[profile.role]}</p>
          {error && <p role="alert">{error}</p>}
          <button type="button" disabled={busy} onClick={signOut}>
            {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </section>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <p>
                  <Link to="/tickets">Ver tickets</Link>
                </p>
                {canCreate && (
                  <p>
                    <Link to="/tickets/new">Crear ticket</Link>
                  </p>
                )}
              </>
            }
          />
          <Route path="/tickets" element={<TicketListScreen onExpired={expireSession} />} />
          <Route
            path="/tickets/new"
            element={
              canCreate ? (
                <CreateTicketForm
                  onCreated={(ticket) => {
                    void navigate(`/tickets/${ticket.id}`, { replace: true })
                  }}
                  onExpired={expireSession}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/tickets/:id" element={<TicketDetailScreen onExpired={expireSession} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    )
  }

  return (
    <section aria-labelledby="login-title">
      <h2 id="login-title">Iniciar sesión</h2>
      <form onSubmit={signIn}>
        <label htmlFor="login-email">Correo electrónico</label>
        <input id="login-email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>
    </section>
  )
}
