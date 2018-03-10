<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') die();

$requestBody = file_get_contents('php://input');
file_put_contents('game.json', $requestBody);

?>