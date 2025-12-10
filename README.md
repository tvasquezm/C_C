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
*   **Backend:** Node.js, Express.js
*   **Base de Datos:** SQLite (archivo `pasteleria.db` incluido en el repositorio)

---

## 🚀 Guía de Despliegue

Esta guía está dirigida al equipo encargado de poner el sitio en producción.

### Estructura del Proyecto
- **Frontend (Raíz del proyecto):** Contiene todos los archivos públicos del sitio web (`index.html`, `assets/`, `pages/`). Es un sitio estático que consume datos de una API.
- **Backend (`/backend`):** Una aplicación Node.js con Express y SQLite que funciona como la API del sitio.

### 1. Despliegue del Backend

El backend es el cerebro de la aplicación y debe estar en línea para que el sitio funcione.

-   **Requisito:** Se necesita un entorno de hosting que soporte **Node.js** (ej: Heroku, Vercel, Render, un VPS, etc.).
-   **Procedimiento:**
    1.  Subir la carpeta `backend` al servicio de hosting.
    2.  Instalar las dependencias ejecutando `npm install` dentro de la carpeta `backend`.
    3.  Iniciar el servidor con `npm start`.
-   **Base de Datos:** La base de datos es un archivo SQLite (`backend/db/pasteleria.db`) que está incluido en el repositorio. No se requiere ninguna configuración adicional; el backend la encontrará y usará automáticamente.
-   **Resultado:** Una vez desplegado, el backend tendrá una **URL pública** (ej: `https://api-pastelarte.com`). Esta URL es fundamental para el siguiente paso.

### 2. Configuración del Frontend

El frontend necesita saber dónde encontrar el backend en internet.

-   **Procedimiento:**
    1.  Obtener la URL pública del backend desplegado en el paso anterior.
    2.  Abrir los siguientes archivos del frontend y reemplazar la URL de desarrollo (`http://localhost:3001`) por la **URL pública del backend**.

-   **Archivos a modificar:**
    -   `assets/js/script.js`
    -   `assets/js/product-service.js`
    -   `assets/js/category-service.js`
    -   `assets/js/banner-service.js`

    **Ejemplo de cambio en `script.js`:**
    ```javascript
    // ANTES:
    const API_BASE_URL = 'http://localhost:3001';

    // DESPUÉS (ejemplo con la URL pública):
    const API_BASE_URL = 'https://api-pastelarte.com';
    ```

### 3. Despliegue del Frontend

Una vez que el frontend ha sido configurado con la URL correcta del backend, se puede subir a cualquier servicio de hosting para sitios estáticos (ej: Netlify, Vercel, GitHub Pages, o el mismo servidor donde está el backend).

Con estos pasos, el sitio web estará completamente funcional en producción.
