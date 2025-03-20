<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $lat = $_POST['lat'];
    $lng = $_POST['lng'];
    $vehicle = $_POST['vehicle'];

    // Guardar los datos en un archivo temporal
    $data = json_encode([
        "lat" => $lat,
        "lng" => $lng,
        "vehicle" => $vehicle
    ]);
    file_put_contents('vehicle_data.json', $data);

    // Responder con los datos recibidos
    echo $data;
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>