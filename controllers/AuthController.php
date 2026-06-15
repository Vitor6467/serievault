<?php
// ============================================================
// SerieVault — Controller: Auth
// ============================================================

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/cors.php';

class AuthController {
    private User $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function register(): void {
        $body = getBody();

        $username = trim($body['username'] ?? '');
        $email    = trim($body['email']    ?? '');
        $senha    =       $body['password'] ?? '';

        if (!$username || !$email || !$senha) {
            jsonError('Preencha todos os campos.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('E-mail inválido.');
        }
        if (strlen($senha) < 6) {
            jsonError('A senha deve ter pelo menos 6 caracteres.');
        }

        if ($this->userModel->findByEmail($email)) {
            jsonError('E-mail já cadastrado.', 409);
        }
        if ($this->userModel->findByUsername($username)) {
            jsonError('Nome de usuário já em uso.', 409);
        }

        $id   = $this->userModel->create($username, $email, $senha);
        $user = $this->userModel->findById($id);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['usuario_id']    = $user['id'];
        $_SESSION['usuario_nome']  = $user['username'];
        $_SESSION['usuario_email'] = $user['email'];

        jsonResponse([
            'message' => 'Cadastro realizado com sucesso!',
            'user'    => [
                'id'           => $user['id'],
                'username'     => $user['username'],
                'email'        => $user['email'],
                'display_name' => $user['display_name'] ?? null,
                'bio'          => $user['bio'] ?? null,
                'avatar_url'   => $user['avatar_url'] ?? null,
                'data_criacao' => $user['data_criacao'],
            ],
        ], 201);
    }

    public function login(): void {
        $body = getBody();

        $email = trim($body['email'] ?? '');
        $senha =       $body['password'] ?? '';

        if (!$email || !$senha) {
            jsonError('Preencha e-mail e senha.');
        }

        $user = $this->userModel->findByEmail($email);
        if (!$user || !$this->userModel->verifyPassword($senha, $user['senha'])) {
            jsonError('Credenciais inválidas.', 401);
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['usuario_id']    = $user['id'];
        $_SESSION['usuario_nome']  = $user['username'];
        $_SESSION['usuario_email'] = $user['email'];

        jsonResponse([
            'message' => 'Login realizado!', 
            'user' => [
                'id'           => $user['id'],
                'username'     => $user['username'],
                'email'        => $user['email'],
                'display_name' => $user['display_name'] ?? null,
                'bio'          => $user['bio'] ?? null,
                'avatar_url'   => $user['avatar_url'] ?? null,
                'data_criacao' => $user['data_criacao'],
            ]
        ]);
    }

    public function logout(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        jsonResponse(['message' => 'Logout realizado.']);
    }

    public function me(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION['usuario_id'])) {
            jsonError('Não logado.', 401);
        }
        $user = $this->userModel->findById((int) $_SESSION['usuario_id']);
        if (!$user) {
            jsonError('Usuário não encontrado.', 404);
        }
        
        jsonResponse([
            'user' => [
                'id'           => $user['id'],
                'username'     => $user['username'],
                'email'        => $user['email'],
                'display_name' => $user['display_name'] ?? null,
                'bio'          => $user['bio'] ?? null,
                'avatar_url'   => $user['avatar_url'] ?? null,
                'data_criacao' => $user['data_criacao'],
            ]
        ]);
    }
}
