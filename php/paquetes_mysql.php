<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = "lubsac_ms-invent";

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM paquetes";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"' . $row['id'] . '",';
        $outp .= '"Paquete":"' . $row['paquete'] . '",';
        $outp .= '"Almacen":"' . $row['almacen'] . '",';
        $outp .= '"IDProducto":"' . $row['id_producto'] . '",';
        $outp .= '"Nombre":"' . $row['nombre'] . '",';
        $outp .= '"Unidad":"' . $row['unidad'] . '",';
        $outp .= '"Stock_actual":"' . $row['stock_actual'] . '",';
        $outp .= '"Moneda":"' . $row['moneda'] . '",';
        $outp .= '"Compra":"' . $row['compra'] . '",';
        $outp .= '"Venta":"' . $row['venta'] . '",';
        $outp .= '"Cantidad":"' . $row['cantidad'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
