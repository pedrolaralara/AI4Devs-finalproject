## Context

El PRD define el flujo y PED-24 cerró las reglas de visibilidad, cancelación, retorno manual y cierre. La interfaz parte del detalle de HU-03.

## Decisions

- Una máquina de estados sin dependencias HTTP comparte las reglas entre la consulta y la ejecución. La API reutiliza la política de visibilidad del detalle y autoriza de nuevo al ejecutar.
- Una escritura registra las marcas de tiempo y los eventos en la misma transacción.
- El cliente presenta las acciones de la API y vuelve a consultar el detalle y sus opciones tras modificar el ticket.
- Las pruebas unitarias de Japa derivan de la matriz del PRD y mantienen sus resultados esperados independientes de la implementación. Las pruebas sobre PostgreSQL cubren persistencia, historial y concurrencia.

## Asignación, historial y concurrencia

- **Asignación.** Los supervisores asignan solo a cuentas activas con rol `agent`. PED-29 concretará el contrato del selector de operadores activos.
- **Reasignación.** Cuando `Assigned` sigue en `Assigned` y cambia el asignado, se registra `assigned` con el valor anterior y el nuevo. Se reserva `status_changed` para cambios reales de estado.
- **Mismo asignado (asumido).** Seleccionar al operador ya asignado devuelve `422` sin incrementar la revisión ni escribir historial.
- **Concurrencia.** El detalle y el resultado del POST exponen `workflowRevision`, un entero que empieza en cero. El cliente envía esa revisión como `expectedRevision`. La escritura compara e incrementa la revisión en una sola sentencia. Una revisión anterior devuelve `409`, también al reasignar sin cambiar de estado.
