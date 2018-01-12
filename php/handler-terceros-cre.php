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

        $_identi        = mysqli_real_escape_string($connect, $data['Identi']);
        $_identiClass   = mysqli_real_escape_string($connect, $data['IdentiClass']);
        $_terceroClass  = mysqli_real_escape_string($connect, $data['TerceroClass']);
        $_nombre        = mysqli_real_escape_string($connect, $data['Nombre']);
        $_direccion     = mysqli_real_escape_string($connect, $data['Direccion']);
        $_contacto      = mysqli_real_escape_string($connect, $data['Contacto']);
        $_mail          = mysqli_real_escape_string($connect, $data['Mail']);
        $_telefono      = mysqli_real_escape_string($connect, $data['Telefono']);

        $query = "INSERT INTO `terceros` (identi,identiClass,terceroClass,nombre,direccion, contacto, mail, telefono) VALUES ('$_identi','$_identiClass','$_terceroClass','$_nombre','$_direccion','$_contacto','$_mail','$_telefono')";

        if(mysqli_query($connect,$query)){
            echo ('Tercero creado');
        }else{
            echo ("Error creando tercero: ". mysqli_error($connect));
        }
        
        mysqli_close($connect);
    }
?>
