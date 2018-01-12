<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM grupos";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' . $row['id'] . '",';
        $outp .= '"Nombre":"' . $row['nombre'] . '",';
        $outp .= '"Detalles":"' . $row['detalles'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
