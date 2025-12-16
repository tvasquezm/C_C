-- =================================================================
--  SCRIPT DE ACTUALIZACIÓN PARA LA BASE DE DATOS 'pasteleriadb'
--  Cambios: Almacenar imágenes como archivos en lugar de BLOB
-- =================================================================

USE `pasteleriadb`;

-- Actualizar tabla productos
ALTER TABLE `productos` DROP COLUMN `img`;
ALTER TABLE `productos` DROP COLUMN `img_mimetype`;
ALTER TABLE `productos` ADD COLUMN `img_path` VARCHAR(255) NULL AFTER `description`;

-- Actualizar tabla banners
ALTER TABLE `banners` DROP COLUMN `img`;
ALTER TABLE `banners` DROP COLUMN `img_mimetype`;
ALTER TABLE `banners` ADD COLUMN `img_path` VARCHAR(255) NULL AFTER `titulo`;

-- Añadir índices para mejor rendimiento
CREATE INDEX idx_productos_category_id ON productos (category_id);
CREATE INDEX idx_productos_is_active ON productos (is_active);
CREATE INDEX idx_banners_activo ON banners (activo);
CREATE INDEX idx_banners_orden ON banners (orden);