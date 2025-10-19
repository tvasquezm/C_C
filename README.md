# Cookies and Cakes - Proyecto de Repostería

Este es el repositorio para el sitio web de "Cookies and Cakes", un proyecto de pastelería. El proyecto incluye una vista pública para clientes y un panel de administración privado para gestionar los productos.

El sistema está diseñado para ser desacoplado, con un frontend (lo que ve el usuario) que consume datos a través de un servicio centralizado, preparándolo para una futura integración con un backend y una base de datos real.

## Cómo Empezar (Frontend)

Este es un proyecto de frontend puro. Para verlo en acción, simplemente abre el archivo `index.html` en tu navegador.

Para una mejor experiencia de desarrollo (con recarga en vivo), puedes usar una extensión como "Live Server" en Visual Studio Code.

---

## 1. Características Principales

### Sitio Público
- **Página de Inicio (`index.html`):** Presenta la marca y muestra carruseles de productos destacados por categoría.
- **Páginas de Categoría:** Vistas que muestran todos los productos de una categoría específica.
- **Página de Detalle de Producto (`pages/product-detail.html`):** Una página plantilla que carga dinámicamente la información de cualquier producto basándose en un ID en la URL.
- **Diseño Responsivo:** Adaptable a dispositivos móviles y de escritorio.
- **Banners Dinámicos:** La sección principal de la página de inicio es un carrusel que muestra banners gestionables desde el panel de administración.
- **Pedido por WhatsApp:** Los botones de "Pedir" o "Cotizar" generan un mensaje de WhatsApp pre-rellenado con los detalles del producto, facilitando el contacto directo con el cliente.

### Panel de Administración (`/admin`)
- **Dashboard (`admin/dashboard.html`):** Muestra todos los productos en una tabla. Permite editar o eliminar productos.
- **Añadir Producto (`admin/add-product.html`):** Formulario para crear nuevos productos.
- **Editar Producto (`admin/edit-product.html`):** Formulario para modificar un producto existente.
- **Notificaciones:** Sistema de notificaciones para confirmar acciones (ej. "Producto añadido con éxito").

---

## 2. Estructura del Proyecto

El proyecto está organizado de la siguiente manera para separar las responsabilidades:

```
pastelarte/
├── admin/                  # Contiene todo lo relacionado con el panel de administración
│   ├── add-product.html
│   ├── dashboard.html
│   ├── edit-product.html
│   ├── admin.js            # Lógica del panel de administración (CRUD)
│   └── admin-style.css     # Estilos del panel de administración
│
├── assets/                 # Recursos compartidos (CSS, JS, imágenes)
│   ├── css/
│   │   └── style.css       # Estilos principales del sitio público
│   └── js/
│       ├── script.js       # Lógica del sitio público (carrusel, renderizado)
│       └── product-service.js # ¡CLAVE! Capa de acceso a datos
│
├── pages/                  # Páginas secundarias del sitio público
│   ├── product-detail.html # Plantilla para mostrar un solo producto
│   ├── tortas-kuchen.html
│   └── ...                 # Otras páginas de categoría
│
├── index.html              # Página principal del sitio
└── README.md               # Este archivo
```

---

## 3. Funcionamiento del Sistema

El corazón del sistema es el archivo `assets/js/product-service.js`. Este actúa como un intermediario entre la interfaz de usuario y los datos.

1.  **`product-service.js`**:
    -   Define cómo obtener, crear, actualizar y eliminar productos (`getAll`, `getById`, `add`, `update`, `delete`).
    -   Actualmente, está configurado para hacer peticiones `fetch` a una API REST en `http://localhost:3000/api/products`. **Este es el punto de conexión con el backend.**

2.  **Sitio Público (`script.js` y `product-detail.html`)**:
    -   Llaman a los métodos de `ProductService` (ej. `ProductService.getAll()`) para obtener la lista de productos.
    -   Luego, usan esa información para generar el HTML de las tarjetas de producto y mostrarlas en la página.

3.  **Panel de Administración (`admin.js`)**:
    -   También utiliza `ProductService` para todas sus operaciones.
    -   Cuando se añade un producto, llama a `ProductService.add(productData)`.
    -   Cuando se elimina, llama a `ProductService.delete(productId)`.

Este diseño significa que si cambiamos la forma en que se almacenan los datos (de `localStorage` a una API), solo necesitamos modificar `product-service.js`, y el resto de la aplicación seguirá funcionando sin cambios mayores.

---

## 4. 🚀 Guía para la Implementación del Backend

El frontend está completamente preparado para funcionar con un backend. El archivo `assets/js/product-service.js` centraliza todas las llamadas a la API. A continuación se detalla todo lo que el backend necesita saber para integrarse correctamente.

### 4.1. Modelo de Datos del Producto

El backend debe manejar objetos de producto con la siguiente estructura JSON. El frontend espera recibir estos campos.

```json
{
  "id": "string",         // Identificador único (generado por el backend/DB)
  "name": "string",       // Nombre del producto
  "category": "string",   // "Tortas y Kuchen", "Galletas y Tortas Temáticas", etc.
  "price": "string",      // Precio (ej: "$15.000")
  "img": "string",        // URL completa de la imagen del producto
  "isActive": "boolean"   // (Opcional) true si el producto es visible, false si está oculto. Si no se provee, se asume true.
}
```

### 4.2. Endpoints de la API

