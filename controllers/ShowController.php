<?php
// ============================================================
// SerieVault — Controller: Show
// ============================================================

require_once __DIR__ . '/../models/Show.php';
require_once __DIR__ . '/../middlewares/Auth.php';
require_once __DIR__ . '/../config/cors.php';

class ShowController {
    private Show $showModel;

    public function __construct() {
        $this->showModel = new Show();
    }

    public function search(): void {
        requireAuth(); // Bloqueio Fundamental
        $q     = trim($_GET['q']     ?? '');
        
        $url = $q ? 'https://api.tvmaze.com/search/shows?q=' . urlencode($q) : 'https://api.tvmaze.com/shows?page=0';
        $data = $this->fetchTVMaze($url);

        if ($q) {
            $data = array_map(fn($item) => $item['show'] ?? $item, $data);
        }

        jsonResponse($data);
    }

    public function detail(int $id): void {
        requireAuth(); // Bloqueio Fundamental
        $show = $this->fetchTVMaze("https://api.tvmaze.com/shows/$id?embed[]=seasons&embed[]=episodes");
        if (isset($show['status']) && $show['status'] === 404) {
            jsonError('Obra não encontrada.', 404);
        }
        jsonResponse($show);
    }

    public function episodes(int $id): void {
        requireAuth();
        $episodes = $this->fetchTVMaze("https://api.tvmaze.com/shows/$id/episodes");
        jsonResponse($episodes);
    }

    public function getUserShows(): void {
        $user    = requireAuth();
        $filters = [
            'status'      => $_GET['status']      ?? '',
            'is_favorite' => $_GET['is_favorite'] ?? '',
        ];
        
        $rawShows = $this->showModel->getUserShows($user['id'], $filters);
        $mapped = [];

        foreach ($rawShows as $s) {
            // Busca na TVMaze (como não salvamos no banco local)
            $tvmazeData = $this->fetchTVMaze("https://api.tvmaze.com/shows/" . $s['tvmaze_id']);
            
            $mapped[] = [
                'id' => $s['tvmaze_id'],
                'tvmaze_id' => $s['tvmaze_id'],
                'show_title' => $tvmazeData['name'] ?? 'Título Desconhecido',
                'poster_url' => $tvmazeData['image']['medium'] ?? $tvmazeData['image']['original'] ?? null,
                'status' => $s['status'],
                'is_favorite' => $s['is_favorite']
            ];
        }
        
        jsonResponse($mapped);
    }

    public function saveShow(): void {
        $user = requireAuth();
        $body = getBody();

        if (empty($body['tvmaze_id'])) {
            jsonError('tvmaze_id é obrigatório.');
        }

        $result = $this->showModel->save($user['id'], $body);
        jsonResponse($result, 201);
    }

    public function updateShow(int $tvmazeId): void {
        $user = requireAuth();
        $body = getBody();

        $result = $this->showModel->update($user['id'], $tvmazeId, $body);
        jsonResponse($result);
    }

    public function deleteShow(int $tvmazeId): void {
        $user    = requireAuth();
        $deleted = $this->showModel->delete($user['id'], $tvmazeId);
        if (!$deleted) {
            jsonError('Obra não encontrada na sua lista.', 404);
        }
        jsonResponse(['message' => 'Obra removida da lista.']);
    }

    public function getFavorites(): void {
        $user = requireAuth();
        $rawShows = $this->showModel->getFavorites($user['id']);
        $mapped = [];
        
        foreach ($rawShows as $s) {
            $tvmazeData = $this->fetchTVMaze("https://api.tvmaze.com/shows/" . $s['tvmaze_id']);
            $mapped[] = [
                'id' => $s['tvmaze_id'],
                'tvmaze_id' => $s['tvmaze_id'],
                'show_title' => $tvmazeData['name'] ?? 'Título Desconhecido',
                'poster_url' => $tvmazeData['image']['medium'] ?? $tvmazeData['image']['original'] ?? null,
                'status' => $s['status'],
                'is_favorite' => 1
            ];
        }
        jsonResponse($mapped);
    }

    public function getShowStatus(int $tvmazeId): void {
        $user = requireAuth();
        $show = $this->showModel->getUserShow($user['id'], $tvmazeId);
        jsonResponse(['status' => $show['status'] ?? null, 'is_favorite' => $show['is_favorite'] ?? 0]);
    }

    private function fetchTVMaze(string $url): mixed {
        $ctx = stream_context_create(['http' => [
            'timeout'     => 10,
            'user_agent'  => 'SerieVault/2.0',
            'ignore_errors' => true,
        ]]);
        $raw = @file_get_contents($url, false, $ctx);
        if ($raw === false) {
            jsonError('Erro ao conectar à API TVMaze.', 502);
        }
        return json_decode($raw, true) ?? [];
    }
}
