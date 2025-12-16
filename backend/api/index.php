<?php
// api/index.php - Punto de entrada principal y router simple

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Incluir archivos necesarios
require_once '../config/database.php';
require_once '../controllers/ProductController.php';
require_once '../controllers/CategoryController.php';
require_once '../controllers/BannerController.php';

// Obtener la URI y método
// Allow method override via `_method` param (form POST) or header `X-HTTP-Method-Override`
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
// Check for override in POST payload or querystring
if (isset($_REQUEST['_method']) && !empty($_REQUEST['_method'])) {
    $requestMethod = strtoupper($_REQUEST['_method']);
} elseif (!empty($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $requestMethod = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

// Remover query string
$uri = parse_url($requestUri, PHP_URL_PATH);
$uri = str_replace(array('/C_C/backend/api', '/backend/api'), '', $uri); // Eliminar prefijos posibles en la URI

// Routing simple
if (preg_match('/^\/products(\/.*)?$/', $uri, $matches)) {
    $controller = new ProductController();
    $controller->handleRequest($requestMethod, $matches[1] ?? '');
} elseif (preg_match('/^\/categories(\/.*)?$/', $uri, $matches)) {
    $controller = new CategoryController();
    $controller->handleRequest($requestMethod, $matches[1] ?? '');
} elseif (preg_match('/^\/banners(\/.*)?$/', $uri, $matches)) {
    $controller = new BannerController();
    $controller->handleRequest($requestMethod, $matches[1] ?? '');
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint no encontrado']);
}
?>