import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { generateOpenApi, openApiFile } from '#services/openapi'

const scalarScript = fileURLToPath(
  new URL('./browser/standalone.js', import.meta.resolve('@scalar/api-reference')),
)

let document: ReturnType<typeof generateOpenApi> | undefined

export default class ApiDocsController {
  /** Serves the generated OpenAPI document as JSON. */
  async spec({ response }: HttpContext) {
    if (app.inProduction) {
      return response.type('application/json').send(await readFile(openApiFile))
    }

    document ??= generateOpenApi().finally(() => {
      document = undefined
    })
    return response.send(await document)
  }

  /** Serves the packaged Scalar bundle on the same origin. */
  script({ response }: HttpContext) {
    return response.type('application/javascript').download(scalarScript)
  }

  /** Renders the API reference against the local OpenAPI document. */
  index({ response }: HttpContext) {
    return response.type('text/html').send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Requesto API</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/api/docs/scalar.js"></script>
    <script>
      Scalar.createApiReference('#app', { url: '/api/openapi.json', withDefaultFonts: false, telemetry: false });
    </script>
  </body>
</html>`)
  }
}
