## Why

HU-04 permite que un operador lleve un Request desde `Open` hasta `Solved` y que el reportero pueda cerrarlo después.

## What Changes

- Aplicar la matriz aprobada de estados, roles y relaciones con el ticket.
- Consultar y ejecutar las transiciones autorizadas desde el detalle.
- Guardar el cambio, sus marcas de tiempo y el historial en una transacción.

### Fuera de alcance

- Reapertura, retorno automático al comentar, escritura de comentarios, edición de campos, notificaciones, SLA, acciones masivas y Kanban.

## Capabilities

### New Capabilities

- `ticket-workflow`: consulta y ejecución de transiciones de un Request.

### Modified Capabilities

Ninguna.

## Impact

- [HU-04](https://linear.app/pedrolaralara/issue/PED-11), [especificación PED-86](https://linear.app/pedrolaralara/issue/PED-86), [API PED-16](https://linear.app/pedrolaralara/issue/PED-16), [web PED-29](https://linear.app/pedrolaralara/issue/PED-29) y [verificación PED-30](https://linear.app/pedrolaralara/issue/PED-30). El alcance del cierre por el reportero se sigue en [PED-23](https://linear.app/pedrolaralara/issue/PED-23).
- [Matriz de estados del PRD](../../../PRD/PRD.md#6-flujo-de-estados) y [criterios de HU-04](../../../readme.md#hu-04--gestionar-el-flujo-de-un-ticket).

## Trazabilidad

Los criterios enlazan con la [spec y el contrato HTTP](specs/ticket-workflow/spec.md) y con el [diseño](design.md). El OpenAPI generado se publica en `/api/openapi.json`.

| Criterios del README | Escenarios | Contrato, diseño y pruebas |
|---|---|---|
| 1–3 · Asignación | Asignarse, asignar y reasignar, denegar asignación a otro. | El POST aplica la regla de asignación. Japa prueba la autoasignación, la asignación a un operador activo y el rechazo a asignar a otro sin permiso. |
| 4–8 y 11 · Flujo y permisos | Iniciar, poner en espera, retomar, resolver, cerrar y cancelar. Rechazar estados finales y saltos. | La matriz unitaria es independiente del código. Japa funcional prueba el recorrido, la cancelación y los rechazos de la API. La escritura de comentarios está fuera del alcance. |
| 9 · Historial | Cambio atómico con autor y fecha. | Japa comprueba marcas de tiempo, rollback y una sola escritura de historial frente a dos reasignaciones con la misma revisión. |
| 10 · Interfaz | Ofrecer las acciones permitidas. | Japa comprueba el GET y sus esquemas OpenAPI. Los controles del detalle y su verificación quedan en PED-29 y PED-30. |

[Matriz unitaria](../../../apps/api/tests/unit/ticket_workflow.spec.ts), [API de transiciones en Japa](../../../apps/api/tests/functional/ticket_transitions.spec.ts) y [regresión del OpenAPI](../../../apps/api/tests/functional/openapi.spec.ts).
