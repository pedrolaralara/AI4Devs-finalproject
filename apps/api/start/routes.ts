import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router.get('/csrf', [AuthController, 'csrf'])
    router.post('/login', [AuthController, 'login'])
    router.get('/me', [AuthController, 'me'])
    router.post('/logout', [AuthController, 'logout'])
  })
  .prefix('/api/auth')

router.get('/api/health', async ({ logger, response }) => {
  try {
    await db.rawQuery('SELECT 1')
    return { status: 'ok' }
  } catch (error) {
    logger.warn({ err: error }, 'Database readiness check failed')
    return response.serviceUnavailable({ status: 'unavailable' })
  }
})
