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
        if (!$result) return null;
        // If DB stored a subfolder (e.g. 'banners/xxx'), normalize to basename
        $file = basename($result['img_path']);
        // Return relative path consistent with Product model
        return '../uploads/' . $file;
    }

    public function create($data) {
        $imagePath = $this->uploadImage($data['image']);
        if (!$imagePath) {
            return ['success' => false, 'message' => 'Error al subir la imagen'];
        }
        // Insert without 'titulo' since it's no longer used
        $stmt = $this->db->prepare('INSERT INTO banners (img_path, activo, orden) VALUES (?, 1, 0)');
        try {
            $stmt->execute([$imagePath]);
            return ['success' => true, 'id' => $this->db->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear el banner: ' . $e->getMessage()];
        }
    }

    public function update($id, $data) {
        $params = [];
        $setParts = [];

        // 'titulo' was removed; only image updates are supported now

        if (isset($data['image']) && $data['image']) {
            $imagePath = $this->uploadImage($data['image']);
            if (!$imagePath) {
                return ['success' => false, 'message' => 'Error al subir la imagen'];
            }
            $setParts[] = 'img_path = ?';
            $params[] = $imagePath;
        }

        if (empty($setParts)) {
            return ['success' => true];
        }

        $params[] = $id;
        $query = 'UPDATE banners SET ' . implode(', ', $setParts) . ' WHERE id = ?';
        $stmt = $this->db->prepare($query);
        try {
            $stmt->execute($params);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar el banner: ' . $e->getMessage()];
        }
    }

    public function updateOrder($ids) {
        // $ids is expected as an array of banner IDs in the desired order
        try {
            $this->db->beginTransaction();
            $order = 0;
            $stmt = $this->db->prepare('UPDATE banners SET orden = ? WHERE id = ?');
            foreach ($ids as $id) {
                $stmt->execute([$order, $id]);
                $order++;
            }
            $this->db->commit();
            return ['success' => true];
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Error al reordenar banners: ' . $e->getMessage()];
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
        $targetDir = __DIR__ . '/../uploads/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        $fileName = uniqid() . '_' . basename($file['name']);
        $targetFile = $targetDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetFile)) {
            return $fileName;
        }
        return false;
    }
}
?>