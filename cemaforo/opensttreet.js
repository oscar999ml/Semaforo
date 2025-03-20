document.addEventListener('DOMContentLoaded', function () {
    window.map = L.map('map').setView([-16.514582632662844, -68.1667763163346], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 21 // Nivel máximo de zoom
    }).addTo(window.map);

    var coordinates;
    var addingSemaforo = false;
    var removingSemaforo = false;
    window.semaforos = [];

    function showMessage(message) {
        var messageBox = document.getElementById('message-box');
        messageBox.innerHTML = message;
    }

    function loadSemaforos() {
        // Elimina todos los semáforos del mapa antes de recargar
        window.semaforos.forEach(function(marker) {
            window.map.removeLayer(marker);
        });
        window.semaforos = [];

        fetch('semaforos.php')
            .then(response => response.json())
            .then(data => {
                data.forEach(function(semaforo) {
                    var semaforoIcon = L.icon({
                        iconUrl: `semaforo_${semaforo.current_color}.png`,
                        iconSize: [32, 32], // Tamaño del icono
                        iconAnchor: [16, 32], // Punto del icono que corresponderá a la posición del marcador
                    });
                    var marker = L.marker([semaforo.lat, semaforo.lng], { icon: semaforoIcon }).addTo(window.map);
                    marker.semaforoId = semaforo.id; // Almacena el id del semáforo en el marcador
                    marker.greenTime = semaforo.green_time;
                    marker.yellowTime = semaforo.yellow_time;
                    marker.redTime = semaforo.red_time;
                    marker.currentColor = semaforo.current_color;
                    window.semaforos.push(marker);
                    startSemaforoCycle(marker);
                });
            })
            .catch(error => {
                console.error('Error al cargar los semáforos:', error);
                showMessage('Error al cargar los semáforos.');
            });
    }

    function saveSemaforo(lat, lng, greenTime, yellowTime, redTime) {
        fetch('semaforos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `lat=${lat}&lng=${lng}&green_time=${greenTime}&yellow_time=${yellowTime}&red_time=${redTime}`
        })
        .then(response => response.text())
        .then(data => {
            showMessage(data);
            loadSemaforos(); // Recargar semáforos para obtener el id del nuevo semáforo
        })
        .catch(error => {
            console.error('Error al guardar el semáforo:', error);
            showMessage('Error al guardar el semáforo.');
        });
    }

    function deleteSemaforo(id) {
        fetch('semaforos.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
        })
        .then(response => response.text())
        .then(data => {
            showMessage(data);
            loadSemaforos(); // Recargar semáforos para reflejar los cambios
        })
        .catch(error => {
            console.error('Error al eliminar el semáforo:', error);
            showMessage('Error al eliminar el semáforo.');
        });
    }

    function updateSemaforo(id, greenTime, yellowTime, redTime) {
        fetch('semaforos.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}&green_time=${greenTime}&yellow_time=${yellowTime}&red_time=${redTime}`
        })
        .then(response => response.text())
        .then(data => {
            showMessage(data);
            loadSemaforos(); // Recargar semáforos para obtener los cambios
        })
        .catch(error => {
            console.error('Error al actualizar el semáforo:', error);
            showMessage('Error al actualizar el semáforo.');
        });
    }

    function startSemaforoCycle(marker) {
        function changeColor() {
            if (marker.currentColor === 'green') {
                marker.currentColor = 'yellow';
                marker.setIcon(L.icon({
                    iconUrl: 'semaforo_yellow.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                }));
                setTimeout(changeColor, marker.yellowTime * 1000);
            } else if (marker.currentColor === 'yellow') {
                marker.currentColor = 'red';
                marker.setIcon(L.icon({
                    iconUrl: 'semaforo_red.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                }));
                setTimeout(changeColor, marker.redTime * 1000);
            } else {
                marker.currentColor = 'green';
                marker.setIcon(L.icon({
                    iconUrl: 'semaforo_green.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                }));
                setTimeout(changeColor, marker.greenTime * 1000);
            }
        }
        changeColor();
    }

    window.map.on('click', function(e) {
        coordinates = e.latlng;
        if (addingSemaforo) {
            var greenTime = prompt("Tiempo en verde (segundos):", "60");
            var yellowTime = prompt("Tiempo en amarillo (segundos):", "3");
            var redTime = prompt("Tiempo en rojo (segundos):", "60");
            if (greenTime && yellowTime && redTime) {
                var semaforoIcon = L.icon({
                    iconUrl: 'semaforo_green.png',
                    iconSize: [32, 32], // Tamaño del icono
                    iconAnchor: [16, 32], // Punto del icono que corresponderá a la posición del marcador
                });
                var marker = L.marker(coordinates, { icon: semaforoIcon }).addTo(window.map);
                marker.greenTime = parseInt(greenTime);
                marker.yellowTime = parseInt(yellowTime);
                marker.redTime = parseInt(redTime);
                marker.currentColor = 'green';
                window.semaforos.push(marker);
                saveSemaforo(coordinates.lat, coordinates.lng, marker.greenTime, marker.yellowTime, marker.redTime);
                startSemaforoCycle(marker);
                addingSemaforo = false;
                showMessage("Semáforo añadido en: " + coordinates.lat + ", " + coordinates.lng);
            } else {
                showMessage("Valores inválidos para los tiempos del semáforo.");
            }
        } else if (removingSemaforo) {
            var closestMarker = null;
            var closestDistance = Infinity;
            window.semaforos.forEach(function(marker) {
                var distance = window.map.distance(marker.getLatLng(), coordinates);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestMarker = marker;
                }
            });
            if (closestMarker && closestDistance < 10) { // Ajusta el umbral de distancia según sea necesario
                window.map.removeLayer(closestMarker);
                window.semaforos = window.semaforos.filter(function(marker) {
                    return marker !== closestMarker;
                });
                deleteSemaforo(closestMarker.semaforoId); // Usa el id del semáforo para eliminarlo
                showMessage("Semáforo eliminado en: " + closestMarker.getLatLng().lat + ", " + closestMarker.getLatLng().lng);
            } else {
                showMessage("No se encontró un semáforo cercano para eliminar.");
            }
            removingSemaforo = false;
        } else {
            showMessage("Coordenadas: " + coordinates.lat + ", " + coordinates.lng);
        }
    });

    document.getElementById('add-semaforo').addEventListener('click', function() {
        addingSemaforo = true;
        showMessage("Haz clic en el mapa para añadir un semáforo.");
    });

    document.getElementById('remove-semaforo').addEventListener('click', function() {
        removingSemaforo = true;
        showMessage("Haz clic en el mapa para eliminar un semáforo.");
    });

    document.getElementById('add-semaforo-coordinates').addEventListener('click', function() {
        var input = document.getElementById('coordinates-input').value;
        var coords = input.split(',').map(Number);
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            var lat = coords[0];
            var lng = coords[1];
            var greenTime = prompt("Tiempo en verde (segundos):", "60");
            var yellowTime = prompt("Tiempo en amarillo (segundos):", "3");
            var redTime = prompt("Tiempo en rojo (segundos):", "60");
            if (greenTime && yellowTime && redTime) {
                var semaforoIcon = L.icon({
                    iconUrl: 'semaforo_green.png',
                    iconSize: [32, 32], // Tamaño del icono
                    iconAnchor: [16, 32], // Punto del icono que corresponderá a la posición del marcador
                });
                var marker = L.marker([lat, lng], { icon: semaforoIcon }).addTo(window.map);
                marker.greenTime = parseInt(greenTime);
                marker.yellowTime = parseInt(yellowTime);
                marker.redTime = parseInt(redTime);
                marker.currentColor = 'green';
                window.semaforos.push(marker);
                saveSemaforo(lat, lng, marker.greenTime, marker.yellowTime, marker.redTime);
                startSemaforoCycle(marker);
                showMessage("Semáforo añadido en: " + lat + ", " + lng);
            } else {
                showMessage("Valores inválidos para los tiempos del semáforo.");
            }
        } else {
            showMessage("Coordenadas inválidas. Por favor, introduce coordenadas en el formato 'lat, lng'.");
        }
    });

    loadSemaforos();
});