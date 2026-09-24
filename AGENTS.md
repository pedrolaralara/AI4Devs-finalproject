an# AGENTS.md

Contexto para asistentes de código (Claude Code, Copilot, Cursor, etc.) que trabajen en este repositorio. `CLAUDE.md` es un enlace simbólico a este archivo: edita siempre `AGENTS.md`.

## Qué es este proyecto

**Nombre del producto: Requesto.**

Proyecto final del máster **AI4Devs 2026/06 Rookies** (LIDR). Consiste en desarrollar un producto de software de inicio a fin, integrando IA en **todas las fases**: idea y documentación, código, testing y despliegue. Debe ser un proyecto real y funcional que aplique lo aprendido en el máster. El dominio es libre; en este caso, un módulo inspirado en el trabajo real del alumno. Dedicación estimada: unas 30 horas en total.

### Necesidad (driver)

Una empresa usa **Jira Service Management (JSM) Data Center** on-premise, y Atlassian ha anunciado su fin de vida (EOL). Hay que sustituirlo, y **no se quiere migrar a JSM Cloud**.

Por eso la aplicación debe poder **desplegarse on-premise**, en infraestructura propia, sin depender de servicios SaaS para funcionar.

### Solución

Una **aplicación web** que gestiona el tipo de ticket que la empresa tiene implementado hoy en JSM. Es una versión deliberadamente sencilla:

- **Un solo tipo de ticket** (issue).
- **Un formulario fijo**, con campos fijos.
- **Un flujo fijo** (workflow de estados).

No es un clon genérico de JSM: no hay tipos de issue, formularios ni workflows configurables. Si una funcionalidad solo tiene sentido con configurabilidad genérica, queda fuera de alcance salvo que los requisitos digan lo contrario.

**La fuente de verdad de los requisitos es [`PRD/PRD.md`](PRD/PRD.md)**: alcance, campos, cálculo de prioridad, flujo de estados y permisos, incluidos los puntos pendientes. Resumen:

- **Tipo de ticket:** `Request` (único).
- **Alcance:** CRUD de tickets, lista, Kanban, detalle, filtros (en lista y Kanban) y explotación de la información mediante un **agente de IA** (dashboards: por decidir).
- **Campos:** id, tipo, título, descripción, reporter, assignee, estado, fecha de creación, urgencia (1-5), impacto (1-5), prioridad (automática, 1-5, a partir de urgencia × impacto), historial (automático) y comentarios con fecha.
- **Flujo:** `Open → Assigned → In progress → Solved → Closed`, con los estados alternativos `Pending user` y `Canceled`.

### Stakeholders y roles

| Rol | Identificador en código | Descripción y permisos |
|-----|-------------------------|------------------------|
| Usuario | `requester` | Peticionario. Abre, cancela y cierra tickets. |
| Agente (operador) | `agent` | Atiende los tickets. Se asigna tickets y los pasa a *In progress*, *Pending user*, *Canceled* y *Solved*. |
| Supervisor | `supervisor` | Todo lo del agente y, además, asigna tickets a un agente. También revisa la información de los tickets. |

En código se usa `requester` en lugar de `user` para no confundir el rol con la entidad `User`, que representa a cualquier persona con cuenta (sea cual sea su rol). En el ticket, el `reporter` es el usuario que lo abrió y el `assignee` el agente asignado.

## Entregas

| # | Contenido | Rama | Fecha |
|---|-----------|------|-------|
| 1 | **Documentación técnica:** ficha del proyecto, descripción, arquitectura, modelo de datos, historias de usuario y tickets de trabajo. | `feature/entrega-1-PLL` | Jueves 24/09/2026 |
| 2 | **Código funcional:** backend, frontend y BD conectados. El flujo principal operativo, aunque no esté 100 % completo. | `feature/entrega-2-PLL` | Jueves 22/10/2026 |
| 3 | **Entrega final:** código funcional + tests (unitarios, integración, E2E) + despliegue + documentación de IA (`prompts.md`) + evidencia de funcionamiento. | `final-project-PLL` | Jueves 12/11/2026 |

Las entregas 1 y 2 tienen **revisión automatizada**. Solo la entrega final recibe feedback humano personalizado.

### Criterios de evaluación

El proyecto final es uno de los cuatro criterios para obtener el certificado. Se evalúa en tres ejes:

1. **Idea y arquitectura** del producto.
2. **Calidad del código.**
3. **Uso de la IA** a lo largo de todo el proceso (registro en `prompts.md`).

### Alcance del MVP

