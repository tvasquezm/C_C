# Cookies and Cakes - Proyecto de Repostería

Este es el repositorio para el sitio web de "Cookies and Cakes", una pastelería real. El proyecto incluye una vista pública para clientes y un panel de administración privado para gestionar el catálogo de productos.

El sistema está construido con un frontend de HTML, CSS y JavaScript puro, y un backend (API) desarrollado con Node.js y Express, conectado a una base de datos MySQL.

## Características Principales

### Sitio Público
- **Página de Inicio (`index.html`):** Presenta la marca y muestra carruseles de productos destacados por categoría.
- **Página de Detalle de Producto (`pages/product-detail.html`):** Una página plantilla que carga dinámicamente la información de cualquier producto basándose en un ID en la URL.
- **Carrito de Compras:** Funcionalidad para añadir productos, ajustar cantidades y finalizar la cotización a través de un mensaje pre-generado de WhatsApp.
- **Diseño Responsivo:** Adaptable a dispositivos móviles y de escritorio.

### Panel de Administración (`/admin`)
- **Dashboard (`admin/dashboard.html`):** Muestra todos los productos en una tabla. Permite editar, eliminar y habilitar/deshabilitar productos.
- **Añadir Producto (`admin/add-product.html`):** Formulario para crear nuevos productos.
- **Editar Producto (`admin/edit-product.html`):** Formulario para modificar un producto existente.
- **Gestión de Categorías (`admin/manage-categories.html`):** Interfaz para crear, editar y eliminar las categorías de productos.
- **Notificaciones:** Sistema de notificaciones para confirmar acciones (ej. "Producto añadido con éxito").

---

## 🚀 Guía de Instalación y Uso

Sigue estos pasos para configurar y ejecutar el proyecto en tu computadora local.

### 1. Prerrequisitos

Asegúrate de tener instalado el siguiente software:
- **Node.js:** (Versión LTS recomendada). Puedes descargarlo desde nodejs.org.
- **XAMPP:** Para tener un servidor Apache y MySQL. Puedes descargarlo desde apachefriends.org.

### 2. Configuración de la Base de Datos

El proyecto utiliza una base de datos MySQL para almacenar toda la información.

1.  **Inicia XAMPP:** Abre el panel de control de XAMPP y presiona "Start" en los módulos de **Apache** y **MySQL**.
2.  **Abre phpMyAdmin:** En tu navegador, ve a la dirección `http://localhost/phpmyadmin`.
3.  **Importa el Script:**
    - En la página principal de phpMyAdmin, haz clic en la pestaña **"Importar"**.
    - Haz clic en "Seleccionar archivo" y busca el archivo `database/schema.sql` que se encuentra en este proyecto.
    - Desplázate hacia abajo y haz clic en el botón **"Importar"** (o "Go").

Esto creará automáticamente la base de datos `pasteleria_db` con todas las tablas y datos de ejemplo necesarios.

### 3. Configuración del Backend (Servidor)

El backend es el encargado de conectar la base de datos con el sitio web.

1.  **Abre una terminal** en la carpeta `backend` del proyecto.
2.  **Instala las dependencias:** Ejecuta el siguiente comando. Esto descargará todos los paquetes necesarios (Express, CORS, MySQL2).
    ```bash
    npm install
    ```
3.  **Inicia el servidor:** Una vez instaladas las dependencias, ejecuta:
    ```bash
    npm start
    ```
    Si todo está correcto, verás el mensaje `Servidor corriendo en http://localhost:3000` en la terminal. **No cierres esta terminal**, ya que el servidor debe estar corriendo para que el sitio funcione.

### 4. Ejecutar el Frontend (Sitio Web)

Con el backend y la base de datos funcionando, ya puedes usar el sitio.

1.  Navega a la carpeta raíz del proyecto (`pasteleria/`).
2.  Abre el archivo `index.html` en tu navegador web.

¡Y listo! Ahora deberías poder ver el sitio completo, con los productos cargados desde la base de datos, y utilizar el panel de administración.

---

## Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js
*   **Base de Datos:** MySQL
*   **Comunicación:** API RESTful
