# Cookies and Cakes - Proyecto de Repostería

Este es el repositorio para el sitio web de "Cookies and Cakes", una pastelería real. El proyecto incluye una vista pública para clientes y un panel de administración privado para gestionar el catálogo de productos.

El sistema está construido con un frontend de HTML, CSS y JavaScript puro, y un backend (API) desarrollado con Node.js y Express, conectado a una base de datos MySQL.

## 📋 Características Principales

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
- **Gestión de Banners:** El backend y el servicio frontend están preparados para administrar los banners del carrusel principal. Se requiere implementar la interfaz de usuario en el panel de administración.
- **Notificaciones:** Sistema de notificaciones para confirmar acciones (ej. "Producto añadido con éxito").

---

## 💻 Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js
*   **Base de Datos:** MySQL
*   **Comunicación:** API RESTful

---

## 🚀 Configuración del Entorno de Desarrollo Local

Sigue estos pasos para configurar y ejecutar el proyecto completo en tu computadora.

### 1. Prerrequisitos

Asegúrate de tener instalado el siguiente software:
- **Node.js:** (Versión LTS recomendada). Puedes descargarlo desde nodejs.org.
- **XAMPP:** Para tener un servidor Apache y MySQL. Puedes descargarlo desde apachefriends.org.
- **Git:** Para clonar el repositorio. Puedes descargarlo desde git-scm.com.

### 2. Clonar el Repositorio

Abre una terminal y clona el proyecto en tu máquina:
```bash
git clone <URL_DEL_REPOSITORIO>
cd pasteleria
```

### 3. Configuración de la Base de Datos

El proyecto utiliza una base de datos MySQL para almacenar toda la información.

1.  **Inicia XAMPP:** Abre el panel de control de XAMPP y presiona "Start" en los módulos de **Apache** y **MySQL**.
2.  **Abre phpMyAdmin:** En tu navegador, ve a la dirección `http://localhost/phpmyadmin`.
3.  **Importa el Script:**
    - En phpMyAdmin, crea una nueva base de datos llamada `pasteleria_db`.
    - Selecciona la base de datos recién creada y ve a la pestaña **"Importar"**.
    - Haz clic en "Seleccionar archivo" y busca el archivo `database/pasteleria_db.sql` dentro de la carpeta del proyecto.
    - Haz clic en el botón **"Importar"** para ejecutar el script.

Esto creará automáticamente la base de datos `pasteleria_db` con todas las tablas y datos de ejemplo necesarios.

### 4. Configuración del Backend (Servidor API)

El backend es el encargado de conectar la base de datos con el sitio web.

1.  **Abre una terminal** en la carpeta `backend` del proyecto.
2.  **Instala las dependencias:** Ejecuta el siguiente comando para descargar los paquetes necesarios (Express, CORS, etc.).
    ```bash
    npm install
    ```
3.  **Inicia el servidor:** Una vez instaladas las dependencias, ejecuta el siguiente comando para poner en marcha la API:
    ```bash
    npm start
    ```
    Si todo está correcto, verás el mensaje `Servidor corriendo en http://localhost:3000` en la terminal. **No cierres esta terminal**, ya que el servidor debe estar corriendo para que el sitio funcione.

### 5. Ejecutar el Frontend (Sitio Web)

Con el backend y la base de datos funcionando, ya puedes usar el sitio.

1.  Navega a la carpeta raíz del proyecto (`pasteleria/`).
2.  Abre el archivo `index.html` en tu navegador web (puedes hacer doble clic en él).

¡Y listo! Ahora deberías poder ver el sitio completo, con los productos cargados desde la base de datos, y utilizar el panel de administración.

---

### Flujo de Trabajo Diario (Resumen)

Cada vez que quieras trabajar en el proyecto, sigue estos 3 pasos:

1.  **Inicia XAMPP:** Asegúrate de que los servicios de **Apache** y **MySQL** estén corriendo.
2.  **Inicia el Backend:** Abre una terminal en la carpeta `backend` y ejecuta `npm start`. No cierres esta terminal.
3.  **Abre el Frontend:** Abre el archivo `index.html` en tu navegador.

> **¿El sitio no carga los productos?**
> Lo más probable es que el servidor backend no esté corriendo o no se pueda conectar a la base de datos. Revisa siempre la terminal donde ejecutaste `npm start` en busca de mensajes de error.
