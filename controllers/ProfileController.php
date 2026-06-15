<?php
// ============================================================
// SerieVault — Controller: Profile
// ============================================================

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middlewares/Auth.php';
require_once __DIR__ . '/../config/cors.php';

class ProfileController {
    private User $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    // GET /api/user/profile
    public function getProfile(): void {
        $auth = requireAuth();
        $user = $this->userModel->findById((int) $auth['id']);
        if (!$user) {
            jsonError('Usuário não encontrado.', 404);
        }
        jsonResponse(['user' => $this->publicFields($user)]);
    }

    // PUT /api/user/profile  (JSON body: display_name, bio)
    public function updateProfile(): void {
        $auth = requireAuth();
        $body = getBody();

        $displayName = trim($body['display_name'] ?? '');
        $bio         = trim($body['bio']          ?? '');

        if (strlen($displayName) > 80) {
            jsonError('Nome de exibição muito longo (máx. 80 caracteres).');
        }
        if (strlen($bio) > 500) {
            jsonError('Bio muito longa (máx. 500 caracteres).');
        }

        $this->userModel->updateProfile((int) $auth['id'], $displayName, $bio);
        $user = $this->userModel->findById((int) $auth['id']);
        jsonResponse(['user' => $this->publicFields($user), 'message' => 'Perfil atualizado com sucesso!']);
    }

    // POST /api/user/avatar  (multipart/form-data with field "avatar")
    public function uploadAvatar(): void {
        $auth = requireAuth();

        if (empty($_FILES['avatar'])) {
            jsonError('Nenhum arquivo enviado.');
        }

        $file     = $_FILES['avatar'];
        $maxSize  = 5 * 1024 * 1024; // 5 MB
        $allowed  = ['image/jpeg', 'image/png', 'image/webp'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonError('Erro no upload do arquivo.');
        }
        if ($file['size'] > $maxSize) {
            jsonError('Arquivo muito grande (máx. 5 MB).');
        }

        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowed, true)) {
            jsonError('Formato inválido. Use JPG, PNG ou WEBP.');
        }

        $ext      = match($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            default      => 'jpg',
        };

        $uploadDir = __DIR__ . '/../assets/uploads/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Remove old avatar
        $existing = $this->userModel->findById((int) $auth['id']);
        if (!empty($existing['avatar_url'])) {
            $oldFile = __DIR__ . '/../' . ltrim($existing['avatar_url'], '/');
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }

        $filename = 'avatar_' . $auth['id'] . '_' . time() . '.' . $ext;
        $dest     = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            jsonError('Falha ao salvar o arquivo.');
        }

        $avatarUrl = '/serievault/assets/uploads/avatars/' . $filename;
        $this->userModel->updateAvatar((int) $auth['id'], $avatarUrl);

        $user = $this->userModel->findById((int) $auth['id']);
        header('Content-Type: application/json; charset=UTF-8');
        jsonResponse(['user' => $this->publicFields($user), 'message' => 'Avatar atualizado!']);
    }

    // GET /api/user/stats
    public function getStats(): void {
        $auth = requireAuth();
        $stats = $this->userModel->getStats((int) $auth['id']);
        jsonResponse(['stats' => $stats]);
    }

    private function publicFields(array $user): array {
        return [
            'id'           => $user['id'],
            'username'     => $user['username'],
            'email'        => $user['email'],
            'display_name' => $user['display_name'] ?? null,
            'bio'          => $user['bio'] ?? null,
            'avatar_url'   => $user['avatar_url'] ?? null,
            'data_criacao' => $user['data_criacao'],
        ];
    }
}
