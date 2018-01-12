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

        for($i=0;$i < count($data); $i++){

            
            $_pack              = mysqli_real_escape_string($connect, $data[$i]['Pack']);
            $_id_producto       = mysqli_real_escape_string($connect, $data[$i]['ID_producto']);
            $_almacen           = mysqli_real_escape_string($connect, $data[$i]['Almacen']);
            $_cantidad          = mysqli_real_escape_string($connect, $data[$i]['Cantidad']);

            $query1 = "SELECT nombre,unidad,stock_actual,moneda,compra,venta FROM productos WHERE id='".$_id_producto."'";
            $result = mysqli_query($connect, $query1);

            while ($row = mysqli_fetch_assoc($result)) {

                $query2 = "INSERT INTO `paquetes` (paquete,almacen,id_producto,nombre,unidad,stock_actual,moneda,compra,venta,cantidad) VALUES ('$_pack','$_almacen','$_id_producto','".$row['nombre']."','".$row['unidad']."','".$row['stock_actual']."','".$row['moneda']."','".$row['compra']."','".$row['venta']."','$_cantidad')";

                if(mysqli_query($connect,$query2)){
                    echo ('Paquete creado');
                }else{
                    echo ("Error creando paquete: ". mysqli_error($connect));
                }
            }

            
            
            
        }

        
        mysqli_close($connect);
    }
?>
