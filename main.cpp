#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// Replace with your network credentials
const char* ssid = "Inti2024";
const char* password = "1234NKevin";

// Create an instance of the server
ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  delay(10);

  Serial.println("Setup started");

  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts > 20) { // Timeout after 10 seconds
      Serial.println("Failed to connect to WiFi");
      return;
    }
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: http://");
  Serial.println(WiFi.localIP());

  // Define the handling function for the /hello route
  server.on("/hello", []() {
    Serial.println("Received request for /hello");
    server.send(200, "text/plain", "Hola Mundo");
  });

  // Start the server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  // Handle client requests
  server.handleClient();
}