<?php
header('Content-Type: application/javascript');

$files = [
    'components/AuthModal.jsx',
    'components/StatusModal.jsx',
    'components/Sidebar.jsx',
    'components/Header.jsx',
    'components/ShowCard.jsx',
    'components/FilterBar.jsx',
    'components/Comments.jsx',
    'components/ShowDetail.jsx',
    'pages/Home.jsx',
    'pages/Explore.jsx',
    'pages/MyList.jsx',
    'pages/Favorites.jsx',
    'pages/Ranking.jsx',
    'pages/Profile.jsx',
    'app.jsx',
];

foreach ($files as $file) {
    echo "/* --- File: $file --- */\n";
    echo file_get_contents(__DIR__ . '/' . $file);
    echo "\n\n";
}
