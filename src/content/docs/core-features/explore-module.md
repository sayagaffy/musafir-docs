---
title: Explore Module - Travel Planning
description: Complete documentation of Explore module for travel planning, itinerary management, and Firebase integration
---

# Explore Module - Travel Planning

Dokumentasi lengkap implementasi Explore Module yang memungkinkan users untuk membuat, mengedit, dan mengelola rencana perjalanan dengan integrasi Firebase Firestore.

## 🏗️ Arsitektur Explore Module

### Overview

Explore Module mengintegrasikan **Firebase Firestore**, **Google Places API**, dan **Google Maps** untuk memberikan pengalaman travel planning yang comprehensive.

### Architecture Pattern

```
UI Pages ↔ ExploreController ↔ GoogleRepo ↔ Google Places API
    ↕              ↕               ↕
UserStore ↔ Firebase Firestore ↔ Location Services
```

## 📂 Struktur File Explore Module

```
lib/
├── controllers/
│   └── explore_controller.dart      # Business logic & state management
├── ui/pages/explore/
│   ├── explore_pages.dart          # Main explore page - travel plans list
│   ├── explore_search.dart         # Location search for planning
│   ├── rencana_page.dart           # Create new travel plan
│   ├── rencana_page_edit.dart      # Edit existing travel plan
│   ├── search_place.dart           # Restaurant search for itinerary
│   └── search_place2.dart          # Mosque search for itinerary
├── data/firestore/
│   └── user_store.dart             # Firebase data operations
└── routes/
    └── routes_helper.dart          # Explore module routing
```

---

## 🎮 ExploreController Deep Dive

### Lokasi File

`lib/controllers/explore_controller.dart`

### Dependencies

```dart
import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:musafir/data/repository/google_repo.dart';
```

### State Management Variables

#### 1. Location & Search State

```dart
// Place selection
RxString placeIdX = ''.obs;          // Selected place ID
int? indexUpdate = 0;                // Index for updates
String idDocument = '';              // Firebase document ID

// Coordinates
double? latX;                        // Latitude
double? lngX;                        // Longitude
```

#### 2. Text Controllers for Forms

```dart
// Travel plan form controllers
TextEditingController searchPlace = TextEditingController();    // Destination search
TextEditingController namePlan = TextEditingController();      // Plan name
TextEditingController startDtTime = TextEditingController();   // Start date/time
TextEditingController endDtTime = TextEditingController();     // End date/time
```

#### 3. Selected Items Management

```dart
// Selected restaurants and mosques for itinerary
List selectedFood = [];              // Selected restaurants
List updateSelectedFood = [];        // For edit mode
List selectedMosque = [];           // Selected mosques
List updateSelectedMosque = [];     // For edit mode
```

#### 4. Data Collections

```dart
// Google Places API results
List<dynamic> _nearbyFood = [];      // Restaurant search results
List<dynamic> get nearbyFood => _nearbyFood;

List<dynamic> _nearbyMosque = [];    // Mosque search results
List<dynamic> get nearbyMosque => _nearbyMosque;

// Loading states
bool _isLoadedFood = false;
bool _isLoadedMosque = false;
```

### Core Methods

#### 1. Location Management

##### updateLatLng() - Update Coordinates

```dart
void updateLatLng(double lat, double lng) {
  latX = lat;
  lngX = lng;
  print('Updated coordinates: $lat, $lng');
  update();
}
```

##### setTujuan() - Set Destination

```dart
void setTujuan(String placeName, String placeId) {
  searchPlace.text = placeName;
  placeIdX.value = placeId;
  print('Destination set: $placeName ($placeId)');
  update();
}
```

#### 2. Google Places API Integration

##### getNearbyPlace() - Search Places for Itinerary

```dart
Future<void> getNearbyPlace({
  String? keyword,      // Search keyword
  String? rankby,       // 'prominence' or 'distance'
  String? type,         // 'resto' or 'mosque'
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
    print('Explore Places Query: $query');

    // Make API request
    Response response = await googleRepo.getNearbyPlace(query);

    if (response.statusCode == 200) {
      if (type == 'resto') {
        _nearbyFood = [];
        _nearbyFood.addAll(NearbyPlace.fromJson(response.body).results);
        _isLoadedFood = true;
        print('Loaded ${_nearbyFood.length} restaurants');
      }
      else if (type == 'mosque') {
        _nearbyMosque = [];
        _nearbyMosque.addAll(NearbyPlace.fromJson(response.body).results);
        _isLoadedMosque = true;
        print('Loaded ${_nearbyMosque.length} mosques');
      }
    } else {
      print('API Error: ${response.statusCode}');
    }
  } catch (e) {
    print('Error in getNearbyPlace: $e');
  }

  update();
}
```

