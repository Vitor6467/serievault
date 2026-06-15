<?php
// ============================================================
// SerieVault — Model: Usuario
// ============================================================

require_once __DIR__ . '/../config/db.php';

class User {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, senha, display_name, bio, avatar_url, data_criacao
               FROM usuarios WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function findByUsername(string $username): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, display_name, bio, avatar_url, data_criacao
               FROM usuarios WHERE username = ? LIMIT 1'
        );
        $stmt->execute([$username]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, display_name, bio, avatar_url, data_criacao
               FROM usuarios WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function updateProfile(int $id, string $displayName, string $bio): void {
        $stmt = $this->db->prepare(
            'UPDATE usuarios SET display_name = ?, bio = ? WHERE id = ?'
        );
        $stmt->execute([$displayName ?: null, $bio ?: null, $id]);
    }

    public function updateAvatar(int $id, string $avatarUrl): void {
        $stmt = $this->db->prepare(
            'UPDATE usuarios SET avatar_url = ? WHERE id = ?'
        );
        $stmt->execute([$avatarUrl, $id]);
    }

    public function getStats(int $userId): array {
        // Total saved shows
        $s = $this->db->prepare('SELECT COUNT(*) FROM acoes_usuario WHERE id_usuario = ?');
        $s->execute([$userId]);
        $total = (int) $s->fetchColumn();

        // By status
        $s2 = $this->db->prepare(
            "SELECT status, COUNT(*) as cnt FROM acoes_usuario WHERE id_usuario = ? GROUP BY status"
        );
        $s2->execute([$userId]);
        $byStatus = [];
        foreach ($s2->fetchAll() as $row) {
            $byStatus[$row['status']] = (int) $row['cnt'];
        }

        // Total comments
        $s3 = $this->db->prepare('SELECT COUNT(*) FROM comentarios WHERE id_usuario = ?');
        $s3->execute([$userId]);
        $comments = (int) $s3->fetchColumn();

        return [
            'total_shows'    => $total,
            'watching'       => $byStatus['watching'] ?? 0,
            'watched'        => $byStatus['watched'] ?? 0,
            'plan_to_watch'  => $byStatus['plan_to_watch'] ?? 0,
            'dropped'        => $byStatus['dropped'] ?? 0,
            'favorite'       => $byStatus['favorite'] ?? 0,
            'total_comments' => $comments,
        ];
    }

    public function create(string $username, string $email, string $senha): int {
        $hash = password_hash($senha, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare(
            'INSERT INTO usuarios (username, email, senha) VALUES (?, ?, ?)'
        );
        $stmt->execute([$username, $email, $hash]);
        return (int) $this->db->lastInsertId();
    }

    public function verifyPassword(string $senha, string $hash): bool {
        return password_verify($senha, $hash);
    }
}
