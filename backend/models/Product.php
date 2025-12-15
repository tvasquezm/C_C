<?php
// models/Product.php

class Product {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll($filters) {
        $whereClauses = [];
        $params = [];

        if (!$filters['all']) {
            $whereClauses[] = 'p.is_active = 1';
        }
        if ($filters['name']) {
            $whereClauses[] = 'p.name LIKE ?';
            $params[] = '%' . $filters['name'] . '%';
        }
        if ($filters['category'] && $filters['category'] !== 'all') {
            $whereClauses[] = 'p.category_id = ?';
            $params[] = $filters['category'];
        }
        if ($filters['status'] && $filters['status'] !== 'all') {
            $whereClauses[] = 'p.is_active = ?';
            $params[] = $filters['status'] === 'active' ? 1 : 0;
        }

        $whereString = $whereClauses ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

        $validSortColumns = ['name' => 'p.name', 'category' => 'c.nombre', 'status' => 'p.is_active', 'id' => 'p.id'];
        $sortColumn = $validSortColumns[$filters['sortBy']] ?? 'p.id';
        $sortOrder = strtoupper($filters['sortOrder']) === 'DESC' ? 'DESC' : 'ASC';

        if ($filters['page'] !== null && $filters['limit'] !== null) {
            $offset = ($filters['page'] - 1) * $filters['limit'];
            $query = "SELECT p.id, p.name, p.category_id, p.price, p.size, p.description, p.is_active, c.nombre as category_name
                     FROM productos p LEFT JOIN categorias c ON p.category_id = c.id_categoria
                     $whereString ORDER BY $sortColumn $sortOrder LIMIT ? OFFSET ?";
            $params[] = (int)$filters['limit'];
            $params[] = (int)$offset;

            $stmt = $this->db->prepare($query);
            $stmt->bindValue(1, (int)$filters['limit'], PDO::PARAM_INT);
            $stmt->bindValue(2, (int)$offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll();

            $totalQuery = "SELECT COUNT(*) as count FROM productos p $whereString";
            $stmtTotal = $this->db->prepare($totalQuery);
            $stmtTotal->execute(array_slice($params, 0, -2)); // Remove limit and offset
            $total = $stmtTotal->fetch()['count'];
            $totalPages = ceil($total / $filters['limit']);

            return [
                'products' => $products,
                'totalPages' => $totalPages,
                'currentPage' => $filters['page']
            ];
        } else {
            $query = "SELECT p.id, p.name, p.category_id, p.price, p.size, p.description, p.is_active, c.nombre as category_name
                     FROM productos p LEFT JOIN categorias c ON p.category_id = c.id_categoria
                     $whereString ORDER BY $sortColumn $sortOrder";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        }
    }

    public function getById($id) {
        $stmt = $this->db->prepare('SELECT id, name, category_id, price, size, description, is_active FROM productos WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getImagePath($id) {
        $stmt = $this->db->prepare('SELECT img_path FROM productos WHERE id = ?');
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ? '../uploads/' . $result['img_path'] : null;
    }

    public function create($data) {
        // Handle image upload
        $imagePath = $this->uploadImage($data['image']);
        if (!$imagePath) {
            return ['success' => false, 'message' => 'Error al subir la imagen'];
        }

        $stmt = $this->db->prepare('INSERT INTO productos (name, category_id, price, size, description, img_path, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)');
        try {
            $stmt->execute([$data['name'], $data['category_id'], $data['price'], $data['size'], $data['description'], $imagePath]);
            return ['success' => true, 'id' => $this->db->lastInsertId()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al crear el producto: ' . $e->getMessage()];
        }
    }

    public function update($id, $data) {
        $imagePath = null;
        if ($data['image']) {
            $imagePath = $this->uploadImage($data['image']);
            if (!$imagePath) {
                return ['success' => false, 'message' => 'Error al subir la imagen'];
            }
            $query = 'UPDATE productos SET name = ?, category_id = ?, price = ?, size = ?, description = ?, img_path = ? WHERE id = ?';
            $params = [$data['name'], $data['category_id'], $data['price'], $data['size'], $data['description'], $imagePath, $id];
        } else {
            $query = 'UPDATE productos SET name = ?, category_id = ?, price = ?, size = ?, description = ? WHERE id = ?';
            $params = [$data['name'], $data['category_id'], $data['price'], $data['size'], $data['description'], $id];
        }

        $stmt = $this->db->prepare($query);
        try {
            $stmt->execute($params);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al actualizar el producto: ' . $e->getMessage()];
        }
    }

    public function delete($id) {
        $stmt = $this->db->prepare('DELETE FROM productos WHERE id = ?');
        try {
            $stmt->execute([$id]);
            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Error al eliminar el producto: ' . $e->getMessage()];
        }
    }

    public function toggleStatus($id) {
        $stmt = $this->db->prepare('SELECT is_active FROM productos WHERE id = ?');
        $stmt->execute([$id]);
        $current = $stmt->fetch();
        if (!$current) {
            return ['success' => false, 'message' => 'Producto no encontrado'];
        }
        $newStatus = !$current['is_active'];
        $stmt = $this->db->prepare('UPDATE productos SET is_active = ? WHERE id = ?');
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