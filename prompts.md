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

Un único modelo para toda la fase de especificación: en esta entrega no hay código, así que no se separó un modelo para especificar y otro para programar. Para las entregas 2 y 3 está previsto añadir **Context7 MCP** para que el agente consulte la documentación actual de AdonisJS 7.

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

### Ajustes humanos sobre lo que generó la IA

- **Requisitos que la IA no podía saber:** que no se quiere migrar a JSM Cloud (lo que convierte el despliegue on-premise en un requisito), que la prioridad debe volver a una escala 1-5, el flujo de estados, los permisos de cada rol y los campos `Reporter` y `Assignee`.
- **Decisiones del autor entre opciones propuestas por la IA:** SPA + API REST en lugar de Inertia, y el nombre del producto (Requesto).
- **Correcciones de contenido:** quitar la imagen original del PRD, aclarar que la nota sobre iCloud Drive se refiere a la copia local de trabajo y no al repositorio, y corregir la ubicación del nombre en la ficha del proyecto.
- **Errores de la IA detectados en la revisión:**
  - La IA escribió **AdonisJS 6**; al revisar el módulo 5 se vio que el máster usa **AdonisJS 7**, y se corrigió.
  - Una **DoD única** para todos los tickets, que el módulo 4 señala como antipatrón. Se sustituyó por DoD por tipo de trabajo.
  - Criterios de aceptación inventados por la IA mezclados con los del autor ("false completeness"). Se marcaron como **(asumido)**.
  - Una contradicción entre la especificación de la API y la HU-04 (qué pasa si un operador asigna a otra persona), detectada y corregida por la propia IA al redactar la sección 4.
- **Revisión de todos los supuestos:** la IA no dio nada por cerrado sin listarlo. Los puntos abiertos (salida de *Pending user*, reapertura, visibilidad, borrado y proveedor LLM) quedaron como pendientes en el PRD y en los ADRs.

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
