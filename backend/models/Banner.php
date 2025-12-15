<?php
// models/Banner.php

class Banner {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->prepare('SELECT id, activo, orden FROM banners');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getActive() {
        $stmt = $this->db->prepare('SELECT id FROM banners WHERE activo = 1 ORDER BY orden ASC');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getImagePath($id) {
        $stmt = $this->db->prepare('SELECT img_path FROM banners WHERE id = ?');
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? '../uploads/' . $result['img_path'] : null;
    }

    public function create($data) {
        $imagePath = $this->uploadImage($data['image']);
        if (!$imagePath) {
            return ['success' => false, 'message' => 'Error al subir la imagen'];
        }

        $stmt = $this->db->prepare('INSERT INTO banners (titulo, img_path, activo, orden) VALUES (?, ?, 1, 0)');
        try {
            $stmt->execute([$data['titulo'], $imagePath]);
            return ['success' => true, 'id' => $this->db->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear el banner: ' . $e->getMessage()];
        }
    }

    public function delete($id) {
        $stmt = $this->db->prepare('DELETE FROM banners WHERE id = ?');
        try {
            $stmt->execute([$id]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al eliminar el banner: ' . $e->getMessage()];
        }
    }

    public function toggleStatus($id) {
        $stmt = $this->db->prepare('SELECT activo FROM banners WHERE id = ?');
        $stmt->execute([$id]);
        $current = $stmt->fetch();
        if (!$current) {
            return ['success' => false, 'message' => 'Banner no encontrado'];
        }
        $newStatus = !$current['activo'];
        $stmt = $this->db->prepare('UPDATE banners SET activo = ? WHERE id = ?');
        $stmt->execute([$newStatus, $id]);
        return ['success' => true, 'newStatus' => $newStatus];
    }

    private function uploadImage($file) {
        $targetDir = '../uploads/';
        $fileName = uniqid() . '_' . basename($file['name']);
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            return $fileName;
        }
        return false;
    }
}
?>