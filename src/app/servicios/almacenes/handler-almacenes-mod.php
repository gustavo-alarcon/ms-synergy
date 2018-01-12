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

        $_id            = mysqli_real_escape_string($connect, $data['ID']);
        $_abrev         = mysqli_real_escape_string($connect, $data['Abrev']);
        $_nombre        = mysqli_real_escape_string($connect, $data['Nombre']);
        $_dir           = mysqli_real_escape_string($connect, $data['Dir']);
        $_supervisor    = mysqli_real_escape_string($connect, $data['Supervisor']);
        $_mail          = mysqli_real_escape_string($connect, $data['Mail']);
        $_telefono      = mysqli_real_escape_string($connect, $data['Telefono']);

        $query = "UPDATE `zonas_sucursales` SET abrev = '".$_abrev."', nombre = '".$_nombre."', dir = '".$_dir."', supervisor = '".$_supervisor."', mail = '".$_mail."', telefono = '".$_telefono."' WHERE id = '".$_id."'";

        if(mysqli_query($connect,$query)){
            $counter = $counter + 1;
        }else{
            $counter = 0;
        }
        

        if($counter > 0){
            echo ('Almacen modificado');
        }else{
            echo ("Error Mod: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>
