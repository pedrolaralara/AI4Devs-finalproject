## Context

La SPA y la API comparten origen mediante el proxy. El [ADR de autenticación](../../../docs/adr/20260924-autenticacion-por-sesion-con-cookie.md) define el guard de sesión, los atributos de la cookie y la invalidación en el servidor.

## Goals / Non-Goals

- Implementar los escenarios de acceso, continuidad y salida definidos en la [spec](specs/user-session/spec.md).
- Dejar la administración de cuentas y las políticas de tickets fuera de HU-00.

## Decisions

### Acceso

VineJS valida el cuerpo del inicio de sesión. AdonisJS verifica el hash de la contraseña y abre la sesión con su guard. Shield valida CSRF y la SPA envía el token indicado en el contrato.

### Continuidad

El servidor comprueba que la cuenta sigue activa y obtiene su rol de PostgreSQL. La SPA recupera el perfil al cargar y usa la lista de tickets como destino común cuando esté disponible. Kanban se mantiene aplazado según el plan.

### Salida

El guard finaliza la sesión en el servidor. AdonisJS guarda las sesiones cifradas en PostgreSQL. La migración crea la tabla técnica `sessions` y Compose de desarrollo la aplica antes de levantar la API. La SPA descarta el perfil local tras recibir la confirmación del cierre.

## Risks / Trade-offs

- Las pruebas HTTP reproducen la cookie anterior al cierre para comprobar que el servidor ya no concede acceso.
