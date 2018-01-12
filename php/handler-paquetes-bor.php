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

    $data = file_get_contents("php://input");

    if (count($data) > 0) {
        
        $_paquete                = mysqli_real_escape_string($connect, $data);

        $query = "DELETE FROM paquetes WHERE paquete = '$_paquete'";

        if(mysqli_query($connect,$query)){
            echo ('Paquete borrado');
        }else{
            echo ("Error borrando paquete: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>
