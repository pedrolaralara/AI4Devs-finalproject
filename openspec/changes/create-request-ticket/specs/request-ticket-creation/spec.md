## ADDED Requirements

### Requirement: Crear un Request desde una sesión autorizada

El sistema SHALL permitir a un peticionario o supervisor autenticado crear un ticket mediante `POST /api/tickets` con título, descripción, urgencia e impacto. El sistema asignará tipo `request`, estado `open`, reportero de la sesión, fecha de creación e identificador `REQ-<id>`, con el asignado vacío.

#### Scenario: Creación correcta

- **WHEN** un peticionario o supervisor autenticado envía el formulario con los cuatro campos válidos
- **THEN** la API devuelve `201`, el ticket creado y su URL en `Location`, y la interfaz abre el detalle con el identificador del ticket

#### Scenario: Petición sin sesión

- **WHEN** se intenta crear un ticket sin una sesión autenticada
- **THEN** la API devuelve `401` y no crea el ticket

#### Scenario: Creación denegada a un operador

- **WHEN** un operador autenticado intenta crear un ticket
- **THEN** la API devuelve `403` y no crea el ticket

### Requirement: Validar los datos de entrada y calcular la prioridad

El sistema SHALL exigir título y descripción, limitar el título a 200 caracteres y validar que urgencia e impacto sean enteros de 1 a 5. La prioridad será calculada como `ceil(urgencia × impacto / 5)`.

#### Scenario: Campos inválidos

- **WHEN** falta el título o la descripción, el título supera 200 caracteres o la urgencia o el impacto está fuera del rango permitido
- **THEN** la API devuelve `422` en formato VineJS, el formulario muestra los errores por campo y no se crea un ticket

#### Scenario: Prioridad de una petición

- **WHEN** se crea un ticket con urgencia 4 e impacto 5
- **THEN** se guarda con prioridad 4 y el formulario no permite introducirla manualmente

### Requirement: Registrar el evento de creación

El sistema SHALL guardar el evento `created` en la misma transacción que el ticket, con el reportero como autor.

#### Scenario: Historial de una petición nueva

- **WHEN** se completa la creación de una petición
- **THEN** el historial asociado contiene el evento `created` con el reportero como autor
