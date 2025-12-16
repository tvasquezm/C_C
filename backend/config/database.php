<?php
// config/database.php - Conexión a la base de datos con PDO

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = getenv('DB_HOST') ?: 'localhost';
        $user = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        $dbname = getenv('DB_NAME') ?: 'pasteleriadb';

        try {
            $this->pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Error de conexión a la base de datos']);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
?>