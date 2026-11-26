import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'
import { verifySessionCredentials } from '#services/session_credentials'
import { loginValidator } from '#validators/login'
import type { SessionProfile } from '../interfaces/session.js'

function profile(user: User): SessionProfile {
  return { id: user.id, fullName: user.fullName, role: user.role }
}

export default class AuthController {
  /**
   * @csrf
   * @summary Obtener el token CSRF
   * @description Shield entrega la cookie XSRF-TOKEN para las peticiones de inicio y cierre.
   * @responseBody 204 -  - Token disponible en la cookie XSRF-TOKEN
   * @responseHeader 204 - Set-Cookie - Incluye XSRF-TOKEN y adonis-session
   */
  csrf({ response }: HttpContext) {
    response.noContent()
  }

  /**
   * @login
   * @throws When the credentials payload fails validation.
   * @summary Iniciar sesión
   * @description Autentica una cuenta activa y establece la cookie HttpOnly adonis-session.
   * @paramHeader X-XSRF-TOKEN - Valor de la cookie XSRF-TOKEN - @type(string) @required
   * @requestBody <loginValidator>
   * @responseBody 200 - <SessionProfile> - Perfil autenticado
   * @responseHeader 200 - Set-Cookie - Incluye la cookie adonis-session de la cuenta autenticada
   * @responseBody 400 - <SessionError> - INVALID_CREDENTIALS
   * @responseBody 403 - <SessionError> - INVALID_CSRF_TOKEN
   * @responseBody 422 - <ValidationErrors> - Cuerpo inválido según VineJS
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

  /**
   * @me
   * @summary Consultar el perfil de sesión
   * @description Requiere la cookie adonis-session de una cuenta activa.
   * @responseBody 200 - <SessionProfile> - Perfil autenticado
   * @responseBody 401 - <SessionError> - UNAUTHENTICATED
   */
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

  /**
   * @logout
   * @summary Cerrar sesión
   * @description Revoca la sesión identificada por la cookie adonis-session.
   * @paramHeader X-XSRF-TOKEN - Valor de la cookie XSRF-TOKEN - @type(string) @required
   * @responseBody 204 -  - Sesión cerrada
   * @responseBody 403 - <SessionError> - INVALID_CSRF_TOKEN
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.noContent()
  }
}
