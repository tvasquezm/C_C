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

    public function update($id, $name) {
        $stmt = $this->db->prepare('UPDATE categorias SET nombre = ? WHERE id_categoria = ?');
        try {
            $stmt->execute([$name, $id]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar la categoría: ' . $e->getMessage()];
        }
    }

    public function delete($id) {
        // $reassignTo: if provided, reassign products to that category before deletion
        // $force: if true, delete products in cascade
        $reassignTo = func_num_args() >= 2 ? func_get_arg(1) : null;
        $force = func_num_args() >= 3 ? func_get_arg(2) : false;

        // Count products using this category
        $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM productos WHERE category_id = ?');
        $stmt->execute([$id]);
        $count = $stmt->fetch()['count'];

        try {
            if ($count > 0) {
                if ($reassignTo) {
                    // Reassign products to another category
                    $stmt = $this->db->prepare('UPDATE productos SET category_id = ? WHERE category_id = ?');
                    $stmt->execute([$reassignTo, $id]);
                } elseif ($force) {
                    // Delete products in cascade
                    $stmt = $this->db->prepare('DELETE FROM productos WHERE category_id = ?');
                    $stmt->execute([$id]);
                } else {
                    return ['success' => false, 'error' => 'in_use', 'message' => "No se puede eliminar. La categoría está asignada a $count producto(s)."];
                }
            }

            $stmt = $this->db->prepare('DELETE FROM categorias WHERE id_categoria = ?');
            $stmt->execute([$id]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al eliminar la categoría: ' . $e->getMessage()];
        }
    }
}
?>