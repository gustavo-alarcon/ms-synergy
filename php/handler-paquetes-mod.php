<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $connect = mysqli_connect($servername, $username, $password, $dbname);

    if (!$connect) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (count($data) > 0) {
        
        $_id            = mysqli_real_escape_string($connect, $data['ID']);
        $_nombre         = mysqli_real_escape_string($connect, $data['Nombre']);
        $_cantidad       = mysqli_real_escape_string($connect, $data['Cantidad']);

        $query = "UPDATE `paquetes` SET nombre = '".$_nombre."', cantidad = '".$_cantidad."' WHERE id = '".$_id."'";

        if(mysqli_query($connect,$query)){
            echo ('Paquete modificado');
        }else{
            echo ("Error borrando paquete: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>