# ticket-detail Specification

## Purpose
TBD - created by archiving change view-ticket-detail. Update Purpose after archive.
## Requirements
### Requirement: Consultar el detalle de un ticket visible

El sistema SHALL mostrar los datos del ticket y sus comentarios e historial a las personas con permiso de lectura.

#### Scenario: Abrir o recargar el detalle

- **GIVEN** una persona autenticada con permiso para ver el ticket
- **WHEN** abre su URL o recarga la pantalla
- **THEN** puede consultar los campos del ticket, los comentarios con autor y fecha y el historial con autor, fecha y cambio registrado

#### Scenario: Abrir un ticket sin comentarios

- **GIVEN** un ticket visible sin comentarios
- **WHEN** la persona abre su detalle
- **THEN** ve los datos y el historial disponible, y la pantalla indica que todavía no hay comentarios

### Requirement: Aplicar la visibilidad a todos los datos del detalle

El sistema SHALL aplicar la matriz del PRD al ticket, a sus comentarios y a su historial.

#### Scenario: Consultar según el rol

- **GIVEN** una persona autenticada
- **WHEN** un peticionario abre un ticket que reportó, un operador abre uno asignado a él o uno `Open` sin asignar, o un supervisor abre un ticket
- **THEN** puede consultar el detalle

#### Scenario: Abrir un ticket ajeno o inexistente

- **GIVEN** un identificador de un ticket inexistente o fuera de la visibilidad de la persona
- **WHEN** intenta abrir su detalle
- **THEN** la pantalla indica que el ticket no está disponible y no muestra sus datos

### Requirement: Contrato HTTP del detalle

La API SHALL servir el detalle mediante `GET /api/tickets/:id` y conservar los identificadores decimales como cadenas.

#### Scenario: Consultar un ticket visible

- **GIVEN** una sesión activa autorizada
- **WHEN** el cliente solicita el detalle
- **THEN** recibe `200` con los datos, comentarios e historial en una respuesta

#### Scenario: Consultar sin acceso

- **WHEN** el cliente solicita el detalle sin sesión activa, o pide un identificador inválido, un ticket inexistente o un ticket fuera de su visibilidad
- **THEN** recibe `401` si la sesión no es válida o `404` si el ticket no está disponible para esa sesión
