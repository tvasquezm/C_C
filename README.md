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
- **Gestión de Banners:** El backend y el servicio frontend están preparados para administrar los banners del carrusel principal. Se requiere implementar la interfaz de usuario en el panel de administración.
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
    - Haz clic en "Seleccionar archivo" y busca el archivo `database/pasteleria_db.sql` que se encuentra en este proyecto.
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

### Poniendo Todo en Marcha (Resumen y Solución de Problemas)

Para que el sitio funcione correctamente, asegúrate de seguir este orden cada vez que trabajes en el proyecto:

1.  **Inicia XAMPP:** Asegúrate de que los servicios de **Apache** y **MySQL** estén corriendo.
2.  **Inicia el Backend:** Abre una terminal en la carpeta `backend` y ejecuta `npm start`. No cierres esta terminal.
3.  **Abre el Frontend:** Abre el archivo `index.html` en tu navegador.

> **¿El sitio no carga los productos?**
> Lo más probable es que el servidor backend no esté corriendo o no se pueda conectar a la base de datos. Revisa siempre la terminal donde ejecutaste `npm start` en busca de mensajes de error.

---

## Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Backend:** Node.js, Express.js
*   **Base de Datos:** MySQL
*   **Comunicación:** API RESTful

---

## 🌐 Puesta en Línea (Deploy)

Esta guía te ayudará a publicar tu sitio web para que sea accesible desde cualquier lugar. Usaremos servicios con capas gratuitas populares entre los desarrolladores.

### Parte 1: Preparar el Código

Antes de subir el proyecto, es crucial que el frontend sepa dónde encontrar al backend en línea.

1.  **Modifica los Servicios del Frontend:**
    - Abre los archivos `assets/js/product-service.js` y `assets/js/banner-service.js`.
    - Cambia la línea `_apiUrl` para que apunte a la URL que tendrá tu backend (la obtendremos en el paso 3). Por ahora, puedes dejar un marcador de posición.
      ```javascript
      // Ejemplo en product-service.js
      _apiUrl: 'https://tu-backend-url.onrender.com/api/products', 
      ```

2.  **Prepara el Backend para Variables de Entorno:**
    - En la terminal, dentro de la carpeta `backend`, instala `dotenv`: `npm install dotenv`.
    - Modifica el archivo `backend/db.js` para que lea las credenciales de la base de datos de forma segura, en lugar de tenerlas escritas en el código.

### Parte 2: Desplegar la Base de Datos

Usaremos **PlanetScale**, que ofrece bases de datos MySQL gratuitas.

1.  **Crea una cuenta** en PlanetScale.
2.  **Crea una nueva base de datos** y asígnale un nombre.
3.  **Obtén las credenciales:** Ve a la sección "Connect" de tu nueva base de datos y genera una nueva contraseña. Guarda los datos: `HOST`, `USERNAME`, `PASSWORD` y `DATABASE`.
4.  **Importa tu esquema:** Usa la pestaña "Console" de PlanetScale para pegar el contenido de tu archivo `database/pasteleria_db.sql` y ejecutarlo. Esto creará tus tablas.

### Parte 3: Desplegar el Backend (API)

Usaremos **Render**, que permite alojar servicios de Node.js gratuitamente.

1.  **Sube tu proyecto a GitHub:** Asegúrate de que todo tu código esté en un repositorio de GitHub.
2.  **Crea una cuenta** en Render usando tu cuenta de GitHub.
3.  **Crea un "New Web Service"** y selecciona tu repositorio.
4.  **Configura las Variables de Entorno:** En la configuración del servicio, añade las siguientes variables de entorno con los datos que obtuviste de PlanetScale:
    - `DB_HOST`: El host de tu base de datos de PlanetScale.
    - `DB_USER`: El usuario.
    - `DB_PASSWORD`: La contraseña.
    - `DB_DATABASE`: El nombre de la base de datos.
    - `DB_PORT`: Generalmente `3306`.
5.  **Configura el inicio:** Asegúrate de que el comando de inicio (`Start Command`) sea `npm start`.
6.  **Despliega:** Haz clic en "Create Web Service". Render construirá y desplegará tu backend. Una vez listo, te dará una URL pública (ej: `https://cookies-and-cakes-api.onrender.com`).

### Parte 4: Desplegar el Frontend (Sitio Estático)

Usaremos **Netlify**, ideal para sitios estáticos.

1.  **Crea una cuenta** en Netlify usando tu cuenta de GitHub.
2.  **Crea un "New site from Git"** y selecciona tu repositorio.
3.  **Configuración:** Netlify detectará que es un sitio estático. No necesitas configurar nada especial. Simplemente haz clic en "Deploy site".
4.  **¡Listo!** Netlify te dará una URL pública para tu sitio web.

### Paso Final: Conectar Todo

1.  **Actualiza la URL del Backend:** Vuelve a tu código, actualiza la variable `_apiUrl` en los archivos de servicio del frontend con la URL real que te dio Render. Sube los cambios a GitHub. Netlify y Render se redesplegarán automáticamente.
2.  **Configura CORS:** En tu archivo `backend/app.js`, asegúrate de que la configuración de CORS permita peticiones desde la URL de tu frontend en Netlify.

¡Felicidades! Tu sitio "Cookies and Cakes" ahora está en línea.
