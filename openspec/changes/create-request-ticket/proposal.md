## Why

HU-01 inicia el recorrido principal de Requesto. Un peticionario necesita registrar una petición para que los operadores puedan atenderla con la prioridad calculada por el sistema.

## What Changes

- Añadir el formulario de creación y la operación `POST /api/tickets`.
- Guardar un Request en estado `Open` con datos de creación automáticos y registrar su evento `created`.
- Mostrar el detalle del ticket recién creado y los errores de validación del formulario.
- Dejar para sus historias la autenticación, el desarrollo completo de la pantalla de detalle y las transiciones. Adjuntos, edición, creación en nombre de otra persona y notificaciones quedan fuera de HU-01.

## Capabilities

### New Capabilities

- `request-ticket-creation`: creación de un Request con validación, prioridad e historial inicial.

### Modified Capabilities

Ninguna.

## Impact

- Fuentes de producto: [PRD](../../../PRD/PRD.md) y [HU-01 en el README](../../../readme.md#hu-01--crear-un-ticket).
- Seguimiento: [PED-42](https://linear.app/pedrolaralara/issue/PED-42) y [PED-26](https://linear.app/pedrolaralara/issue/PED-26).
- Dependencias: HU-00 para sesión y roles, PED-15 para persistencia y HU-03 para la pantalla de detalle.
- **Validado por el autor:** camino feliz, máximo de 200 caracteres para el título y creación por peticionarios y supervisores con su propia cuenta.

## Trazabilidad

Los criterios de [HU-01 en el README](../../../readme.md#hu-01--crear-un-ticket) se corresponden con los escenarios de la [spec funcional y del contrato HTTP](specs/request-ticket-creation/spec.md) y con las decisiones del [diseño](design.md). El OpenAPI generado publica `POST /api/tickets` en `/api/openapi.json`.

| Criterio | Contrato y diseño | Evidencia |
|---|---|---|
| Creación correcta | `201` con el Request y `Location`. La SPA abre el resumen devuelto por el servidor. | Japa comprueba ambos roles y los datos asignados por el servidor. Playwright confirma la navegación desde el formulario. |
| Prioridad calculada | PostgreSQL calcula la prioridad. La vista previa usa la misma fórmula y el resumen utiliza el valor devuelto por la API. | Japa comprueba el valor persistido. Vitest distingue el valor estimado del recibido. Playwright comprueba ambos en el recorrido real. |
| Validación de campos | VineJS y la comprobación de campos admitidos devuelven `422`. La SPA vincula cada error a su campo. | Japa prueba valores inválidos y campos del servidor. Vitest comprueba que el formulario conserva los datos y presenta el error junto al campo. |
| Historial | El ticket y el evento `created` comparten transacción. HU-03 incorpora la consulta del historial en el detalle. | Japa comprueba autor y evento persistidos y fuerza un fallo para verificar el rollback. |
| Permisos | Bouncer admite peticionarios y supervisores. La API devuelve `401` sin sesión válida y `403` para un operador o un fallo de CSRF. | Japa comprueba las respuestas y la ausencia de persistencia. Vitest comprueba que un operador no puede abrir el formulario. |

Pruebas de [creación en Japa](../../../apps/api/tests/functional/ticket_creation.spec.ts), [OpenAPI en Japa](../../../apps/api/tests/functional/openapi.spec.ts), [formulario en Vitest](../../../apps/web/src/features/tickets/create-ticket.test.tsx) y [creación en Playwright](../../../e2e/ticket-creation.spec.ts).
