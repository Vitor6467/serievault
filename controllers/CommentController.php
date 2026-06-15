<?php
// ============================================================
// SerieVault — Controller: Comment
// ============================================================

require_once __DIR__ . '/../models/Comment.php';
require_once __DIR__ . '/../middlewares/Auth.php';
require_once __DIR__ . '/../config/cors.php';

class CommentController {
    private Comment $commentModel;

    public function __construct() {
        $this->commentModel = new Comment();
    }

    public function getComments(int $tvmazeId): void {
        requireAuth(); // Bloqueado
        $comments = $this->commentModel->getByShow($tvmazeId);
        jsonResponse($comments);
    }

    public function addComment(int $tvmazeId): void {
        $user    = requireAuth(); // Bloqueado
        $body    = getBody();
        $content = trim($body['content'] ?? '');

        if (!$content) {
            jsonError('O comentário não pode estar vazio.');
        }

        $comment = $this->commentModel->create($user['id'], $tvmazeId, $content);
        jsonResponse($comment, 201);
    }

    public function deleteComment(int $commentId): void {
        $user    = requireAuth(); // Bloqueado
        $deleted = $this->commentModel->delete($commentId, $user['id']);
        if (!$deleted) {
            jsonError('Comentário não encontrado ou sem permissão.', 404);
        }
        jsonResponse(['message' => 'Comentário excluído.']);
    }
}
