# ticket-list Specification

## Purpose
TBD - created by archiving change list-visible-tickets. Update Purpose after archive.
## Requirements
### Requirement: CA-1 Listar tickets visibles

El sistema SHALL ofrecer una lista de los tickets que la persona puede consultar según el PRD.

#### Scenario: Consultar la lista como peticionario

- **WHEN** el peticionario abre la lista
- **THEN** ve solo los tickets que ha abierto y puede seleccionar uno para abrir su detalle

#### Scenario: Consultar la lista como operador

- **WHEN** un operador abre la lista
- **THEN** ve sus tickets asignados y los tickets abiertos sin asignar

#### Scenario: Consultar la lista como supervisor

- **WHEN** un supervisor abre la lista
- **THEN** puede consultar todos los tickets

### Requirement: CA-2 Buscar y filtrar el listado

El sistema SHALL aplicar los filtros y la búsqueda al conjunto visible antes de ordenar, contar y paginar.

#### Scenario: Combinar filtros

- **WHEN** la persona elige estados, una prioridad y un texto de búsqueda
- **THEN** la lista y su total reflejan los tickets visibles que cumplen todos los filtros y contienen el texto en el título o la descripción

### Requirement: CA-3 Conservar la consulta al navegar

El sistema SHALL conservar los filtros, el orden y la página al volver al listado desde el detalle.

#### Scenario: Abrir un ticket desde una página filtrada

- **WHEN** la persona abre un ticket de una página filtrada y vuelve a la lista
- **THEN** recupera los filtros, el orden y la página de origen

### Requirement: Contrato HTTP del listado para CA-1, CA-2 y CA-3

La API SHALL devolver `200` con `data` y metadatos de paginación para una consulta válida de `GET /api/tickets`. El total se calcula sobre los tickets visibles que coinciden con los filtros.

#### Scenario: Consulta inválida o sin sesión

- **WHEN** un cliente solicita `GET /api/tickets` sin sesión o con filtros inválidos en una sesión activa
- **THEN** la API devuelve `401` sin sesión activa o `422` para los filtros inválidos
