import app from '@adonisjs/core/services/app'
import env from '#start/env'

const appUrl = new URL(env.get('APP_URL'))
const loopbackHttp =
  appUrl.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(appUrl.hostname)

export const secureCookies = app.inProduction && !loopbackHttp
