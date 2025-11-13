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
  `category` VARCHAR(100) NOT NULL,
  `price` VARCHAR(50) NOT NULL,
  `size` VARCHAR(100) NULL DEFAULT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `img` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
);

-- 4. CREACIÓN DE LA TABLA `banners`
-- Para las imágenes promocionales de la página de inicio.
CREATE TABLE `banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `img_url` VARCHAR(255) NOT NULL,
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
INSERT INTO `productos` (`name`, `category`, `price`, `size`, `description`, `img`, `is_active`) VALUES
('Torta de Chocolate Intenso', 'Tortas y Kuchen', '$25.000', 'Mediana', 'Una descripción de ejemplo para la torta de chocolate.', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Kuchen de Manzana y Nuez', 'Tortas y Kuchen', '$18.000', 'Pequeño', 'Una descripción de ejemplo para el kuchen.', 'https://images.pexels.com/photos/14107/pexels-photo-14107.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Galletas de Superhéroes', 'Galletas y Tortas Temáticas', 'Cotizar', NULL, 'Una descripción de ejemplo para las galletas.', 'https://images.pexels.com/photos/3809434/pexels-photo-3809434.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Torta de Cumpleaños Personalizada', 'Galletas y Tortas Temáticas', 'Cotizar', '25 personas', 'Una descripción de ejemplo para la torta personalizada.', 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Cupcakes de Vainilla', 'Repostería y Otros Dulces', '$1.500 c/u', NULL, 'Una descripción de ejemplo para los cupcakes.', 'https://images.pexels.com/photos/1055271/pexels-photo-1055271.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
('Macarons Surtidos', 'Repostería y Otros Dulces', '$12.000 (docena)', NULL, 'Una descripción de ejemplo para los macarons.', 'https://images.pexels.com/photos/3218467/pexels-photo-3218467.jpeg?auto=compress&cs=tinysrgb&w=600', 1);

-- Banner de ejemplo
INSERT INTO `banners` (`img_url`, `titulo`, `activo`, `orden`) VALUES
('https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Nuevas Tortas de Temporada', 1, 1);