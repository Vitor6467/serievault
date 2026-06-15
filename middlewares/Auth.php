<?php
// ============================================================
// SerieVault — Middleware de Autenticação Global
// ============================================================

require_once __DIR__ . '/../config/cors.php';

function requireAuth(): array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Regra Fundamental: Se não estiver logado, barrar o acesso (401 Unauthorized)
    if (empty($_SESSION['usuario_id'])) {
        jsonError('Acesso não autorizado. Você precisa estar logado.', 401);
    }
    
    return [
        'id'    => $_SESSION['usuario_id'],
        'nome'  => $_SESSION['usuario_nome'],
        'email' => $_SESSION['usuario_email'],
    ];
}
