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
- El inicio de sesión se traslada desde [Arquitectura](../../../../ARQUITECTURA.md#71-inicio-de-sesión). El autor aprobó el recorrido y el contrato al pedir el commit de PED-66.
- Reutiliza las cuentas y roles de PED-15. Desbloquea la creación y consulta de tickets.

## Trazabilidad

Los identificadores enlazan los criterios de la [historia HU-00](../../../../readme.md#hu-00--autenticación-y-roles) con los escenarios de la [spec y el contrato HTTP](specs/user-session/spec.md) y sus decisiones de diseño.

La aplicación publica el OpenAPI generado en `/api/openapi.json`. Las pruebas funcionales comprueban las respuestas, cabeceras y esquemas documentados.

| Historia | Escenarios funcionales | Contrato HTTP y OpenAPI | Diseño | Evidencia de aceptación |
|---|---|---|---|---|
| CA-1 | [Acceso con una cuenta activa](specs/user-session/spec.md#requirement-acceso-con-una-cuenta-activa) | `GET /api/auth/csrf` y `POST /api/auth/login` | [Acceso](design.md#acceso) | Japa comprueba el perfil de los tres roles y los errores de credenciales, validación y CSRF. Vitest y Playwright comprueban la entrada desde el formulario. |
| CA-2 | [Continuidad del acceso](specs/user-session/spec.md#requirement-continuidad-del-acceso) | `GET /api/auth/me` | [Continuidad](design.md#continuidad) | Japa comprueba que la misma sesión devuelve el rol actualizado y pierde acceso al desactivar la cuenta. Vitest comprueba la recuperación y el reintento. Playwright recarga y conserva el acceso. |
| CA-3 | [Salida de Requesto](specs/user-session/spec.md#requirement-salida-de-requesto) | `POST /api/auth/logout` y `GET /api/auth/me` | [Salida](design.md#salida) | Japa comprueba el rechazo de CSRF y que la cookie anterior devuelve `401` tras salir. Vitest comprueba el cierre y su error. Playwright confirma que el formulario sigue visible tras recargar. |

Fuentes de verificación en [Japa de autenticación](../../../../apps/api/tests/functional/auth.spec.ts), [Japa de OpenAPI](../../../../apps/api/tests/functional/openapi.spec.ts), [Vitest](../../../../apps/web/src/app.test.tsx) y [Playwright](../../../../e2e/authentication.spec.ts).
