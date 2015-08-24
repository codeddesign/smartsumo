<?php
$dir   = 'articles/';
$files = [ 'hollywood.txt', 'sports.txt', 'technology.txt' ];

$patterns = [
    'title' => '%%%',
    'site'  => '^^^',
    'body'  => '&&&',
];

$articles = [ ];
foreach ($files as $fNo => $file) {
    $content = implode( ' ', file( $dir . $file ) );
    $lines   = explode( "\n", $content );
    $article = [ ];

    foreach ($lines as $lNo => $line) {
        if ( ! trim( $line )) {
            $article = [ ];
            continue;
        }

        if (stripos( $line, $patterns['title'] ) or $lNo == 0) {
            $line = str_ireplace( $patterns['title'], '', $line );
            $line = trim( $line );

            $article['title'] = $line;
        }

        if (stripos( $line, $patterns['site'] )) {
            $line = str_ireplace( $patterns['site'], '', $line );
            $line = trim( $line );

            $article['site'] = $line;
        }

        if (stripos( $line, $patterns['body'] )) {
            $line = str_ireplace( $patterns['body'], '', $line );
            $line = trim( $line );

            if ( ! isset( $article['body'] )) {
                $article['body'] = '';
            }

            $article['body'] .= $line;
        }

        if (isset( $article['body'] )) {
            $article['body'] .= $line;
        }

        if ( ! isset( $lines[$lNo + 1] ) or ! trim( $lines[$lNo + 1] )) {
            $articles[] = $article;
        }
    }
}

file_put_contents( 'articles.json', json_encode( $articles ) );