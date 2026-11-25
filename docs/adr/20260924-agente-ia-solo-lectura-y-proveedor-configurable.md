# Agente de IA con herramientas de solo lectura y proveedor LLM configurable

## Estado

Aceptado (24/09/2026). El proveedor y el modelo concretos están pendientes de decisión.

Actualizado el 25/11/2026 para fijar la política de residencia de datos por entorno.

## Contexto y problema

Requesto incluye un agente de IA para explotar la información de los tickets en lenguaje natural. Hay dos riesgos:

* **Seguridad:** un agente con acceso libre a la base de datos puede filtrar datos que el usuario no debería ver, o modificarlos por una inyección de prompt.
* **On-premise:** el producto existe para no depender de la nube. Si el LLM es un servicio externo, los datos consultados salen de la infraestructura de la empresa.

## Opciones consideradas

* Agente que genera y ejecuta SQL libre (*text-to-SQL*)
* Agente con *tool calling* sobre herramientas de solo lectura que reutilizan los servicios de dominio
* Proveedor LLM fijo en la nube
* Proveedor LLM configurable (API externa o modelo local compatible)

## Decisión

Se elige **tool calling sobre herramientas de solo lectura** y **un proveedor LLM configurable**:

* Las herramientas (buscar tickets, contar por estado o prioridad, carga por operador, tiempos de resolución) llaman a los servicios de dominio, que aplican los permisos del usuario que pregunta.
* El agente no puede crear, modificar ni borrar datos, y nunca genera SQL.
* El proveedor y el modelo se seleccionan mediante variables de entorno, dentro de la política de cada entorno.
* Si el agente está habilitado en producción, el proveedor debe estar autoalojado dentro de la infraestructura de la empresa. Las preguntas y los resultados de las herramientas se procesan allí. La aplicación debe rechazar cualquier configuración de una API externa en producción.
* En desarrollo y demos, una API externa requiere activación explícita y solo puede recibir preguntas y resultados de herramientas basados en datos sintéticos.

## Consecuencias

* El agente solo responde lo que cubren sus herramientas. Las preguntas nuevas requieren herramientas nuevas.
* Hay que definir una interfaz de proveedor común, porque no todos los modelos locales soportan *tool calling* con la misma calidad.
* Queda pendiente elegir el proveedor autoalojado y el modelo para producción.
