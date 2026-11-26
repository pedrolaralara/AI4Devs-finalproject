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
