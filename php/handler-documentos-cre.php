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

        $_abrev                     = mysqli_real_escape_string($connect, $data['Abrev']);
        $_nombre                    = mysqli_real_escape_string($connect, $data['Nombre']);
        $_tipo                      = mysqli_real_escape_string($connect, $data['Tipo']);
        $_naturaleza                = mysqli_real_escape_string($connect, $data['Naturaleza']);
        $_serie                     = mysqli_real_escape_string($connect, $data['Numtienda']);
        $_correlativo_inicial       = mysqli_real_escape_string($connect, $data['CorrelativoInicial']);
        $_correlativo_actual        = mysqli_real_escape_string($connect, $data['CorrelativoInicial']);
        $_uso                       = mysqli_real_escape_string($connect, $data['Uso']);

        $query = "INSERT INTO `documentos` (abrev,nombre,tipo,naturaleza,numtienda, correlativo_inicial,correlativo_actual,uso) VALUES ('$_abrev','$_nombre','$_tipo','$_naturaleza','$_serie','$_correlativo_inicial','$_correlativo_inicial','$_uso')";

        if(mysqli_query($connect,$query)){
            echo ('Documento creado');
        }else{
            echo ("Error creando documento: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>
