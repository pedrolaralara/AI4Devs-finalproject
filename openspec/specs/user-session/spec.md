# user-session Specification

## Purpose
TBD - created by archiving change authenticate-users. Update Purpose after archive.
## Requirements
### Requirement: Acceso con una cuenta activa

El sistema SHALL permitir que una persona con cuenta activa acceda a Requesto con los permisos de su rol.

#### Scenario: CA-1 · Entrar con credenciales válidas

- **GIVEN** una cuenta activa de peticionario, operador o supervisor
- **WHEN** la persona introduce su email y contraseña correctos
- **THEN** entra en Requesto con los permisos de su rol

#### Scenario: CA-1 · Rechazar credenciales o cuenta inactiva

- **GIVEN** una cuenta inactiva, un email desconocido o una contraseña incorrecta
- **WHEN** la persona intenta entrar
- **THEN** sigue sin acceso y recibe el mismo mensaje genérico en los tres casos

### Requirement: Continuidad del acceso

El sistema SHALL mantener el acceso de una cuenta activa mientras su sesión sea válida.

#### Scenario: CA-2 · Volver a cargar la aplicación

- **GIVEN** que la persona tiene una sesión válida y su cuenta sigue activa
- **WHEN** vuelve a cargar Requesto
- **THEN** conserva el acceso con los permisos de su rol actual

#### Scenario: CA-2 · Volver sin acceso válido

- **GIVEN** que la sesión ha caducado, no existe o la cuenta se ha desactivado
- **WHEN** la persona intenta acceder a Requesto
- **THEN** se le pide iniciar sesión

### Requirement: Salida de Requesto

El sistema SHALL terminar el acceso asociado a la sesión actual cuando la persona cierre sesión.

#### Scenario: CA-3 · Salir de la aplicación

- **GIVEN** que la persona ha iniciado sesión
- **WHEN** cierra sesión y vuelve a intentar acceder
- **THEN** se le pide iniciar sesión de nuevo

### Requirement: Contrato HTTP de autenticación

La API SHALL exponer las siguientes operaciones bajo `/api/auth`. El perfil de sesión contiene `id` como cadena decimal para preservar la precisión de `bigint`, `fullName` y `role`. Los valores de `role` son `requester`, `agent` y `supervisor`.

#### Scenario: CA-1 y CA-3 · Obtener el token CSRF

- **WHEN** el cliente solicita `GET /api/auth/csrf`
- **THEN** la API devuelve `204` y el cliente puede obtener el token de la cookie `XSRF-TOKEN` y enviarlo en `X-XSRF-TOKEN` al iniciar o cerrar sesión

#### Scenario: CA-1 · Autenticar la cuenta

- **GIVEN** un token CSRF válido
- **WHEN** el cliente envía email y contraseña correctos de una cuenta activa a `POST /api/auth/login`
- **THEN** la API devuelve `200` con el perfil y establece la cookie de sesión `HttpOnly`, con `SameSite=Lax` y `Secure` en producción

#### Scenario: CA-1 · Rechazar el inicio de sesión

- **GIVEN** un token CSRF válido
- **WHEN** el cliente envía credenciales incorrectas o de una cuenta inactiva a `POST /api/auth/login`
- **THEN** la API devuelve `400` con un mensaje genérico

#### Scenario: CA-1 · Validar el cuerpo del inicio de sesión

- **GIVEN** un token CSRF válido
- **WHEN** el cuerpo enviado a `POST /api/auth/login` incumple la validación
- **THEN** la API devuelve `422` con el formato de validación del proyecto

#### Scenario: CA-2 · Consultar el perfil

- **WHEN** el cliente solicita `GET /api/auth/me`
- **THEN** la API devuelve `200` con el perfil actual si la sesión es válida y la cuenta está activa, o `401` en caso contrario

#### Scenario: CA-3 · Invalidar la sesión

- **GIVEN** una sesión válida y un token CSRF válido
- **WHEN** el cliente envía `POST /api/auth/logout`
- **THEN** la API devuelve `204` y una consulta del perfil con la cookie anterior devuelve `401`

#### Scenario: CA-1 y CA-3 · Bloquear operaciones sin token CSRF válido

- **GIVEN** un token CSRF ausente o inválido
- **WHEN** el cliente intenta iniciar o cerrar sesión
- **THEN** la API devuelve `403` con `INVALID_CSRF_TOKEN` y conserva el estado previo de la sesión
