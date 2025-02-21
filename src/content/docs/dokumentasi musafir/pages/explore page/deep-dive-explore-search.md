# Deep Dive: explore_search.dart

## Overview
`explore_search.dart` menangani fungsionalitas pencarian dalam aplikasi Musafir. File ini mengintegrasikan Google Places API untuk pencarian lokasi dan menyediakan antarmuka pengguna untuk pencarian tempat.

## Struktur Kelas

### ExploreSearch (StatefulWidget)
```dart
class ExploreSearch extends StatefulWidget {
  const ExploreSearch({super.key});
  
  @override
  State<ExploreSearch> createState() => _ExploreSearchState();
}
```

### _ExploreSearchState
```dart
class _ExploreSearchState extends State<ExploreSearch> {
  String? address;
  var locationController = Get.find<LocationController>();
}
```

#### State Variables
- `address`: Menyimpan alamat current user
- `locationController`: Controller untuk manajemen lokasi

## Lifecycle Methods

### initState()
```dart
@override
void initState() {
  getData();
  super.initState();
}
```

## Core Functions

### getData()
```dart
void getData() async {
  UserStore().getUserDetail().then((value) {
    setState(() {
      address = value['address'] ?? 'none';
    });
  });
}
```

#### Cara Kerja:
1. Mengambil detail user dari Firestore
2. Mengupdate state dengan alamat user
3. Menghandle kasus dimana alamat tidak ada

### Location Search Integration

#### Pencarian Lokasi
```dart
TextFormField(
  onChanged: (value) {
    locationController.getPlace(value);
  },
  decoration: InputDecoration(
    hintText: 'Cari tujuan kamu disini,',
    prefixIcon: const Icon(Icons.search_rounded),
  ),
)
```

#### Menampilkan Hasil Pencarian
```dart
GetBuilder<LocationController>(
  builder: (place) {
    return place.isLoaded
      ? ListView.builder(
          itemCount: place.getPlaces.length,
          itemBuilder: (context, index) => LocationListTile(
            press: () {
              handleLocationSelect(place.getPlaces[index]);
            },
            location: place.getPlaces[index].description,
          ),
        )
      : const SizedBox();
  }
)
```

## UI Components

### header()
```dart
Widget header() {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.only(
      left: 18,
      top: 20,
      bottom: 20,
      right: 18,
    ),
    child: Column(
      children: [
        SearchBar(),
        // Other header components
      ],
    ),
  );
}
```

### listDataSearch()
```dart
Widget listDataSearch() {
  return Container(
    margin: const EdgeInsets.only(bottom: 30),
    child: Column(
      children: [
        SearchResultsList(),
        RecentSearches(),
      ],
    ),
  );
}
```

## State Management dengan GetX

### LocationController Usage
```dart
var locationController = Get.find<LocationController>();

// Mencari tempat
locationController.getPlace(searchQuery);

// Mengakses hasil pencarian
final places = locationController.getPlaces;

// Mengecek status loading
final isLoaded = locationController.isLoaded;
```

### Examples:
```dart
// Menangani pemilihan lokasi
void handleLocationSelect(Place place) {
  var exploreController = Get.find<ExploreController>();
  
  exploreController.setTujuan(
    place.description,
    place.placeId,
  );
  
  exploreController.getGeoCodeAddress(place.description);
  
  Get.offNamed(RouteHelper.getRencanaPage());
}
```

## Google Places API Integration

### Place Search
```dart
// Di LocationController
Future<void> getPlace(String placeName) async {
  try {
    final result = await placesApi.searchPlaces(placeName);
    places.value = result;
    isLoaded = true;
    update();
  } catch (e) {
    handleError(e);
  }
}
```

### Geocoding
```dart
Future<void> getGeoCodeAddress(String address) async {
  try {
    final coordinates = await geocodingApi.getCoordinates(address);
    updateLatLng(coordinates.lat, coordinates.lng);
  } catch (e) {
    handleError(e);
  }
}
```

## Error Handling

### API Errors
```dart
try {
  await locationController.getPlace(searchQuery);
} catch (e) {
  if (e is PlacesApiException) {
    DialogHelper.showError('Error searching places');
  } else {
    DialogHelper.showError('Unknown error occurred');
  }
}
```

### Validation
```dart
void validateSearch(String query) {
  if (query.isEmpty) {
    DialogHelper.showError('Search query cannot be empty');
    return;
  }
  
  if (query.length < 3) {
    DialogHelper.showError('Search query too short');
    return;
  }
  
  performSearch(query);
}
```

## Performance Optimization

### Deboun