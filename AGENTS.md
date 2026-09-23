# AGENTS.md

Contexto para asistentes de código (Claude Code, Copilot, Cursor, etc.) que trabajen en este repositorio. `CLAUDE.md` es un enlace simbólico a este archivo: edita siempre `AGENTS.md`.

## Qué es este proyecto

Proyecto final del máster **AI4Devs** (LIDR). El objetivo es construir un producto completo usando asistentes de IA en todas las fases del ciclo de desarrollo, y documentarlo.

**Producto:** una herramienta de gestión de tickets de un único tipo de issue. Es como un Jira Service Management, pero especializado en un tipo de petición concreto en lugar de ser genérico.

> Pendiente de definir: tipo de ticket, usuarios y roles, ciclo de vida (estados, aprobaciones, SLA) y alcance del MVP.

## Estructura del repositorio

| Ruta | Propósito |
|------|-----------|
| `readme.md` | Documentación entregable del proyecto (plantilla oficial del máster): ficha, producto, arquitectura, modelo de datos, API, historias de usuario, tickets y PRs. |
| `prompts.md` | Registro de los prompts principales usados con asistentes de IA, organizados por las mismas secciones que `readme.md` (máximo 3 por sección). |
| `AGENTS.md` | Este archivo. Contexto para agentes. |
| `CLAUDE.md` | Enlace simbólico a `AGENTS.md`. |

## Stack técnico

> Pendiente de decidir: backend, frontend, base de datos, infraestructura y despliegue.

## Convenciones

- **Idioma:** la documentación, los commits y la comunicación van en español. El código (identificadores, nombres de ficheros) va en inglés.
- **Ramas:** el trabajo se hace en ramas `feature/<descripcion>` y se integra en `main` mediante pull request. La rama de la primera entrega es `feature/entrega-1-PLL`.
- **Commits:** mensajes cortos en español, en imperativo (p. ej. "Añadir modelo de datos de tickets").
- **Documentación:** al tomar una decisión relevante (arquitectura, modelo de datos, API, etc.), actualiza la sección correspondiente de `readme.md`. Si surge de un prompt significativo, regístralo en `prompts.md`.
- No subas configuración local del IDE (`.idea/` está en `.gitignore`) ni secretos.

## Notas del entorno

El repositorio está dentro de iCloud Drive. Evita directorios pesados sin ignorar (p. ej. `node_modules/`, `.venv/`) y vigila la aparición de ficheros duplicados del tipo `archivo 2.md`.
