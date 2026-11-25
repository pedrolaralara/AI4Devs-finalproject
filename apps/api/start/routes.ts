import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

router.get('/api/health', async ({ logger, response }) => {
  try {
    await db.rawQuery('SELECT 1')
    return { status: 'ok' }
  } catch (error) {
    logger.warn({ err: error }, 'Database readiness check failed')
    return response.serviceUnavailable({ status: 'unavailable' })
  }
})
