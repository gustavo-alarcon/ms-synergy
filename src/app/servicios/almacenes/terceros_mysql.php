<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = "lubsac_ms-invent";

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM terceros";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' . $row['id'] . '",';
        $outp .= '"Identi":"' . $row['identi'] . '",';
        $outp .= '"IdentiClass":"' . $row['identiClass'] . '",';
        $outp .= '"TerceroClass":"' . $row['terceroClass'] . '",';
        $outp .= '"Nombre":"' . $row['nombre'] . '",';
        $outp .= '"Ciudad":"' . $row['ciudad'] . '",';
        $outp .= '"Direccion":"' . $row['direccion'] . '",';
        $outp .= '"Contacto":"' . $row['contacto'] . '",';
        $outp .= '"Mail":"' . $row['mail'] . '",';
        $outp .= '"Telefono":"' . $row['telefono'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
