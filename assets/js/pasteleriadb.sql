-- =================================================================
--  SCRIPT DE CREACIÓN PARA LA BASE DE DATOS 'pasteleria_db'
-- =================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
-- Si ya existe, la borra para empezar de cero y evitar errores.
-- Las siguientes líneas se han comentado porque la base de datos 'pasteleria_db' ya existe.
-- DROP DATABASE IF EXISTS `pasteleria_db`;
-- CREATE DATABASE `pasteleria_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pasteleria_db`;

-- 2. CREACIÓN DE LA TABLA `categorias`
-- Aquí se guardarán los tipos de productos (Tortas, Galletas, etc.)
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_categoria`)
);

-- 3. CREACIÓN DE LA TABLA `productos`
-- El catálogo principal de tus productos.
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category_id` INT NOT NULL, -- CAMBIO: Ahora es un número para relacionarlo.
  `price` VARCHAR(50) NOT NULL, -- CAMBIO: Volvemos a texto para guardar "Cotizar".
  `size` VARCHAR(100) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `img` LONGBLOB NULL, -- Cambiado de VARCHAR a LONGBLOB, puede ser NULL
  `img_mimetype` VARCHAR(50) NULL COMMENT 'Guarda el tipo MIME de la imagen (ej: image/png) para servirla correctamente.',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1, 
  PRIMARY KEY (`id`),
  -- MEJORA: Creamos la relación entre la tabla de productos y la de categorías.
  -- Esto asegura que un producto siempre tenga una categoría válida.
  FOREIGN KEY (`category_id`) REFERENCES `categorias`(`id_categoria`) ON DELETE CASCADE
);

-- 4. CREACIÓN DE LA TABLA `banners`
-- Para las imágenes promocionales de la página de inicio.
DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `img` LONGBLOB NULL,
  `img_mimetype` VARCHAR(50) NULL COMMENT 'Guarda el tipo MIME de la imagen (ej: image/png) para servirla correctamente.',
  `titulo` VARCHAR(150),
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `orden` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- 5. INSERCIÓN DE DATOS DE EJEMPLO
-- Se insertan datos para que la tienda no se vea vacía al iniciar.

-- Categorías de ejemplo
INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Tortas y Kuchen'),
(2, 'Galletas y Tortas Temáticas'),
(3, 'Repostería y Otros Dulces'),
(4, 'Temporada');

-- Productos de ejemplo
INSERT INTO `productos` (`name`, `category_id`, `price`, `size`, `description`, `is_active`) VALUES
-- Categoría 1: Tortas y Kuchen (6 productos)
('Torta de Chocolate Intenso', 1, '$25.000', 'Mediana (15 pers.)', 'Capas de bizcocho de chocolate húmedo y un rico frosting de cacao, ideal para los amantes del chocolate.', 1),
('Kuchen de Manzana y Nuez', 1, '$18.000', 'Grande (12 porc.)', 'Clásico kuchen sureño con manzanas frescas, canela y una cubierta crocante de nueces.', 1),
('Cheesecake de Frutos Rojos', 1, '$22.000', 'Mediano (10 pers.)', 'Cremoso cheesecake sobre una base de galleta, cubierto con una generosa capa de salsa de frutos rojos.', 1),
('Torta Red Velvet', 1, '$28.000', 'Mediana (15 pers.)', 'El clásico pastel de terciopelo rojo con su inconfundible frosting de queso crema.', 1),
('Tarta de Frutas de Estación', 1, '$20.000', 'Grande (12 porc.)', 'Una base de masa sablée, crema pastelera y una colorida selección de las mejores frutas de la temporada.', 1),
('Torta de Tres Leches', 1, '$23.000', 'Mediana (12 pers.)', 'Bizcocho esponjoso bañado en una mezcla de tres leches, cubierto con merengue italiano.', 1),

