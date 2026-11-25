import router from '@adonisjs/core/services/router'

router.get('/api/health', () => ({ status: 'ok' }))