##### getGeoCodeAddress() - Geocoding for Destination

```dart
Future<void> getGeoCodeAddress(String address) async {
  try {
    print('Geocoding destination: $address');

    // Implementation untuk convert address ke coordinates
    List<Location> locations = await locationFromAddress(address);

    if (locations.isNotEmpty) {
      updateLatLng(
        locations.first.latitude,
        locations.first.longitude
      );
    }
  } catch (e) {
    print('Geocoding error: $e');
  }
}
```

#### 3. Selection Management

##### addSelectedFood() - Add Restaurant to Itinerary

```dart
void addSelectedFood(Map<String, dynamic> restaurant) {
  // Check if already selected
  bool alreadySelected = selectedFood.any(
    (food) => food['place_id'] == restaurant['place_id']
  );

  if (!alreadySelected) {
    selectedFood.add({
      'place_id': restaurant['place_id'],
      'name': restaurant['name'],
      'rating': restaurant['rating'] ?? 0.0,
      'vicinity': restaurant['vicinity'] ?? '',
      'photo_reference': restaurant['photos']?[0]['photo_reference'] ?? '',
    });

    print('Added restaurant: ${restaurant['name']}');
  } else {
    print('Restaurant already in itinerary');
  }

  update();
}
```

##### addSelectedMosque() - Add Mosque to Itinerary

```dart
void addSelectedMosque(Map<String, dynamic> mosque) {
  bool alreadySelected = selectedMosque.any(
    (m) => m['place_id'] == mosque['place_id']
  );

  if (!alreadySelected) {
    selectedMosque.add({
      'place_id': mosque['place_id'],
      'name': mosque['name'],
      'rating': mosque['rating'] ?? 0.0,
      'vicinity': mosque['vicinity'] ?? '',
      'photo_reference': mosque['photos']?[0]['photo_reference'] ?? '',
    });

    print('Added mosque: ${mosque['name']}');
  } else {
    print('Mosque already in itinerary');
  }

  update();
}
```

##### removeSelected() - Remove from Itinerary

```dart
void removeSelectedFood(String placeId) {
  selectedFood.removeWhere((food) => food['place_id'] == placeId);
  update();
}

void removeSelectedMosque(String placeId) {
  selectedMosque.removeWhere((mosque) => mosque['place_id'] == placeId);
  update();
}
```

#### 4. Clear & Reset Methods

##### clearExploreData() - Reset All Data

```dart
void clearExploreData() {
  // Clear form controllers
  searchPlace.clear();
  namePlan.clear();
  startDtTime.clear();
  endDtTime.clear();

  // Clear selections
  selectedFood.clear();
  selectedMosque.clear();
  updateSelectedFood.clear();
  updateSelectedMosque.clear();

  // Reset location
  placeIdX.value = '';
  latX = null;
  lngX = null;

  // Clear search results
  _nearbyFood.clear();
  _nearbyMosque.clear();
  _isLoadedFood = false;
  _isLoadedMosque = false;

  print('Explore data cleared');
  update();
}
```

---

## 🖥️ UI Implementation

### 1. Explore Pages (explore_pages.dart)

Main explore page yang menampilkan daftar rencana perjalanan user.

#### Key Features:

- List semua travel plans dari Firebase
- ExpansionTile untuk setiap plan
- Edit dan delete functionality
- Navigation ke maps

#### Core Functions:

##### getData() - Load User's Travel Plans

```dart
void getData() async {
  UserStore().exploreList().then((value) {
    setState(() {
      dataPlans.clear();
      for (var i in value.docs) {
        Map<String, dynamic> payload = {
          "id": i.id,
          "place_id": i.data()['place_id'],
          'place_name': i.data()['place_name'],
          'start_time': i.data()['start_time'],
          'end_time': i.data()['end_time'],
          'name_plan': i.data()['name_plan'],
          'resto': i.data()['resto'] ?? [],
          'mosque': i.data()['mosque'] ?? [],
          'lat': i.data()['lat'],
          'lng': i.data()['lng'],
        };
        dataPlans.add(payload);
      }
    });
  });
}
```

##### navigasiPeta() - Open in Maps

