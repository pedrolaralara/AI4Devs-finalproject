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

| Criterios del README | Escenarios | Contrato y diseño |
|---|---|---|
| 1–3 · Asignación | Asignarse, asignar y reasignar, denegar asignación a otro. | POST de transiciones y regla de asignación. |
| 4–8 y 11 · Flujo y permisos | Iniciar, poner en espera, retomar, resolver, cerrar y cancelar. Rechazar estados finales y saltos. | Matriz independiente de pruebas y visibilidad compartida con el detalle. |
| 9 · Historial | Cambio atómico con autor y fecha. | Actualización e inserción de eventos en la misma transacción. |
| 10 · Interfaz | Ofrecer las acciones permitidas. | GET de transiciones y recarga del detalle tras la operación. |
