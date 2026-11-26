## Context

La SPA de React consume la API REST de AdonisJS. HU-01 depende de un usuario identificado por la sesión (HU-00) y del esquema de tickets e historial (PED-15).

## Goals / Non-Goals

- Completar la creación desde el formulario hasta la persistencia y la navegación al detalle.
- Mantener los controles de acceso y validación en el servidor.
- Limitar el cambio a la creación y al uso del detalle existente. HU-03 define el detalle completo.

## Decisions

- El controlador recibe la sesión y valida los cuatro campos del formulario mediante VineJS. Delega la creación a un servicio.
- El servicio toma el reportero de la sesión y guarda el ticket y el evento `created` en una transacción. La respuesta `201` se devuelve tras guardar ambos.
- PostgreSQL calcula la prioridad mediante su columna generada. La vista previa del formulario aplica la misma fórmula y la interfaz usa el valor devuelto por la API tras el guardado.
- La SPA usa el identificador devuelto por la API para navegar al detalle. La cabecera HTTP `Location` identifica el recurso de la API. El id del ticket y el del reportero se serializan como cadenas decimales, igual que el id del perfil de sesión, para conservar la precisión de `bigint`.
- Empezar con un caso de Japa que falle por el comportamiento aún ausente. Añadir pruebas de validación y persistencia en Japa y del formulario en Vitest.

## Risks / Trade-offs

- La autorización de creación admite a peticionarios y supervisores. El reportero se obtiene de la sesión para ambos roles.
- Si falla el historial, la transacción debe dejar el ticket sin crear. La prueba verificará ambos registros después de la operación.
