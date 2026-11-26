## Context

La sesión y el detalle están implementados. El README define el contrato de `GET /api/tickets` y el PRD define la visibilidad.

## Decisions

- Validar la consulta con VineJS y publicar el contrato generado con OpenAPI. Admitir los parámetros `status`, `priority`, `assigneeId`, `reporterId`, `q`, `sort`, `page` y `perPage` del README.
- Compartir la regla de visibilidad con el detalle y aplicarla antes de filtrar, contar y paginar. Combinar filtros distintos con AND y valores del mismo filtro con OR.
- Ordenar por prioridad descendente por defecto. Usar el ID como desempate para estabilizar las páginas **(asumido)**.
- Gestionar en la URL el estado de filtros, orden y página para recuperarlo al volver del detalle. Mostrar carga, lista vacía y error.

## Verification

Japa cubrirá la matriz de roles y las combinaciones de filtros. Vitest cubrirá la lectura de filtros y los estados de la lista. Playwright abrirá un detalle desde la lista y comprobará la visibilidad con sesiones separadas.
