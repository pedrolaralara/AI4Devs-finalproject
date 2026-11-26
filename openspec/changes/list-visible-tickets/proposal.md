## Why

El equipo necesita encontrar tickets y abrir su detalle desde una lista que respete la visibilidad de cada rol.

## What Changes

- Mostrar los tickets visibles y enlazar al detalle de cada uno.
- Permitir combinar filtros, buscar por título y descripción, ordenar y paginar.

### Fuera de alcance

- Kanban, exportaciones, edición de tickets y agente de IA.

## Capabilities

### New Capabilities

- `ticket-list`: listado y búsqueda de tickets visibles.

### Modified Capabilities

Ninguna.

## Impact

- [HU-02 en Linear](https://linear.app/pedrolaralara/issue/PED-12), [lista básica](https://linear.app/pedrolaralara/issue/PED-28), [filtros y paginación](https://linear.app/pedrolaralara/issue/PED-97) y [verificación](https://linear.app/pedrolaralara/issue/PED-98).
- [PRD](../../../PRD/PRD.md#visibilidad-de-tickets) y [contrato de la API](../../../readme.md#4-especificación-de-la-api).
- La [especificación](specs/ticket-list/spec.md) se traduce en el [diseño](design.md). Las pruebas de [listado](../../../apps/api/tests/functional/ticket_list.spec.ts) y [OpenAPI](../../../apps/api/tests/functional/openapi.spec.ts) cubren el contrato HTTP. [Playwright](../../../e2e/ticket-list.spec.ts) verifica la visibilidad por rol y el regreso a la misma página al volver del detalle.

## Trazabilidad

Los criterios de la [historia](../../../readme.md#hu-02--lista-de-tickets-con-filtros) se corresponden con los requisitos de la spec.

| Criterio | Evidencia |
|---|---|
| CA-1 · Visibilidad | Japa comprueba la sesión y el total por rol. Playwright verifica el conjunto visible para peticionario, operador y supervisor. |
| CA-2 · Filtros | Japa cubre filtros combinados, búsqueda literal y entradas inválidas. Playwright combina estados y texto. |
| CA-3 · Navegación | Japa comprueba los metadatos de página. Playwright abre un detalle desde la página 2 y comprueba que el listado restaura la consulta y el resultado. |
