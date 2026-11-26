export type SessionProfile = {
  id: string
  fullName: string
  role: 'requester' | 'agent' | 'supervisor'
}

export class SessionRequestError extends Error {}

const connectionError = 'No se pudo conectar con la API.'

export async function getSession(signal: AbortSignal): Promise<SessionProfile | null> {
  const response = await fetch('/api/auth/me', { signal, cache: 'no-store' })
  if (response.status === 401) return null
  if (!response.ok) throw new SessionRequestError(connectionError)

  return response.json()
}

async function getCsrfToken() {
  const response = await fetch('/api/auth/csrf', { cache: 'no-store' })
  if (!response.ok) throw new SessionRequestError(connectionError)

  const cookieName = 'XSRF-TOKEN='
  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(cookieName))
  if (!cookie) throw new SessionRequestError('No se pudo preparar la sesión. Inténtalo de nuevo.')

  return decodeURIComponent(cookie.slice(cookieName.length))
}

export async function login(email: string, password: string): Promise<SessionProfile> {
  const token = await getCsrfToken()
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
    body: JSON.stringify({ email, password }),
  })

  if (response.status === 400)
    throw new SessionRequestError('El email o la contraseña son incorrectos.')
  if (response.status === 422) throw new SessionRequestError('Revisa el email y la contraseña.')
  if (!response.ok) throw new SessionRequestError('No se pudo iniciar sesión. Inténtalo de nuevo.')

  return response.json()
}

export async function logout() {
  const token = await getCsrfToken()
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'X-XSRF-TOKEN': token },
  })
  if (!response.ok) throw new SessionRequestError('No se pudo cerrar sesión. Inténtalo de nuevo.')
}
