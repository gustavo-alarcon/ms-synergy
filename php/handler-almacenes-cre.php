<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];
    $counter = 0;

    $connect = mysqli_connect($servername, $username, $password, $dbname);

    if (!$connect) {
        die("Connection failed: " . mysqli_connect_error());
    }
    
    $data = json_decode(file_get_contents("php://input"), true);

    if (count($data) > 0) {

        $_abrev         = mysqli_real_escape_string($connect, $data['abrev']);
        $_nombre        = mysqli_real_escape_string($connect, $data['nombre']);
        $_dir           = mysqli_real_escape_string($connect, $data['dir']);
        $_supervisor    = mysqli_real_escape_string($connect, $data['supervisor']);
        $_mail          = mysqli_real_escape_string($connect, $data['mail']);
        $_telefono      = mysqli_real_escape_string($connect, $data['telefono']);

        $query = "INSERT INTO `zonas_sucursales` (abrev,nombre,dir,supervisor,mail, telefono) VALUES ('$_abrev','$_nombre','$_dir','$_supervisor','$_mail','$_telefono')";

        if(mysqli_query($connect,$query)){
            echo ('Almacen creado');
        }else{
            echo ("Error creando almacen: ". mysqli_error($connect));
        }

        mysqli_close($connect);
    }
?>