-- Categoría 2: Galletas y Tortas Temáticas (6 productos)
('Torta de Cumpleaños Personalizada', 2, 'Cotizar', 'A convenir', 'Diseñamos la torta de tus sueños para esa celebración especial. Elige el sabor, relleno y temática.', 1),
('Galletas Decoradas (Temáticas)', 2, 'Cotizar', 'Por docena', 'Galletas de mantequilla finamente decoradas a mano para eventos, fiestas o regalos corporativos.', 1),
('Torta de Bautizo o Baby Shower', 2, 'Cotizar', 'A convenir', 'Tiernas y elegantes tortas para celebrar la llegada de un nuevo miembro a la familia. Diseños personalizables.', 1),
('Torta de Matrimonio', 2, 'Cotizar', 'A convenir', 'Creamos tortas de matrimonio elegantes y deliciosas, adaptadas al estilo de tu celebración.', 1),
('Galletas Corporativas con Logo', 2, 'Cotizar', 'Desde 50 unidades', 'Sorprende a tus clientes o equipo con galletas personalizadas con el logo de tu empresa.', 1),
('Torta con Diseño de Personajes', 2, 'Cotizar', 'A convenir', 'Hacemos realidad el personaje favorito de tus hijos en una deliciosa torta.', 1),

-- Categoría 3: Repostería y Otros Dulces (6 productos)
('Cupcakes de Vainilla y Frambuesa', 3, '$1.800 c/u', 'Unidad', 'Suaves cupcakes de vainilla con un corazón de mermelada de frambuesa y frosting de queso crema.', 1),
('Macarons Surtidos', 3, '$12.000', 'Caja de 12', 'Una selección de nuestros mejores macarons: chocolate, pistacho, frambuesa, y más.', 1),
('Brownies de Chocolate y Nuez', 3, '$8.000', 'Caja de 6', 'Intensos y húmedos brownies de chocolate semi-amargo con trozos de nuez.', 1),
('Alfajores de Maicena', 3, '$7.000', 'Caja de 10', 'Suaves y delicados alfajores rellenos de manjar y espolvoreados con coco rallado.', 1),
('Cake Pops Temáticos', 3, '$1.500 c/u', 'Unidad (mín. 12)', 'Divertidos y deliciosos cake pops cubiertos de chocolate y decorados según la temática de tu evento.', 1),
('Donas Glaseadas', 3, '$1.200 c/u', 'Unidad', 'Clásicas donas esponjosas cubiertas con un glaseado de azúcar o chocolate.', 1),

-- Categoría 4: Temporada (6 productos)
('Torta de Castañas (Otoño)', 4, '$24.000', 'Mediana (12 pers.)', 'Una delicia de otoño con puré de castañas y un suave bizcocho de vainilla.', 1),
('Kuchen de Ciruela (Verano)', 4, '$19.000', 'Grande (12 porc.)', 'Aprovecha la temporada de ciruelas con este jugoso y aromático kuchen.', 1),
('Pan de Pascua (Navidad)', 4, '$15.000', '1 Kg', 'Nuestro tradicional Pan de Pascua con frutos secos, fruta confitada y un toque de especias.', 0),
('Galletas de Jengibre (Invierno)', 4, '$6.000', 'Bolsa de 10', 'Clásicas galletas de jengibre y especias, perfectas para un día frío.', 1),
('Torta Helada de Frutilla (Verano)', 4, '$26.000', 'Mediana (15 pers.)', 'Refrescante torta helada con capas de merengue, helado de frutilla y crema.', 1),
('Pie de Calabaza (Otoño)', 4, '$18.000', 'Grande (10 porc.)', 'El clásico "Pumpkin Pie" americano, cremoso y lleno de sabor a especias de otoño.', 1);

-- Banners de ejemplo
INSERT INTO `banners` (`titulo`, `activo`, `orden`) VALUES
('Pastelería Artesanal', 1, 0),
('Tortas para toda Ocasión', 1, 1),
('Nuevos Sabores de Temporada', 1, 2);