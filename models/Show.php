<?php
// ============================================================
// SerieVault — Model: Show
// ============================================================

require_once __DIR__ . '/../config/db.php';

class Show {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getUserShows(int $userId, array $filters = []): array {
        $where  = ['id_usuario = ?'];
        $params = [$userId];

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'favorite') {
                $where[]  = 'status = ?';
                $params[] = 'favorite';
            } else {
                $where[]  = 'status = ?';
                $params[] = $filters['status'];
            }
        }

        if (isset($filters['is_favorite']) && $filters['is_favorite'] == 1) {
            $where[] = 'status = ?';
            $params[] = 'favorite';
        }

        $whereStr = implode(' AND ', $where);
        
        $sql = "SELECT tvmaze_id, tipo, status, IF(status = 'favorite', 1, 0) AS is_favorite
                FROM acoes_usuario
                WHERE $whereStr
                ORDER BY data_acao DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getUserShow(int $userId, int $tvmazeId): ?array {
        $stmt = $this->db->prepare(
            "SELECT tvmaze_id, tipo, status, IF(status = 'favorite', 1, 0) AS is_favorite
             FROM acoes_usuario
             WHERE id_usuario = ? AND tvmaze_id = ?"
        );
        $stmt->execute([$userId, $tvmazeId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function save(int $userId, array $data): array {
        $tvmazeId = (int) $data['tvmaze_id'];
        $tipo = $data['show_type'] ?? 'serie';
        
        // Favorite takes precedence in this simple structure or it's a generic status string
        $status = $data['status'] ?? '';
        if (isset($data['is_favorite']) && $data['is_favorite'] == 1) {
            $status = 'favorite';
        }
        if (!$status) {
            $status = 'assistindo'; // Default
        }

        $stmt = $this->db->prepare('SELECT id FROM acoes_usuario WHERE id_usuario = ? AND tvmaze_id = ?');
        $stmt->execute([$userId, $tvmazeId]);
        
        if ($stmt->fetch()) {
            $upd = $this->db->prepare('UPDATE acoes_usuario SET status = ? WHERE id_usuario = ? AND tvmaze_id = ?');
            $upd->execute([$status, $userId, $tvmazeId]);
        } else {
            $ins = $this->db->prepare('INSERT INTO acoes_usuario (id_usuario, tvmaze_id, tipo, status) VALUES (?, ?, ?, ?)');
            $ins->execute([$userId, $tvmazeId, $tipo, $status]);
        }

        return $this->getUserShow($userId, $tvmazeId);
    }

    public function update(int $userId, int $tvmazeId, array $data): array {
        $status = $data['status'] ?? null;
        if (isset($data['is_favorite'])) {
            $status = $data['is_favorite'] == 1 ? 'favorite' : 'assistido';
        }
        
        if ($status) {
            $upd = $this->db->prepare('UPDATE acoes_usuario SET status = ? WHERE id_usuario = ? AND tvmaze_id = ?');
            $upd->execute([$status, $userId, $tvmazeId]);
        }
        return $this->getUserShow($userId, $tvmazeId) ?: [];
    }

    public function delete(int $userId, int $tvmazeId): bool {
        $del = $this->db->prepare('DELETE FROM acoes_usuario WHERE id_usuario = ? AND tvmaze_id = ?');
        $del->execute([$userId, $tvmazeId]);
        return $del->rowCount() > 0;
    }

    public function getFavorites(int $userId): array {
        return $this->getUserShows($userId, ['is_favorite' => 1]);
    }
}
