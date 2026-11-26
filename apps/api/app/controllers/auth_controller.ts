import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'
import { verifySessionCredentials } from '#services/session_credentials'
import { loginValidator } from '#validators/login'

function profile(user: User) {
  return { id: user.id, fullName: user.fullName, role: user.role }
}

export default class AuthController {
  /** Returns an empty response after Shield publishes the XSRF cookie. */
  csrf({ response }: HttpContext) {
    response.noContent()
  }

  /**
   * Opens a session and returns the authenticated profile.
   * @throws When the credentials payload fails validation.
   */
  async login({ auth, request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await verifySessionCredentials(email, password)
    if (!user) {
      return response.badRequest({
        code: 'INVALID_CREDENTIALS',
        message: 'El email o la contraseña son incorrectos.',
      })
    }

    await auth.use('web').login(user)
    return profile(user)
  }

  /** Returns the current profile if the session belongs to an active account. */
  async me({ auth, response }: HttpContext) {
    const guard = auth.use('web')
    if (!(await guard.check()) || !guard.user?.isActive) {
      return response.unauthorized({
        code: 'UNAUTHENTICATED',
        message: 'Inicia sesión para continuar.',
      })
    }

    return profile(guard.user)
  }

  /** Revokes the current session and returns an empty response. */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.noContent()
  }
}
