import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { ticketEventTypes, ticketStatuses, userRoles } from '#models/ticket_types'

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

function normalizeRequiredFields(schema: Schema) {
  schema.required = []
  for (const [field, property] of Object.entries(schema.properties)) {
    if (property.required) schema.required.push(field)
    delete property.required
  }
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
  normalizeRequiredFields(validator)
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

  const createTicket = paths['/api/tickets'].post
  const ticketInput = schemas.createTicketValidator
  normalizeRequiredFields(ticketInput)
  Object.assign(ticketInput, { additionalProperties: false })
  Object.assign(ticketInput.properties, {
    urgency: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
    impact: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
  })
  const ticketExample = {
    title: 'Alta de acceso',
    description: 'Necesito acceso a la herramienta interna.',
    urgency: 4,
    impact: 5,
  }
  ticketInput.example = ticketExample
  if (createTicket.requestBody) {
    createTicket.requestBody.required = true
    createTicket.requestBody.content['application/json'].example = ticketExample
  }
  createTicket.security = [{ sessionCookie: [] }]
  Object.assign(schemas.TicketReporter.properties.id, { pattern: '^[0-9]+$', example: '7' })
  const dates = { type: 'string', format: 'date-time' }
  Object.assign(schemas.CreatedTicket.properties, {
    id: { type: 'string', pattern: '^[0-9]+$', example: '42' },
    key: { type: 'string', example: 'REQ-42' },
    type: { type: 'string', enum: ['request'] },
    status: { type: 'string', enum: ['open'] },
    urgency: { type: 'integer', minimum: 1, maximum: 5 },
    impact: { type: 'integer', minimum: 1, maximum: 5 },
    priority: { type: 'integer', minimum: 1, maximum: 5, readOnly: true },
    assignee: { type: 'object', nullable: true, enum: [null] },
    solvedAt: { ...dates, nullable: true, enum: [null] },
    closedAt: { ...dates, nullable: true, enum: [null] },
    createdAt: dates,
    updatedAt: dates,
  })
  const created = createTicket.responses['201'].content?.['application/json']
  if (created) {
    created.example = {
      ...ticketExample,
      id: '42',
      key: 'REQ-42',
      type: 'request',
      status: 'open',
      priority: 4,
      reporter: { id: '7', fullName: 'Cuenta de ejemplo' },
      assignee: null,
      solvedAt: null,
      closedAt: null,
      createdAt: '2026-11-26T10:00:00.000Z',
      updatedAt: '2026-11-26T10:00:00.000Z',
    }
  }

  const viewTicket = paths['/api/tickets/{id}'].get
  viewTicket.security = [{ sessionCookie: [] }]
  Object.assign(schemas.TicketDetail.properties, schemas.CreatedTicket.properties, {
    status: { type: 'string', enum: ticketStatuses },
    assignee: {
      type: 'object',
      nullable: true,
      allOf: [{ $ref: '#/components/schemas/TicketReporter' }],
    },
    solvedAt: { ...dates, nullable: true },
    closedAt: { ...dates, nullable: true },
    workflowRevision: { type: 'integer', minimum: 0, example: 0 },
  })
  Object.assign(schemas.TicketComment.properties, {
    id: { type: 'string', pattern: '^[0-9]+$' },
    createdAt: dates,
  })
  const nullableText = { type: 'string', nullable: true }
  Object.assign(schemas.TicketHistoryEntry.properties, {
    id: { type: 'string', pattern: '^[0-9]+$' },
    eventType: { type: 'string', enum: ticketEventTypes },
    field: nullableText,
    oldValue: nullableText,
    newValue: nullableText,
    createdAt: dates,
  })
  const detail = viewTicket.responses['200'].content?.['application/json']
  if (detail) {
    detail.example = {
      ...(created?.example as object),
      workflowRevision: 0,
      comments: [],
      history: [],
    }
  }

  const transitionRoutes = paths['/api/tickets/{id}/transitions']
  transitionRoutes.get.security = [{ sessionCookie: [] }]
  const options = transitionRoutes.get.responses['200'].content?.['application/json']
  if (options) options.example = [{ to: 'assigned', requiresAssignee: true }]
  const transition = transitionRoutes.post
  transition.security = [{ sessionCookie: [] }]
  const transitionBody = schemas.ticketTransitionValidator
  normalizeRequiredFields(transitionBody)
  Object.assign(transitionBody, { additionalProperties: false })
  Object.assign(transitionBody.properties, {
    to: { type: 'string', enum: ticketStatuses },
    assigneeId: { type: 'string', pattern: '^[1-9][0-9]{0,18}$' },
    expectedRevision: { type: 'integer', minimum: 0, maximum: 2147483647 },
  })
  const transitionExample = { to: 'assigned', expectedRevision: 0, assigneeId: '10' }
  transitionBody.example = transitionExample
  if (transition.requestBody) {
    transition.requestBody.required = true
    transition.requestBody.content['application/json'].example = transitionExample
  }
  const transitionResult = transition.responses['200'].content?.['application/json']
  if (transitionResult) {
    transitionResult.example = {
      ...(detail?.example as object),
      status: 'assigned',
      assignee: { id: '10', fullName: 'Operador de ejemplo' },
      workflowRevision: 1,
    }
  }
  const transitionValidation = transition.responses['422'].content?.['application/json']
  if (transitionValidation) {
    Object.assign(transitionValidation, {
      schema: {
        oneOf: [
          { $ref: '#/components/schemas/ValidationErrors' },
          { $ref: '#/components/schemas/SessionError' },
        ],
      },
    })
  }
  Object.assign(schemas.TicketTransitionOption.properties, {
    to: { type: 'string', enum: ticketStatuses },
  })

  // Publish only schemas referenced by a documented operation.
  const referenced = new Set(schemaReferences(paths))
  for (const name of referenced) {
    if (!schemas[name]) throw new Error(`Missing OpenAPI schema: ${name}`)
    for (const dependency of schemaReferences(schemas[name])) referenced.add(dependency)
  }
  components.schemas = Object.fromEntries([...referenced].map((name) => [name, schemas[name]]))

  return document
}
