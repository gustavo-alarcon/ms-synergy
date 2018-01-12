<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM zonas_sucursales";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' .        $row['id'] . '",';
        $outp .= '"Abrev":"' .      $row['abrev'] . '",';            
        $outp .= '"Nombre":"' .     $row['nombre'] . '",';
        $outp .= '"Dir":"' .        $row['dir'] . '",';
        $outp .= '"Supervisor":"' . $row['supervisor'] . '",';
        $outp .= '"Mail":"' .       $row['mail'] . '",';
        $outp .= '"Telefono":"' .        $row['telefono'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
