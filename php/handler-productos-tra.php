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

    $sql_search = "SELECT * FROM `productos` WHERE nombre = '".$data['Producto']."' AND zona = '".$data['Destino']."'";

    $res_search = mysqli_query($connect,$sql_search);

    $rows_count = mysqli_num_rows($res_search);
    
    if ($rows_count > 0) {

        $query_ori = "UPDATE `productos` SET stock_actual = stock_actual - ".$data['Cantidad']." WHERE nombre = '".$data['Producto']."' AND zona = '".$data['Origen']."'";
        if (mysqli_query($connect,$query_ori)){
            echo ('');
        }else{
            echo ('Error actualizando Almacen origen '.mysqli_error($connect).'***');
        }

        $query_des = "UPDATE `productos` SET stock_actual = stock_actual + ".$data['Cantidad']." WHERE nombre = '".$data['Producto']."' AND zona = '".$data['Destino']."'";
        if (mysqli_query($connect,$query_des)){
            echo ('Almacen destino actualizado***');
        }else{
            echo ('Error actualizando Almacen Destino '.mysqli_error($connect).'***');
        }

    } else {
        echo ('Creando producto en Almacen destino***');
        $query_ori_copy = "SELECT * FROM `productos` WHERE nombre = '".$data['Producto']."' AND zona = '".$data['Origen']."'";
        $res_copy = mysqli_query($connect,$query_ori_copy);

        while ($row = mysqli_fetch_assoc($res_copy)){
            
            $_id                = mysqli_real_escape_string($connect, $row['id']);
            $_grupo             = mysqli_real_escape_string($connect, $row['grupo']);
            $_almacen           = $data['Destino'];
            $_nombre            = mysqli_real_escape_string($connect, $row['nombre']);
            $_codigo            = mysqli_real_escape_string($connect, $row['codigo']);
            $_unidad            = mysqli_real_escape_string($connect, $row['unidad']);
            $_stock_inicial     = $data['Cantidad'];
            $_stock_actual      = mysqli_real_escape_string($connect, $data['Cantidad']);
            $_stock_emergencia  = mysqli_real_escape_string($connect, $row['stocke']);
            $_stock_porcentaje  = mysqli_real_escape_string($connect, $row['offset_stocka']);
            $_stock_alerta      = mysqli_real_escape_string($connect, $row['stocka']);
            $_moneda            = mysqli_real_escape_string($connect, $row['moneda']);
            $_compra            = mysqli_real_escape_string($connect, $row['compra']);
            $_venta             = mysqli_real_escape_string($connect, $row['venta']);
    
            $query_paste = "INSERT INTO `productos` (grupo,zona,nombre,codigo,unidad,stock_inicial,stock_actual, stocke,offset_stocka,stocka,moneda,compra,venta) VALUES ('$_grupo','$_almacen','$_nombre','$_codigo','$_unidad','$_stock_inicial','$_stock_actual','$_stock_emergencia','$_stock_porcentaje','$_stock_alerta','$_moneda','$_compra','$_venta')";
            
            if (mysqli_query($connect,$query_paste)){
                echo ('Producto creado***');
            }else{
                echo ('Error creando producto en Almacen Destino: '.mysqli_error($connect).'***');
            }
        }

        $query_ori2 = "UPDATE `productos` SET stock_actual = stock_actual - ".$data['Cantidad']." WHERE nombre = '".$data['Producto']."' AND zona = '".$data['Origen']."'";
        if (mysqli_query($connect,$query_ori2)){
            echo ('Almacen origen actualizado***');
        }else{
            echo ('Error actualizando Almacen origen '.mysqli_error($connect).'***');
        }
    }
?>