```dart
void navigasiPeta(int indexParent) async {
  final availableMaps = await MapLauncher.installedMaps;
  await availableMaps.first.showMarker(
    coords: Coords(
      dataPlans[indexParent]['lat'],
      dataPlans[indexParent]['lng']
    ),
    title: "${dataPlans[indexParent]['place_name']}",
  );
}
```

##### edit() - Prepare Edit Mode

```dart
void edit(int indexParent) async {
  var explorC = Get.find<ExploreController>();

  // Populate form dengan data existing
  explorC.namePlan.text = dataPlans[indexParent]['name_plan'];
  explorC.searchPlace.text = dataPlans[indexParent]['place_name'];
  explorC.startDtTime.text = dataPlans[indexParent]['start_time'];
  explorC.endDtTime.text = dataPlans[indexParent]['end_time'];
  explorC.placeIdX.value = dataPlans[indexParent]['place_id'];

  explorC.updateLatLng(
    dataPlans[indexParent]['lat'],
    dataPlans[indexParent]['lng']
  );

  // Set selected items
  explorC.selectedFood = dataPlans[indexParent]['resto'];
  explorC.selectedMosque = dataPlans[indexParent]['mosque'];
  explorC.idDocument = dataPlans[indexParent]['id'];

  // Navigate to edit page
  Get.offNamed(RouteHelper.getRencanaPageEdit());
}
```

### 2. Explore Search (explore_search.dart)

Location search page untuk memilih destinasi perjalanan.

#### Key Features:

- Google Places autocomplete search
- Location suggestions
- Integration dengan LocationController

#### Implementation:

```dart
// Search input dengan debouncing
TextFormField(
  onChanged: (value) {
    locationController.getPlace(value);
  },
  decoration: InputDecoration(
    hintText: 'Cari tujuan kamu disini',
    prefixIcon: Icon(Icons.search_rounded),
  ),
)

// Results list
GetBuilder<LocationController>(
  builder: (place) {
    return place.isLoaded
      ? ListView.builder(
          itemCount: place.getPlaces.length,
          itemBuilder: (context, index) => LocationListTile(
            press: () {
              var exploreController = Get.find<ExploreController>();
              exploreController.setTujuan(
                place.getPlaces[index].description,
                place.getPlaces[index].placeId,
              );
              exploreController.getGeoCodeAddress(
                place.getPlaces[index].description
              );
              Get.offNamed(RouteHelper.getRencanaPage());
            },
            location: place.getPlaces[index].description,
          ),
        )
      : SizedBox();
  }
)
```

### 3. Rencana Page (rencana_page.dart)

Create new travel plan page dengan form input.

#### Key Features:

- Travel plan name input
- Destination display
- Date picker untuk start/end dates
- Add restaurants dan mosques

#### Form Validation:

```dart
void validateAndProceed(String type) {
  String nameplan = exploreController.namePlan.text.trim();
  String search = exploreController.searchPlace.text.trim();
  String start = exploreController.startDtTime.text.trim();
  String end = exploreController.endDtTime.text.trim();

  if (nameplan.isEmpty) {
    DialogHelper.showSnackBar('Nama Rencana Perjalanan tidak boleh kosong');
  } else if (search.isEmpty) {
    DialogHelper.showSnackBar('Tempat Tujuan tidak boleh kosong');
  } else if (start.isEmpty) {
    DialogHelper.showSnackBar('Tanggal Berangkat tidak boleh kosong');
  } else if (end.isEmpty) {
    DialogHelper.showSnackBar('Tanggal Kembali tidak boleh kosong');
  } else {
    // Proceed dengan search
    proceedWithSearch(type);
  }
}
```

### 4. Rencana Page Edit (rencana_page_edit.dart)

Edit existing travel plan dengan data pre-populated.

#### Key Features:

- Pre-filled form dengan data existing
- Update functionality
- Same validation sebagai create mode

#### Update Function:

```dart
void updatePlace(String type) async {
  // Validation sama seperti create
  if (isFormValid()) {
    if (type == 'resto') {
      await exploreController.getNearbyPlace(
        keyword: 'resto+food',
        rankby: 'distance',
        type: 'resto',
        location: '${exploreController.latX},${exploreController.lngX}',
        radius: 2000
      );
      Get.toNamed(RouteHelper.getSearchPlaceExplore('resto_edit'));
    } else if (type == 'mosque') {
      await exploreController.getNearbyPlace(
        keyword: 'mosque',
        rankby: 'distance',
        type: 'mosque',
        location: '${exploreController.latX},${exploreController.lngX}',
        radius: 3000
      );
      Get.toNamed(RouteHelper.getSearchPlaceExplore2('mosque_edit'));
    }
  }
}
```

