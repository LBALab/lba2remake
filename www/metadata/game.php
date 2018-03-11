<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') die();

$requestBody = file_get_contents('php://input');
file_put_contents('game.json', $requestBody);


$slackhook = '';

$message = json_encode(array(
        'channel' => '#metadata',
        'username' => 'lba2remake',
        'text' => 'Game metadata updated.', 
        'icon_url' => 'http://lba2remake.xesf.net/editor/icons/var.png'
    ));

$result = file_get_contents($slackhook, false, stream_context_create(array(
    'http' => array(
    'method' => 'POST',
    'header' => 'Content-Type: application/json' . "\r\n",
    'content' => $message,
    ),
    )));

echo $result; 

?>