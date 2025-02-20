---
title: Deep Dive Google Controller
description: Penjelasan lebih lanjut tentang google controller di musafir app.
---

# Deep Dive: Google Controller

## Overview
GoogleController adalah komponen inti yang menangani semua interaksi dengan Google Maps API dan layanan lokasi Google. Controller ini bertanggung jawab untuk geocoding, pencarian tempat, dan manajemen lokasi.

## Dependency Injection & Setup

```dart
class GoogleController extends GetxController {
  final GoogleRepo googleRepo;
  final Debouncer debouncer = Debouncer(duration: const Duration(seconds: 1));
  
  GoogleController({required this.googleRepo});
}
```

## State Management

### 1. Loading States
```dart
bool _isLoaded = false;        // Status loading umum
bool _isLoadedFood = false;    // Status loading restoran
bool _isLoadedMosque = false;  // Status loading masjid
```

### 2. Data States
```dart
List<dynamic> _geoCode = [];      // Data geocoding
List<dynamic> _getPlaces = [];    // Data hasil pencarian tempat
List<dynamic> _nearbyPlaces = []; // Data tempat terdekat
List<dynamic> _nearbyMosque = []; // Data masjid terdekat
List<dynamic> _nearbyFood = [];   // Data restoran terdekat
```

### 3. Pagination States
```dart
late String _nextPageTokenMosque; // Token pagination masjid
late String _nextPageTokenFood;   // Token pagination restoran
```

### 4. Filter States
```dart
String _filterType = 'default';   // Tipe filter aktif
int _rate = 0;                   // Rating filter
```

## Deep Dive: Core Functionalities

### 1. Geocoding Service
```dart
Future<void> getGeoCode()
Future<void> getGeoCodelatLng(LatLng latLng)
Future<void> getGeoCodeAddress(String address)
```

#### Implementasi Detail:

1. **Get Geocode from Default Location**
```dart
Future<void> getGeoCode() async {
  Response response = await googleRepo.getGeocode(
    const LatLng(-6.233636722968254, 106.85436441344)
  );
  
  if (response.statusCode == 200) {
    _geoCode = [];
    _geoCode.addAll(Geocode.fromJson(response.body).results);
    _isLoaded = true;
    update();
  }
}
```

2. **Get Geocode from LatLng**
```dart
Future<void> getGeoCodelatLng(LatLng latLng) async {
  Response response = await googleRepo.getGeocode(latLng);
  
  if (response.statusCode == 200) {
    _geoCode = [];
    _geoCode.addAll(Geocode.fromJson(response.body).results);
    
    setAddressAndLatlng(
      geoCode[0].formattedAddress,
      geoCode[0].geometry.location.lat,
      geoCode[0].geometry.location.lng
    );
    
    _isLoaded = true;
    update();
  }
}
```

### 2. Places Search Service
```dart
Future<void> getNearbyPlace({
  String? keyword,
  String? rankby,
  String? type,
  String? pagetoken,
  String? location,
  int? radius,
})
```

#### Implementasi Detail:

1. **Query Building**
```dart
var k = keyword != null ? 'keyword=${keyword}&' : '';
var r = rankby != null ? 'rankby=${rankby}&' : '';
var t = type != null ? 'type=${type}&' : '';
var l = location != null ? 'location=${location}&' : '';
var rd = radius != null ? 'radius=${radius}&' : '';
var pt = pagetoken != null ? 'pagetoken=${pagetoken}&' : '';
var query = k + r + t + l + rd + pt;
```

2. **Request Processing**
```dart
Response response = await googleRepo.getNearbyPlace(query);

if (response.statusCode == 200) {
  if (type == 'restaurant') {
    _nearbyFood = [];
    _nearbyFood.addAll(NearbyPlace.fromJson(response.body).results);
    _nextPageTokenFood = response.body['next_page_token'];
    _isLoadedFood = true;
  }

  if (type == 'mosque') {
    _nearbyMosque = [];
    _nearbyMosque.addAll(NearbyPlace.fromJson(response.body).results);
    _nextPageTokenMosque = response.body['next_page_token'] ?? 'none';
    _isLoadedMosque = true;
  }
  
  update();
}
```

