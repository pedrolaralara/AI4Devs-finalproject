# SPA React + API REST en lugar de AdonisJS + Inertia

## Estado

Aceptado (24/09/2026)

## Contexto y problema

Requesto necesita un frontend en React y un backend en AdonisJS 7. AdonisJS permite dos formas de conectarlos: una SPA independiente que consume una API REST, o una aplicación única con Inertia, donde el servidor enruta y entrega las páginas de React sin exponer una API propiamente dicha.

Además del frontend, el **agente de IA** tiene que consultar los datos de los tickets aplicando las mismas reglas de permisos, y la documentación del proyecto pide especificar la API en OpenAPI.

## Opciones consideradas

* SPA React + Vite que consume una API REST de AdonisJS
* AdonisJS + Inertia + React (aplicación única)

## Decisión

Se elige **SPA React + Vite + API REST**, porque:

* La API REST es un contrato explícito y documentable (OpenAPI) que pueden usar la SPA, el agente de IA y futuros integradores.
* Front y back se desarrollan, prueban y despliegan de forma independiente.
* Encaja con la estructura del entregable del máster (especificación de la API).

## Consecuencias

* Hay que mantener dos aplicaciones y el contrato entre ellas.
* El enrutado y el estado de sesión se gestionan en el cliente (React Router, TanStack Query).
* Hay que configurar CORS o servir ambas bajo el mismo dominio. Se resuelve con Nginx como reverse proxy (`/` para la SPA y `/api/*` para la API), ver [20260924-autenticacion-por-sesion-con-cookie.md](20260924-autenticacion-por-sesion-con-cookie.md).
