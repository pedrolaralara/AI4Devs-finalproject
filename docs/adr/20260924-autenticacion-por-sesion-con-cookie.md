# Autenticación por sesión con cookie en lugar de tokens de acceso

## Estado

Aceptado (24/09/2026)

## Contexto y problema

La SPA necesita autenticar a los usuarios contra la API. `@adonisjs/auth` ofrece, entre otros, un guard de **sesión** (cookie) y un guard de **access tokens** (tokens opacos `oat_*` enviados como `Bearer`).

Requesto es una herramienta interna, desplegada on-premise, en la que la SPA y la API se sirven bajo el mismo dominio a través de Nginx. No hay clientes externos (móviles u otras aplicaciones) que necesiten tokens.

## Opciones consideradas

* Guard de sesión con cookie `HttpOnly`
* Guard de access tokens guardados en el navegador (`localStorage`)
* Access tokens en cookie `HttpOnly`

## Decisión

Se elige **el guard de sesión con cookie `HttpOnly`, `Secure` y `SameSite`**, porque:

* El token nunca es accesible desde JavaScript, lo que reduce el impacto de un XSS.
* Al compartir dominio, la cookie funciona sin configuración extra.
* AdonisJS aporta de serie la protección CSRF (shield) para este modo.
* Cerrar sesión o dar de baja a un usuario invalida su acceso de inmediato en el servidor.

## Consecuencias

* Las peticiones que modifican datos deben incluir el token CSRF.
* Si en el futuro hubiera clientes externos a la API, habrá que añadir el guard de access tokens para ellos.
* El agente de IA se ejecuta en el backend dentro de la petición del usuario, así que reutiliza su sesión y sus permisos sin necesidad de tokens.