### 5. Search Place (search_place.dart & search_place2.dart)

Restaurant dan mosque selection pages untuk itinerary.

#### Key Features:

- List hasil search dari Google Places API
- Selection management (add/remove)
- Visual feedback untuk selected items
- Save itinerary functionality

#### Restaurant Selection (search_place.dart):

```dart
Widget buildRestaurantTile(Map<String, dynamic> restaurant, int index) {
  bool isSelected = exploreController.selectedFood.any(
    (food) => food['place_id'] == restaurant['place_id']
  );

  return ListTile(
    leading: Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        image: restaurant['photos'] != null
          ? DecorationImage(
              image: NetworkImage(
                '${AppConstants.PLACE_PHOTO}${restaurant['photos'][0]['photo_reference']}'
              ),
              fit: BoxFit.cover,
            )
          : null,
      ),
    ),
    title: Text(restaurant['name'] ?? 'Unknown'),
    subtitle: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(restaurant['vicinity'] ?? ''),
        Row(
          children: [
            Icon(Icons.star, color: Colors.orange, size: 16),
            Text('${restaurant['rating'] ?? 0.0}'),
          ],
        ),
      ],
    ),
    trailing: isSelected
      ? Icon(Icons.check_circle, color: Colors.green)
      : Icon(Icons.add_circle_outline),
    onTap: () {
      if (isSelected) {
        exploreController.removeSelectedFood(restaurant['place_id']);
      } else {
        exploreController.addSelectedFood(restaurant);
      }
    },
  );
}
```

#### Save Itinerary Function:

```dart
void saveItinerary() async {
  try {
    await UserStore().addExplore(
      placeId: exploreController.placeIdX.value,
      placeName: exploreController.searchPlace.text,
      startTime: exploreController.startDtTime.text,
      endTime: exploreController.endDtTime.text,
      namePlan: exploreController.namePlan.text,
      resto: exploreController.selectedFood,
      mosque: exploreController.selectedMosque,
      lat: exploreController.latX!,
      lng: exploreController.lngX!,
    );

    DialogHelper.showSnackBar(
      'Rencana perjalanan berhasil disimpan!',
      isError: false,
    );

    // Clear data dan navigate back
    exploreController.clearExploreData();
    Get.offNamed(RouteHelper.getExplorePage());

  } catch (e) {
    print('Error saving itinerary: $e');
    DialogHelper.showSnackBar(
      'Gagal menyimpan rencana perjalanan',
      isError: true,
    );
  }
}
```

---

## 🔗 Firebase Integration

### 1. Data Structure di Firestore

#### Collection: `explore_plans`

```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "place_name": "Tokyo, Japan",
  "start_time": "15/05/2025 16:05",
  "end_time": "21/05/2025 20:05",
  "name_plan": "Tokyo Adventure",
  "resto": [
    {
      "place_id": "ChIJxxxxxxx",
      "name": "Halal Restaurant Tokyo",
      "rating": 4.5,
      "vicinity": "Shibuya, Tokyo",
      "photo_reference": "CmRaAAAAxx..."
    }
  ],
  "mosque": [
    {
      "place_id": "ChIJyyyyyyy",
      "name": "Tokyo Camii",
      "rating": 4.8,
      "vicinity": "Shibuya, Tokyo",
      "photo_reference": "CmRaAAAAyy..."
    }
  ],
  "lat": 35.6762,
  "lng": 139.6503,
  "user_id": "firebase_user_id",
  "created_at": "2025-05-15T10:30:00Z"
}
```

### 2. UserStore Methods untuk Explore

#### addExplore() - Create New Plan

```dart
Future<void> addExplore({
  required String placeId,
  required String placeName,
  required String startTime,
  required String endTime,
  required String namePlan,
  required List resto,
  required List mosque,
  required double lat,
  required double lng,
}) async {
  try {
    await FirebaseFirestore.instance
        .collection('explore_plans')
        .add({
      'place_id': placeId,
      'place_name': placeName,
      'start_time': startTime,
      'end_time': endTime,
      'name_plan': namePlan,
      'resto': resto,
      'mosque': mosque,
      'lat': lat,
      'lng': lng,
      'user_id': FirebaseAuth.instance.currentUser?.uid,
      'created_at': FieldValue.serverTimestamp(),
    });
  } catch (e) {
    throw Exception('Failed to save travel plan: $e');
  }
}
```

