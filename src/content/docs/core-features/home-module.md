---
title: Home Module - Core Features
description: Complete documentation of Home module implementation with Google Places API integration, location services, and UI components
---

# Home Module - Core Features

Dokumentasi lengkap implementasi Home Module yang merupakan fitur inti aplikasi Musafir untuk pencarian tempat halal dan lokasi ibadah terdekat.

## 🏗️ Arsitektur Home Module

### Overview

Home Module mengintegrasikan **Google Places API**, **Firebase Firestore**, dan **Location Services** untuk memberikan pengalaman pencarian yang seamless kepada user.

### Architecture Pattern

```
UI Pages ↔ HomeController ↔ GoogleRepo ↔ Google Places API
    ↕              ↕            ↕
UserStore ↔ Firebase ↔ LocationController
```

## 📂 Struktur File Home Module

```
lib/
├── controllers/
│   └── home_controller.dart         # Business logic & state management
├── ui/pages/home/
│   ├── home_page.dart              # Main home page
│   ├── detail_card.dart            # Place detail view
│   ├── home_search.dart            # Search functionality with categories
│   ├── llist_card.dart             # Places list view
│   ├── llist_places_card.dart      # Firebase places list
│   ├── list_kategory.dart          # Food category filters
│   ├── review_place.dart           # Place review system
│   ├── add_place.dart              # Add new place functionality
│   └── set_location.dart           # Location setting page
├── data/repository/
│   └── google_repo.dart            # Google API repository
└── routes/
    └── routes_helper.dart          # Home module routing
```

---

## 🎮 HomeController Deep Dive

### Lokasi File

`lib/controllers/home_controller.dart`

### Dependencies

```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:get/get.dart';
import 'package:musafir/data/repository/google_repo.dart';
```

### State Management Variables

#### 1. Loading States

```dart
// Global loading state
bool _loading = false;
bool get loading => _loading;

// Specific loading states untuk setiap data type
bool _isLoadedFood = false;           // Restaurant data
bool _isLoadedMosque = false;         // Mosque data
bool _isLoadedFoodKategory = false;   // Food category data
bool _isLoadAddress = false;          // Address search data
bool _isLoadedSearch = false;         // General search data
bool _isLoadedlocal = false;          // Local Firebase places data
```

#### 2. Data Collections

```dart
// Restaurant Data dari Google Places API
List<dynamic> _nearbyFood = [].obs;
List<dynamic> get nearbyFood => _nearbyFood;
String _nextPageTokenFood;           // Pagination token

// Mosque Data dari Google Places API
List<dynamic> _nearbyMosque = [].obs;
List<dynamic> get nearbyMosque => _nearbyMosque;
String _nextPageTokenMosque;         // Pagination token

// Food Category Data (filtered results)
List<dynamic> _nearbyFoodKategory = [];
List<dynamic> get nearbyFoodKategory => _nearbyFoodKategory;

// Place Details (current selected place)
dynamic _placeDtl;
dynamic get placeDtl => _placeDtl;

// Search & Address Collections
List<dynamic> _addressCollection = [];    // Geocoding results
List<dynamic> _searchPlace = [];          // Search results
List<dynamic> _localPlace = [].obs;       // Firebase local places
```

#### 3. Filter & Configuration

```dart
// Filter parameters untuk list page
String _filterType = 'default';
String get filterType => _filterType;

int _rate = 0;                       // Rating filter
int get rate => _rate;

// Location configuration
int countryId = 0;
int provinceId = 0;
int cityId = 0;
```

### Core Methods

#### 1. Lifecycle Management

```dart
@override
void onInit() {
  print('HomeController initialized');
  super.onInit();
}

@override
void onReady() {
  print('HomeController ready');
  // Load initial data jika belum ada
  if (_nearbyFood.isEmpty) {
    refreshHome();
  }
  super.onReady();
}

@override
void onClose() {
  print('HomeController disposed');
  super.onClose();
}
```

#### 2. Data Management

##### clearList() - Reset All Data

```dart
void clearList() {
  // Clear restaurant data
  if (_nearbyFood.isNotEmpty) {
    _nearbyFood.clear();
    _isLoadedFood = false;
    print('Cleared nearby food data');
  }

  // Clear mosque data
  if (_nearbyMosque.isNotEmpty) {
    _nearbyMosque.clear();
    _isLoadedMosque = false;
    print('Cleared nearby mosque data');
  }

  // Clear other collections
  if (_nearbyFoodKategory.isNotEmpty) {
    _nearbyFoodKategory.clear();
    _isLoadedFoodKategory = false;
  }

  if (_addressCollection.isNotEmpty) {
    _addressCollection.clear();
    _isLoadAddress = false;
  }

  if (_searchPlace.isNotEmpty) {
    _searchPlace.clear();
    _isLoadedSearch = false;
  }

  if (_localPlace.isNotEmpty) {
    _localPlace.clear();
    _isLoadedlocal = false;
  }

  update(); // Notify UI
}
```

##### Filter Management

