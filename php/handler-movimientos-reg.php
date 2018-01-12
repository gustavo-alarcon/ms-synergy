<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_GET["db"];

    $connect = mysqli_connect($servername, $username, $password, $dbname);

    if (!$connect) {
        die("Connection failed: " . mysqli_connect_error());
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (count($data) > 0) {

        for($i=0; $i < count($data); $i++){
            
            $_almacen_destino       = mysqli_real_escape_string($connect, $data[$i]['AlmacenDestino']);
            $_almacen_origen        = mysqli_real_escape_string($connect, $data[$i]['AlmacenOrigen']);
            $_cantidad              = mysqli_real_escape_string($connect, $data[$i]['Cantidad']);
            $_compra                = mysqli_real_escape_string($connect, $data[$i]['Compra']);
            $_correlativo           = mysqli_real_escape_string($connect, $data[$i]['Correlativo']);
            $_documento             = mysqli_real_escape_string($connect, $data[$i]['Documento']);
            $_fecha                 = mysqli_real_escape_string($connect, $data[$i]['Fecha']);
            $_serie                 = mysqli_real_escape_string($connect, $data[$i]['Serie']);
            $_moneda                = mysqli_real_escape_string($connect, $data[$i]['Moneda']);
            $_movimiento            = mysqli_real_escape_string($connect, $data[$i]['Movimiento']);
            $_paquete               = mysqli_real_escape_string($connect, $data[$i]['Paquete']);
            $_producto              = mysqli_real_escape_string($connect, $data[$i]['Producto']);
            $_id_prod               = mysqli_real_escape_string($connect, $data[$i]['IDProducto']);
            $_tercero               = mysqli_real_escape_string($connect, $data[$i]['Tercero']);
            $_unidad                = mysqli_real_escape_string($connect, $data[$i]['Unidad']);
            $_venta                 = mysqli_real_escape_string($connect, $data[$i]['Venta']);

            $query = "INSERT INTO `movimientos` (almacen_destino,almacen_origen,cantidad,compra,correlativo,documento,fecha,serie,moneda,movimiento,paquete,producto,id_prod,tercero,unidad,venta) VALUES ('$_almacen_destino','$_almacen_origen','$_cantidad','$_compra','$_correlativo','$_documento','$_fecha','$_serie','$_moneda','$_movimiento','$_paquete','$_producto','$_id_prod','$_tercero','$_unidad','$_venta')";

            if(mysqli_query($connect,$query)){
                switch ($_movimiento) {
                    case 'SALIDA':
                        echo ("Venta registrada");
                        break;
                    
                    case 'ENTRADA':
                        echo ("Compra registrada");
                        break;
                    
                    case 'AJUSTE DE ENTRADA':
                        echo ("Ajuste de entrada registrado");
                        break;

                    case 'AJUSTE DE SALIDA':
                        echo ("Ajuste de salida registrado");
                        break;

                    default:
                        
                        break;
                }
            }else{
                echo ("Error registrando movimiento: ". mysqli_error($connect));
            }

        }
        mysqli_close($connect);
    }
?>
