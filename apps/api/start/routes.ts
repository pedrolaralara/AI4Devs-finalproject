import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

const ApiDocsController = () => import('#controllers/api_docs_controller')
const AuthController = () => import('#controllers/auth_controller')
const TicketsController = () => import('#controllers/tickets_controller')

router
  .group(() => {
    router.get('/csrf', [AuthController, 'csrf'])
    router.post('/login', [AuthController, 'login'])
    router.get('/me', [AuthController, 'me'])
    router.post('/logout', [AuthController, 'logout'])
  })
  .prefix('/api/auth')

router.post('/api/tickets', [TicketsController, 'store'])
router.get('/api/tickets/:id', [TicketsController, 'show'])

router.get('/api/openapi.json', [ApiDocsController, 'spec'])
router.get('/api/docs/scalar.js', [ApiDocsController, 'script'])
router.get('/docs', [ApiDocsController, 'index'])

router.get('/api/health', async ({ logger, response }) => {
  try {
    await db.rawQuery('SELECT 1')
    return { status: 'ok' }
  } catch (error) {
    logger.warn({ err: error }, 'Database readiness check failed')
    return response.serviceUnavailable({ status: 'unavailable' })
  }
})
