<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $sql = "SELECT nombre, stock_actual, unidad, stocke, stocka FROM productos WHERE zona like '".$data['Almacen']."'";

    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"Nombre":"'      . $row['nombre']        . '",';
        $outp .= '"Unidad":"'       . $row['unidad']        . '",';
        $outp .= '"Stocke":'        . $row['stocke']        . ',';
        $outp .= '"Stocka":'        . $row['stocka']        . ',';
        $outp .= '"Stock_actual":'  . $row['stock_actual']  . '}';
    }

    $outp ='{"records":['.$outp.']}';

    echo ($outp);

    mysqli_close($conn);

    
?>
