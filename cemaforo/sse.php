<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

// Leer los datos del archivo temporal
$data = file_get_contents('vehicle_data.json');
if ($data) {
    echo "data: $data\n\n";
} else {
    echo "data: {\"lat\": \"-16.514582632662844\", \"lng\": \"-68.1667763163346\", \"vehicle\": \"Policía\"}\n\n";
}
flush();
?>