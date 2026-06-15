<?php
// ============================================================
// SerieVault — Model: Comentario
// ============================================================

require_once __DIR__ . '/../config/db.php';

class Comment {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getByShow(int $tvmazeId): array {
        $stmt = $this->db->prepare(
            'SELECT c.id, c.tvmaze_id, c.comentario AS content, c.data_criacao AS created_at,
                    u.id AS user_id, u.username
               FROM comentarios c
               JOIN usuarios u ON u.id = c.id_usuario
              WHERE c.tvmaze_id = ?
              ORDER BY c.data_criacao DESC'
        );
        $stmt->execute([$tvmazeId]);
        return $stmt->fetchAll();
    }

    public function create(int $userId, int $tvmazeId, string $content): array {
        $stmt = $this->db->prepare(
            'INSERT INTO comentarios (id_usuario, tvmaze_id, comentario) VALUES (?, ?, ?)'
        );
        $stmt->execute([$userId, $tvmazeId, $content]);
        $id = (int) $this->db->lastInsertId();

        $stmt2 = $this->db->prepare(
            'SELECT c.id, c.tvmaze_id, c.comentario AS content, c.data_criacao AS created_at,
                    u.id AS user_id, u.username
               FROM comentarios c
               JOIN usuarios u ON u.id = c.id_usuario
              WHERE c.id = ?'
        );
        $stmt2->execute([$id]);
        return $stmt2->fetch();
    }

    public function delete(int $commentId, int $userId): bool {
        $stmt = $this->db->prepare(
            'DELETE FROM comentarios WHERE id = ? AND id_usuario = ?'
        );
        $stmt->execute([$commentId, $userId]);
        return $stmt->rowCount() > 0;
    }
}
