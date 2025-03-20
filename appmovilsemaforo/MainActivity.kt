package com.example.cemaforo

import android.os.Bundle
import android.util.Log
import android.view.MotionEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.cemaforo.ui.theme.CemaforoTheme
import okhttp3.*
import org.osmdroid.config.Configuration
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import java.io.IOException

class MainActivity : ComponentActivity() {
    private lateinit var mapView: MapView
    private var vehicleMarker: Marker? = null
    private var vehicleLatLng: GeoPoint = GeoPoint(-15.7942, -47.8822) // Coordenadas de Brasilia, Brasil

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Configuration.getInstance().load(this, getPreferences(MODE_PRIVATE))
        setContent {
            CemaforoTheme {
                MapScreen()
            }
        }
    }

    @Composable
    fun MapScreen() {
        var lat by remember { mutableStateOf(vehicleLatLng.latitude) }
        var lng by remember { mutableStateOf(vehicleLatLng.longitude) }
        var selectedVehicle by remember { mutableStateOf("Seleccionar vehiculo") }
        val vehicleOptions = listOf("Bombero", "Ambulancia", "Policia", "Vehiculo de Gobierno", "Presidencial")

        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            AndroidView(factory = { context ->
                mapView = MapView(context).apply {
                    setMultiTouchControls(true)
                    controller.setZoom(4.0)
                    controller.setCenter(GeoPoint(-15.7942, -47.8822)) // Centro en América Latina
                    setOnTouchListener { _, event ->
                        if (event.pointerCount == 1 && event.action == MotionEvent.ACTION_UP && event.eventTime - event.downTime < 200) {
                            val geoPoint = mapView.projection.fromPixels(event.x.toInt(), event.y.toInt()) as GeoPoint
                            moveMarkerTo(geoPoint.latitude, geoPoint.longitude) { newLat, newLng ->
                                lat = newLat
                                lng = newLng
                                Log.d("MapPosition", "Vehiculo: $selectedVehicle, Latitud: $newLat, Longitud: $newLng")
                                sendLocationData(newLat, newLng, selectedVehicle)
                            }
                        }
                        false
                    }
                }
                mapView
            }, modifier = Modifier.weight(1f))

            Text(text = "Latitud: %.6f, Longitud: %.6f".format(lat, lng))

            VehicleDropdownMenu(selectedVehicle, vehicleOptions) { selected ->
                selectedVehicle = selected
                Log.d("VehicleSelection", "Vehiculo seleccionado: $selectedVehicle")
            }

            CrossButtons(
                onUpClick = { moveMarker(0.0001, 0.0, lat, lng) { newLat, newLng ->
                    lat = newLat
                    lng = newLng
                    Log.d("MapPosition", "Vehiculo: $selectedVehicle, Latitud: $newLat, Longitud: $newLng")
                    sendLocationData(newLat, newLng, selectedVehicle)
                }},
                onDownClick = { moveMarker(-0.0001, 0.0, lat, lng) { newLat, newLng ->
                    lat = newLat
                    lng = newLng
                    Log.d("MapPosition", "Vehiculo: $selectedVehicle, Latitud: $newLat, Longitud: $newLng")
                    sendLocationData(newLat, newLng, selectedVehicle)
                }},
                onLeftClick = { moveMarker(0.0, -0.0001, lat, lng) { newLat, newLng ->
                    lat = newLat
                    lng = newLng
                    Log.d("MapPosition", "Vehiculo: $selectedVehicle, Latitud: $newLat, Longitud: $newLng")
                    sendLocationData(newLat, newLng, selectedVehicle)
                }},
                onRightClick = { moveMarker(0.0, 0.0001, lat, lng) { newLat, newLng ->
                    lat = newLat
                    lng = newLng
                    Log.d("MapPosition", "Vehiculo: $selectedVehicle, Latitud: $newLat, Longitud: $newLng")
                    sendLocationData(newLat, newLng, selectedVehicle)
                }}
            )
        }
    }

    @Composable
    fun VehicleDropdownMenu(selectedVehicle: String, vehicleOptions: List<String>, onVehicleSelected: (String) -> Unit) {
        var expanded by remember { mutableStateOf(false) }

        Box(modifier = Modifier.padding(16.dp)) {
            Button(onClick = { expanded = true }) {
                Text(selectedVehicle)
            }
            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                vehicleOptions.forEach { vehicle ->
                    DropdownMenuItem(
                        text = { Text(vehicle) },
                        onClick = {
                            onVehicleSelected(vehicle)
                            expanded = false
                        }
                    )
                }
            }
        }
    }

    @Composable
    fun CrossButtons(
        onUpClick: () -> Unit,
        onDownClick: () -> Unit,
        onLeftClick: () -> Unit,
        onRightClick: () -> Unit
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Button(onClick = onUpClick, modifier = Modifier.padding(8.dp)) {
                    Text("Arriba")
                }
                Row {
                    Button(onClick = onLeftClick, modifier = Modifier.padding(8.dp)) {
                        Text("Izquierda")
                    }
                    Spacer(modifier = Modifier.width(32.dp))
                    Button(onClick = onRightClick, modifier = Modifier.padding(8.dp)) {
                        Text("Derecha")
                    }
                }
                Button(onClick = onDownClick, modifier = Modifier.padding(8.dp)) {
                    Text("Abajo")
                }
            }
        }
    }

    private fun moveMarker(latStep: Double, lngStep: Double, lat: Double, lng: Double, updateCoordinates: (Double, Double) -> Unit) {
        vehicleLatLng = GeoPoint(lat + latStep, lng + lngStep)
        if (vehicleMarker == null) {
            vehicleMarker = Marker(mapView).apply {
                position = vehicleLatLng
                mapView.overlays.add(this)
            }
        } else {
            vehicleMarker!!.position = vehicleLatLng
        }
        mapView.controller.setCenter(vehicleLatLng)
        updateCoordinates(vehicleLatLng.latitude, vehicleLatLng.longitude)
    }

    private fun moveMarkerTo(lat: Double, lng: Double, updateCoordinates: (Double, Double) -> Unit) {
        vehicleLatLng = GeoPoint(lat, lng)
        if (vehicleMarker == null) {
            vehicleMarker = Marker(mapView).apply {
                position = vehicleLatLng
                mapView.overlays.add(this)
            }
        } else {
            vehicleMarker!!.position = vehicleLatLng
        }
        mapView.controller.setCenter(vehicleLatLng)
        updateCoordinates(vehicleLatLng.latitude, vehicleLatLng.longitude)
    }

    private fun sendLocationData(lat: Double, lng: Double, vehicle: String) {
        val client = OkHttpClient()

        val formBody = FormBody.Builder()
            .add("lat", lat.toString())
            .add("lng", lng.toString())
            .add("vehicle", vehicle)
            .build()

        val request = Request.Builder()
            .url("http://192.168.100.6:80/cemaforo/receive_data.php") // Reemplaza con tu dirección IP y puerto
            .post(formBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val responseData = response.body?.string()
                    Log.d("ServerResponse", "Response: $responseData")
                }
            }
        })
    }

    @Preview(showBackground = true)
    @Composable
    fun PreviewCrossButtons() {
        CemaforoTheme {
            CrossButtons(
                onUpClick = {},
                onDownClick = {},
                onLeftClick = {},
                onRightClick = {}
            )
        }
    }
}