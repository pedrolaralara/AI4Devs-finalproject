import { test } from '@japa/runner'

test('publishes the implemented session contract in OpenAPI', async ({ assert, client }) => {
  const response = await client.get('/api/openapi.json')
  response.assertStatus(200)

  const { paths, components } = response.body()
  const {
    '/api/auth/csrf': { get: csrf },
    '/api/auth/login': { post: login },
    '/api/auth/me': { get: me },
    '/api/auth/logout': { post: logout },
  } = paths

  assert.sameMembers(Object.keys(csrf.responses), ['204'])
  assert.sameMembers(Object.keys(login.responses), ['200', '400', '403', '422'])
  assert.sameMembers(Object.keys(me.responses), ['200', '401'])
  assert.sameMembers(Object.keys(logout.responses), ['204', '403'])
  assert.notProperty(csrf.responses['204'], 'content')
  assert.notProperty(logout.responses['204'], 'content')
  assert.deepEqual(me.security, [{ sessionCookie: [] }])
  assert.equal(components.schemas.SessionProfile.properties.id.type, 'string')
  assert.sameMembers(components.schemas.SessionProfile.properties.role.enum, [
    'requester',
    'agent',
    'supervisor',
  ])
  assert.sameMembers(components.schemas.loginValidator.required, ['email', 'password'])

  for (const operation of [login, logout]) {
    assert.isTrue(
      operation.parameters.some(
        (parameter: { in: string; name: string; required: boolean }) =>
          parameter.in === 'header' && parameter.name === 'X-XSRF-TOKEN' && parameter.required,
      ),
    )
  }
})

test('publishes the ticket creation contract in OpenAPI', async ({ assert, client }) => {
  const response = await client.get('/api/openapi.json')
  response.assertStatus(200)
  const { paths, components } = response.body()
  const operation = paths['/api/tickets'].post
  const input = components.schemas.createTicketValidator
  const created = components.schemas.CreatedTicket

  assert.sameMembers(Object.keys(operation.responses), ['201', '401', '403', '422'])
  assert.property(operation.responses['201'].headers, 'Location')
  assert.deepEqual(operation.security, [{ sessionCookie: [] }])
  assert.isTrue(operation.requestBody.required)
  assert.isFalse(input.additionalProperties)
  assert.sameMembers(input.required, ['title', 'description', 'urgency', 'impact'])
  assert.equal(input.properties.title.maxLength, 200)
  assert.equal(input.properties.urgency.type, 'integer')
  assert.equal(created.properties.id.type, 'string')
  assert.isTrue(created.properties.priority.readOnly)
})

test('publishes the aggregated ticket detail contract in OpenAPI', async ({ assert, client }) => {
  const response = await client.get('/api/openapi.json')
  response.assertStatus(200)
  const { paths, components } = response.body()
  const operation = paths['/api/tickets/{id}'].get
  const detail = components.schemas.TicketDetail.properties

  assert.sameMembers(Object.keys(operation.responses), ['200', '401', '404'])
  assert.deepEqual(operation.security, [{ sessionCookie: [] }])
  assert.equal(operation.parameters[0].schema.type, 'string')
  assert.equal(detail.comments.items.$ref, '#/components/schemas/TicketComment')
  assert.equal(detail.history.items.$ref, '#/components/schemas/TicketHistoryEntry')
})

test('serves the Scalar reference and its script from the API origin', async ({
  assert,
  client,
}) => {
  const reference = await client.get('/docs')
  reference.assertStatus(200)
  assert.include(reference.text(), 'src="/api/docs/scalar.js"')
  assert.include(reference.text(), "url: '/api/openapi.json'")

  const asset = await client.head('/api/docs/scalar.js')
  asset.assertStatus(200)
  assert.match(asset.header('content-type') ?? '', /javascript/)
})
