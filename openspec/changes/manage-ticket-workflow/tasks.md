## 1. Especificación (PED-86)

- [x] 1.1 Confirmar los criterios ya acordados y resolver los puntos de asignación, historial y concurrencia.

## 2. Backend (PED-16)

- [x] 2.1 Escribir las pruebas unitarias de la matriz y ejecutar la primera prueba roja sin PostgreSQL (PED-87).
- [x] 2.2 Implementar la máquina de estados pura, pasar la matriz de Japa y distinguir una transición inexistente de una prohibida (PED-88).
- [x] 2.3 Implementar la consulta y la escritura transaccional con pruebas de permisos, historial y concurrencia (PED-89).
- [x] 2.4 Contrastar OpenAPI, requisitos, diseño y pruebas de la API (PED-90).

## 3. Interfaz y verificación

- [x] 3.1 Exponer y verificar el contrato del selector de operadores elegibles (PED-91).
- [x] 3.2 Integrar las acciones devueltas por la API y actualizar el detalle tras una transición (PED-92). Coordinar el cierre de la entrega final con PED-23.
- [x] 3.3 Verificar las acciones y la gestión de conflictos de revisión con Vitest (PED-93).
- [x] 3.4 Verificar en Playwright el recorrido de crear, asignar, iniciar y resolver, y documentar la trazabilidad (PED-30 y PED-94).
- [x] 3.5 Verificar en Playwright que el reportero puede cerrar el ticket resuelto, que el operador carece de esa acción y que la fecha y el historial sobreviven a una recarga (PED-23 y PED-95).
