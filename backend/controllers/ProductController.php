<?php
// controllers/ProductController.php

require_once '../models/Product.php';

class ProductController {
    private $productModel;

    public function __construct() {
        $this->productModel = new Product();
    }

    public function handleRequest($method, $path) {
        switch ($method) {
            case 'GET':
                if ($path === '') {
                    $this->getAll();
                } elseif (preg_match('/^\/(\d+)$/', $path, $matches)) {
                    $this->getById($matches[1]);
                } elseif (preg_match('/^\/(\d+)\/image$/', $path, $matches)) {
                    $this->getImage($matches[1]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Ruta no encontrada']);
                }
                break;
            case 'POST':
                if ($path === '') {
                    $this->create();
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Ruta no encontrada']);
                }
                break;
            case 'PUT':
                if (preg_match('/^\/(\d+)$/', $path, $matches)) {
                    $this->update($matches[1]);
                } elseif (preg_match('/^\/(\d+)\/status$/', $path, $matches)) {
                    $this->toggleStatus($matches[1]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Ruta no encontrada']);
                }
                break;
            case 'DELETE':
                if (preg_match('/^\/(\d+)$/', $path, $matches)) {
                    $this->delete($matches[1]);
                } else {
                    http_response_code(404);
                    echo json_encode(['message' => 'Ruta no encontrada']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['message' => 'Método no permitido']);
        }
    }

    private function getAll() {
        $filters = [
            'all' => $_GET['all'] ?? null,
            'page' => isset($_GET['page']) ? (int)$_GET['page'] : null,
            'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : null,
            'name' => $_GET['name'] ?? null,
            'category' => $_GET['category'] ?? null,
            'status' => $_GET['status'] ?? null,
            'sortBy' => $_GET['sortBy'] ?? 'id',
            'sortOrder' => $_GET['sortOrder'] ?? 'asc'
        ];

        $result = $this->productModel->getAll($filters);
        echo json_encode($result);
    }

    private function getById($id) {
        $product = $this->productModel->getById($id);
        if ($product) {
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Producto no encontrado']);
        }
    }

    private function getImage($id) {
        $imagePath = $this->productModel->getImagePath($id);
        if ($imagePath && file_exists($imagePath)) {
            $mime = mime_content_type($imagePath);
            header("Content-Type: $mime");
            readfile($imagePath);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Imagen no encontrada']);
        }
    }

    private function create() {
        if (!isset($_FILES['product-image'])) {
            http_response_code(400);
            echo json_encode(['errors' => [['msg' => 'La imagen del producto es requerida']]]);
            return;
        }

        $data = [
            'name' => $_POST['product-name'] ?? '',
            'category_id' => $_POST['product-category'] ?? '',
            'price' => $_POST['product-price'] ?? '',
            'size' => $_POST['product-size'] ?? '',
            'description' => $_POST['product-description'] ?? '',
            'image' => $_FILES['product-image']
        ];

        $result = $this->productModel->create($data);
        if ($result['success']) {
            http_response_code(201);
            echo json_encode(['id' => $result['id'], 'name' => $data['name'], 'category_id' => $data['category_id']]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function update($id) {
        $data = [
            'name' => $_POST['product-name'] ?? '',
            'category_id' => $_POST['product-category'] ?? '',
            'price' => $_POST['product-price'] ?? '',
            'size' => $_POST['product-size'] ?? '',
            'description' => $_POST['product-description'] ?? '',
            'image' => $_FILES['product-image'] ?? null
        ];

        $result = $this->productModel->update($id, $data);
        if ($result['success']) {
            echo json_encode(['message' => 'Producto actualizado con éxito']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function delete($id) {
        $result = $this->productModel->delete($id);
        if ($result['success']) {
            http_response_code(204);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function toggleStatus($id) {
        $result = $this->productModel->toggleStatus($id);
        if ($result['success']) {
            echo json_encode(['success' => true, 'newStatus' => $result['newStatus']]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }
}
?>