<?php
    SESSION_START();
    if(!isset($_SESSION['db'])){
        header("Location: http://localhost/meraki-rent/ms-invent/html/login.html");
        exit();
    }
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = $_SESSION['db'];

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    $sql = "SELECT * FROM regdocumentos";
    $result = mysqli_query($conn, $sql);

    $outp = "";

    while ($row = mysqli_fetch_assoc($result)) {
        if ($outp != "") {$outp .= ",";}
        $outp .= '{"Operacion":"' . $row['id_transaction'] . '",';
        $outp .= '"ID":"' . $row['id_resumen'] . '",';
        $outp .= '"Fecha":"' . $row['fecha'] . '",';
        $outp .= '"Doc":"' . $row['doc'] . '",';
        $outp .= '"DocNum":"' . $row['docnum'] . '",';
        $outp .= '"Guia":"' . $row['guia'] . '",';
        $outp .= '"Tercero":"' . $row['tercero'] . '",';
        $outp .= '"Detalle":"' . $row['detalle'] . '",';
        $outp .= '"IDProd":"' . $row['idprod'] . '",';
        $outp .= '"Prod":"' . $row['prod'] . '",';
        $outp .= '"Moneda":"' . $row['moneda'] . '",';
        $outp .= '"SCantidad":"' . $row['scantidad'] . '",';
        $outp .= '"SPUnitario":"' . $row['spunitario'] . '",';
        $outp .= '"STotal":"' . $row['stotal'] . '",';
        $outp .= '"ECantidad":"' . $row['ecantidad'] . '",';
        $outp .= '"EPUnitario":"' . $row['epunitario'] . '",';
        $outp .= '"ETotal":"' . $row['etotal'] . '",';
        $outp .= '"Stock":"' . $row['stock'] . '",';
        $outp .= '"RegDate":"' . $row['regDate'] . '"}';
    }

    $outp ='{"records":['.$outp.']}';
    mysqli_close($conn);

    echo ($outp);
?>
