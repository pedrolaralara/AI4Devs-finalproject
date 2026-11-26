import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import router from '@adonisjs/core/services/router'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { generateOpenApi, openApiFile } from '#services/openapi'

export default class OpenApi extends BaseCommand {
  static commandName = 'openapi:generate'
  static description = 'Genera el contrato OpenAPI de Requesto'
  static options: CommandOptions = { startApp: true }

  async run() {
    router.commit()
    const spec = await generateOpenApi()
    await mkdir(dirname(openApiFile), { recursive: true })
    await writeFile(openApiFile, `${JSON.stringify(spec, null, 2)}\n`)
  }
}
