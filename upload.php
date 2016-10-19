<?php
//error_reporting(0);
//var_dump(__DIR__);
$json = [
    'code' => 1,
    'msg'  => '上传失败',
    'obj'  => ''
];
$imgbase64 = $_POST?$_POST['imgbase64']:null;

if(!isset($imgbase64)) {
    ajaxReturn($json);
}
$url = uploadImage($imgbase64);
if ($url) {
    $json['code'] = 0;
    $json['msg']  = 'success';
    $json['obj']  = array(
        'url'=>$url,
        'image_id'=>12345
    );
}
ajaxReturn($json);


/*
 * ---------------------------------------
 * 上传base64格式的图片
 * @param  int    $id  参数信息
 * @return json   返回信息
 * ---------------------------------------
 */
function uploadImage($imgbase64){
    $config = array(
        'path' => __DIR__.'/upload/',
        'url'  => 'upload/',
    );
    if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $imgbase64, $result)){
        $type = $result[2];
        $type = $type == 'jpeg' ? 'jpg' : $type;
        $fileName = time() . rand( 1 , 1000 ) . ".".$type;
        /* 以年月创建目录 */
        $dir = date('Ym', time());
        if (!file_exists($config['path'].$dir)) {
            mkdir($config['path'].$dir, 0777);
        }
        $fileName = $dir.'/'.$fileName;
        if (file_put_contents($config['path'].$fileName, base64_decode(str_replace($result[1], '', $imgbase64)))){
            return $config['url'].$fileName;
        }
    }
    return false;
}

function ajaxReturn($data) {
    // 返回JSON数据格式到客户端 包含状态信息
    header('Content-Type:application/json; charset=utf-8');
    exit(json_encode($data));
}