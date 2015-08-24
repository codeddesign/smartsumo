<?php
$text  = implode( '', file( '_stopwords.txt' ) );
$lines = explode( "\n", $text );

$words = [ ];
foreach ($lines as $lNo => $line) {
    $line = trim( $line );
    $temp = explode( " ", $line );

    foreach ($temp as $wNo => $w) {
        $w = trim( $w );
        if (trim( $w )) {
            $words[] = trim( $w );
        }

    }
}

file_put_contents( 'stop-words.json', json_encode( $words ) );