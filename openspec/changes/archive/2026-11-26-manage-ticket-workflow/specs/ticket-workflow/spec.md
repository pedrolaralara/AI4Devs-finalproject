## ADDED Requirements

### Requirement: Aplicar la matriz de estados y permisos

El sistema SHALL aplicar la matriz aprobada del PRD a cada cambio de estado o asignación. Solo las cuentas activas con rol `agent` pueden ser seleccionadas como asignadas.

#### Scenario: Asignarse e iniciar el trabajo

- **GIVEN** un operador y un ticket `Open` sin asignar
- **WHEN** el operador se lo asigna y después inicia el trabajo
- **THEN** el ticket pasa por `Assigned` y queda en `In progress` con ese operador como asignado

#### Scenario: Asignar o reasignar como supervisor

- **GIVEN** un supervisor y un ticket en `Open` o `Assigned`
- **WHEN** el supervisor selecciona un operador activo
- **THEN** el ticket queda en `Assigned` con el operador elegido

#### Scenario: Poner en espera, retomar y resolver

- **GIVEN** un ticket en `In progress` y el operador asignado o un supervisor
- **WHEN** pone el ticket en espera y después retoma el trabajo y lo resuelve
- **THEN** el ticket pasa por `Pending user`, vuelve a `In progress` y termina en `Solved`

#### Scenario: Cerrar una petición resuelta

- **GIVEN** un ticket en `Solved`
- **WHEN** su reportero, peticionario o supervisor, lo cierra
- **THEN** queda en `Closed`

#### Scenario: Cancelar una petición

- **GIVEN** un ticket en `Open`, `Assigned`, `In progress` o `Pending user`
- **WHEN** el reportero, el operador asignado o un supervisor lo cancela
- **THEN** queda en `Canceled`

#### Scenario: Rechazar un cambio prohibido

- **WHEN** se solicita un salto fuera de la matriz, se intenta asignar a otra persona sin permiso o se intenta cambiar un estado final
- **THEN** el ticket conserva su estado, asignado e historial

### Requirement: Mostrar y registrar los cambios

El sistema SHALL mostrar solo las acciones permitidas y registrar el resultado de cada acción válida.

#### Scenario: Abrir el detalle

- **WHEN** una persona abre un ticket visible
- **THEN** ve las acciones permitidas para el estado actual, su rol y su relación con el ticket

#### Scenario: Consultar el historial tras un cambio

- **WHEN** se cambia el estado o el asignado de un ticket
- **THEN** el historial identifica al actor, la fecha y los valores anterior y nuevo. Registra `status_changed` si cambia el estado y `assigned` si cambia el asignado

### Requirement: Contrato HTTP de transiciones

La API SHALL reutilizar la visibilidad del detalle. Un ticket inexistente y uno no visible devuelven el mismo `404`.

#### Scenario: Consultar las acciones permitidas

- **WHEN** una sesión activa solicita `GET /api/tickets/:id/transitions` de un ticket visible
- **THEN** recibe `200` con `[{ to, requiresAssignee }]`. Si no hay acciones posibles recibe `[]`

#### Scenario: Consultar las opciones de asignación

- **GIVEN** un supervisor con una sesión activa y un ticket visible
- **WHEN** solicita `GET /api/tickets/:id/eligible-assignees`
- **THEN** recibe `200` con `[{ id, fullName }]` de operadores activos, excluyendo al asignado actual. Sin acción de asignar o reasignar recibe `[]`. Una sesión activa de otro rol recibe `403` si puede ver el ticket, o `404` si está fuera de su visibilidad

#### Scenario: Ejecutar una acción válida

- **GIVEN** una sesión activa, CSRF válido y una acción permitida
- **WHEN** el cliente envía `POST /api/tickets/:id/transitions` con `to`, `expectedRevision` y, cuando corresponda, `assigneeId`
- **THEN** recibe `200` con el ticket actualizado, con `workflowRevision` incrementada. El cambio y su historial se guardan juntos. `solvedAt` se rellena al resolver y `closedAt` al cerrar o cancelar

#### Scenario: Detectar reasignaciones concurrentes

- **GIVEN** un ticket visible en `Assigned` y dos solicitudes válidas con la misma revisión
- **WHEN** se intenta reasignar el ticket dos veces con esa revisión
- **THEN** solo una reasignación se guarda. La otra recibe `409` y no añade un evento

#### Scenario: Rechazar la operación

- **WHEN** se solicita una operación sin sesión, sobre un ticket no visible, sin permiso, con datos o transición inválidos, o sobre una versión que cambió
- **THEN** la API devuelve respectivamente `401`, `404`, `403`, `422` o `409` cuando se cumplen las comprobaciones anteriores. El POST exige CSRF y su rechazo devuelve `403`
