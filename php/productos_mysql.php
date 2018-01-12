<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM productos";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' . $row['id'] . '",';
        $outp .= '"Grupo":"' . $row['grupo'] . '",';
        $outp .= '"Zona":"' . $row['zona'] . '",';
        $outp .= '"Nombre":"' . $row['nombre'] . '",';
        $outp .= '"Codigo":"' . $row['codigo'] . '",';
        $outp .= '"Unidad":"' . $row['unidad'] . '",';
        $outp .= '"Stock_inicial":"' . $row['stock_inicial'] . '",';
        $outp .= '"Stock_actual":"' . $row['stock_actual'] . '",';
        $outp .= '"Stocke":"' . $row['stocke'] . '",';
        $outp .= '"Offset_stocka":"' . $row['offset_stocka'] . '",';
        $outp .= '"Stocka":"' . $row['stocka'] . '",';
        $outp .= '"Moneda":"' . $row['moneda'] . '",';
        $outp .= '"Compra":"' . $row['compra'] . '",';
        $outp .= '"Venta":"' . $row['venta'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
