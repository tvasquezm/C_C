<?php
// models/Category.php

class Category {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->db->prepare('SELECT id_categoria AS id, nombre AS name FROM categorias');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create($name) {
        $stmt = $this->db->prepare('INSERT INTO categorias (nombre) VALUES (?)');
        try {
            $stmt->execute([$name]);
            return ['success' => true, 'id' => $this->db->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear la categoría: ' . $e->getMessage()];
        }
    }

    public function delete($id) {
        // Check if in use
        $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM productos WHERE category_id = ?');
        $stmt->execute([$id]);
        $count = $stmt->fetch()['count'];

        if ($count > 0) {
            return ['success' => false, 'error' => 'in_use', 'message' => "No se puede eliminar. La categoría está asignada a $count producto(s)."];
        }

        $stmt = $this->db->prepare('DELETE FROM categorias WHERE id_categoria = ?');
        try {
            $stmt->execute([$id]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al eliminar la categoría: ' . $e->getMessage()];
        }
    }
}
?>