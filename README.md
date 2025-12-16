# C & C Cookies and Cakes — Código fuente

Este repositorio contiene la versión del sitio web de la pastelería "C & C Cookies and Cakes" preparada para producción. El contenido en esta rama incluye únicamente los archivos y carpetas que se utilizan en el sitio público y en el panel de administración.

Contenido principal incluido:
- `index.html` — Entrada pública del sitio.
- `assets/` — Recursos públicos: `css/`, `js/`, `images/`, `webfonts/`.
- `pages/` — Páginas públicas (categorías y detalle de producto).
- `admin/` — Panel de administración (HTML/CSS/JS) para gestionar productos, categorías y banners.
- `backend/` — API en PHP (estructura ligera):
  - `backend/api/` — Punto de entrada de la API.
  - `backend/controllers/` — Controladores HTTP.
  - `backend/models/` — Modelos de base de datos.
  - `backend/config/` — Configuración de conexión PDO.
  - `backend/uploads/` — Archivos subidos por el sitio.
- `database/` — Scripts SQL (`pasteleriadb.sql`, `update_schema.sql`).
- `uploads/` — Archivos de ejemplo / subidos.

Notas rápidas:
- Dependencias: esta rama no requiere dependencias Node para producción; el proyecto usa PHP + MySQL en backend.
- Imágenes y archivos subidos se guardan en `backend/uploads/` y `uploads/`.
- Se han retirado archivos y dependencias de desarrollo no necesarios para el sitio en producción.

Si quieres, agrego un apartado técnico corto (versión mínima de PHP, permisos de carpetas o cómo restaurar la base de datos desde `database/pasteleriadb.sql`).

Fin.
# C & C Cookies and Cakes - Sitio Web

Este repositorio contiene el código fuente completo para el sitio web de la pastelería "C & C Cookies and Cakes". El proyecto está listo para ser desplegado en un entorno de producción.

## 📋 Características Principales

El sitio web está diseñado para ofrecer una experiencia de usuario fluida y profesional, con un fuerte enfoque en el rendimiento y la responsividad.

### Sitio Público
- **Página de Inicio Dinámica:** La página principal se construye automáticamente a partir de las categorías de la base de datos, creando una sección con un carrusel de productos para cada una.
- **Carruseles Optimizados:**
    - **Responsivos:** Muestran 5 productos en escritorio, 2 en tablets y 1 en móviles, con un diseño adaptado para cada vista.
    - **Estables y Fluidos:** Se ha corregido el "lag" al hacer scroll y se han solucionado problemas de estabilidad que hacían desaparecer elementos.
- **Páginas de Categoría:** Vistas de cuadrícula que muestran todos los productos de una categoría seleccionada.
- **Página de Detalle de Producto:** Carga dinámica de la información completa de un producto.
- **Carrito de Compras Avanzado:**
    - Permite añadir cualquier producto, incluyendo aquellos sin precio (para cotizar).
    - Muestra subtotales por producto y un total general de la compra.
    - Genera un mensaje de WhatsApp detallado para finalizar la cotización, incluyendo cantidades, precios y totales.
- **Animaciones Modernas:** Elementos que aparecen suavemente al hacer scroll para una navegación más agradable.

### Panel de Administración (`/admin`)
- **Dashboard (`admin/dashboard.html`):** Muestra todos los productos en una tabla. Permite editar, eliminar y habilitar/deshabilitar productos.
- **Añadir Producto (`admin/add-product.html`):** Formulario para crear nuevos productos.
- **Editar Producto (`admin/edit-product.html`):** Formulario para modificar un producto existente.
- **Gestión de Categorías (`admin/manage-categories.html`):** Interfaz para crear, editar y eliminar las categorías de productos.
- **Gestión de Banners:** El backend y el servicio frontend están preparados para administrar los banners del carrusel principal. Se requiere implementar la interfaz de usuario en el panel de administración.

---

## 💻 Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** PHP 7+, PDO para base de datos
*   **Base de Datos:** MySQL (archivo `pasteleriadb.sql` incluido en el repositorio)

---

## 🚀 Guía de Despliegue

Esta guía está dirigida al equipo encargado de poner el sitio en producción.

### Estructura del Proyecto
- **Frontend (Raíz del proyecto):** Contiene todos los archivos públicos del sitio web (`index.html`, `assets/`, `pages/`). Es un sitio estático que consume datos de una API.
- **Backend (`/backend`):** Una aplicación PHP con estructura MVC simple (controllers, models, config) que funciona como la API del sitio.

### 1. Despliegue del Backend

El backend es el cerebro de la aplicación y debe estar en línea para que el sitio funcione.

-   **Requisito:** Se necesita un entorno de hosting que soporte **PHP** (la mayoría de hostings compartidos lo hacen).
-   **Procedimiento:**
    1.  Subir la carpeta `backend` al servidor.
    2.  Asegurarse de que el archivo `.htaccess` esté presente para el routing.
    3.  Configurar las variables de entorno en un archivo `.env` o directamente en `config/database.php` (host, usuario, contraseña, base de datos).
-   **Base de Datos:** Ejecutar el script `database/pasteleriadb.sql` para crear las tablas, y `database/update_schema.sql` para actualizar el esquema (cambio de BLOB a archivos).
-   **Resultado:** Una vez desplegado, el backend responderá en la ruta `/backend/api/` del dominio.

### 2. Configuración del Frontend

El frontend necesita saber dónde encontrar el backend en internet.

-   **Procedimiento:** Normalmente no requiere cambios si el backend está en `/backend/api/` del mismo dominio. Si está en un dominio diferente, actualizar las URLs en:
    -   `assets/js/script.js`
    -   `assets/js/product-service.js`
    -   `assets/js/category-service.js`
    -   `assets/js/banner-service.js`

    **Ejemplo de cambio en `script.js`:**
    ```javascript
    // ANTES:
    const API_BASE_URL = 'http://localhost:3001';

    // DESPUÉS (ejemplo con dominio propio):
    const API_BASE_URL = 'https://tu-dominio.com/backend/api';
    ```

### 3. Despliegue del Frontend

Una vez que el frontend ha sido configurado con la URL correcta del backend, se puede subir a cualquier servicio de hosting para sitios estáticos (ej: Netlify, Vercel, GitHub Pages, o el mismo servidor donde está el backend).

Con estos pasos, el sitio web estará completamente funcional en producción.
