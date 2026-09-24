# Monorepo con npm workspaces

## Estado

Aceptado (24/09/2026)

## Contexto y problema

El proyecto tiene dos aplicaciones TypeScript (API y SPA), tests E2E que prueban ambas a la vez, configuración de despliegue común y una única herramienta de lint y formato (Biome). Además, la entrega del máster se hace sobre un único repositorio (fork de la plantilla oficial).

## Opciones consideradas

* Monorepo con npm workspaces (`apps/api`, `apps/web`)
* Monorepo con pnpm workspaces o Turborepo
* Dos repositorios separados

## Decisión

Se elige **un monorepo con npm workspaces**, porque:

* La entrega exige un único repositorio.
* Un cambio que afecta a API y SPA (p. ej. un campo nuevo del ticket) va en una sola pull request.
* Biome, TypeScript, los tests E2E y Docker Compose se configuran una sola vez en la raíz.
* npm viene con Node.js: no añade herramientas que haya que instalar en el servidor on-premise.

## Consecuencias

* Los tipos compartidos entre API y SPA (p. ej. los estados del ticket) pueden vivir en un paquete común si hace falta más adelante.
* Sin Turborepo no hay caché de builds entre paquetes; con dos aplicaciones pequeñas no compensa la complejidad.