### 3. Place Search with Debouncing
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

## Filter Management

### 1. Type Filter
```dart
void setFilterType(String value) {
  _filterType = value;
  update();
}
```

### 2. Rating Filter
```dart
void setRate(int value) {
  _rate = value;
  update();
}
```

## Debouncer Implementation

```dart
class Debouncer {
  final Duration duration;
  Timer? _timer;

  Debouncer({required this.duration});

  void run(VoidCallback action) {
    bool isActive = _timer?.isActive ?? false;
    
    if (isActive) {
      _timer?.cancel();
    }
    _timer = Timer(duration, action);
  }
}
```

## Error Handling & Edge Cases

### 1. API Error Handling
```dart
try {
  Response response = await googleRepo.getNearbyPlace(query);
  if (response.statusCode != 200) {
    // Handle error response
    return;
  }
} catch (e) {
  print('Error in getNearbyPlace: $e');
  // Handle exception
}
```

### 2. Null Safety Implementation
```dart
String get nextPageTokenFood => _nextPageTokenFood ?? 'none';
List<dynamic> get nearbyFood => List.from(_nearbyFood);
```

## Contoh Penggunaan Komprehensif

### 1. Setup Controller
```dart
final googleC = Get.put(GoogleController(googleRepo: Get.find()));
```

### 2. Pencarian Tempat
```dart
// Cari tempat berdasarkan query
TextField(
  onChanged: (value) {
    googleC.getPlace(value);
  },
)

// Tampilkan hasil
Obx(() => 
  ListView.builder(
    itemCount: googleC.getPlaces.length,
    itemBuilder: (context, index) {
      return ListTile(
        title: Text(googleC.getPlaces[index].description),
      );
    },
  )
)
```

### 3. Pencarian Tempat Terdekat
```dart
// Cari restoran terdekat
await googleC.getNearbyPlace(
  type: 'restaurant',
  location: '$lat,$lng',
  radius: 1000,
);

// Tampilkan hasil
if (googleC.isLoadedFood) {
  ListView.builder(
    itemCount: googleC.nearbyFood.length,
    itemBuilder: (context, index) {
      return PlaceCard(place: googleC.nearbyFood[index]);
    },
  );
}
```

## Integration dengan Maps

### 1. Geocoding
```dart
// Convert koordinat ke alamat
await googleC.getGeoCodelatLng(LatLng(-6.2088, 106.8456));

// Convert alamat ke koordinat
await googleC.getGeoCodeAddress("Jl. Sudirman No. 1");
```

### 2. Place Details
```dart
// Get detail tempat
final place = googleC.getPlaces[0];
final details = await googleC.getPlaceDetails(place.placeId);
```

## Tips dan Best Practices

### 1. Efficient API Usage
```dart
// Gunakan debouncer untuk search
TextField(
  onChanged: (value) {
    // Akan menunggu 1 detik sebelum request API
    googleC.getPlace(value);
  },
)
```

### 2. State Management
```dart
// Update UI saat data berubah
Obx(() => 
  googleC.isLoaded
    ? ResultWidget()
    : LoadingWidget()
)
```

### 3. Error Prevention
```dart
// Selalu check status response
if (response.statusCode == 200 && response.body != null) {
  // Process data
}
```

## Testing Scenarios

### 1. API Integration Tests
- Successful API calls
- Error responses
- Rate limiting
- Invalid parameters

### 2. State Management Tests
- Loading states
- Data updates
- Filter changes

### 3. Edge Cases
- Empty responses
- Network timeouts
- Invalid coordinates

## Debugging Tips

### 1. Response Logging
```dart
print('API Response:');
print('Status: ${response.statusCode}');
print('Body: ${response.body}');
```

### 2. State Tracking
```dart
print('Current State:');
print('Places: ${_getPlaces.length}');
print('Next Token: $_nextPageTokenFood');
```

### 3. Filter Debugging
```dart
print('Filter State:');
print('Type: $_filterType');
print('Rating: $_rate');
```

