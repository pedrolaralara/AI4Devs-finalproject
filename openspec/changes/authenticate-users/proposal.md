## Why

Requesto necesita identificar a la persona que usa la aplicación y aplicar sus permisos en el servidor. HU-00 proporciona la sesión y el rol que necesitan las historias de tickets.

## What Changes

- Añadir inicio, consulta y cierre de sesión para cuentas activas.
- Obtener el rol de la cuenta en el servidor: `requester`, `agent` o `supervisor`.
- Proteger las operaciones que modifican datos con CSRF.

### Fuera de alcance

- Alta de usuarios, recuperación de contraseña, SSO y administración de cuentas.
- Políticas sobre tickets, que se desarrollan con sus respectivas historias.

## Capabilities

### New Capabilities

- `user-session`: autenticar cuentas existentes y recuperar su identidad y rol.

### Modified Capabilities

Ninguna.

## Impact

- [HU-00 en Linear](https://linear.app/pedrolaralara/issue/PED-8) y [especificación PED-66](https://linear.app/pedrolaralara/issue/PED-66).
- El inicio de sesión se traslada desde [Arquitectura](../../../ARQUITECTURA.md#71-inicio-de-sesión). El autor aprobó el recorrido y el contrato al pedir el commit de PED-66.
- Reutiliza las cuentas y roles de PED-15. Desbloquea la creación y consulta de tickets.

## Trazabilidad

Los identificadores enlazan los criterios de la [historia HU-00](../../../readme.md#hu-00--autenticación-y-roles) con los escenarios de la [spec y el contrato HTTP](specs/user-session/spec.md) y sus decisiones de diseño.

La aplicación publica el OpenAPI generado en `/api/openapi.json`. Las pruebas funcionales comprueban las respuestas, cabeceras y esquemas documentados.

| Historia | Escenarios funcionales | Contrato HTTP | Diseño |
|---|---|---|---|
| CA-1 | Acceso con una cuenta activa | CSRF y login | [Acceso](design.md#acceso) |
| CA-2 | Continuidad del acceso | Perfil de la sesión | [Continuidad](design.md#continuidad) |
| CA-3 | Salida de Requesto | CSRF y logout | [Salida](design.md#salida) |
