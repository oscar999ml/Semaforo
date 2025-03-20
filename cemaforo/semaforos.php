<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "semaforos_db";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['vehicle'])) {
        // Recibir datos del vehículo desde la aplicación Android
        $vehicle = $_POST['vehicle'];
        $lat = $_POST['lat'];
        $lng = $_POST['lng'];

        // Aquí puedes almacenar los datos en una base de datos o procesarlos según sea necesario
        // Por simplicidad, vamos a devolver los datos recibidos como una respuesta JSON

        $response = array(
            'vehicle' => $vehicle,
            'lat' => $lat,
            'lng' => $lng
        );

        echo json_encode($response);
    } else {
        // Guardar semáforo
        $lat = $_POST['lat'];
        $lng = $_POST['lng'];
        $green_time = $_POST['green_time'];
        $yellow_time = $_POST['yellow_time'];
        $red_time = $_POST['red_time'];
        $sql = "INSERT INTO semaforos (lat, lng, green_time, yellow_time, red_time, current_color) VALUES ('$lat', '$lng', '$green_time', '$yellow_time', '$red_time', 'green')";
        if ($conn->query($sql) === TRUE) {
            echo "Nuevo semáforo guardado";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Eliminar semáforo
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    $sql = "DELETE FROM semaforos WHERE id='$id' LIMIT 1";
    if ($conn->query($sql) === TRUE) {
        echo "Semáforo eliminado";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Actualizar semáforo
    parse_str(file_get_contents("php://input"), $data);
    $id = $data['id'];
    $green_time = $data['green_time'];
    $yellow_time = $data['yellow_time'];
    $red_time = $data['red_time'];
    $sql = "UPDATE semaforos SET green_time='$green_time', yellow_time='$yellow_time', red_time='$red_time' WHERE id='$id'";
    if ($conn->query($sql) === TRUE) {
        echo "Semáforo actualizado";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    // Cargar semáforos
    $sql = "SELECT id, lat, lng, green_time, yellow_time, red_time, current_color FROM semaforos";
    $result = $conn->query($sql);
    $semaforos = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $semaforos[] = $row;
        }
    }
    echo json_encode($semaforos);
}

$conn->close();
?>