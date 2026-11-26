## Why

HU-01 inicia el recorrido principal de Requesto. Un peticionario necesita registrar una petición para que los operadores puedan atenderla con la prioridad calculada por el sistema.

## What Changes

- Añadir el formulario de creación y la operación `POST /api/tickets`.
- Guardar un Request en estado `Open` con datos de creación automáticos y registrar su evento `created`.
- Mostrar el detalle del ticket recién creado y los errores de validación del formulario.
- Dejar para sus historias la autenticación, el desarrollo completo de la pantalla de detalle y las transiciones. Adjuntos, edición, creación en nombre de otra persona y notificaciones quedan fuera de HU-01.

## Capabilities

### New Capabilities

- `request-ticket-creation`: creación de un Request con validación, prioridad e historial inicial.

### Modified Capabilities

Ninguna.

## Impact

- Fuentes de producto: [PRD](../../../PRD/PRD.md) y [HU-01 en el README](../../../readme.md#hu-01--crear-un-ticket).
- Seguimiento: [PED-42](https://linear.app/pedrolaralara/issue/PED-42) y [PED-26](https://linear.app/pedrolaralara/issue/PED-26).
- Dependencias: HU-00 para sesión y roles, PED-15 para persistencia y HU-03 para la pantalla de detalle.
- **Validado por el autor:** camino feliz, máximo de 200 caracteres para el título y creación por peticionarios y supervisores con su propia cuenta.
