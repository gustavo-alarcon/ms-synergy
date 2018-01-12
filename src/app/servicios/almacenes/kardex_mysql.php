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


    $sql_mov = "SELECT * FROM movimientos WHERE fecha <= '".$data['Fecha']."' AND almacen_origen='".$data['Almacen']."' AND id_prod='".$data['IDProd']."' AND unidad='".$data['Unidad']."'";

    $result_mov = mysqli_query($conn, $sql_mov);

    $sql_prod = "SELECT stock_inicial FROM productos WHERE id='".$data['IDProd']."'";

    $result_prod = mysqli_query($conn, $sql_prod);
    $stock = mysqli_fetch_assoc($result_prod);

    $outp = "";
    $temp_stock = $stock['stock_inicial'];

    while ($row = mysqli_fetch_assoc($result_mov)) {

        $entrada_cantidad = 0;
        $entrada_costo = 0;
        $entrada_total = 0;
        $salida_cantidad = 0;
        $salida_costo = 0;
        $salida_total = 0;
        $saldo_cantidad = 0;
        $saldo_costo = $row['venta'];
        $saldo_total = 0;

        if ($row['movimiento'] === 'ENTRADA' || $row['movimiento'] === 'AJUSTE DE ENTRADA') {
            $temp_stock = $temp_stock + $row['cantidad'];
            $saldo_total = $temp_stock * $saldo_costo;
            $entrada_cantidad = $row['cantidad'];
            $entrada_costo = $row['compra'];
            $entrada_total = $row['cantidad']*$row['compra'];
        }elseif ($row['movimiento'] === 'SALIDA' || $row['movimiento'] === 'AJUSTE DE SALIDA') {
            $temp_stock = $temp_stock - $row['cantidad'];
            $saldo_total = $temp_stock * $saldo_costo;
            $salida_cantidad = $row['cantidad'];
            $salida_costo = $row['venta'];
            $salida_total = $row['cantidad']*$row['venta'];
        }elseif ($row['movimiento'] === 'TRANSFERENCIA') {
            if ($row['almacen_origen'] === $data['Almacen']) {
                $temp_stock = $temp_stock - $row['cantidad'];
                $saldo_total = $temp_stock * $saldo_costo;
                $salida_cantidad = $row['cantidad'];
            }else {
                $temp_stock = $temp_stock + $row['cantidad'];
                $saldo_total = $temp_stock * $saldo_costo;
                $entrada_cantidad = $row['cantidad'];
            }
        }

        if ($outp != "") {$outp .= ",";}
        $outp .= '{"ID":"'              . $row['id']                . '",';
        $outp .= '"Fecha":"'            . $row['fecha']             . '",';
        $outp .= '"Documento":"'        . $row['documento']         . '",';
        $outp .= '"Correlativo":"'      . $row['correlativo']       . '",';
        $outp .= '"Serie":"'            . $row['serie']             . '",';
        $outp .= '"Tercero":"'          . $row['tercero']           . '",';
        $outp .= '"Producto":"'         . $row['producto']          . '",';
        $outp .= '"Paquete":"'          . $row['paquete']           . '",';
        $outp .= '"Unidad":"'           . $row['unidad']            . '",';
        $outp .= '"Moneda":"'           . $row['moneda']            . '",';
        $outp .= '"E_cantidad":'        . $entrada_cantidad         . ',';
        $outp .= '"E_costo":'           . $entrada_costo            . ',';
        $outp .= '"E_total":'           . $entrada_total            . ',';
        $outp .= '"S_cantidad":'        . $salida_cantidad          . ',';
        $outp .= '"S_costo":'           . $salida_costo             . ',';
        $outp .= '"S_total":'           . $salida_total             . ',';
        $outp .= '"Stock":'             . $temp_stock               . ',';
        $outp .= '"SL_costo":'          . $saldo_costo              . ',';
        $outp .= '"SL_total":'          . $saldo_total              . ',';
        $outp .= '"Movimiento":"'       . $row['movimiento']        . '",';
        $outp .= '"Stock_inicial":'     . $stock['stock_inicial']   . ',';
        $outp .= '"RegDate":"'          . $row['regDate']           . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