- Un MVP robusto, no una pantalla con un botón: al menos **un flujo end-to-end completo** con backend, frontend y base de datos.
- Entre **3 y 5 historias de usuario must-have** y **1-2 should-have**.
- La entrega final debe tener entre 3 y 5 funcionalidades completas, tests (unitarios, integración y al menos un E2E del flujo principal) y evidencia de despliegue (URL pública, capturas o vídeo).
- No hace falta aplicar todo lo visto en el máster: se prioriza que el producto funcione y que se vea cómo se usó la IA.

### Entrega 1 en detalle (fase actual)

**Es 100 % documentación: todavía no hay código.** No generes scaffolding ni código de aplicación salvo que se pida explícitamente.

Qué hay que tener en `readme.md` en la rama `feature/entrega-1-PLL`:

| Qué se pide | Sección de `readme.md` |
|-------------|------------------------|
| Ficha del proyecto: nombre, descripción, URL del repo | 0 |
| Descripción del producto: objetivo, características y funcionalidades | 1.1, 1.2 |
| Arquitectura del sistema y stack tecnológico elegido | 2 (sobre todo 2.1, 2.2 y 2.3) |
| Modelo de datos (diagrama mermaid con PK/FK y descripción de entidades) | 3 |
| Historias de usuario (3-5 must-have + 1-2 should-have; en el readme se documentan 3) | 5 |
| Tickets de trabajo (uno de backend, uno de frontend y uno de base de datos) | 6 |

Opcional, pero recomendable adelantarlo: especificación de la API (sección 4, máximo 3 endpoints en OpenAPI). Las secciones 1.3 (diseño y UX), 1.4 (instalación), 2.4 a 2.6 (despliegue, seguridad, tests) y 7 (pull requests) se completan en entregas posteriores.

Además, conviene ir registrando en `prompts.md` los prompts usados para generar esta documentación.

Para cerrar la entrega, el alumno abre la **pull request** de la rama y rellena el formulario de entrega indicando la URL de esa PR. En el repositorio oficial, en la sección de Pull Requests, hay ejemplos de entregas de ediciones anteriores.

### Cómo se entrega

- El repositorio es un **fork** del repositorio oficial `AI4Devs-finalproject`.
- Cada entrega va en su propia rama, con las iniciales del alumno (**PLL**). Los nombres de rama de la tabla son obligatorios: sin las iniciales la entrega no se puede identificar.
- Tras cada entrega, el alumno rellena el formulario de entrega del máster (Typeform): nombre, email, tipo de entrega y **URL de la pull request**. Sin formulario, la entrega no existe formalmente. Lo hace el alumno, no un agente.
- Si no se llega a la fecha final, se puede pedir una prórroga de hasta 2 semanas (hasta el jueves 26/11/2026), con antelación y al TA.

### Qué debe contener `prompts.md`

Es **obligatorio** y es uno de los tres ejes de evaluación. Ya no se trata solo de pegar prompts, sino de documentar el **flujo de trabajo con IA**. No hace falta registrar todos los prompts, solo los clave:

- Herramientas usadas (Claude Code, Cursor, ChatGPT, etc.).
- Modelos y para qué se usó cada uno (p. ej. uno para especificaciones y otro para programar).
- Skills, subagentes, rules o comandos personalizados, si se usaron (este `AGENTS.md` cuenta).
- Los prompts o workflows más representativos.
- Qué ajustes humanos hubo que hacer sobre lo que generó la IA.

## Estructura del repositorio

| Ruta | Propósito |
|------|-----------|
| `readme.md` | Documentación entregable del proyecto (plantilla oficial del máster): ficha, producto, arquitectura, modelo de datos, API, historias de usuario, tickets y PRs. |
| `prompts.md` | Registro de los prompts principales usados con asistentes de IA, organizados por las mismas secciones que `readme.md` (máximo 3 por sección). |
| `PRD/PRD.md` | Documento de requisitos de producto (fuente de verdad). Los puntos pendientes se concretarán en documentos de requisitos que lo detallan. |
| `docs/adr/` | Architecture Decision Records (formato MADR). Índice en `docs/adr/README.md`. |
| `AGENTS.md` | Este archivo. Contexto para agentes. |
| `CLAUDE.md` | Enlace simbólico a `AGENTS.md`. |

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 |
| Backend | AdonisJS 7 |
| Bundler | Vite |
| Linter / formatter | Biome |
| Base de datos | PostgreSQL |

- **Lenguaje:** TypeScript en front y back (AdonisJS 7 es TypeScript nativo).
- **Linter y formatter:** Biome es la única herramienta de lint y formato. No añadas ESLint ni Prettier, aunque las plantillas de AdonisJS o React los incluyan por defecto.

- **Despliegue:** on-premise. Evita dependencias de servicios cloud gestionados que no se puedan autoalojar.

- **Integración front-back:** el frontend es una **SPA** (React + Vite) independiente que consume una **API REST** expuesta por AdonisJS. No se usa Inertia.

