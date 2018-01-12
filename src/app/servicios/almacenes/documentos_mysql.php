<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = 'lubsac_ms-invent';

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM documentos";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' . $row['id'] . '",';
        $outp .= '"Abrev":"' . $row['abrev'] . '",';
        $outp .= '"Nombre":"' . $row['nombre'] . '",';
        $outp .= '"Tipo":"' . $row['tipo'] . '",';
        $outp .= '"Naturaleza":"' . $row['naturaleza'] . '",';
        $outp .= '"Numtienda":"' . $row['numtienda'] . '",';
        $outp .= '"Correlativo_inicial":"' . $row['correlativo_inicial'] . '",';
        $outp .= '"Correlativo_actual":"' . $row['correlativo_actual'] . '",';
        $outp .= '"Uso":"' . $row['uso'] . '",';    
        $outp .= '"Detalle":"' . $row['detalles'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
