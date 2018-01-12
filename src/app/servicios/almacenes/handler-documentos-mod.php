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

        $_id                        = mysqli_real_escape_string($connect, $data['ID']);
        $_abrev                     = mysqli_real_escape_string($connect, $data['Abrev']);
        $_nombre                    = mysqli_real_escape_string($connect, $data['Nombre']);
        $_tipo                      = mysqli_real_escape_string($connect, $data['Tipo']);
        $_naturaleza                = mysqli_real_escape_string($connect, $data['Naturaleza']);
        $_serie                     = mysqli_real_escape_string($connect, $data['Numtienda']);
        $_correlativo_inicial       = mysqli_real_escape_string($connect, $data['Correlativo_inicial']);
        $_correlativo_actual        = mysqli_real_escape_string($connect, $data['Correlativo_actual']);
        $_uso                       = mysqli_real_escape_string($connect, $data['Uso']);

        $query = "UPDATE `documentos` SET abrev = '".$_abrev."', nombre = '".$_nombre."', tipo = '".$_tipo."', naturaleza = '".$_naturaleza."', numtienda = '".$_serie."', correlativo_inicial = '".$_correlativo_inicial."', correlativo_actual = '".$_correlativo_actual."', uso = '".$_uso."' WHERE id = '".$_id."'";

        echo ($query);
        
        if(mysqli_query($connect,$query)){
            echo ('Documento modificado');
        }else{
            echo ("Error modificando documento: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>
