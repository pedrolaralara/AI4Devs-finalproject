# AGENTS.md

Contexto para asistentes de código (Claude Code, Copilot, Cursor, etc.) que trabajen en este repositorio. `CLAUDE.md` es un enlace simbólico a este archivo: edita siempre `AGENTS.md`.

## Qué es este proyecto

Proyecto final del máster **AI4Devs** (LIDR). El objetivo es construir un producto completo usando asistentes de IA en todas las fases del ciclo de desarrollo, y documentarlo.

### Necesidad (driver)

Una empresa usa **Jira Service Management (JSM) Data Center** on-premise, y Atlassian ha anunciado su fin de vida (EOL). Hay que sustituirlo.

### Solución

Una **aplicación web** que gestiona el tipo de ticket que la empresa tiene implementado hoy en JSM. Es una versión deliberadamente sencilla:

- **Un solo tipo de ticket** (issue).
- **Un formulario fijo**, con campos fijos.
- **Un flujo fijo** (workflow de estados).

No es un clon genérico de JSM: no hay tipos de issue, formularios ni workflows configurables. Si una funcionalidad solo tiene sentido con configurabilidad genérica, queda fuera de alcance salvo que los requisitos digan lo contrario.

Los detalles concretos (campos del formulario, estados y transiciones, roles y permisos) se definen en el PRD y en los requisitos.

### Stakeholders y roles

| Rol | Identificador en código | Descripción |
|-----|-------------------------|-------------|
| Usuario | `requester` | Peticionario: abre tickets. |
| Agente | `agent` | Operador: atiende y resuelve los tickets. |
| Supervisor | `supervisor` | Revisa informes sobre los tickets. Rol previsto, aún por confirmar su alcance. |

En código se usa `requester` en lugar de `user` para no confundir el rol con la entidad `User`, que representa a cualquier persona con cuenta (sea cual sea su rol).

> Pendiente: PRD y requisitos (tipo de ticket, campos, flujo, permisos por rol, alcance del MVP).

## Estructura del repositorio

| Ruta | Propósito |
|------|-----------|
| `readme.md` | Documentación entregable del proyecto (plantilla oficial del máster): ficha, producto, arquitectura, modelo de datos, API, historias de usuario, tickets y PRs. |
| `prompts.md` | Registro de los prompts principales usados con asistentes de IA, organizados por las mismas secciones que `readme.md` (máximo 3 por sección). |
| `AGENTS.md` | Este archivo. Contexto para agentes. |
| `CLAUDE.md` | Enlace simbólico a `AGENTS.md`. |

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React |
| Backend | AdonisJS |
| Bundler | Vite |
| Linter / formatter | Biome |
| Base de datos | PostgreSQL |

- **Lenguaje:** TypeScript en front y back (AdonisJS v6 es TypeScript nativo).
- **Linter y formatter:** Biome es la única herramienta de lint y formato. No añadas ESLint ni Prettier, aunque las plantillas de AdonisJS o React los incluyan por defecto.

> Pendiente: cómo se integran front y back (SPA separada con API REST o AdonisJS + Inertia), ORM, autenticación, tests, infraestructura y despliegue.

## Convenciones

- **Idioma:** la documentación, los commits y la comunicación van en español. El código (identificadores, nombres de ficheros) va en inglés.
- **Ramas:** el trabajo se hace en ramas `feature/<descripcion>` y se integra en `main` mediante pull request. La rama de la primera entrega es `feature/entrega-1-PLL`.
- **Commits:** mensajes cortos en español, en imperativo (p. ej. "Añadir modelo de datos de tickets").
- **Documentación:** al tomar una decisión relevante (arquitectura, modelo de datos, API, etc.), actualiza la sección correspondiente de `readme.md`. Si surge de un prompt significativo, regístralo en `prompts.md`.
- No subas configuración local del IDE (`.idea/` está en `.gitignore`) ni secretos.

## Notas del entorno

El repositorio está dentro de iCloud Drive. Evita directorios pesados sin ignorar (p. ej. `node_modules/`, `.venv/`) y vigila la aparición de ficheros duplicados del tipo `archivo 2.md`.
