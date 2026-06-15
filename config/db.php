<?php
// ============================================================
// SerieVault — Configuração do Banco de Dados
// ============================================================

define('DB_HOST', 'localhost');
define('DB_PORT', '3307');
define('DB_NAME', 'crud');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            // Conecta sem selecionar o banco para poder criá-lo
            $dsn = sprintf('mysql:host=%s;port=%s;charset=%s', DB_HOST, DB_PORT, DB_CHARSET);
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Cria o banco automaticamente
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "`");
            $pdo->exec("USE `" . DB_NAME . "`");
            
            // Cria as tabelas automaticamente
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `usuarios` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(50) NOT NULL UNIQUE,
                    `email` VARCHAR(100) NOT NULL UNIQUE,
                    `senha` VARCHAR(255) NOT NULL,
                    `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            // Migration: add profile columns if missing
            $pdo->exec("
                ALTER TABLE `usuarios`
                    ADD COLUMN IF NOT EXISTS `display_name` VARCHAR(80) DEFAULT NULL,
                    ADD COLUMN IF NOT EXISTS `bio`          TEXT        DEFAULT NULL,
                    ADD COLUMN IF NOT EXISTS `avatar_url`   VARCHAR(500) DEFAULT NULL
            ");
            
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `acoes_usuario` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `id_usuario` INT NOT NULL,
                    `tvmaze_id` INT NOT NULL,
                    `tipo` VARCHAR(50) NOT NULL,
                    `status` VARCHAR(50) NOT NULL,
                    `data_acao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY `uq_user_obra` (`id_usuario`, `tvmaze_id`),
                    CONSTRAINT `fk_acao_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `comentarios` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `id_usuario` INT NOT NULL,
                    `tvmaze_id` INT NOT NULL,
                    `comentario` TEXT NOT NULL,
                    `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT `fk_com_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}