El backend debe crear un servidor que escuche en `http://localhost:3000` y responda a las siguientes rutas.

**URL Base de la API:** `/api/products`

| Método | Ruta                  | Descripción                                                                                                | Respuesta Exitosa (Cuerpo)                               |
|--------|-----------------------|------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| `GET`  | `/api/products`       | Devuelve una lista de todos los productos.                                                                 | `[ {producto1}, {producto2}, ... ]`                       |
| `GET`  | `/api/products/:id`   | Devuelve un único producto que coincida con el `id` proporcionado.                                         | `{producto}`                                             |
| `POST` | `/api/products`       | Crea un nuevo producto. Recibe los datos del producto (sin `id`) en el cuerpo de la petición (request body). | `{producto_creado_con_id}`                               |
| `PUT`  | `/api/products/:id`   | Actualiza un producto existente. Recibe los datos actualizados en el request body.                         | `{producto_actualizado}`                                 |
| `DELETE`| `/api/products/:id`  | Elimina un producto que coincida con el `id`.                                                              | (No se requiere cuerpo de respuesta, solo status 200/204) |

> **Nota:** El frontend ya está completamente configurado para consumir estos endpoints. No se necesitan cambios en el código JavaScript del frontend.

### 4.3. Manejo de Imágenes

El frontend simplemente espera una URL en el campo `img`. El backend es responsable de gestionar el almacenamiento de las imágenes.

**Sugerencia de implementación:**
1.  Crear un endpoint adicional, por ejemplo `POST /api/upload`.
2.  Este endpoint recibiría un archivo de imagen, lo guardaría en el servidor (o en un servicio como AWS S3, Cloudinary, etc.).
3.  Devolvería la URL pública de la imagen guardada.
4.  El panel de administración podría ser modificado para usar este endpoint y autocompletar el campo "URL de la Imagen".

### 4.4. Autenticación (Próximo Paso)

Actualmente, el panel de administración (`/admin`) es de acceso público. Un paso crucial para un sistema en producción es proteger estas rutas.

**Sugerencia de implementación:**
1.  Crear endpoints en el backend para login (`POST /api/auth/login`) y logout.
2.  Implementar un sistema de tokens (ej. JWT - JSON Web Tokens).
3.  El frontend guardaría el token después de un login exitoso y lo enviaría en las cabeceras (`Authorization: Bearer <token>`) de cada petición a rutas protegidas.
4.  El backend validaría este token en cada petición a los endpoints de administración (POST, PUT, DELETE de productos).

### 4.5. Dashboard de Estadísticas (Mejora Futura)

Para enriquecer el panel de administración, se puede crear una nueva sección de estadísticas (`admin/statistics.html`). Esta página ofrecería información valiosa sobre el rendimiento del sitio.

**Sugerencia de implementación:**
1.  **Recolección de Datos:** El backend necesitaría registrar eventos clave, como:
    -   Visitas a la página de detalle de cada producto.
    -   Clics en los botones "Pedir por WhatsApp" o "Cotizar".
    -   Ventas completadas.

2.  **Nuevos Endpoints de Estadísticas:** El backend debería exponer nuevos endpoints para que el frontend los consuma. Por ejemplo:
    -   `GET /api/stats/most-viewed`: Devolver los productos más visitados.
    -   `GET /api/stats/sales-over-time`: Devolver datos de ventas por día/semana/mes.
    -   `GET /api/stats/category-performance`: Devolver un resumen de ventas o visitas por categoría.

3.  **Visualización en el Frontend:** La página `admin/statistics.html` usaría estos datos para renderizar gráficos y tablas (usando librerías como Chart.js o ApexCharts) que muestren las métricas de forma clara.

---

## 5. 🖼️ Guía para la Gestión de Banners (Backend)

El frontend ha sido actualizado para incluir un sistema de gestión de banners dinámicos que se muestran en la página de inicio.

### 5.1. Modelo de Datos del Banner

El backend debe manejar objetos de banner con la siguiente estructura JSON:

```json
{
  "id": "string",         // Identificador único (generado por el backend/DB)
  "title": "string",      // Título principal del banner
  "subtitle": "string",   // Subtítulo o texto secundario
  "imageUrl": "string",   // URL completa de la imagen de fondo del banner
  "linkUrl": "string",    // URL a la que dirigirá el botón del banner (ej: /pages/tortas-kuchen.html)
  "buttonText": "string", // Texto para el botón (ej: "Ver Productos")
  "isActive": "boolean"   // true si el banner debe mostrarse, false si está oculto.
}
```

### 5.2. Endpoints de la API para Banners

El backend debe implementar los siguientes endpoints en la URL base `/api/banners`.

| Método | Ruta                  | Descripción                                                                                                |
|--------|-----------------------|------------------------------------------------------------------------------------------------------------|
| `GET`  | `/api/banners`        | Devuelve una lista de todos los banners.                                                                   |
| `GET`  | `/api/banners/active` | Devuelve una lista de solo los banners que tienen `isActive: true`.                                        |
| `GET`  | `/api/banners/:id`    | Devuelve un único banner que coincida con el `id`.                                                         |
| `POST` | `/api/banners`        | Crea un nuevo banner. Recibe los datos en el request body.                                                 |
| `PUT`  | `/api/banners/:id`    | Actualiza un banner existente. Recibe los datos actualizados en el request body.                           |
| `DELETE`| `/api/banners/:id`   | Elimina un banner que coincida con el `id`.                                                                |
