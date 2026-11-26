## Why

Una persona necesita consultar un Request desde su URL y entender su estado, su conversación y los cambios registrados.

## What Changes

- Consultar los campos, comentarios e historial de un ticket visible.
- Cargar el detalle desde la API al abrir la URL o recargar la página.
- Aplicar la matriz de visibilidad del PRD a los tres conjuntos de datos.

### Fuera de alcance

- Publicar o editar comentarios, editar campos y ejecutar transiciones.
- Implementar la lista, el Kanban o el agente de IA.

## Capabilities

### New Capabilities

- `ticket-detail`: consulta del ticket, sus comentarios y su historial.

### Modified Capabilities

Ninguna.

## Impact

- [HU-03 en Linear](https://linear.app/pedrolaralara/issue/PED-10), [PED-81](https://linear.app/pedrolaralara/issue/PED-81) y [PED-27](https://linear.app/pedrolaralara/issue/PED-27).
- [Matriz de visibilidad del PRD](../../../../PRD/PRD.md#visibilidad-de-tickets) y [responsabilidades de los controladores](../../../../ARQUITECTURA.md).
- Depende de la sesión de HU-00 y de los datos de PED-15. Sustituye el resumen temporal que abre HU-01 tras crear un ticket.

## Trazabilidad

Los criterios del [README](../../../../readme.md#hu-03--detalle-del-ticket-con-comentarios-e-historial) enlazan con la [spec y el contrato HTTP](specs/ticket-detail/spec.md) y el [diseño](design.md). El OpenAPI generado publica `GET /api/tickets/:id` en `/api/openapi.json`.

| Criterio | Contrato y diseño | Evidencia |
|---|---|---|
| CA-1 · Detalle | `200` con los campos y ambas colecciones ordenadas. La SPA carga desde la URL. | Japa comprueba contenido, autores, orden y esquemas. Vitest comprueba los comentarios visibles y el estado vacío. Playwright crea un ticket y confirma sus datos e historial tras recargar y abrir la URL en otra pestaña. |
| CA-2 · Visibilidad | La consulta aplica la matriz del PRD. Devuelve `401` sin sesión activa y el mismo `404` para tickets inexistentes o fuera de la visibilidad. | Japa cubre los tres roles y compara los errores. Vitest verifica la pantalla de ticket no disponible y el regreso al inicio de sesión cuando caduca. |

Pruebas de [detalle en Japa](../../../../apps/api/tests/functional/ticket_detail.spec.ts), [OpenAPI en Japa](../../../../apps/api/tests/functional/openapi.spec.ts), [detalle en Vitest](../../../../apps/web/src/features/tickets/ticket-detail.test.tsx) y [creación y detalle en Playwright](../../../../e2e/ticket-creation.spec.ts).
