<?php
// controllers/BannerController.php

require_once '../models/Banner.php';

class BannerController {
    private $bannerModel;

    public function __construct() {
        $this->bannerModel = new Banner();
    }

    public function handleRequest($method, $path) {
        switch ($method) {
            case 'GET':
                if ($path === '') {
                    $this->getAll();
                } elseif ($path === '/active') {
                    $this->getActive();
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
                if (preg_match('/^\/(\d+)\/status$/', $path, $matches)) {
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
        $banners = $this->bannerModel->getAll();
        echo json_encode($banners);
    }

    private function getActive() {
        $banners = $this->bannerModel->getActive();
        echo json_encode($banners);
    }

    private function getImage($id) {
        $imagePath = $this->bannerModel->getImagePath($id);
        if ($imagePath && file_exists($imagePath)) {
            $mime = mime_content_type($imagePath);
            header("Content-Type: $mime");
            readfile($imagePath);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Imagen de banner no encontrada']);
        }
    }

    private function create() {
        if (!isset($_FILES['banner-image'])) {
            http_response_code(400);
            echo json_encode(['message' => 'La imagen del banner es requerida']);
            return;
        }

        $data = [
            'titulo' => $_POST['titulo'] ?? null,
            'image' => $_FILES['banner-image']
        ];

        $result = $this->bannerModel->create($data);
        if ($result['success']) {
            http_response_code(201);
            echo json_encode(['id' => $result['id'], 'titulo' => $data['titulo']]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function delete($id) {
        $result = $this->bannerModel->delete($id);
        if ($result['success']) {
            http_response_code(204);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }

    private function toggleStatus($id) {
        $result = $this->bannerModel->toggleStatus($id);
        if ($result['success']) {
            echo json_encode(['success' => true, 'newStatus' => $result['newStatus']]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => $result['message']]);
        }
    }
}
?>