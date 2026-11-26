import { type SubmitEvent, useEffect, useState } from 'react'
import { getSession, login, logout, type SessionProfile, SessionRequestError } from './session-api'

const roleLabels: Record<SessionProfile['role'], string> = {
  requester: 'Peticionario',
  agent: 'Operador',
  supervisor: 'Supervisor',
}

export function SessionScreen() {
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
    } catch {
      setError('No se pudo cerrar sesión. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

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
    return (
      <section aria-labelledby="session-title">
        <h2 id="session-title">{profile.fullName}</h2>
        <p>{roleLabels[profile.role]}</p>
        {error && <p role="alert">{error}</p>}
        <button type="button" disabled={busy} onClick={signOut}>
          {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </section>
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
