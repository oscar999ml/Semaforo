document.addEventListener('DOMContentLoaded', function () {
    function fetchVehicleData() {
        fetch('vehicle_data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // Verifica los datos recibidos en la consola
                updateVehicleInfo(data);
                updateVehiclePosition('vehiculo1', data.lat, data.lng, data.vehicle);
                checkProximityToSemaforos(data.lat, data.lng); // Llama a la función aquí
            })
            .catch(error => {
                console.error('Error al cargar los datos del vehículo:', error);
                document.getElementById('vehicle-info').innerText = 'Error al cargar los datos del vehículo.';
            });
    }

    function updateVehicleInfo(data) {
        document.getElementById('vehicle-info').innerText = `Vehículo: ${data.vehicle}, Latitud: ${data.lat}, Longitud: ${data.lng}`;
    }

    function updateVehiclePosition(id, lat, lng, vehicleType) {
        // Aquí puedes actualizar la posición del vehículo en el mapa
        console.log(`Vehicle ${id} (${vehicleType}) moved to ${lat}, ${lng}`);
        // Actualiza el marcador del vehículo en el mapa
        if (!window.vehicleMarkers) {
            window.vehicleMarkers = {};
        }

        if (!window.vehicleMarkers[id]) {
            window.vehicleMarkers[id] = L.marker([lat, lng]).addTo(window.map);
        } else {
            window.vehicleMarkers[id].setLatLng([lat, lng]);
        }
    }

    function checkProximityToSemaforos(lat, lng) {
        if (!window.semaforos) return;

        window.semaforos.forEach(function(marker) {
            var distance = window.map.distance(marker.getLatLng(), L.latLng(lat, lng));
            if (distance < 100 && marker.currentColor === 'red') { // Ajusta el umbral de distancia según sea necesario
                changeSemaforoToGreenTemporarily(marker);
            }
        });
    }

    function changeSemaforoToGreenTemporarily(marker) {
        if (marker.currentColor !== 'green') {
            marker.currentColor = 'green';
            marker.setIcon(L.icon({
                iconUrl: 'semaforo_green.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            }));
            setTimeout(function() {
                startSemaforoCycle(marker);
            }, 200); // Cambia a verde por 5 segundos
        }
    }

    // Llama a fetchVehicleData cada 5 segundos para actualizar la posición del vehículo
    setInterval(fetchVehicleData, 500);

    // Llama a fetchVehicleData inmediatamente para cargar los datos al inicio
    fetchVehicleData();
});