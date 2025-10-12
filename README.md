# Cookies and Cakes - Proyecto de Repostería

Este es el repositorio para el sitio web de "Cookies and Cakes", una pastelería real. El proyecto incluye una vista pública para clientes y un panel de administración privado para gestionar los productos.

El sistema está diseñado para ser desacoplado, con un frontend (lo que ve el usuario) que consume datos a través de un servicio centralizado, preparándolo para una futura integración con un backend y una base de datos real.

## Características Principales

### Sitio Público
- **Página de Inicio (`index.html`):** Presenta la marca y muestra carruseles de productos destacados por categoría.
- **Páginas de Categoría:** Vistas que muestran todos los productos de una categoría específica.
- **Página de Detalle de Producto (`pages/product-detail.html`):** Una página plantilla que carga dinámicamente la información de cualquier producto basándose en un ID en la URL.
- **Diseño Responsivo:** Adaptable a dispositivos móviles y de escritorio.

### Panel de Administración (`/admin`)
- **Dashboard (`admin/dashboard.html`):** Muestra todos los productos en una tabla. Permite editar o eliminar productos.
- **Añadir Producto (`admin/add-product.html`):** Formulario para crear nuevos productos.
- **Editar Producto (`admin/edit-product.html`):** Formulario para modificar un producto existente.
- **Notificaciones:** Sistema de notificaciones para confirmar acciones (ej. "Producto añadido con éxito").

---

## Estructura del Proyecto

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

## Funcionamiento del Sistema

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

## 🚀 Próximos Pasos: Conexión a una Base de Datos

El frontend ya está preparado para funcionar con un backend. Para completar la conexión, debes seguir estos dos pasos principales:

### Paso 1: Construir el Backend (API)

Necesitas crear un servidor que escuche las peticiones en la URL que `product-service.js` espera: `http://localhost:3000/api/products`.

Este servidor será responsable de:
1.  Conectarse a una base de datos (como MongoDB, PostgreSQL, MySQL, etc.).
2.  Crear los "endpoints" o rutas que correspondan a las operaciones CRUD:
    -   `GET /api/products`: Devolver todos los productos.
    -   `GET /api/products/:id`: Devolver un producto específico.
    -   `POST /api/products`: Crear un nuevo producto.
    -   `PUT /api/products/:id`: Actualizar un producto.
    -   `DELETE /api/products/:id`: Eliminar un producto.

> **Recomendación:** Utilizar **Node.js** con el framework **Express** es una excelente opción para crear esta API de forma rápida y eficiente.

### Paso 2: Adaptar el Frontend a la Asincronía

Como `product-service.js` ahora usa funciones `async` (porque las peticiones de red no son instantáneas), el código que lo llama debe "esperar" la respuesta.

Debes ir a los siguientes archivos y modificar las funciones para que usen `async/await`:

1.  **`admin/admin.js`**:
    -   En `initDashboardPage`, la función `renderTable` debe ser `async` y usar `const products = await ProductService.getAll();`.
    -   En `initEditProductPage`, la carga del producto debe ser `const product = await ProductService.getById(productId);`.
    -   Todos los manejadores de `submit` de formularios y el evento de `delete` deben convertirse en `async` y usar `await` al llamar a los métodos de `ProductService`.

2.  **`assets/js/script.js`**:
    -   La función `renderProducts` debe ser `async` y usar `const allProducts = await ProductService.getAll();`.
    -   El evento `DOMContentLoaded` que llama a `renderProducts` también debe ser `async`.

3.  **`pages/product-detail.html`**:
    -   El script dentro de este archivo ya está correctamente implementado con `async/await`, por lo que puede servir de ejemplo.

Una vez que el backend esté funcionando y el frontend esté adaptado a la asincronía, tu aplicación tendrá un flujo de datos completo y persistente.