- **Backend:** AdonisJS 7 con Lucid (ORM), VineJS (validación), `@adonisjs/auth` con guard de sesión (cookie `HttpOnly`) y `@adonisjs/bouncer` (autorización por rol). Capas: controllers finos → `app/services/` (dominio: máquina de estados, prioridad, historial) → modelos. Las reglas de flujo y permisos viven solo en los servicios y las políticas, nunca en el frontend.
- **Frontend:** React Router, TanStack Query y dnd-kit (Kanban). Estructura por funcionalidad en `src/features/`.
- **Agente de IA:** módulo `app/agent/` del backend. Usa *tool calling* con herramientas **de solo lectura** que reutilizan los servicios de dominio y respetan los permisos del usuario. Nunca genera SQL libre. El proveedor del LLM es configurable por variables de entorno.
- **Tests:** Japa (unitarios y funcionales de la API), Vitest + Testing Library (componentes), Playwright (E2E).
- **Infraestructura:** Docker Compose con tres servicios (`web` con Nginx, `api`, `db` con PostgreSQL). CI con GitHub Actions.
- **Estructura:** monorepo con npm workspaces: `apps/api`, `apps/web`, `e2e/`, `docker/`. La estructura completa está en la sección 2.3 del `readme.md`.

> Pendiente: proveedor y modelo concretos del LLM (API externa o modelo local, por la restricción on-premise).

## Convenciones

- **Idioma:** la documentación, los commits y la comunicación van en español. El código (identificadores, nombres de ficheros) va en inglés.
- **Ramas:** cada entrega tiene su rama obligatoria (ver "Entregas"). No renombres ni borres esas ramas.
- **Commits:** mensajes cortos en español, en imperativo (p. ej. "Añadir modelo de datos de tickets").
- No subas configuración local del IDE (`.idea/` está en `.gitignore`) ni secretos.

## Documentación

La documentación es *docs-as-code*: vive en el repo, se revisa en la PR y se actualiza junto con el código. Estas reglas siguen las recomendaciones del módulo 5 del máster.

- **Misma PR:** el cambio que modifica comportamiento actualiza también la documentación afectada (`readme.md`, ADRs, OpenAPI, TSDoc). Una PR que deja la documentación desactualizada no está terminada.
- **ADRs:** cada decisión técnica que alguien nuevo se preguntaría "¿por qué lo hicieron así?" tiene su ADR en `docs/adr/`, en formato MADR (Estado, Contexto y problema, Opciones consideradas, Decisión, Consecuencias), con nombre `YYYYMMDD-slug.md`. Añádelo al índice de `docs/adr/README.md`. Una decisión sustituida se marca como *Sustituido por*; no se borra.
- **Diagramas:** en Mermaid, embebidos en Markdown. Nada de imágenes de diagramas que no se puedan editar como texto.
- **API:** la especificación OpenAPI se genera desde el código con `adonis-autoswagger` y se visualiza con Scalar en `/docs`. Documenta cada acción de controller con sus comentarios (`@summary`, `@description`, `@requestBody`, `@responseBody` incluidos los errores `403`/`422`). No escribas YAML de OpenAPI a mano.
- **Código:** TSDoc en los métodos públicos de `app/services/` y `app/controllers/`. Describe el significado, los errores (`@throws`) y ejemplos si el uso no es obvio. **No repitas los tipos** en `@param` ni `@returns`: ya los da TypeScript.
- **La IA genera el borrador; una persona valida el significado.** No marques como hecha documentación generada sin comprobar que describe el comportamiento real.
- **Registro de IA:** si una decisión o un documento sale de un prompt significativo, regístralo en `prompts.md`.

### Documentación de librerías: Context7

AdonisJS 7 salió en febrero de 2026 y los modelos apenas la conocen: es fácil generar código de AdonisJS 6 que no funciona en la 7. Cuando generes código que use AdonisJS 7, Lucid, VineJS, Bouncer o React 19, consulta la documentación actualizada con **Context7 MCP** (`use context7`). Si la pregunta cruza varias librerías, consulta una por turno.

Instalación (la hace el desarrollador, una vez): `claude mcp add context7 -- npx -y @upstash/context7-mcp`.

### Pendiente para entregas 2 y 3

Validación de la documentación en CI (markdownlint-cli2, lychee para enlaces rotos, Vale para estilo y cobertura de TSDoc con TypeDoc) y un `llms.txt` en la raíz.

## Notas del entorno

La copia local de trabajo del autor (el clon en su Mac, no el repositorio de GitHub) está dentro de iCloud Drive. Si trabajas en esa copia, evita directorios pesados sin ignorar (p. ej. `node_modules/`, `.venv/`) y vigila la aparición de ficheros duplicados del tipo `archivo 2.md`.
