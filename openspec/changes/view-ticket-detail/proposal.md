## Why

Una persona necesita consultar un Request desde su URL y entender su estado, su conversación y los cambios registrados.

## What Changes

- Consultar los campos, comentarios e historial de un ticket visible.
- Cargar el detalle desde la API al abrir la URL o recargar la página.
- Aplicar la matriz de visibilidad del PRD a los tres conjuntos de datos.

### Fuera de alcance

- Publicar o editar comentarios, editar campos y ejecutar transiciones.
- Implementar la lista, el Kanban o el agente de IA.

## Capabilities

### New Capabilities

- `ticket-detail`: consulta del ticket, sus comentarios y su historial.

### Modified Capabilities

Ninguna.

## Impact

- [HU-03 en Linear](https://linear.app/pedrolaralara/issue/PED-10), [PED-81](https://linear.app/pedrolaralara/issue/PED-81) y [PED-27](https://linear.app/pedrolaralara/issue/PED-27).
- [Matriz de visibilidad del PRD](../../../PRD/PRD.md#visibilidad-de-tickets) y [responsabilidades de los controladores](../../../ARQUITECTURA.md).
- Depende de la sesión de HU-00 y de los datos de PED-15. Sustituye el resumen temporal que abre HU-01 tras crear un ticket.

## Trazabilidad

Los criterios del [README](../../../readme.md#hu-03--detalle-del-ticket-con-comentarios-e-historial) enlazan con la [spec y el contrato HTTP](specs/ticket-detail/spec.md) y el [diseño](design.md). CA-1 corresponde a la consulta de un ticket visible y CA-2 a la visibilidad aplicada al detalle y sus colecciones. PED-27 contrastará ambos con el OpenAPI generado y las pruebas.
