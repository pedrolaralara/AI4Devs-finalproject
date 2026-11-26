# request-ticket-creation Specification

## Purpose
TBD - created by archiving change create-request-ticket. Update Purpose after archive.
## Requirements
### Requirement: Crear un Request desde una sesión autorizada

El sistema SHALL permitir a un peticionario o supervisor autenticado crear un ticket con título, descripción, urgencia e impacto. El sistema asignará tipo `request`, estado `open`, reportero de la sesión, fecha de creación e identificador `REQ-<id>`, con el asignado vacío.

#### Scenario: Creación correcta

- **WHEN** un peticionario o supervisor autenticado envía el formulario con los cuatro campos válidos
- **THEN** se crea el ticket y la interfaz abre el detalle con su identificador

#### Scenario: Petición sin sesión

- **WHEN** se intenta crear un ticket sin una sesión autenticada
- **THEN** se exige iniciar sesión y el ticket no se crea

#### Scenario: Creación denegada a un operador

- **WHEN** un operador autenticado intenta crear un ticket
- **THEN** se deniega la operación y el ticket no se crea

### Requirement: Validar los datos de entrada y calcular la prioridad

El sistema SHALL exigir título y descripción, limitar el título a 200 caracteres y validar que urgencia e impacto sean enteros de 1 a 5. La prioridad será calculada como `ceil(urgencia × impacto / 5)`.

#### Scenario: Campos inválidos

- **WHEN** falta el título o la descripción, el título supera 200 caracteres o la urgencia o el impacto está fuera del rango permitido
- **THEN** el formulario muestra los errores por campo y el ticket no se crea

#### Scenario: Prioridad de una petición

- **WHEN** se crea un ticket con urgencia 4 e impacto 5
- **THEN** se guarda con prioridad 4 y el formulario no permite introducirla manualmente

### Requirement: Registrar el evento de creación

El sistema SHALL guardar el evento `created` en la misma transacción que el ticket, con el reportero como autor.

#### Scenario: Historial de una petición nueva

- **WHEN** se completa la creación de una petición
- **THEN** el historial asociado contiene el evento `created` con el reportero como autor

### Requirement: Contrato HTTP de creación

La API SHALL autenticar la sesión, exigir CSRF y aceptar únicamente los cuatro campos del formulario en el cuerpo JSON. Los identificadores de ticket y reportero se devuelven como cadenas decimales.

#### Scenario: Guardar mediante el contrato HTTP

- **GIVEN** una sesión activa autorizada y un token CSRF válido
- **WHEN** el cliente envía un cuerpo válido a `POST /api/tickets`
- **THEN** recibe `201`, el ticket creado y `Location: /api/tickets/<id>`

#### Scenario: Rechazar una petición sin CSRF válido

- **WHEN** el cliente envía un token CSRF ausente o inválido
- **THEN** recibe `403 INVALID_CSRF_TOKEN`

#### Scenario: Rechazar una operación no autorizada o un cuerpo inválido

- **GIVEN** un token CSRF válido
- **WHEN** el cliente carece de sesión activa, tiene rol operador o envía un cuerpo inválido desde una sesión autorizada
- **THEN** recibe respectivamente `401 UNAUTHENTICATED`, `403 FORBIDDEN` o `422` con errores por campo
