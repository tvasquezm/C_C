-- =================================================================
--  SCRIPT DE CREACIÓN PARA LA BASE DE DATOS 'pasteleria_db'
-- =================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
-- Si ya existe, la borra para empezar de cero y evitar errores.
DROP DATABASE IF EXISTS `pasteleria_db`;
CREATE DATABASE `pasteleria_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pasteleria_db`;

-- 2. CREACIÓN DE LA TABLA `categorias`
-- Aquí se guardarán los tipos de productos (Tortas, Galletas, etc.)
CREATE TABLE `categorias` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_categoria`)
);

-- 3. CREACIÓN DE LA TABLA `productos`
-- El catálogo principal de tus productos.
CREATE TABLE `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category_id` INT NOT NULL, -- CAMBIO: Ahora es un número para relacionarlo.
  `price` VARCHAR(50) NOT NULL, -- CAMBIO: Volvemos a texto para guardar "Cotizar".
  `size` VARCHAR(100) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `img` LONGBLOB NULL, -- Cambiado de VARCHAR a LONGBLOB, puede ser NULL
  `is_active` TINYINT(1) NOT NULL DEFAULT 1, 
  PRIMARY KEY (`id`),
  -- MEJORA: Creamos la relación entre la tabla de productos y la de categorías.
  -- Esto asegura que un producto siempre tenga una categoría válida.
  FOREIGN KEY (`category_id`) REFERENCES `categorias`(`id_categoria`) ON DELETE CASCADE
);

-- 4. CREACIÓN DE LA TABLA `banners`
-- Para las imágenes promocionales de la página de inicio.
CREATE TABLE `banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `img` LONGBLOB NULL,
  `titulo` VARCHAR(150),
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `orden` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

-- 5. INSERCIÓN DE DATOS DE EJEMPLO
-- ¡Añadimos algunos datos para que la tienda no se vea vacía!

-- Categorías de ejemplo
INSERT INTO `categorias` (`nombre`) VALUES
('Tortas y Kuchen'),
('Galletas y Tortas Temáticas'),
('Repostería y Otros Dulces');

-- Productos de ejemplo
INSERT INTO `productos` (`name`, `category_id`, `price`, `size`, `description`, `is_active`, `img`) VALUES
-- Tortas y Kuchen (8)
('Torta de Chocolate Intenso', 1, '$25.000', 'Mediana (15 pers.)', 'Capas de bizcocho de chocolate húmedo y un rico frosting de cacao, ideal para los amantes del chocolate.', 1, NULL),
('Kuchen de Manzana y Nuez', 1, '$18.000', 'Grande (12 porc.)', 'Clásico kuchen sureño con manzanas frescas, canela y una cubierta crocante de nueces.', 1, NULL),
('Cheesecake de Frutos Rojos', 1, '$22.000', 'Mediano (10 pers.)', 'Cremoso cheesecake sobre una base de galleta, cubierto con una generosa capa de salsa de frutos rojos.', 1, NULL),
('Torta Red Velvet', 1, '$28.000', 'Mediana (15 pers.)', 'El clásico pastel de terciopelo rojo con su inconfundible frosting de queso crema.', 1, NULL),
('Tarta de Frutas de Estación', 1, '$20.000', 'Grande (12 porc.)', 'Una base de masa sablée, crema pastelera y una colorida selección de las mejores frutas de la temporada.', 1, NULL),
('Torta de Tres Leches', 1, '$23.000', 'Mediana (12 pers.)', 'Bizcocho esponjoso bañado en una mezcla de tres leches, cubierto con merengue italiano.', 1, NULL),
('Pie de Limón', 1, '$17.000', 'Grande (10 porc.)', 'El equilibrio perfecto entre lo ácido y lo dulce, con una base crujiente y un suave merengue.', 1, NULL),
('Torta de Panqueque Naranja', 1, '$26.000', 'Mediana (15 pers.)', 'Finas capas de panqueques intercaladas con una suave y aromática crema de naranja.', 1, NULL),

-- Galletas y Tortas Temáticas (5)
('Torta de Cumpleaños Personalizada', 2, 'Cotizar', 'A convenir', 'Diseñamos la torta de tus sueños para esa celebración especial. Elige el sabor, relleno y temática.', 1, NULL),
('Galletas Decoradas (Temáticas)', 2, 'Cotizar', 'Por docena', 'Galletas de mantequilla finamente decoradas a mano para eventos, fiestas o regalos corporativos.', 1, NULL),
('Torta de Bautizo o Baby Shower', 2, 'Cotizar', 'A convenir', 'Tiernas y elegantes tortas para celebrar la llegada de un nuevo miembro a la familia. Diseños personalizables.', 1, NULL),
('Torta de Matrimonio', 2, 'Cotizar', 'A convenir', 'Creamos tortas de matrimonio elegantes y deliciosas, adaptadas al estilo de tu celebración.', 1, NULL),
('Galletas Corporativas con Logo', 2, 'Cotizar', 'Desde 50 unidades', 'Sorprende a tus clientes o equipo con galletas personalizadas con el logo de tu empresa.', 1, NULL),

-- Repostería y Otros Dulces (7)
('Cupcakes de Vainilla y Frambuesa', 3, '$1.800 c/u', 'Unidad', 'Suaves cupcakes de vainilla con un corazón de mermelada de frambuesa y frosting de queso crema.', 1, NULL),
('Macarons Surtidos', 3, '$12.000', 'Caja de 12', 'Una selección de nuestros mejores macarons: chocolate, pistacho, frambuesa, y más.', 1, NULL),
('Brownies de Chocolate y Nuez', 3, '$8.000', 'Caja de 6', 'Intensos y húmedos brownies de chocolate semi-amargo con trozos de nuez.', 1, NULL),
('Alfajores de Maicena', 3, '$7.000', 'Caja de 10', 'Suaves y delicados alfajores rellenos de manjar y espolvoreados con coco rallado.', 1, NULL),
('Cake Pops Temáticos', 3, '$1.500 c/u', 'Unidad (mín. 12)', 'Divertidos y deliciosos cake pops cubiertos de chocolate y decorados según la temática de tu evento.', 1, NULL),
('Donas Glaseadas', 3, '$1.200 c/u', 'Unidad', 'Clásicas donas esponjosas cubiertas con un glaseado de azúcar o chocolate.', 1, NULL),
('Mini Cheesecakes', 3, '$10.000', 'Pack de 4', 'Porciones individuales de nuestros cremosos cheesecakes en sabores surtidos.', 1, NULL);