```dart
void setFilterType(String value) {
  _filterType = value;
  update();
}

void setRate(int value) {
  _rate = value;
  update();
}
```

#### 3. Google Places API Integration

##### getNearbyPlace() - Core Search Function

```dart
Future<void> getNearbyPlace({
  String? keyword,      // Search keyword
  String? rankby,       // 'prominence' or 'distance'
  String? type,         // 'restaurant', 'mosque', 'food'
  String? pagetoken,    // For pagination
  String? location,     // 'lat,lng' format
  int? radius,          // Search radius in meters
}) async {
  try {
    // Build query parameters
    var k = keyword != null ? 'keyword=${keyword}&' : '';
    var r = rankby != null ? 'rankby=${rankby}&' : '';
    var t = type != null ? 'type=${type}&' : '';
    var l = location != null ? 'location=${location}&' : '';
    var rd = radius != null ? 'radius=${radius}&' : '';
    var pt = pagetoken != null ? 'pagetoken=${pagetoken}&' : '';

    var query = k + r + t + l + rd + pt;
    print('Google Places Query: $query');

    // Make API request
    Response response = await googleRepo.getNearbyPlace(query);

    if (response.statusCode == 200) {
      // Parse response based on type
      if (type == 'restaurant') {
        _nearbyFood = [];
        _nearbyFood.addAll(NearbyPlace.fromJson(response.body).results);
        _nextPageTokenFood = response.body['next_page_token'] ?? 'none';
        _isLoadedFood = true;
      }
      else if (type == 'mosque') {
        _nearbyMosque = [];
        _nearbyMosque.addAll(NearbyPlace.fromJson(response.body).results);
        _nextPageTokenMosque = response.body['next_page_token'] ?? 'none';
        _isLoadedMosque = true;
      }
      else if (type == 'food') {
        _nearbyFoodKategory = [];
        _nearbyFoodKategory.addAll(NearbyPlace.fromJson(response.body).results);
        _isLoadedFoodKategory = true;
      }

      print('Successfully loaded ${type} data: ${response.body['results'].length} places');
    } else {
      print('API Error: ${response.statusCode}');
    }
  } catch (e) {
    print('Error in getNearbyPlace: $e');
    showCustomSnackBar(
      isError: true,
      'Failed to load places. Please try again.',
      title: 'Error',
      backgroundColor: kRedColor,
    );
  }

  update();
}
```

**Usage Examples:**

```dart
// Search nearby restaurants
await homeController.getNearbyPlace(
  keyword: 'halal+restaurant',
  rankby: 'distance',
  type: 'restaurant',
  location: '-6.2088,106.8456',
  radius: 1000
);

// Search by food category
await homeController.getNearbyPlace(
  keyword: 'indian+food',
  rankby: 'distance',
  type: 'food',
  location: userLocation
);

// Search mosques nearby
await homeController.getNearbyPlace(
  keyword: 'mosque',
  rankby: 'distance',
  type: 'mosque',
  location: userLocation,
  radius: 2000
);
```

##### placeDetail() - Get Detailed Place Information

```dart
Future<void> placeDetail(String placeId) async {
  try {
    print('Fetching place detail for: $placeId');

    Response response = await googleRepo.getPlaceDetail(placeId);

    if (response.statusCode == 200) {
      _placeDtl = PlaceDetail.fromJson(response.body).result;
      print('Place detail loaded: ${_placeDtl.name}');
    } else {
      print('Failed to get place detail: ${response.statusCode}');
    }
  } catch (e) {
    print('Error getting place detail: $e');
  }

  update();
}
```

#### 4. Location Services & Geocoding

##### getGeoCodeAddress() - Convert Address to Coordinates

```dart
Future<void> getGeoCodeAddress(String address, String type) async {
  try {
    print('Geocoding address: $address');

    List<Location> locations = await locationFromAddress(address);

    if (locations.isNotEmpty) {
      double lat = locations.first.latitude;
      double lng = locations.first.longitude;

      print('Geocoded coordinates: $lat, $lng');

      if (type == 'setLoc') {
        // Update user location
        await setUserLocation(lat, lng);
      }
      // Handle other types as needed
    }
  } catch (e) {
    print('Geocoding error: $e');
  }
}
```

##### setAddress() - Reverse Geocoding

```dart
Future<void> setAddress(double lat, double lng, String type) async {
  try {
    List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);

    if (placemarks.isNotEmpty) {
      Placemark placemark = placemarks.first;
      String address = '${placemark.street}, ${placemark.locality}, ${placemark.country}';

      print('Reverse geocoded address: $address');

      // Update address based on type
      if (type == 'set') {
        // Save to user preferences
        await saveUserAddress(address, lat, lng);
      }
    }
  } catch (e) {
    print('Reverse geocoding error: $e');
  }
}
```

##### distance() - Calculate Distance Between Places

