---
title: "Location Controller Deep Dive"
description: "Penjelasan Mendalam tentang location controller di musafir app."
---

# Deep Dive: Location Controller

## Overview
LocationController adalah komponen yang menangani semua aspek lokasi pengguna, termasuk permission handling, geolocation tracking, dan reverse geocoding. Controller ini mengintegrasikan Geolocator package dengan Google Maps untuk memberikan pengalaman lokasi yang lengkap.

## Dependency Injection & Setup

```dart
class LocationController extends GetxController implements GetxService {
  GoogleRepo googleRepo;
  LocationController({required this.googleRepo});
}
```

## State Management

### 1. Search & Place States
```dart
final Debouncer debouncer = Debouncer(duration: const Duration(seconds: 1));
List<dynamic> _getPlaces = [];    // Hasil pencarian tempat
List<dynamic> _geoCode = [];      // Data geocoding
bool _isLoaded = false;           // Status loading
```

### 2. Location States
```dart
String _address = 'none';         // Alamat saat ini
LatLng? _latLng;                 // Koordinat saat ini
Position _position;              // Posisi dari Geolocator
```

### 3. Permission States
```dart
bool _serviceEnabled;             // Status layanan lokasi
LocationPermission _permission;   // Status izin lokasi
```

## Deep Dive: Core Functionalities

### 1. Location Permission Management
```dart
Future<void> determinePosition() async {
  bool serviceEnabled;
  LocationPermission permission;

  // 1. Check service status
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    return Future.error('Location services are disabled.');
  }

  // 2. Check permission status
  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      return Future.error('Location permissions are denied');
    }
  }

  // 3. Handle permanent denial
  if (permission == LocationPermission.deniedForever) {
    return Future.error(
      'Location permissions are permanently denied, we cannot request permissions.');
  }

  // 4. Get position and set state
  Position position = await Geolocator.getCurrentPosition();
  setPermision(serviceEnabled, permission, position);
  startedPosition();
}
```

### 2. Current Location Tracking
```dart
Future<void> getCurrentPosition() async {
  final hasPermission = _serviceEnabled;
  if (!hasPermission) return;

  await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high
  ).then((Position position) {
    _position = position;
    _latLng = LatLng(position.latitude, position.longitude);

    final homeC = Get.find<HomeController>();
    homeC.setAddress(position.latitude, position.longitude, 'get');
  }).catchError((e) {
    debugPrint(e);
  });
}
```

### 3. Geocoding Services

#### Reverse Geocoding (LatLng to Address)
```dart
Future<void> getGeoCodelatLng(LatLng latLng) async {
  Response response = await googleRepo.getGeocode(latLng);

  if (response.statusCode == 200) {
    _geoCode = [];
    _geoCode.addAll(Geocode.fromJson(response.body).results);

    _latLng = LatLng(
      geoCode[0].geometry.location.lat,
      geoCode[0].geometry.location.lng
    );

    _address = geoCode[0].formattedAddress;
    _isLoaded = true;
    update();
  }
}
```

#### Forward Geocoding (Address to LatLng)
```dart
Future<void> getGeoCodeAddress(String address) async {
  Response response = await googleRepo.getGeocodeAddress(address);

  if (response.statusCode == 200) {
    _geoCode = [];
    _geoCode.addAll(Geocode.fromJson(response.body).results);

    _latLng = LatLng(
      geoCode[0].geometry.location.lat,
      geoCode[0].geometry.location.lng
    );

    _address = geoCode[0].formattedAddress;
    _isLoaded = true;
    update();
  }
}
```

### 4. Place Search with Debouncing
```dart
Future<void> getPlace(String query) async {
  debouncer.run(() async {
    Response response = await googleRepo.getPlace(query);
    if (response.statusCode == 200) {
      _getPlaces = [];
      _getPlaces.addAll(GetPlaces.fromJson(response.body).predictions);
      _isLoaded = true;
      update();
    }
  });
}
```

## Location Initialization & Setup

### 1. Started Position
```dart
Future<void> startedPosition() async {
  final hasPermission = _serviceEnabled;
  if (!hasPermission) return;

  await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high
  ).then((Position position) {
    position = position;
    _latLng = LatLng(position.latitude, position.longitude);
  }).catchError((e) {
    debugPrint(e);
  });
}
```

