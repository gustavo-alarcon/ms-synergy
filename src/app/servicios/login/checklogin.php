<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    $servername = "localhost";
    $username = "root";
    $password = "1nj7TkF94h";
    $dbname = "merakiso_ms-invent";

    $conn = mysqli_connect($servername, $username, $password, $dbname);

    if (!$conn) {
	    die("Connection failed: " . mysqli_connect_error());
    }

    $data = json_decode(file_get_contents("php://input"), true);
    
    $sql = "SELECT * FROM users";
    $result = mysqli_query($conn, $sql);

    
    $uname = test_input($data[0]["uname"]);
    $psw = test_input($data[0]["upass"]);
    
    $outp = "";
    $registred = true;

    if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
                if (($row["uname"] == $uname) and ($row["psw"] == $psw)){

                    $outp .= '{"ID":"' .       $row['id'] . '",';
                    $outp .= '"Mail":"' .      $row['mail'] . '",';            
                    $outp .= '"Uname":"' .     $row['uname'] . '",';
                    $outp .= '"Name":"' .      $row['name'] . '",';
                    $outp .= '"Lastname":"' .  $row['lastname'] . '",';
                    $outp .= '"Type":"' .      $row['type'] . '",';
                    $outp .= '"Db":"' .        $row['db'] . '"}';
                    
                    $outp ='{"records":['.$outp.']}';
                    $registred = true;
                    break;
                } else {
                    $registred = false;
                }
            }
    } else {
            echo ("Error en conexión");
    }

    if ($registred){
        echo ($outp);
    }else{
        echo ('{"records":[{"ID":"false"}]}');
    }
    
    mysqli_close($conn);
    
    
    function test_input($data_) {
        $data_ = trim($data_);
        $data_ = stripslashes($data_);
        $data_ = htmlspecialchars($data_);
        return $data_;
	}
 ?>