```dart
Future<String> distance(String destinations, String origins) async {
  try {
    Response response = await googleRepo.getDistance(origins, destinations);

    if (response.statusCode == 200) {
      var data = response.body;
      String distance = data['rows'][0]['elements'][0]['distance']['text'];
      return distance;
    }
  } catch (e) {
    print('Distance calculation error: $e');
  }

  return '0 km';
}
```

#### 5. Search Functionality

##### getSearchPlace() - Place Search with Debouncing

```dart
final debouncer = Debouncer(duration: Duration(milliseconds: 300));

Future<void> getSearchPlace(String textSearch, String latlang) async {
  debouncer.run(() async {
    if (textSearch.isEmpty) return;

    try {
      String query = 'input=${textSearch}&location=${latlang}';
      Response response = await googleRepo.getSearchPlace(query);

      if (response.statusCode == 200) {
        _searchPlace = [];
        _searchPlace.addAll(SearchPlace.fromJson(response.body).predictions);
        _isLoadedSearch = true;

        print('Search results: ${_searchPlace.length} places found');
      }
    } catch (e) {
      print('Search error: $e');
    }

    update();
  });
}
```

### Debouncer Class

```dart
class Debouncer {
  final Duration duration;
  Timer? _timer;

  Debouncer({required this.duration});

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(duration, action);
  }
}
```

---

## 🖥️ UI Implementation

### 1. Home Page (home_page.dart)

Main landing page yang menampilkan kategori makanan dan rekomendasi tempat terdekat.

**Key Features:**

- Deteksi lokasi otomatis
- Kategori makanan (Algerian, Indian, Japan, Bakery)
- Rekomendasi restoran terdekat
- Masjid terdekat

### 2. Home Search (home_search.dart)

Search page dengan kategori dan filter.

**Implementation Example:**

```dart
// Kategori pencarian makanan
GestureDetector(
  onTap: () async {
    homeController.getNearbyPlace(
      keyword: 'algerian+food',
      rankby: 'distance',
      type: 'food',
      location: latLang,
    );
    Get.toNamed(
      RouteHelper.getHomeListPage('filterList_food', 'Algerian'),
    );
  },
  child: const TileTagsSearch(title: 'Algerian'),
)
```

### 3. Detail Card (detail_card.dart)

Detailed view untuk setiap tempat yang dipilih.

**Features:**

- Photo gallery
- Place information (nama, tipe, rating)
- Reviews dan ratings
- Navigation ke maps
- Add to favorites

### 4. List Cards (llist_card.dart & llist_places_card.dart)

List view untuk menampilkan hasil pencarian.

**Features:**

- Infinite scrolling dengan pagination
- Filter berdasarkan rating
- Sorting berdasarkan jarak
- Firebase dan Google Places integration

---

## 🔄 Integration Flows

### 1. Initial Home Load Flow

```
User opens app → onReady() → refreshHome() →
getNearbyPlace(restaurants) → getNearbyPlace(mosques) →
Update UI with results
```

### 2. Search Flow

```
User types search → getSearchPlace() (debounced) →
Google Places API → Update search results →
User selects → placeDetail() → Navigate to detail
```

### 3. Category Selection Flow

```
User taps category → getNearbyPlace(keyword + type) →
Navigate to list page → Display filtered results
```

### 4. Location Update Flow

```
User changes location → setAddress() → getGeoCodeAddress() →
clearList() → refreshHome() → Reload nearby places
```

---

## 🛠️ Error Handling & Best Practices

### 1. API Error Handling

```dart
try {
  Response response = await googleRepo.getNearbyPlace(query);
  // Handle response
} catch (e) {
  print('API Error: $e');
  showCustomSnackBar(
    isError: true,
    'Failed to load data. Please check your connection.',
    title: 'Error'
  );
}
```

### 2. Loading States

```dart
// Show loading
_loading = true;
update();

// Hide loading after operation
_loading = false;
update();
```

### 3. Memory Management

```dart
@override
void onClose() {
  // Cancel timers
  debouncer._timer?.cancel();

  // Clear large collections
  clearList();

  super.onClose();
}
```

---

## 📊 Performance Considerations

### 1. Data Caching

- Results di-cache untuk menghindari duplicate API calls
- Pagination tokens disimpan untuk infinite scrolling

### 2. Memory Optimization

- clearList() method untuk clean up data
- Observable lists untuk reactive UI updates

### 3. Network Optimization

- Debouncing untuk search queries
- Error retry mechanism
- Timeout handling

---

## 🧪 Testing & Debugging

### Debug Tips

1. Monitor API calls dengan log statements
2. Check loading states untuk UI debugging
3. Verify location permissions
4. Test dengan berbagai network conditions

### Common Issues

1. **Empty Results**: Check API key dan location permissions
2. **Slow Loading**: Implement timeout dan retry logic
3. **Memory Leaks**: Ensure proper disposal di onClose()

---

Dokumentasi ini mencakup implementasi lengkap Home Module. Untuk detail spesifik UI components dan styling, silakan merujuk ke file-file individual di folder `lib/ui/pages/home/`.

**File location untuk dokumentasi ini:**
`src/content/docs/core-features/home-module.md`