### 2. Permission Setup
```dart
void setPermision(bool serviceE, LocationPermission permis, Position position) {
  _serviceEnabled = serviceE;
  _permission = permis;
  _latLng = LatLng(position.latitude, position.longitude);
}
```

## Error Handling & Edge Cases

### 1. Location Service Errors
```dart
if (!serviceEnabled) {
  return Future.error('Location services are disabled.');
}
```

### 2. Permission Errors
```dart
if (permission == LocationPermission.denied) {
  permission = await Geolocator.requestPermission();
  if (permission == LocationPermission.denied) {
    return Future.error('Location permissions are denied');
  }
}
```

### 3. API Errors
```dart
try {
  Response response = await googleRepo.getGeocode(latLng);
  if (response.statusCode != 200) {
    // Handle error response
    return;
  }
} catch (e) {
  debugPrint('Error in getGeocode: $e');
}
```

## Contoh Penggunaan Komprehensif

### 1. Setup Controller
```dart
final locationC = Get.put(LocationController(googleRepo: Get.find()));
```

### 2. Initialize Location Services
```dart
Future<void> initializeLocation() async {
  await locationC.determinePosition();
  await locationC.getCurrentPosition();
}
```

### 3. Location Updates
```dart
// Get current location
ElevatedButton(
  onPressed: () async {
    await locationC.getCurrentPosition();
    print('Current Location: ${locationC.latlng}');
  },
  child: Text('Get Location'),
)

// Show current address
Obx(() => Text(locationC.address))
```

### 4. Place Search Implementation
```dart
TextField(
  onChanged: (value) {
    locationC.getPlace(value);
  },
)

Obx(() => 
  ListView.builder(
    itemCount: locationC.getPlaces.length,
    itemBuilder: (context, index) {
      return ListTile(
        title: Text(locationC.getPlaces[index].description),
        onTap: () {
          locationC.getGeoCodeAddress(
            locationC.getPlaces[index].description
          );
        },
      );
    },
  )
)
```

## Integration dengan Maps

### 1. Map Controller Integration
```dart
GoogleMapController? mapController;

void onMapCreated(GoogleMapController controller) {
  mapController = controller;
  getCurrentPosition();
}
```

### 2. Camera Updates
```dart
void updateCamera() {
  if (mapController != null && _latLng != null) {
    mapController!.animateCamera(
      CameraUpdate.newLatLng(_latLng!)
    );
  }
}
```

## Tips dan Best Practices

### 1. Permission Handling
```dart
// Check permissions before accessing location
Future<bool> checkPermissions() async {
  bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    // Show dialog to enable location services
    return false;
  }
  return true;
}
```

### 2. Efficient Updates
```dart
// Use debouncing for search
TextField(
  onChanged: (value) {
    // Akan delay 1 detik sebelum request
    locationC.getPlace(value);
  },
)
```

### 3. State Updates
```dart
// Force update UI
void forceUpdate() {
  update();
}
```

## Testing Scenarios

### 1. Permission Tests
- Location service enabled/disabled
- Permission granted/denied
- Permission denied forever

### 2. Location Updates
- Get current location
- Location accuracy
- Location updates frequency

### 3. Geocoding Tests
- Forward geocoding
- Reverse geocoding
- Invalid addresses/coordinates

## Debugging Tips

### 1. Location State Logging
```dart
print('Location State:');
print('Service Enabled: $_serviceEnabled');
print('Permission: $_permission');
print('Current Position: $_latLng');
```

### 2. Address State Tracking
```dart
print('Address State:');
print('Current Address: $_address');
print('Geocode Results: ${_geoCode.length}');
```

### 3. Permission Debugging
```dart
print('Permission State:');
print('Location Permission: ${await Geolocator.checkPermission()}');
print('Service Enabled: ${await Geolocator.isLocationServiceEnabled()}');
```

## Security Considerations

### 1. Permission Best Practices
- Request permissions only when needed
- Handle denial gracefully
- Provide clear reasoning for location access

### 2. Data Handling
- Clear location data when not needed
- Don't store sensitive location information
- Use secure transmission methods

### 3. User Privacy
- Allow users to disable location tracking
- Clear communication about location usage
- Option to use approximate location
