---
title: "Deep Dive: explore_search.dart"
description: "explores_search deep dive"
---
# Deep Dive: explore_search.dart

## Performance Optimization

### Debouncing Search Input
```dart
TextFormField(
  onChanged: (value) {
    if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      locationController.getPlace(value);
    });
  },
)
```

### Lazy Loading Results
```dart
ListView.builder(
  physics: const NeverScrollableScrollPhysics(),
  shrinkWrap: true,
  itemCount: place.getPlaces.length,
  itemBuilder: (context, index) => LocationListTile(...)
)
```

## Gesture Handling

### Location Selection
```dart
LocationListTile(
  press: () {
    var exploreController = Get.find<ExploreController>();
    exploreController.setTujuan(
      place.getPlaces[index].description,
      place.getPlaces[index].placeId,
    );
    exploreController.getGeoCodeAddress(place.getPlaces[index].description);
    Get.offNamed(RouteHelper.getRencanaPage());
  },
  location: place.getPlaces[index].description,
)
```

## Navigation Logic

### Back Navigation
```dart
GestureDetector(
  onTap: () {
    Get.back();
  },
  child: const Icon(Icons.keyboard_backspace_rounded)
)
```

### Forward Navigation
```dart
void handleLocationSelect(Place place) {
  exploreController.setTujuan(place.description, place.placeId);
  exploreController.getGeoCodeAddress(place.description);
  Get.offNamed(RouteHelper.getRencanaPage());
}
```

## State Management dengan GetX

### Controller Integration
```dart
class _ExploreSearchState extends State<ExploreSearch> {
  String? address;
  var locationController = Get.find<LocationController>();

  @override
  void initState() {
    getData();
    super.initState();
  }
}
```

### Reactive State Updates
```dart
GetBuilder<LocationController>(
  builder: (place) {
    return place.isLoaded
      ? SearchResults(places: place.getPlaces)
      : EmptyState();
  }
)
```

## Error Handling

### Network Errors
```dart
try {
  await locationController.getPlace(searchQuery);
} catch (e) {
  DialogHelper.showSnackBar(
    "Gagal mencari lokasi. Silakan coba lagi.",
    title: "Error"
  );
}
```

### Data Validation
```dart
void validateAddress(String? address) {
  if (address == null || address.isEmpty) {
    DialogHelper.showSnackBar(
      "Alamat tidak ditemukan",
      title: "Validasi"
    );
  }
}
```

## Best Practices

### 1. Clean Architecture
```dart
// Separation of concerns
class ExploreSearch extends StatefulWidget {
  // Widget definition
}

class _ExploreSearchState extends State<ExploreSearch> {
  // State management
}

class LocationController extends GetxController {
  // Business logic
}
```

### 2. Resource Management
```dart
@override
void dispose() {
  searchController.dispose();
  _debounceTimer?.cancel();
  super.dispose();
}
```

### 3. Consistent Error Handling
```dart
Future<void> safeOperation(Future<void> Function() operation) async {
  try {
    await operation();
  } catch (e) {
    handleError(e);
  }
}
```

## Testing Guidelines

### Widget Tests
```dart
testWidgets('ExploreSearch shows search field', (tester) async {
  await tester.pumpWidget(const ExploreSearch());
  expect(find.byType(TextFormField), findsOneWidget);
});
```

### Integration Tests
```dart
testWidgets('Can search and select location', (tester) async {
  await tester.pumpWidget(const ExploreSearch());
  await tester.enterText(find.byType(TextFormField), 'Jakarta');
  await tester.pump(Duration(milliseconds: 500));
  await tester.tap(find.byType(LocationListTile).first);
  expect(find.byType(RencanaPage), findsOneWidget);
});
```

## Tips Penggunaan

### 1. Efisiensi Pencarian
- Gunakan minimal 3 karakter untuk pencarian
- Tunggu setengah detik setelah mengetik
- Hasil pencarian diurutkan berdasarkan relevansi

### 2. Navigasi
- Back button untuk kembali ke halaman sebelumnya
- Tap hasil pencarian untuk memilih lokasi
- Auto-navigate ke halaman rencana setelah memilih

### 3. Error Recovery
- Retry pada kegagalan network
- Clear input untuk memulai pencarian baru
- Back navigation untuk cancel pencarian

## Debug Tips

### Common Issues
```dart
// Location not found
print('Address from DB: $address');
print('Location Controller state: ${locationController.latlng}');

// Search not working
print('Search query: $searchQuery');
print('API response: ${place.getPlaces}');

// Navigation issues
print('Current route: ${Get.currentRoute}');
print('Previous route: ${Get.previousRoute}');
```

### Performance Monitoring
```dart
int _startTime;
void measureSearchPerformance() {
  _startTime = DateTime.now().millisecondsSinceEpoch;
  // Perform search
  final endTime = DateTime.now().millisecondsSinceEpoch;
  print('Search took: ${endTime - _startTime}ms');
}
```

## Feature Enhancements

### 1. Recent Searches
```dart
class RecentSearches {
  static const int MAX_RECENT = 5;
  
  static Future<void> addRecent(String query) async {
    final prefs = await SharedPreferences.getInstance();
    final recent = prefs.getStringList('recent_searches') ?? [];
    if (recent.contains(query)) recent.remove(query);
    recent.insert(0, query);
    if (recent.length > MAX_RECENT) recent.removeLast();
    await prefs.setStringList('recent_searches', recent);
  }
}
```

### 2. Location Suggestions
```dart
Widget buildSuggestions() {
  return FutureBuilder<List<String>>(
    future: getSuggestions(),
    builder: (context, snapshot) {
      if (!snapshot.hasData) return const SizedBox();
      return ListView.builder(
        itemCount: snapshot.data!.length,
        itemBuilder: (context, index) => SuggestionTile(
          suggestion: snapshot.data![index],
          onTap: () => handleSuggestionSelect(snapshot.data![index]),
        ),
      );
    },
  );
}
```

### 3. Search History
```dart
class SearchHistory {
  static Future<void> saveSearch(Place place) async {
    await FirebaseFirestore.instance
        .collection('search_history')
        .add({
          'place_id': place.placeId,
          'description': place.description,
          'timestamp': DateTime.now(),
        });
  }
}
```

## Maintenance Tips

### 1. Code Documentation
- Tambahkan komentar untuk logic kompleks
- Jelaskan parameter dan return values
- Dokumentasikan asumsi dan limitasi

### 2. Error Logging
- Log semua error untuk debugging
- Kategorikan error berdasarkan tipe
- Track error rates untuk monitoring

### 3. Performance Monitoring
- Monitor response times
- Track memory usage
- Identifikasi bottlenecks
