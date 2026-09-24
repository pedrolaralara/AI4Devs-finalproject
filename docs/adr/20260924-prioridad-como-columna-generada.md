# Prioridad calculada como columna generada en PostgreSQL

## Estado

Aceptado (24/09/2026)

## Contexto y problema

La prioridad de un ticket no se introduce a mano: se calcula a partir de la urgencia (1-5) y el impacto (1-5), y se reescala a 1-5 con `ceil(urgencia × impacto / 5)`. La prioridad se usa para filtrar y ordenar la lista y el Kanban, y la consulta también el agente de IA.

## Opciones consideradas

* Columna generada `STORED` en PostgreSQL
* Calcularla en el servicio de dominio y guardarla como una columna normal
* No guardarla y calcularla al leer (en el ORM o en cada consulta)

## Decisión

Se elige **una columna generada `STORED`**:
`priority smallint GENERATED ALWAYS AS (ceil(urgency * impact / 5.0)) STORED`, porque:

* Nunca puede quedar desincronizada con la urgencia y el impacto, venga el cambio de donde venga.
* Se puede indexar, así que filtrar y ordenar por prioridad es eficiente.
* Cualquier consulta, incluidas las del agente de IA, ve el mismo valor sin repetir la fórmula.

## Consecuencias

* La fórmula vive en una migración. Cambiarla requiere una migración nueva.
* El modelo Lucid debe tratar `priority` como solo lectura.
* Para la vista previa en el formulario, la SPA replica la fórmula; un test comprueba que ambas coinciden.
