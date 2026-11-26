## Context

HU-01 muestra el resumen devuelto por la creación. Consultar la URL o recargar requiere recuperar el ticket desde PostgreSQL.

## Goals / Non-Goals

- Mostrar el detalle de solo lectura y respetar el mismo alcance de visibilidad que usarán la lista y las transiciones.
- Mantener fuera de HU-03 las operaciones de escritura.

## Decisions

- La API aplica la política de visibilidad antes de responder. El cliente presenta el resultado de la consulta.
- La respuesta de detalle reutiliza los campos del contrato de tickets e incluye dos colecciones, comentarios e historial.
- Las colecciones se ordenan de más antiguo a más reciente, usando el id para desempatar fechas.
- La SPA usa la URL existente `/tickets/:id` y distingue carga, sesión caducada, ticket no disponible y error de conexión.

## Risks / Trade-offs

- Japa debe cubrir los casos permitidos y denegados de los tres roles y comprobar que `404` no distingue entre un ticket inexistente y uno no visible.
- La verificación en navegador debe incluir acceso por URL y recarga de un ticket recién creado.
