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
- La [especificación](specs/ticket-list/spec.md) se traduce en el [diseño](design.md). Las referencias a pruebas se añadirán cuando se implementen.

La historia funcional queda pendiente de validar con el autor antes de implementar.
