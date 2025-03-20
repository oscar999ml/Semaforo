document.addEventListener('DOMContentLoaded', function () {
    function sendHelloWorld() {
        // Reemplaza <ESP8266_IP_ADDRESS> con la dirección IP de tu ESP8266
        fetch('http://192.168.100.26/hello')
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

    // Llama a sendHelloWorld cada 5 segundos para enviar "Hola Mundo" al microcontrolador
    setInterval(sendHelloWorld, 5000);

    // Llama a sendHelloWorld inmediatamente para enviar el primer mensaje
    sendHelloWorld();
});