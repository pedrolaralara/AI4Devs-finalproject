## 1. Validación de producto

- [x] 1.1 Revisar con el autor el camino feliz trasladado desde HU-01 en el README.
- [x] 1.2 Confirmar el máximo de 200 caracteres y la política de creación por rol. Completar los escenarios de límite y autorización.

## 2. Implementación de HU-01

- [ ] 2.1 Comprobar que están disponibles la sesión de HU-00 y el esquema de PED-15. Escribir y ejecutar el primer caso rojo en Japa.
- [ ] 2.2 Implementar validación, autorización y persistencia transaccional del ticket y su evento. Verificar `201` para peticionario y supervisor, `401` sin sesión, `403` para operador y `422` para datos inválidos.
- [ ] 2.3 Implementar el formulario, la vista previa de prioridad, los errores y la navegación al detalle. Añadir las pruebas de Vitest.
- [ ] 2.4 Actualizar la documentación de la API y verificar con Biome, TypeScript, Japa y Vitest. Registrar la evidencia de TDD en `prompts.md`.
