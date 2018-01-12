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
        
        $_id                = mysqli_real_escape_string($connect, $data['ID']);
        $_grupo             = mysqli_real_escape_string($connect, $data['Grupo']);
        $_almacen           = mysqli_real_escape_string($connect, $data['Zona']);
        $_nombre            = mysqli_real_escape_string($connect, $data['Nombre']);
        $_codigo            = mysqli_real_escape_string($connect, $data['Codigo']);
        $_unidad            = mysqli_real_escape_string($connect, $data['Unidad']);
        $_stock_inicial     = mysqli_real_escape_string($connect, $data['Stock_inicial']);
        $_stock_actual      = mysqli_real_escape_string($connect, $data['Stock_actual']);
        $_stock_emergencia  = mysqli_real_escape_string($connect, $data['Stocke']);
        $_stock_porcentaje  = mysqli_real_escape_string($connect, $data['Offset_stocka']);
        $_stock_alerta      = mysqli_real_escape_string($connect, $data['Stocka']);
        $_moneda            = mysqli_real_escape_string($connect, $data['Moneda']);
        $_compra            = mysqli_real_escape_string($connect, $data['Compra']);
        $_venta             = mysqli_real_escape_string($connect, $data['Venta']);

        $query = "UPDATE `productos` SET grupo = '".$_grupo."', zona = '".$_almacen."', nombre = '".$_nombre."', codigo = '".$_codigo."', unidad = '".$_unidad."', stock_inicial = '".$_stock_inicial."', stock_actual = '".$_stock_actual."', stocke = '".$_stock_emergencia."', offset_stocka = '".$_stock_porcentaje."', stocka = '".$_stock_alerta."', moneda = '".$_moneda."', compra = '".$_compra."', venta = '".$_venta."' WHERE id = '".$_id."'";
       
        if(mysqli_query($connect,$query)){
            echo ('Producto modificado');
        }else{
            echo ("Error modificando producto: ". mysqli_error($connect));
        }
        mysqli_close($connect);
    }
?>
