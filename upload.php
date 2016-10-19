<?php

error_reporting(0);
$file = $_POST?$_POST['imgbase64']:null;
//var_dump($_POST);

header('Content-Type:"text/json"');
if(!isset($file)) {
    echo json_encode(array(
        'code' => 1,
        'msg'  => '上传图片错误',
        'obj'  => '',
    ));
    exit;
}
echo json_encode(array(
    'code' => 0,
    'msg'  => '',
    'obj'  => array(
        'url'=>'',
        'image_id'=>12345
    ),
));
