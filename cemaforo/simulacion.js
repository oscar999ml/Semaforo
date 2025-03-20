document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([-15.7942, -47.8822], 4); // Coordenadas de Brasilia, Brasil con un nivel de zoom de 4

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 21 // Nivel máximo de zoom
    }).addTo(map);

    var vehicleMarker;
    var vehicleLatLng;

    map.on('click', function(e) {
        if (!vehicleMarker) {
            vehicleLatLng = e.latlng;
            vehicleMarker = L.marker(vehicleLatLng).addTo(map);
            updateCoordinates(vehicleLatLng);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (vehicleMarker) {
            var lat = vehicleLatLng.lat;
            var lng = vehicleLatLng.lng;
            var step = 0.0001; // Ajusta el tamaño del paso según sea necesario

            switch (e.key) {
                case 'w': // Avanzar
                    lat += step;
                    break;
                case 's': // Retroceder
                    lat -= step;
                    break;
                case 'a': // Izquierda
                    lng -= step;
                    break;
                case 'd': // Derecha
                    lng += step;
                    break;
                case 'q': // Avanzar con leve giro a la izquierda
                    lat += step;
                    lng -= step / 2;
                    break;
                case 'e': // Avanzar con leve giro a la derecha
                    lat += step;
                    lng += step / 2;
                    break;
                case 'z': // Retroceder con leve giro a la izquierda
                    lat -= step;
                    lng -= step / 2;
                    break;
                case 'c': // Retroceder con leve giro a la derecha
                    lat -= step;
                    lng += step / 2;
                    break;
            }

            vehicleLatLng = L.latLng(lat, lng);
            vehicleMarker.setLatLng(vehicleLatLng);
            updateCoordinates(vehicleLatLng);
            map.setView(vehicleLatLng); // Centra el mapa en la nueva posición del vehículo
        }
    });

    function updateCoordinates(latlng) {
        document.getElementById('lat').textContent = latlng.lat.toFixed(6);
        document.getElementById('lng').textContent = latlng.lng.toFixed(6);
    }
});