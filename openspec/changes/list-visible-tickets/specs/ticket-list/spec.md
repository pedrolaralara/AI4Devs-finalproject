## ADDED Requirements

### Requirement: Listar tickets visibles

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

### Requirement: Buscar y filtrar el listado

El sistema SHALL aplicar los filtros y la búsqueda al conjunto visible antes de ordenar, contar y paginar.

#### Scenario: Combinar filtros

- **WHEN** la persona elige estados, una prioridad y un texto de búsqueda
- **THEN** la lista y su total reflejan los tickets visibles que cumplen todos los filtros y contienen el texto en el título o la descripción

#### Scenario: Consulta inválida o sin sesión

- **WHEN** un cliente solicita `GET /api/tickets` sin sesión o con filtros inválidos en una sesión activa
- **THEN** la API devuelve `401` sin sesión activa o `422` para los filtros inválidos
