> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

0. [Flujo de trabajo con IA](#0-flujo-de-trabajo-con-ia)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Flujo de trabajo con IA

### Herramientas y modelos

| Herramienta | Modelo | Para qué se usó |
|-------------|--------|-----------------|
| **Claude Code** (CLI, en el terminal) | Claude Opus 5.5 | Toda la entrega 1: contexto del proyecto, digitalización de notas, PRD, redacción del `readme.md`, ADRs, revisión contra el temario y operaciones de git (commits y push). |
| **Claude in Chrome** (extensión de navegador) | El mismo agente, a través de Claude Code | Leer el enunciado del proyecto final y las lecciones de los módulos 4 y 5 del máster en la plataforma de LIDR, que requiere sesión iniciada. El login lo hizo el autor; el agente solo leyó el contenido. |
| **Codex** | GPT-6.2 Sol en las consultas a Context7 ejecutadas con la CLI | Retomar el proyecto tras la primera entrega, gestionar las tareas en Linear, montar el entorno y verificar la API y la web. |
| **Context7 MCP** | Herramienta de consulta documental | Consultar documentación de AdonisJS 7, React 19 y Lucid durante el montaje. El autor autorizó el acceso y Codex lo verificó con una consulta real. |

### Contexto, reglas y skills

- **`AGENTS.md`** (con `CLAUDE.md` como enlace simbólico, para que lo lea cualquier asistente): se fue construyendo a lo largo de la sesión con el enunciado del máster, el driver del producto, el stack, los roles, el plan de entregas y las reglas de trabajo (idioma, ramas, commits, documentación *docs-as-code*, historias listas para IA, estimación y *Definition of Done* por tipo de trabajo). Es la memoria del proyecto para cualquier agente que trabaje en él.
- **`PRD/PRD.md`**: fuente de verdad de los requisitos, digitalizada a partir de notas manuscritas.
- **`docs/adr/`**: decisiones de arquitectura en formato MADR, generadas por la IA a partir de las decisiones tomadas en la conversación.
- **Skill `claude-in-chrome`** de Claude Code para automatizar la lectura de las lecciones.

### Workflow seguido

1. **Contexto primero.** Antes de escribir documentación, se creó el `AGENTS.md` y se le fue dando información por partes: driver, solución, arquitectura, stakeholders y el enunciado del máster.
2. **Requisitos desde notas manuscritas.** El autor escribió el PRD a mano; la IA lo transcribió desde la imagen, detectó huecos (flujo de estados, permisos, asignación) y preguntó por ellos antes de seguir.
3. **Sección a sección.** El `readme.md` se redactó en orden (0 → 1 → 2 → 3 → 5 → 6 → 4). En cada paso la IA listaba explícitamente los **supuestos** que había tomado para que el autor los validara, y se hacía commit al cerrar cada bloque.
4. **Auditoría contra el temario.** Con la documentación ya escrita, se pidió a la IA que leyera los módulos 5 (documentación) y 4 (planificación) del máster, comparara con lo hecho y propusiera correcciones. De ahí salieron los ADRs, los diagramas C4 y de secuencia, las épicas, el plan por entregas, los criterios marcados como "(asumido)", los non-goals y la DoD por tipo de trabajo.

**Entrega 2.** El autor pidió desglosar cada historia o tarea en subtareas de Linear antes de empezar y trabajar en una rama identificada por issue. Codex ejecuta las comprobaciones y presenta el resultado. El autor valida el bloque antes del commit. Para mantener la versión acordada de Node sin cambiar la instalación del Mac, el autor pidió ejecutar Node 24 en Docker.

### Ajustes humanos sobre lo que generó la IA

- **Requisitos que la IA no podía saber:** que no se quiere migrar a JSM Cloud (lo que convierte el despliegue on-premise en un requisito), que la prioridad debe volver a una escala 1-5, el flujo de estados, los permisos de cada rol y los campos `Reporter` y `Assignee`.
- **Decisiones del autor entre opciones propuestas por la IA:** SPA + API REST en lugar de Inertia, y el nombre del producto (Requesto).
- **Correcciones de contenido:** quitar la imagen original del PRD, aclarar que la nota sobre iCloud Drive se refiere a la copia local de trabajo y no al repositorio, y corregir la ubicación del nombre en la ficha del proyecto.
- **Errores de la IA detectados en la revisión:**
  - La IA escribió **AdonisJS 6**; al revisar el módulo 5 se vio que el máster usa **AdonisJS 7**, y se corrigió.
  - Una **DoD única** para todos los tickets, que el módulo 4 señala como antipatrón. Se sustituyó por DoD por tipo de trabajo.
  - Criterios de aceptación inventados por la IA mezclados con los del autor ("false completeness"). Se marcaron como **(asumido)**.
  - Una contradicción entre la especificación de la API y la HU-04 (qué pasa si un operador asigna a otra persona), detectada y corregida por la propia IA al redactar la sección 4.
- **Revisión de todos los supuestos:** quedaron abiertas la salida de *Pending user*, la reapertura, la visibilidad, el proveedor LLM, los estados desde los que se puede cancelar un ticket y quién puede editar sus campos y en qué estados. El borrado físico también estaba pendiente en la primera entrega. El autor lo descartó para el MVP al revisar el feedback (véase la sección 7).

### Flujos de trabajo representativos

1. **Requisitos y arquitectura.** A partir del PRD manuscrito, el autor pidió a Claude Code transcribirlo, detectar decisiones pendientes y contrastar la documentación con el temario. El autor definió las restricciones on-premise, el flujo y los permisos.
2. **Especificación e implementación.** El autor pidió revisar la trazabilidad entre la historia, OpenSpec, el contrato HTTP y las pruebas. Codex desglosó el trabajo en Linear y el autor validó cada bloque antes del commit.
3. **Pruebas del flujo principal.** El autor pidió poder verificar manualmente los tickets mientras el listado seguía pendiente. Se usó la URL directa del detalle y se comprobó el recorrido en Playwright con sesiones separadas de peticionario y operador.
4. **Cierre de la entrega, CI y despliegue.** El autor proporcionó el checklist oficial y pidió desglosar el trabajo en Linear. Codex corrigió el procedimiento de entrega, comprobó las suites de Docker desde una copia de los archivos versionados y reutilizó esos comandos en GitHub Actions. El autor revisó las coincidencias de Gitleaks en el historial base y confirmó que eran ejemplos. Para el despliegue on-premise, Codex consultó la documentación de AdonisJS, construyó las imágenes y verificó la SPA y la API a través de Nginx con PostgreSQL temporal.
5. **Listado con visibilidad por rol.** El autor validó el recorrido de HU-02. Codex escribió primero las pruebas de sesión y visibilidad, verificó que fallaban y consultó Context7 para usar la paginación de Lucid con la regla compartida del detalle. En la revisión manual, el autor detectó que buscar duplicaba el formulario. Codex reprodujo el fallo en Chromium y corrigió las claves de React que compartían los filtros y los resultados.

---

## 1. Descripción general del producto

**Prompt 1:** contexto de negocio, dado por partes al agente para construir el `AGENTS.md`

```
# Necesidad o Driver
sustituir Jira Service Management onpremise en una determinada empresa ya que Atlassian ha anunciado el EOL de JSM datacenter.

# Solución
Crear una app web que gestione el tipo de tickets implementado en dicho JSM.
Será una versión muy sencilla, con un solo tipo de ticket (issue), un formulario fijo con unos campos fijos y un flujo fijo.
La información concreta se especificará en el PDR y requisitos.
```

**Prompt 2:** digitalización de las notas manuscritas del PRD (entrada multimodal)

```
Puedes digitalizar el archivo /PRD/PRD.md? es una imagen con mis notas a mano
```

*Resultado:* la IA transcribió la imagen a Markdown estructurado (driver, objetivo, arquitectura, alcance, campos), marcó las lecturas dudosas y preguntó por lo que faltaba: flujo de estados, permisos, asignación y el significado del "agente".

**Prompt 3:** respuesta del autor a las preguntas de la IA, que cerró los requisitos principales

```
1. La multiplicación tendría que dar de nuevo una escala de 1-5
2. Es una flecha que apunta al punto anterior, todavia no tengo claro si habrá dashboards o se generaran tambien mediante agentes.
3. Complementa lo que ya hay en agents.
El flujo de momento será Open -> Assigned -> In progress -> Solved -> Closed. Estados alternativos: Pending User y Canceled
Permisos:
- El usuario puede abrir, cancelar y Cerrar tickets
- El Operador puede asignarse, poner en in progress, en Pending user, Cancelled y Solved.
- El supervisor puede hacer lo mismo que el operador y ademas asignar a un operador.
Hay que añadir los campos Assignee y Reporter.
Efectivamente la explotación mediante agente sería mediante un agente IA
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** stack decidido por el autor

```
# Arquitectura
La arquitectura básica será:
- Front: React
- Back: AdonisJS
- Bundler: Vite
- Linter/formatter: Biome
- Base de Datos: Postgre
```

**Prompt 2:** decisión entre las dos opciones de integración que propuso la IA

```
SPA + API REST, empieza por la sección 0. Que es SPA?
```

**Prompt 3:** auditoría de la documentación contra el módulo 5 del máster

```
ok, vamos muy bien. Revisa el modulo 5 del master. Explica lo referente a documentación efectiva. Por favor, confirma que estamos siguiendo las recomendaciones y buenas prácticas y que no nos dejamos nada.
```

*Resultado:* la IA leyó las lecciones con Claude in Chrome y presentó una tabla de cumplimiento. Tras la aprobación del autor ("sí, haz los puntos 1 a 4"): corrección a AdonisJS 7, cinco ADRs en formato MADR, diagrama de contexto C4 y diagrama de secuencia del cambio de estado, y reglas de documentación en el `AGENTS.md`.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

```
ok, pasa a la sección 2
```

*Resultado:* con el contexto del `AGENTS.md` y del PRD, la IA propuso los componentes (Lucid, VineJS, Bouncer, sesión con cookie, TanStack Query, dnd-kit, Japa, Vitest, Playwright, Nginx, Docker Compose) y los listó como decisiones a revisar. Los que tenían alternativas relevantes se documentaron después como ADRs.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Generado con el mismo prompt que 2.2 (monorepo con `apps/api` y `apps/web`), y justificado en el ADR [Monorepo con npm workspaces](docs/adr/20260924-monorepo-con-npm-workspaces.md).

### **2.4. Infraestructura y despliegue**

Adelantado como plan en la entrega 1 con el prompt de 2.2. Se completará en la entrega final.

### **2.5. Seguridad**

Adelantado como plan en la entrega 1 con el prompt de 2.2. Se completará en la entrega final.

### **2.6. Tests**

Adelantado como plan en la entrega 1 con el prompt de 2.2. Se completará en la entrega final.

---

### 3. Modelo de Datos

**Prompt 1:**

```
ok, pasa a la sección 3
```

*Resultado:* a partir de los campos, el flujo y los roles del PRD, la IA diseñó el modelo (`users`, `tickets`, `comments`, `ticket_events`) con el diagrama ER en Mermaid, y propuso decisiones que el autor revisó: prioridad como columna generada en PostgreSQL, restricción de assignee obligatorio a partir de `assigned`, y cancelar en lugar de borrar.

---

### 4. Especificación de la API

**Prompt 1:**

```
sí, sigue con la sección 4
```

*Resultado:* especificación OpenAPI 3.0 de los tres endpoints del flujo principal (crear, listar con filtros y cambiar de estado), coherente con las historias y los tickets ya escritos. Al redactarla, la IA detectó y corrigió una contradicción con la HU-04 y validó que el YAML fuera correcto.

---

### 5. Historias de Usuario

**Prompt 1:**

```
ok, pasa a la sección 5
```

*Resultado:* backlog priorizado con MoSCoW y story points, y las tres historias que cubren el ciclo del ticket (HU-01, HU-04 y HU-05) con criterios en Dado/cuando/entonces.

**Prompt 2:** auditoría de la planificación contra el módulo 4 del máster

```
igual que hemos hecho antes, revisa el modulo 4 de planificación del master y comprueba que hemos tenido en cuenta las recomendaciones y buenas practicas de ese modulo tambien
```

**Prompt 3:**

```
has primero commint con lo que hay y despues aplica todo
```

*Resultado:* épicas con tallas, columna de complejidad/riesgo, plan por entregas con colchón del 30 %, criterios marcados como "(asumido)", sección "Fuera de alcance" en cada historia y todas las condiciones en formato Dado/cuando/entonces.

---

### 6. Tickets de Trabajo

**Prompt 1:** tras aprobar la propuesta de la IA de seguir con la sección 6

```
si, por favor
```

*Resultado:* tres tickets (base de datos, backend y frontend) derivados de HU-01, HU-04 y HU-05, con alcance paso a paso, criterios de aceptación, tests y notas técnicas.

**Prompt 2:** el mismo prompt de auditoría del módulo 4 (ver sección 5), que sustituyó la DoD común por una DoD por tipo de trabajo y añadió los non-goals a cada ticket.

---

### 7. Pull Requests

Se completará en las entregas 2 y 3.

**Revisión de la entrega 1.** A partir de los [comentarios de CodeRabbit en la PR #341](https://github.com/LIDR-academy/AI4Devs-finalproject/pull/341), el autor pidió a Codex una lista de correcciones y que las propusiera una a una. Codex detectó que los tickets de trabajo ya definían el `GET` de transiciones que faltaba en el contrato OpenAPI. El autor aprobó añadirlo y confirmó que la respuesta sería `200` con `[]` cuando el ticket fuera visible y el usuario no tuviera transiciones disponibles.

El autor confirmó que, si un ticket ya no procede, el MVP permite cancelarlo y conserva su historial. Codex incorporó al PRD la exclusión del borrado físico desde la aplicación y alineó el resumen de alcance de `AGENTS.md`.

El autor aprobó usar un proveedor LLM autoalojado si se habilita el agente en producción. En desarrollo y demos se permite una API externa solo con preguntas y datos sintéticos. Codex trasladó la decisión al PRD, el README, la arquitectura y el contexto para asistentes. La elección del proveedor autoalojado y el modelo sigue abierta.

El autor aprobó los controles de configuración propuestos por Codex para el ADR del agente de IA: rechazar una API externa en producción y exigir su activación explícita en desarrollo y demos, con preguntas y datos sintéticos.

**Montaje de la API (PED-37).** El autor autorizó iniciar la API tras verificar el acceso a Context7. Codex consultó el starter oficial de AdonisJS 7 y lo ejecutó con Node 24 en Docker. Adaptó el starter al workspace npm y retiró sus ejemplos de autenticación, SQLite y las configuraciones de ESLint y Prettier. La primera comprobación HTTP detectó que el almacén de sesiones de base de datos del starter seguía intentando resolver Lucid. Codex dejó solo el almacén de cookies definido en la arquitectura y repitió la comprobación. TypeScript pasó y `GET /api/health` devolvió `200`.

**Montaje de la web (PED-38).** Codex consultó Context7 para montar la raíz de React 19 y cancelar la petición al desmontar el componente. Preparó el workspace con Vite y un proxy de desarrollo a AdonisJS. La pantalla inicial muestra el estado de la conexión a la API.

**Conexión con PostgreSQL (PED-39).** Codex consultó en Context7 la configuración de Lucid y su API de consulta. Añadió PostgreSQL al Compose de desarrollo y usó `SELECT 1` en el endpoint de salud para verificar la conexión desde AdonisJS a través del proxy de Vite.

**Entorno de pruebas (PED-41).** Codex preparó un Compose independiente con PostgreSQL temporal. Añadió una prueba de Japa que verifica la base activa y la respuesta del endpoint de salud, y dos pruebas de Vitest que comprueban qué muestra la pantalla cuando la API responde o no está disponible.

**Primer change de OpenSpec (PED-42).** El autor pidió mantener el registro de IA al día y seguir con HU-01. Codex preparó la propuesta, el diseño, la especificación y las tareas a partir del PRD y los criterios del README. La IA trasladó el camino feliz existente y dejó pendientes de validación humana el máximo de 200 caracteres y la política de creación por rol. El ciclo de TDD se documentará cuando se ejecute en PED-26.

Durante la revisión, el autor confirmó el camino feliz y el máximo de 200 caracteres. Corrigió el supuesto de permisos para permitir la creación tanto a peticionarios como a supervisores. Codex trasladó la decisión al PRD, el README y el change.

**Verificación desde una copia limpia (PED-43).** Codex reprodujo el README a partir del commit `008e710` con `git archive`. Usó un proyecto Docker separado y un puerto temporal para evitar interferencias con el entorno de desarrollo. Generó una clave local, comprobó en el navegador la conexión entre la web y la API y verificó `HTTP 200` en `/api/health` con PostgreSQL. Pasaron Biome, TypeScript, los dos builds y las tres pruebas de Japa y Vitest en su entorno aislado.

**Visibilidad por rol (PED-59).** Codex propuso que el peticionario vea sus tickets, el operador los asignados a él y los `Open` sin asignar, y el supervisor todos. El autor confirmó la propuesta y su aplicación a la lista, el detalle, los comentarios, el historial y la consulta de transiciones disponibles. Codex incorporó la regla al PRD y al README.

**Edición de campos (PED-60).** El autor confirmó la propuesta de Codex de que el reportero pueda editar título, descripción, urgencia e impacto mientras el ticket esté en `Open`, con recálculo automático de prioridad. Codex actualizó el PRD y el README.

**Cancelación y retorno al trabajo (PED-61).** El autor confirmó los estados de origen de la cancelación y los actores autorizados. También confirmó que el retorno desde `Pending user` es manual y que `Solved` solo admite el cierre. Codex incorporó las decisiones al PRD y a los criterios de HU-04, y corrigió el ejemplo de acceso a un ticket no visible para indicar `404`.

**Revisión de la matriz (PED-62).** Codex detectó que restringir el cierre al rol peticionario dejaría sin cierre propio los tickets de un supervisor. El autor confirmó que cierra el reportero, sea peticionario o supervisor, y que solo un supervisor puede reasignar en `Assigned`. Codex alineó el PRD y los criterios de HU-04 y dejó indicada la matriz de producto como referencia independiente para las pruebas MBT.

**Esquema inicial (PED-15).** Codex consultó Context7 para contrastar migraciones, transacciones y seeders de Lucid. Aplicó SQL de PostgreSQL para la identidad, los enums y la columna de prioridad generada, y preparó pruebas de restricciones sobre PostgreSQL aislado. El tipado detectó un error en el orden de las llamadas de las pruebas parametrizadas de Japa. Codex lo corrigió tras consultar la documentación del runner.

La verificación aplicó, revirtió y volvió a aplicar las cinco migraciones. Ejecutó el seeder dos veces y comprobó que se mantenían las seis cuentas y los 21 tickets. La suite confirmó también que Lucid refresca la prioridad dentro de la transacción. Pasaron Biome, TypeScript y las 20 pruebas de Japa y Vitest.

**Especificación de autenticación (PED-66).** El autor autorizó arrancar HU-00 y abrir su primera rama. Codex desglosó la historia en Linear, trasladó el inicio de sesión desde el diagrama de arquitectura y preparó los escenarios de sesión, cuenta inactiva y CSRF. La validación estricta de OpenSpec pasó. Quedó pendiente la revisión del autor y la comprobación de que el almacén de sesiones permita revocar una cookie anterior al cierre.

El autor pidió separar la historia, los escenarios funcionales, el contrato HTTP y el diseño, y revisar su consistencia. Codex añadió la historia al README, enlazó sus tres criterios con las otras vistas y dejó la comprobación de trazabilidad en el flujo de trabajo del proyecto.

El autor aprobó el recorrido y los supuestos del contrato al pedir el commit de PED-66.

**Prueba roja de autenticación (PED-70).** Codex escribió en Japa el primer caso de CA-1 con una cuenta activa en PostgreSQL aislado. La ejecución devolvió el `404` esperado frente al `200` del contrato. Las otras 18 pruebas de Japa y las dos de Vitest pasaron. Context7 confirmó las APIs del guard de sesión de AdonisJS 7, Shield y el almacén de sesiones en PostgreSQL. La siguiente subtarea incorporará el intercambio CSRF al caso y verificará la revocación con la cookie anterior al cierre.

**Contrato de autenticación (PED-71).** Codex implementó el guard de AdonisJS 7 con sesiones cifradas en PostgreSQL y un error JSON para el rechazo de CSRF. En la primera ejecución, el adaptador de sesión de Japa reemplazaba la cookie que enviaba la prueba y limpiaba la sesión al terminar cada petición. Se retiró el adaptador, que no usaban las demás pruebas, y Japa verificó el intercambio de cookies reales. La prueba de cierre reutilizó la cookie de sesión anterior y recibió `401`.

Pasaron Biome, TypeScript, las 23 pruebas de Japa y las dos de Vitest. La instalación de verificación en la copia de iCloud encontró un directorio de caché de Vitest duplicado. Codex repitió el arranque en una copia temporal fuera de iCloud y comprobó que la API migró una base vacía y respondió `200` en salud y `204` al solicitar la cookie CSRF.

**OpenAPI de autenticación (PED-72).** Codex consultó la documentación de AutoSwagger y contrastó su salida sobre AdonisJS 7. El primer intento omitió las anotaciones. Se adaptó la referencia del controlador para el escáner y se comprobó el JSON generado contra OpenSpec y las pruebas HTTP. Codex configuró Scalar con su JavaScript local y verificó en Brave que el build de producción renderiza la referencia. El JSON servido coincidió con el artefacto del build. Pasaron Biome, TypeScript, 25 pruebas de Japa y dos de Vitest.

**Acceso en React (PED-73).** Codex consultó Context7 para revisar la cancelación de efectos con StrictMode y el envío del formulario en React 19. Integró el acceso por email y contraseña, la recuperación del perfil y el cierre con CSRF. Biome señaló la dependencia del primer diseño del reintento. Codex vinculó el efecto al estado de recuperación y habilitó los tipos de Vite para la importación de CSS. Pasaron Biome, TypeScript, cinco pruebas web y el build de Vite. La comprobación con API real queda en las siguientes subtareas.

**Verificación de la web de autenticación (PED-74).** Codex levantó el commit `3e96e09` en un Compose aislado, aplicó las migraciones y cargó el seeder. En Brave comprobó el rechazo de credenciales incorrectas, la entrada de una cuenta supervisora, la restauración del perfil al recargar y el retorno al formulario tras salir y recargar de nuevo. Pasaron las 25 pruebas de Japa y las cinco de Vitest. Queda pendiente la prueba automatizada de navegador de PED-69.

**Prueba E2E de autenticación (PED-75).** Codex convirtió el recorrido validado en Brave en una prueba de Playwright. Reutilizó el Compose de desarrollo con un proyecto aislado, PostgreSQL temporal y la imagen oficial de Chromium fijada a la versión de Playwright del lockfile. Desde una copia limpia, Chromium inició sesión, conservó el perfil al recargar y volvió al formulario tras cerrar y recargar. Pasaron el E2E, Biome y TypeScript.

**Trazabilidad de HU-00 (PED-76).** Codex contrastó CA-1, CA-2 y CA-3 con la especificación, el contrato HTTP, el OpenAPI generado, el diseño y las pruebas. La revisión encontró que el perfil se comprobaba antes y después de desactivar la cuenta, pero faltaba comprobar un cambio de rol con la misma sesión. Se amplió Japa para verificar que la API lee el rol vigente. Pasaron 25 pruebas de Japa, cinco de Vitest, el E2E de Chromium, Biome, TypeScript y la validación estricta de OpenSpec.

**Prueba roja de creación de tickets (PED-77).** Codex desglosó PED-26 en Linear y reutilizó las funciones de cookies y CSRF de las pruebas de autenticación. Japa aplicó las migraciones en PostgreSQL aislado, inició una sesión real de peticionario y envió un ticket válido. El caso esperaba `201` y recibió `404`, el fallo esperado antes de implementar la ruta. Pasaron las otras 25 pruebas de Japa y las cinco de Vitest.

**API de creación de tickets (PED-78).** Codex consultó Context7 sobre la validación estricta de VineJS y contrastó Bouncer con la versión instalada. Implementó la política de roles y la transacción de Lucid. La suite convirtió el `404` de la prueba roja en `201` para los dos roles autorizados y forzó un fallo del evento en PostgreSQL para comprobar el rollback. Codex mantuvo los identificadores decimales como cadenas en JSON, igual que en el perfil de sesión, y alineó OpenSpec, README y el OpenAPI generado. Pasaron 31 pruebas de Japa, cinco de Vitest, Biome, TypeScript y el build de la API.

**Formulario de creación (PED-79).** Codex consultó Context7 sobre formularios controlados y errores asociados a campos en React. Reutilizó la obtención de CSRF, añadió React Router y abrió el resumen con la respuesta del servidor. Vitest usó una prioridad devuelta distinta de la estimada para comprobar que el resumen muestra el valor guardado. La consulta del detalle al recargar se mantiene en HU-03. Pasaron 31 pruebas de Japa, nueve de Vitest, Biome, TypeScript y el build web.

**Verificación de HU-01 (PED-80).** Codex vinculó los criterios del README con la spec, el diseño, el contrato generado y las pruebas. Playwright comprobó con PostgreSQL aislado que un peticionario puede enviar el formulario, recibir `201` con `Location` y abrir el resumen con la prioridad 4 de 5. Pasaron los dos E2E, 31 pruebas de Japa y nueve de Vitest, Biome, TypeScript y OpenSpec.

**Borrador de detalle (PED-81).** Codex trasladó la visibilidad aprobada en el PRD al change de HU-03 y enlazó los criterios del README, los escenarios, el contrato y el diseño. Marcó pendientes de revisión el recorrido de consulta, la respuesta agregada, el orden cronológico y el estado sin comentarios. El borrador pasó la validación estricta de OpenSpec.

El autor confirmó para HU-03 la consulta desde la URL o al recargar, la respuesta agregada, el orden de más antiguo a más reciente y el mensaje cuando aún no hay comentarios.

**Prueba roja del detalle (PED-82).** Codex reutilizó la preparación de cuentas y sesiones de las pruebas de creación. Japa creó el ticket con una sesión real y PostgreSQL aislado. La consulta posterior esperaba `200` con el detalle y el evento original, y devolvió `404` porque la ruta aún no existe. Pasaron las otras 31 pruebas de Japa y las nueve de Vitest.

**API de detalle (PED-83).** Codex consultó Context7 sobre las consultas y transacciones de Lucid. Aplicó la matriz de visibilidad al acceder al ticket y cargó las relaciones ordenadas dentro de la misma instantánea de PostgreSQL. Japa pasó de `404` a `200` para el reportero y verificó el mismo error para identificadores inválidos, inexistentes o fuera de la visibilidad. También comprobó el orden de las colecciones y el OpenAPI. Pasaron 36 pruebas de Japa, nueve de Vitest, Biome, TypeScript, OpenSpec y el build de la API.

**Detalle en React (PED-84).** Codex consultó Context7 sobre efectos cancelables e identidad de componentes. Sustituyó el resumen temporal por una consulta al abrir `/tickets/:id` y canceló las peticiones obsoletas al cambiar de ticket. Vitest verificó la URL directa, los comentarios e historial, la colección vacía, el `404`, el reintento y la sesión caducada. Pasaron las 14 pruebas web, Biome, TypeScript, OpenSpec y el build de Vite. Playwright comprobará la recarga contra el stack real en PED-85.

**Verificación de HU-03 (PED-85).** Codex amplió el recorrido de Playwright para recargar el ticket recién creado y consultar su URL desde una segunda pestaña. Chromium verificó los datos guardados, el historial de creación y el estado sin comentarios. La matriz vincula esa evidencia con las pruebas de comentarios y visibilidad de Japa y Vitest. Pasaron dos E2E, 36 pruebas de Japa y 14 de Vitest, Biome, TypeScript y OpenSpec.

**Borrador del flujo (PED-86).** Codex trasladó la matriz de estados aprobada y los criterios de HU-04 a OpenSpec. Al contrastar el PRD con REQ-BE-01, identificó diferencias sobre a quién puede asignar un supervisor y qué eventos genera una reasignación. También detectó que comparar solo el estado de origen no cubre la concurrencia entre dos reasignaciones. Las propuestas quedan pendientes de confirmación. El change pasó la validación estricta.

El autor confirmó que la asignación se limita a operadores activos, que la reasignación genera solo el evento de asignación si conserva el estado y que una revisión anterior devuelve 409. Codex incorporó la revisión al contrato de detalle y transiciones.

**Pruebas unitarias del flujo (PED-87).** Codex convirtió la matriz aprobada del PRD en 42 casos de Japa, combinando los siete estados con seis relaciones del actor. El oráculo de pruebas se definió sin consultar la implementación. Codex movió el arranque de PostgreSQL a las suites de integración para ejecutar la suite unitaria sin base de datos. Con la máquina aún vacía, los 23 casos sin acciones pasaron y los 19 que esperan acciones fallaron como estaba previsto.

**Máquina de estados (PED-88).** Codex implementó las reglas puras de HU-04 en una tabla de estados y comprobó que la consulta y la evaluación de transiciones usan las mismas reglas. La suite distingue una transición inexistente de una acción prohibida para el actor. La matriz esperada siguió derivándose del PRD.

**API transaccional del flujo (PED-89).** Codex consultó Context7 sobre la actualización condicional y los bloqueos de Lucid. Implementó la revisión del flujo, los endpoints y el historial atómico. Japa verificó la reasignación concurrente con resultados `200` y `409`, un solo evento y rollback cuando PostgreSQL impide escribir el historial. También comprobó el flujo hasta cerrar y las marcas de tiempo. Pasaron las siete migraciones de ida y vuelta, 83 pruebas de Japa, 14 de Vitest, Biome, TypeScript, OpenSpec y el build de la API.

**OpenAPI del flujo (PED-90).** Codex contrastó el JSON generado con el contrato y detectó ejemplos incoherentes de estado, asignado y revisión. Los alineó con una asignación válida y añadió una prueba de regresión sobre códigos, autenticación, revisión y esquemas. Documentó la evidencia en la matriz de HU-04. Pasaron 84 pruebas de Japa, 14 de Vitest, Biome, TypeScript, OpenSpec y el build de la API.

**Operadores elegibles (PED-91).** Codex mantuvo el contrato de transiciones y añadió una consulta específica para el selector del supervisor. Reutilizó el filtro de operadores activos de la escritura. Japa verificó el acceso por rol, la exclusión del asignado actual y las opciones vacías fuera del estado asignable. Pasaron 85 pruebas de Japa, 14 de Vitest, Biome, TypeScript, OpenSpec y el build de la API.

**Acciones del flujo en React (PED-92).** Codex consultó Context7 sobre efectos y mutaciones. Integró las acciones devueltas por la API, el selector de operadores y el envío con CSRF y revisión. Si la API devuelve `409`, la web recarga el detalle y las acciones. La primera prueba del POST esperaba una posición incorrecta en la lista de peticiones porque omitía la consulta previa de CSRF. Codex corrigió la aserción para comprobar el cuerpo y las cabeceras directamente. Pasaron 15 pruebas de Vitest, Biome, TypeScript, OpenSpec y el build web.

**Verificación web del flujo (PED-93).** Codex añadió casos de Vitest para exigir una selección al asignar, mostrar el historial devuelto por el POST, ocultar los controles cuando la API devuelve una lista vacía y recargar tras un `409` sin repetir la escritura. TypeScript detectó un argumento incompatible en los selectores de Testing Library. Codex lo corrigió y repitió las suites. Pasaron 85 pruebas de Japa, 18 de Vitest, Biome, TypeScript, OpenSpec y el build web.

**Recorrido de la entrega 2 (PED-94).** Codex amplió Playwright para abrir el ticket creado por un peticionario en un contexto de navegador distinto. El operador inició sesión, se asignó el ticket, empezó el trabajo y lo resolvió. Tras recargar, Chromium confirmó el estado, el asignado y el historial. El peticionario también vio el estado actualizado. Pasaron los dos E2E con PostgreSQL aislado, Biome, TypeScript y OpenSpec.

**Cierre por el reportero (PED-95).** Codex extendió el E2E existente. Chromium comprobó que el operador carece de la acción de cierre y que el reportero puede cerrar el ticket resuelto. Tras recargar, se mantuvieron el estado final, la fecha de cierre y el evento con el reportero como actor. Pasaron los dos E2E, Biome, TypeScript y OpenSpec.
