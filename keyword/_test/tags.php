<?php
$lines = explode( "\n", implode( '', file( 'tags.txt' ) ) );

$tags = [ ];
foreach ($lines as $lNo => $line) {
    if ( ! trim( $line )) {
        continue;
    }

    list( $tag, $rest ) = explode( ": ", $line );
    $rest       = str_replace( [ '"', ' ', "\r", "\n" ], '', $rest );
    $words      = explode( ",", $rest );
    $tags[$tag] = $words;
}

$tags = json_encode( $tags, JSON_PRETTY_PRINT );

file_put_contents( 'tags.json', $tags );