# Prueba Técnica - AI Engineer Jr

## El Reto

Tienes un conjunto de facturas en formato texto (carpeta `data/`).

Construye un sistema en Python que:

1. Extraiga la información relevante usando un LLM (OpenAI)
2. Estructure los datos en un modelo que tú propongas
3. Exporte los resultados a un formato tabular (CSV o similar)
4. El código debe estar preparado para ejecutarse como AWS Lambda

---

## API Key de OpenAI

```
(La clave debe configurarse como variable de entorno)
```

Esta key tiene vencimiento. Úsala con variables de entorno.

---

## Entregables

1. **Propuesta de modelo de datos**: Documenta qué entidades identificas, qué campos tiene cada una, y qué relaciones existen entre ellas.

2. **Código funcional**: Extracción con OpenAI, procesamiento de múltiples archivos, exportación a CSV, estructura de Lambda.

3. **Documentación**: Cómo instalar, cómo ejecutar, y las decisiones técnicas que tomaste.

---

## 🎨 Bonus: Frontend Dashboard

Además del procesamiento backend, construye una interfaz web que permita visualizar y gestionar las facturas procesadas.

### Requerimientos Mínimos

1. **Página de carga**: Zona de drag & drop para subir archivos `.txt` de facturas
2. **Vista de resultados**: Tabla con las facturas procesadas (filtrable y ordenable)
3. **Vista de detalle**: Al hacer clic en una factura, mostrar sus líneas de productos

### Requerimientos Deseables

- Dashboard con gráficos (total por cliente, productos más vendidos, tendencia temporal)
- Comparador visual: texto original ↔ datos estructurados
- Indicador de estado del procesamiento (loading, éxito, error)
- Diseño responsive

### Stack Sugerido

- React / Vue / Svelte (elige tu preferido)
- Librería de gráficos (Chart.js, Recharts, etc.)
- Estilizado moderno (Tailwind, CSS Modules, o similar)

### Se Evaluará

- Calidad visual y UX
- Componentización y estructura del código
- Manejo de estados (carga, error, éxito)
- Creatividad en la presentación de datos

---

## Entrega

Viernes. Sube tu solución a un repositorio de GitHub.

Si tienes dudas, pregunta.
