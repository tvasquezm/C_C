<?php
// controllers/CategoryController.php

require_once '../models/Category.php';

class CategoryController {
    private $categoryModel;

    public function __construct() {
        $this->categoryModel = new Category();
    }

    public function handleRequest($method, $path) {
        switch ($method) {
            case 'GET':
                if ($path === '') {
                    $this->getAll();
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
        $categories = $this->categoryModel->getAll();
        echo json_encode($categories);
    }

    private function create() {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';

        $result = $this->categoryModel->create($name);
        if ($result['success']) {
            http_response_code(201);
            echo json_encode(['id' => $result['id'], 'name' => $name]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $name = $data['name'] ?? '';

        $result = $this->categoryModel->update($id, $name);
        if ($result['success']) {
            echo json_encode(['success' => true, 'id' => $id, 'name' => $name]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $result['message']]);
        }
    }

    private function delete($id) {
        // Support query params: reassign_to=<id> or force=1 for cascade delete
        $reassignTo = $_GET['reassign_to'] ?? null;
        $force = isset($_GET['force']) && ($_GET['force'] === '1' || $_GET['force'] === 'true');

        $result = $this->categoryModel->delete($id, $reassignTo, $force);
        if ($result['success']) {
            http_response_code(204);
        } elseif (!empty($result['error']) && $result['error'] === 'in_use') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'msg' => $result['message']]);
        } else {
            http_response_code(500);
            echo json_encode(['ok' => false, 'msg' => $result['message']]);
        }
    }
}
?>