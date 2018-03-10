<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') die();

$requestBody = file_get_contents('php://input');
file_put_contents("scene_" . $_GET['sceneId'] . ".json", $requestBody);

?>