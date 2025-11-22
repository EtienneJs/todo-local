# 📋 TODO - Pruebas de Endpoints

Una aplicación web interactiva para probar y rastrear el progreso de endpoints de API. Esta herramienta te permite organizar, probar y marcar como completados los diferentes endpoints de tu API de manera visual e intuitiva.

## 🎯 Características

- ✅ **Seguimiento de progreso**: Marca endpoints como completados y visualiza tu progreso en tiempo real
- 📊 **Estadísticas**: Estadísticas por módulo y globales con porcentajes de completitud
- 🎨 **Interfaz moderna**: Diseño limpio y responsivo con gradientes y animaciones
- 📱 **Responsive**: Funciona perfectamente en dispositivos móviles y tablets
- 💾 **Persistencia local**: Tu progreso se guarda automáticamente en el navegador (localStorage)
- ➕ **Tareas personalizadas**: Añade tus propios endpoints personalizados a cualquier módulo
- 🎉 **Animaciones**: Celebra tus logros con animaciones de confeti cuando completes secciones
- 🔍 **Navegación intuitiva**: Sidebar con navegación rápida entre módulos

## 🚀 Uso

### Inicio rápido

1. Abre el archivo `TODO-ENDPOINTS.html` en tu navegador
2. Navega entre los diferentes módulos usando el sidebar
3. Marca los endpoints como completados usando los checkboxes
4. Tu progreso se guarda automáticamente

### Funcionalidades principales

#### Navegación entre módulos

- Usa el sidebar izquierdo para cambiar entre módulos
- Usa los botones "Anterior" y "Siguiente" en la parte inferior
- Cada módulo muestra su progreso en el sidebar

#### Marcar endpoints como completados

- Haz clic en el checkbox junto a cada endpoint
- Los endpoints completados se marcan visualmente con un estilo diferente
- El progreso se actualiza automáticamente

#### Selección masiva

- Usa los botones "Seleccionar Todo" o "Deseleccionar Todo" en cada módulo
- Útil para marcar rápidamente múltiples endpoints

#### Añadir tareas personalizadas

1. Haz clic en el botón "➕ Añadir Nueva Tarea" en cualquier módulo
2. Completa el formulario con:
   - Título del endpoint
   - Método HTTP (GET, POST, PATCH, PUT, DELETE)
   - Ruta del endpoint
   - JSON de ejemplo (opcional)
   - Notas adicionales (opcional)
3. La tarea se añadirá al módulo actual
4. Puedes eliminar tareas personalizadas con el botón 🗑️ que aparece al pasar el mouse

## 📦 Módulos incluidos

### 🏦 Bank (9 endpoints)

Base URL: `http://localhost:3000/api/bank`

- Crear Banco (POST)
- Listar Bancos (GET)
- Listar Bancos con filtro (GET)
- Obtener Banco por ID (GET)
- Actualizar Banco (PATCH)
- Eliminar Banco (DELETE)
- Crear Cuenta Bancaria (POST)
- Actualizar Cuenta Bancaria (PATCH)
- Eliminar Cuenta Bancaria (DELETE)
- Crear Transacción (POST)

### 📦 Product (6 endpoints)

Base URL: `http://localhost:3000/api/product`

- Crear Categoría (POST)
- Crear Producto (POST)
- Listar Productos (GET)
- Obtener Producto por ID (GET)
- Actualizar Producto (PATCH)
- Eliminar Producto (DELETE)

### 🛒 Buy History (5 endpoints)

Base URL: `http://localhost:3000/api/buy-history`

- Crear Historial de Compra (POST)
- Listar Historial de Compras (GET)
- Obtener Historial por ID (GET)
- Actualizar Historial (PATCH)
- Eliminar Historial (DELETE)

### 🔢 Contador (5 endpoints)

Base URL: `http://localhost:3000/api/contador`

- Crear Contador (POST)
- Listar Contadores (GET)
- Obtener Contador por ID (GET)
- Actualizar Contador (PATCH)
- Eliminar Contador (DELETE)

### 🏆 Tropy (5 endpoints)

Base URL: `http://localhost:3000/api/tropy`

- Crear Trofeo (POST)
- Listar Trofeos (GET)
- Obtener Trofeo por ID (GET)
- Actualizar Trofeo (PATCH)
- Eliminar Trofeo (DELETE)

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con gradientes, animaciones y diseño responsivo
- **JavaScript (Vanilla)**: Lógica de la aplicación sin dependencias externas
- **localStorage**: Persistencia de datos en el navegador
- **js-confetti**: Biblioteca externa para animaciones de confeti (CDN)

## 📊 Estadísticas

La aplicación muestra estadísticas en dos niveles:

### Estadísticas globales

- Total de endpoints completados
- Total de endpoints
- Porcentaje de progreso general

### Estadísticas por módulo

- Endpoints completados en el módulo
- Total de endpoints en el módulo
- Porcentaje de progreso del módulo
- Indicador visual en el sidebar cuando un módulo está completo

## 💾 Almacenamiento

El progreso se guarda automáticamente en el `localStorage` del navegador:

- Estado de cada checkbox (completado/no completado)
- Tareas personalizadas añadidas por el usuario
- Estado de animaciones de confeti mostradas

**Nota**: Los datos se almacenan localmente en tu navegador. Si limpias el caché o cambias de navegador, perderás el progreso guardado.

## 🎨 Personalización

### Añadir nuevos módulos

Para añadir un nuevo módulo, necesitas:

1. Añadir una entrada en el sidebar:

   ```html
   <li class="section-nav-item">
     <button class="section-nav-button" data-section="nuevo-modulo">
       🎯 Nuevo Módulo
       <span class="section-progress" id="nuevo-modulo-progress">0/5</span>
     </button>
   </li>
   ```

2. Crear una nueva sección con la estructura HTML correspondiente
3. Añadir el nombre del módulo al array `sections` en JavaScript
4. Añadir el total inicial en `sectionTotals`

### Modificar estilos

Los estilos están definidos en la sección `<style>` del HTML. Puedes personalizar:

- Colores del tema
- Tamaños de fuente
- Espaciados
- Animaciones

## 📝 Notas sobre los endpoints

Cada endpoint incluye:

- **Método HTTP**: Visualizado con colores distintivos
  - 🔵 GET (azul)
  - 🟢 POST (verde)
  - 🟡 PATCH (amarillo)
  - 🔴 DELETE (rojo)
- **Ruta**: Path completo del endpoint
- **Ejemplo JSON**: Cuando aplica, muestra un ejemplo del cuerpo de la petición
- **Notas**: Información adicional sobre validaciones y requisitos

## 🐛 Solución de problemas

### El progreso no se guarda

- Verifica que las cookies y localStorage estén habilitados en tu navegador
- Asegúrate de no estar en modo incógnito (algunos navegadores bloquean localStorage)

### Las animaciones no funcionan

- Verifica tu conexión a internet (js-confetti se carga desde CDN)
- Abre la consola del navegador para ver si hay errores

### Las tareas personalizadas desaparecen

- Verifica que no hayas limpiado el localStorage del navegador
- Las tareas se guardan localmente, no en el servidor

## 📄 Licencia

Este proyecto es de uso libre. Siéntete libre de modificarlo y adaptarlo a tus necesidades.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras algún bug o tienes sugerencias de mejora, no dudes en reportarlo.

---

**Desarrollado con ❤️ para facilitar las pruebas de API**
