<?php
// ============================================================
// SerieVault — Router da API
// ============================================================

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ShowController.php';
require_once __DIR__ . '/controllers/CommentController.php';
require_once __DIR__ . '/controllers/ProfileController.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove subdiretório base se existir
if (strpos($path, '/serievault') === 0) {
    $path = substr($path, strlen('/serievault'));
}
$path = rtrim($path, '/');

$auth    = new AuthController();
$shows   = new ShowController();
$comments = new CommentController();
$profile  = new ProfileController();

// -------------------------------------------------------
// Auth Routes (Abertas)
// -------------------------------------------------------
if ($method === 'POST' && $path === '/api/auth/register') {
    $auth->register(); exit;
}
if ($method === 'POST' && $path === '/api/auth/login') {
    $auth->login(); exit;
}
if ($method === 'POST' && $path === '/api/auth/logout') {
    $auth->logout(); exit;
}
if ($method === 'GET' && $path === '/api/auth/me') {
    $auth->me(); exit;
}

// -------------------------------------------------------
// Show Routes (Fechadas via middleware)
// -------------------------------------------------------
if ($method === 'GET' && $path === '/api/shows/search') {
    $shows->search(); exit;
}
if ($method === 'GET' && preg_match('#^/api/shows/(\d+)/episodes$#', $path, $m)) {
    $shows->episodes((int) $m[1]); exit;
}
if ($method === 'GET' && preg_match('#^/api/shows/(\d+)/status$#', $path, $m)) {
    $shows->getShowStatus((int) $m[1]); exit;
}
if ($method === 'GET' && preg_match('#^/api/shows/(\d+)$#', $path, $m)) {
    $shows->detail((int) $m[1]); exit;
}

// -------------------------------------------------------
// User Show Routes (Fechadas)
// -------------------------------------------------------
if ($method === 'GET'    && $path === '/api/user/shows') {
    $shows->getUserShows(); exit;
}
if ($method === 'POST'   && $path === '/api/user/shows') {
    $shows->saveShow(); exit;
}
if ($method === 'GET'    && $path === '/api/user/favorites') {
    $shows->getFavorites(); exit;
}
if ($method === 'PUT'    && preg_match('#^/api/user/shows/(\d+)$#', $path, $m)) {
    $shows->updateShow((int) $m[1]); exit;
}
if ($method === 'DELETE' && preg_match('#^/api/user/shows/(\d+)$#', $path, $m)) {
    $shows->deleteShow((int) $m[1]); exit;
}

// -------------------------------------------------------
// Profile Routes (Fechadas)
// -------------------------------------------------------
if ($method === 'GET'  && $path === '/api/user/profile') {
    $profile->getProfile(); exit;
}
if ($method === 'PUT'  && $path === '/api/user/profile') {
    $profile->updateProfile(); exit;
}
if ($method === 'POST' && $path === '/api/user/avatar') {
    $profile->uploadAvatar(); exit;
}
if ($method === 'GET'  && $path === '/api/user/stats') {
    $profile->getStats(); exit;
}

// -------------------------------------------------------
// Comment Routes (Fechadas)
// -------------------------------------------------------
if ($method === 'GET'    && preg_match('#^/api/comments/(\d+)$#', $path, $m)) {
    $comments->getComments((int) $m[1]); exit;
}
if ($method === 'POST'   && preg_match('#^/api/comments/(\d+)$#', $path, $m)) {
    $comments->addComment((int) $m[1]); exit;
}
if ($method === 'DELETE' && preg_match('#^/api/comments/(\d+)$#', $path, $m)) {
    $comments->deleteComment((int) $m[1]); exit;
}

jsonError("Rota API não encontrada: $method $path", 404);
