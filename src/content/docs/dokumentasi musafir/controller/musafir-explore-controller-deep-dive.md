---
title: Explore Controller Deep Dive
description: Penjelasan mendalam tentang Explore Controller
---

# Deep Dive: Explore Controller

## Overview
ExploreController adalah komponen yang menangani fitur eksplorasi tempat dalam aplikasi Musafir. Controller ini fokus pada pencarian tempat, manajemen lokasi, dan integrasi dengan Google Places API.

## Dependency Injection & Setup

```dart
class ExploreController extends GetxController implements GetxService {
  GoogleRepo googleRepo;
  ExploreController({required this.googleRepo});
}
```

## Komponen State Management

### 1. Location & Search State
```dart
RxString placeIdX = ''.obs;          // ID tempat yang dipilih
int? indexUpdate = 0;                // Index untuk update
String idDocument = '';              // ID dokumen
double? latX;                        // Latitude
double? lngX;                        // Longitude
```

### 2. Text Controllers
```dart
TextEditingController searchPlace = TextEditingController();   // Input pencarian
TextEditingController namePlan = TextEditingController();     // Nama rencana
TextEditingController startDtTime = TextEditingController();  // Waktu mulai
TextEditingController endDtTime = TextEditingController();    // Waktu selesai
```

### 3. Selected Items Management
```dart
List selectedFood = [];           // Makanan yang dipilih
List updateSelectedFood = [];     // Update makanan terpilih
List selectedMosque = [];        // Masjid yang dipilih
List updateSelectedMosque = [];  // Update masjid terpilih
```

## Deep Dive: Core Functionalities

### 1. Nearby Place Search
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
   var k = keyword != null ? 'keyword=$keyword&' : '';
   var r = rankby != null ? 'rankby=$rankby&' : '';
   var t = type != null ? 'type=$type&' : '';
   var l = location != null ? 'location=$location&' : '';
   var rd = radius != null ? 'radius=$radius&' : '';
   var pt = pagetoken != null ? 'pagetoken=$pagetoken&' : '';
   var query = k + r + t + l + rd + pt;
   ```
   - Membangun query string secara dinamis
   - Handle parameter opsional

2. **API Request**
   ```dart
   Response response = await googleRepo.getNearbyPlace(query);
   ```
   - Menggunakan GoogleRepo untuk request
   - Handle response async

3. **Response Processing**
   ```dart
   if (response.statusCode == 200) {
     if (type == 'resto') {
       _nearbyFood = [];
       _nearbyFood.addAll(NearbyPlace.fromJson(response.body).results);
       _nextPageTokenFood = response.body['next_page_token'] ?? 'none';
       _isLoadedFood = true;
     }
   }
   ```
   - Parsing response JSON
   - Update state berdasarkan tipe
   - Handle pagination token

### 2. Geocoding Service
```dart
Future<void> getGeoCodeAddress(String address)
```

#### Implementasi Detail:
1. **Request Process**
   ```dart
   Response response = await googleRepo.getGeocodeAddress(address);
   ```
   - Convert alamat ke koordinat

2. **State Update**
   ```dart
   _geoCode = [];
   _geoCode.addAll(Geocode.fromJson(response.body).results);
   _latLng = LatLng(
     geoCode[0].geometry.location.lat,
     geoCode[0].geometry.location.lng
   );
   ```
   - Update koordinat
   - Set state lokasi

### 3. Location Management
```dart
void setTujuan(String description, String placeId) {
  placeIdX.value = placeId;
  searchPlace.text = description;
  update();
}

void updateLatLng(double lat, double lng) {
  _latLng = LatLng(lat, lng);
  update();
}
```

### 4. State Clearing
```dart
void clearAll() async {
  searchPlace.clear();
  placeIdX.value = '';
  startDtTime.clear();
  endDtTime.clear();
  namePlan.clear();
  selectedFood.clear();
  selectedMosque.clear();
  setLatLng();
}
```

## Loading States Management

### 1. Restaurant Data
```dart
bool _isLoadedFood = false;
List<dynamic> _nearbyFood = [].obs;
String _nextPageTokenFood;
```

### 2. Mosque Data
```dart
bool _isLoadedMosque = false;
List<dynamic> _nearbyMosque = [].obs;
String _nextPageTokenMosque;
```

## Integration Points

### 1. Google Places API
- Nearby Search
- Place Details
- Geocoding

### 2. Maps Integration
- Location Updates
- Coordinate Management

### 3. State Management
- GetX Reactive State
- Observable Lists

## Error Handling & Edge Cases

### 1. API Errors
```dart
if (response.statusCode != 200) {
  // Handle API error
  update();
  return;
}
```

### 2. Empty Results
```dart
if (_nearbyFood.isEmpty) {
  // Handle no results
  update();
  return;
}
```

### 3. Location Errors
```dart
if (_latLng == null) {
  // Handle missing location
  return;
}
```

## Contoh Penggunaan Komprehensif

### 1. Setup Controller
```dart
final exploreC = Get.put(ExploreController(googleRepo: Get.find()));
```

### 2. Pencarian Tempat Terdekat
```dart
// Cari restoran terdekat
await exploreC.getNearbyPlace(
  keyword: "restaurant",
  type: "resto",
  location: "${_latLng.latitude},${_latLng.longitude}",
  radius: 1000
);

// Cari masjid terdekat
await exploreC.getNearbyPlace(
  type: "mosque",
  location: "${_latLng.latitude},${_latLng.longitude}",
  radius: 500
);
```

### 3. Update Lokasi
```dart
exploreC.setTujuan("Lokasi Baru", "place_id_123");
exploreC.updateLatLng(-6.2088, 106.8456);
```

### 4. Observing Changes
```dart
Obx(() => 
  ListView.builder(
    itemCount: exploreC.nearbyFood.length,
    itemBuilder: (context, index) {
      var place = exploreC.nearbyFood[index];
      return ListTile(
        title: Text(place.name),
        subtitle: Text(place.vicinity),
      );
    },
  )
);
```

## Tips dan Best Practices

### 1. Resource Management
```dart
@override
void onClose() {
  searchPlace.dispose();
  namePlan.dispose();
  startDtTime.dispose();
  endDtTime.dispose();
  super.dispose();
}
```

### 2. State Updates
```dart
// Gunakan update() untuk memicu rebuild
void someFunction() {
  // Update state
  update();
}

// Gunakan .obs untuk reactive state
final count = 0.obs;
```

### 3. Error Prevention
```dart
// Selalu check null
void updateLocation() {
  if (_latLng != null) {
    // Process location
  }
}
```

## Testing Scenarios

### 1. API Integration
- Successful API calls
- Error handling
- Rate limiting

### 2. State Management
- State updates
- State clearing
- State persistence

### 3. User Interactions
- Search functionality
- Location updates
- Selection management

## Debugging Tips

### 1. State Monitoring
```dart
void trigerUpdate() async {
  print('Current State:');
  print('Place ID: ${placeIdX.value}');
  print('Selected Food: $selectedFood');
  print('Selected Mosque: $selectedMosque');
  update();
}
```

### 2. API Response Logging
```dart
print('API Response:');
print('Status Code: ${response.statusCode}');
print('Body: ${response.body}');
```

### 3. Error Tracking
```dart
try {
  // API call
} catch (e) {
  print('Error in getNearbyPlace: $e');
  // Handle error
}
```
