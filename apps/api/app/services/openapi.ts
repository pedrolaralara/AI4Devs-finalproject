import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { userRoles } from '#models/ticket_types'

const require = createRequire(import.meta.url)
const { default: autoSwagger } = require('adonis-autoswagger') as {
  default: typeof import('adonis-autoswagger').default
}

export const openApiFile = app.makePath('tmp/openapi.json')

type Schema = {
  type?: string
  properties: Record<
    string,
    { type?: string; format?: string; example?: unknown; required?: boolean }
  >
  required?: string[]
  example?: unknown
}
type MediaTypes = Record<string, { example?: unknown }>
type Operation = {
  responses: Record<string, { content?: MediaTypes; description: string }>
  requestBody?: { required?: boolean; content: MediaTypes }
  security?: Record<string, string[]>[]
}
type OpenApiDocument = {
  paths: Record<string, Record<string, Operation>>
  components: {
    schemas: Record<string, Schema>
    securitySchemes: Record<string, { type: string; in: string; name: string }>
  }
}

function schemaReferences(value: unknown) {
  return Array.from(
    JSON.stringify(value).matchAll(/"#\/components\/schemas\/([^"]+)"/g),
    (match) => match[1],
  )
}

/** Generates the API description from registered routes and controller annotations. */
export async function generateOpenApi() {
  const root = router.toJSON().root.map((route) => {
    // AutoSwagger expects a module reference in the AdonisJS 6 format.
    const handler = route.handler
    if (typeof handler !== 'object') return route

    const module = handler.importExpression?.match(/import\(['"]([^'"]+)['"]\)/)?.[1]
    return module && handler.method
      ? { ...route, handler: { ...handler, reference: `${module}.${handler.method}` } }
      : route
  })

  const document: OpenApiDocument = await autoSwagger.json(
    { root },
    {
      path: fileURLToPath(app.appRoot),
      title: 'Requesto API',
      version: '0.1.0',
      description: 'API de Requesto.',
      tagIndex: 2,
      snakeCase: false,
      fileNameInSummary: false,
      ignore: ['/api/health', '/api/openapi.json', '/api/docs/scalar.js', '/docs'],
      common: { headers: {}, parameters: {} },
      productionEnv: 'openapi-artifact',
    },
  )

  const { paths, components } = document
  const { schemas } = components
  const profile = { id: '42', fullName: 'Cuenta de ejemplo', role: 'requester' }
  const credentials = { email: 'persona@example.test', password: 'ejemplo' }
  const login = paths['/api/auth/login'].post
  const me = paths['/api/auth/me'].get
  const logout = paths['/api/auth/logout'].post

  // AutoSwagger treats TypeScript aliases as refs and Vine required fields as property flags.
  Object.assign(schemas.SessionProfile.properties, {
    id: { type: 'string', pattern: '^[0-9]+$', example: profile.id },
    role: { type: 'string', enum: userRoles, example: profile.role },
  })
  const validator = schemas.loginValidator
  validator.required = []
  for (const [field, property] of Object.entries(validator.properties)) {
    if (property.required) validator.required.push(field)
    delete property.required
  }
  validator.properties.email.format = 'email'
  validator.properties.password.format = 'password'
  validator.example = credentials
  if (login.requestBody) {
    login.requestBody.required = true
    login.requestBody.content['application/json'].example = credentials
  }

  for (const operation of [login, me]) {
    const response = operation.responses['200'].content?.['application/json']
    if (response) response.example = profile
  }
  for (const operation of [paths['/api/auth/csrf'].get, logout]) {
    delete operation.responses['204'].content
  }
  components.securitySchemes = {
    sessionCookie: { type: 'apiKey', in: 'cookie', name: 'adonis-session' },
  }
  me.security = [{ sessionCookie: [] }]

  // Publish only schemas referenced by a documented operation.
  const referenced = new Set(schemaReferences(paths))
  for (const name of referenced) {
    if (!schemas[name]) throw new Error(`Missing OpenAPI schema: ${name}`)
    for (const dependency of schemaReferences(schemas[name])) referenced.add(dependency)
  }
  components.schemas = Object.fromEntries([...referenced].map((name) => [name, schemas[name]]))

  return document
}