#### exploreList() - Get User's Plans

```dart
Future<QuerySnapshot> exploreList() async {
  try {
    return await FirebaseFirestore.instance
        .collection('explore_plans')
        .where('user_id', isEqualTo: FirebaseAuth.instance.currentUser?.uid)
        .orderBy('created_at', descending: true)
        .get();
  } catch (e) {
    throw Exception('Failed to load travel plans: $e');
  }
}
```

#### updateExplore() - Update Existing Plan

```dart
Future<void> updateExplore({
  required String documentId,
  required Map<String, dynamic> data,
}) async {
  try {
    await FirebaseFirestore.instance
        .collection('explore_plans')
        .doc(documentId)
        .update(data);
  } catch (e) {
    throw Exception('Failed to update travel plan: $e');
  }
}
```

---

## 🔄 Integration Flows

### 1. Create New Travel Plan Flow

```
User opens Explore → Tap "Buat Rencana" →
Search destination → Fill form →
Add restaurants → Add mosques →
Save to Firebase → Success message
```

### 2. Edit Travel Plan Flow

```
User opens plan detail → Tap edit →
Pre-populate form → Modify data →
Update selections → Save changes →
Update Firebase → Success message
```

### 3. Search and Select Flow

```
Enter destination → Google Places API →
Select location → Get coordinates →
Search nearby places → Select items →
Add to itinerary → Continue planning
```

### 4. Maps Integration Flow

```
User taps "Lihat Peta" → Check available maps →
Open with coordinates → Show marker →
User can navigate dengan maps app
```

---

## 🛠️ Error Handling & Validation

### 1. Form Validation

```dart
bool validateTravelPlan() {
  if (namePlan.text.trim().isEmpty) {
    showError('Nama rencana tidak boleh kosong');
    return false;
  }

  if (searchPlace.text.trim().isEmpty) {
    showError('Destinasi harus dipilih');
    return false;
  }

  if (startDtTime.text.trim().isEmpty || endDtTime.text.trim().isEmpty) {
    showError('Tanggal perjalanan harus diisi');
    return false;
  }

  return true;
}
```

### 2. Firebase Error Handling

```dart
try {
  await saveToFirebase();
} on FirebaseException catch (e) {
  switch (e.code) {
    case 'permission-denied':
      showError('Tidak memiliki akses untuk menyimpan data');
      break;
    case 'unavailable':
      showError('Layanan tidak tersedia, coba lagi nanti');
      break;
    default:
      showError('Terjadi kesalahan: ${e.message}');
  }
} catch (e) {
  showError('Terjadi kesalahan tak terduga');
}
```

### 3. API Error Handling

```dart
try {
  await exploreController.getNearbyPlace(parameters);
} catch (e) {
  if (e.toString().contains('quota')) {
    showError('Kuota API telah habis, coba lagi nanti');
  } else if (e.toString().contains('network')) {
    showError('Periksa koneksi internet Anda');
  } else {
    showError('Gagal memuat data tempat');
  }
}
```

---

## 📊 Performance Optimizations

### 1. Lazy Loading

- Load travel plans hanya saat dibuka
- Pagination untuk large datasets
- Image loading dengan caching

### 2. State Management

- Efficient state updates dengan GetX
- Minimal rebuilds dengan proper update() calls
- Memory cleanup di onClose()

### 3. Database Optimization

- Firestore indexes untuk query performance
- Batch operations untuk multiple updates
- Offline persistence untuk better UX

---

## 🧪 Testing Scenarios

### 1. Create Travel Plan

- Valid form submission
- Invalid/empty form handling
- Network failure scenarios
- Firebase permission issues

### 2. Edit Travel Plan

- Data pre-population
- Partial updates
- Concurrent edit handling

### 3. Search Integration

- Google Places API responses
- No results handling
- API quota limits
- Location permissions

---

Dokumentasi ini mencakup implementasi lengkap Explore Module dengan semua fitur travel planning. Module ini terintegrasi penuh dengan Firebase untuk persistence dan Google APIs untuk location services.

**File location untuk dokumentasi ini:**
`src/content/docs/core-features/explore-module.md`

**Related Documentation:**

- [Home Module](./home-module.md) - Core places discovery
- [Authentication System](../authentication/authentication-system.md) - User management
- [Firebase Integration](../advanced/firebase-integration.md) - Database operations
