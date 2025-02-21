---
title: Deep Dive: search_place.dart
description: search_place.dart adalah komponen yang menangani pencarian dan pemilihan tempat makan/resto dalam aplikasi Musafir.
---


# Deep Dive: search_place.dart

## Overview
`search_place.dart` adalah komponen yang menangani pencarian dan pemilihan tempat makan/resto dalam aplikasi Musafir. File ini memungkinkan pengguna untuk:
- Melihat daftar resto terdekat
- Memfilter resto berdasarkan status halal
- Memilih multiple resto untuk rencana perjalanan
- Melihat detail setiap resto

## Struktur Kelas

### SearchPlace (StatefulWidget)
```dart
class SearchPlace extends StatefulWidget {
  final String type;  // Menentukan mode edit atau create
  const SearchPlace({super.key, required this.type});
  
  @override
  State<SearchPlace> createState() => _SearchPlaceState();
}
```

### _SearchPlaceState
```dart
class _SearchPlaceState extends State<SearchPlace> {
  String? latlang;
  var homeC = Get.find<HomeController>();
  var expC = Get.find<ExploreController>();
  List placesData = [];
  bool isLoad = false;
  List selectedCard = [];
}
```

## Core Functions

### getData()
```dart
void getData() async {
  var locationController = Get.find<LocationController>();
  UserStore().getUserDetail().then((value) {
    setState(() {
      latlang = value['lat'] != null
          ? '${value['lat']},${value['lng']}'
          : locationController.latlng.toString();
    });
  });
}
```
- **Kegunaan**: Mengambil lokasi user untuk pencarian resto terdekat
- **Output**: String koordinat dalam format "latitude,longitude"
- **Fallback**: Menggunakan lokasi dari LocationController jika data user tidak ada

### getPlacesData()
```dart
void getPlacesData() async {
  if (expC.nearbyFood.isNotEmpty) {
    for (var i in expC.nearbyFood) {
      var destination = '${homeC.filterDot(i.geometry.location.lat.toString())},${homeC.filterDot(i.geometry.location.lng.toString())}';
      
      await homeC.distance(
        '${expC.latlng!.latitude}, ${expC.latlng!.longitude}',
        destination
      ).then((value) async {
        Map<String, dynamic> newdata = {
          "place_id": i.placeId,
          'title': i.name,
          'address': i.vicinity,
          'jarak': value.replaceAll('km', ''),
          'selected': await check(i.placeId),
          'photos': i.photos != null ? i.photos.first.photoReference : 'none',
        };
        setState(() {
          placesData.add(newdata);
          isLoad = true;
        });
      });
    }
  }
}
```
- **Kegunaan**: Memproses data resto dari API menjadi format yang siap ditampilkan
- **Input**: Data dari Google Places API (nearbyFood)
- **Output**: List placesData dengan informasi lengkap tiap resto
- **Features**:
  - Kalkulasi jarak dari posisi user
  - Cek status selected untuk resto
  - Handle foto resto

### check()
```dart
Future<bool?> check(String placeId) async {
  bool status = false;
  var check = expC.selectedFood.where((x) => x['place_id'] == placeId);
  if (check.isNotEmpty) {
    status = true;
  }
  return status;
}
```
- **Kegunaan**: Mengecek apakah resto sudah dipilih sebelumnya
- **Input**: Place ID dari resto
- **Output**: Boolean status selected

## UI Components

### Header Section
```dart
Widget header(BuildContext context) {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(color: kBackgroundColor),
    child: Row(
      children: [
        BackButton(),
        RekomendasiTitle(
          title: 'Rekomendasi Resto Terdekat',
          onTap: () {},
        ),
      ],
    ),
  );
}
```

### Restaurant Card
```dart
Widget contactItem(
  String title, 
  String address, 
  bool isSelected, 
  int index,
  String halalStatus, 
  String destination, 
  String photos, 
  String placeId
) {
  return Card(
    elevation: 1,
    child: ListTile(
      leading: PhotoContainer(photos),
      title: RestaurantInfo(title, address),
      subtitle: StatusInfo(halalStatus, destination),
      trailing: SelectionIndicator(isSelected),
      onTap: () => handleSelection(index),
    ),
  );
}
```

### Selection Handler
```dart
void handleSelection(int index) {
  setState(() {
    placesData[index]['selected'] = !placesData[index]['selected'];
    
    if (placesData[index]['selected']) {
      expC.selectedFood.add({
        'place_id': placeId,
        'title': title,
        'address': address,
        'selected': true,
        'jarak': destination,
        'photos': photos,
        'halalStatus': halalStatus,
      });
    } else {
      expC.selectedFood.removeWhere(
        (element) => element['place_id'] == placesData[index]['place_id'],
      );
    }
  });
}
```

## State Management

### Data Loading State
```dart
// Loading state
bool isLoad = false;

// Show loading or content
Widget build(BuildContext context) {
  return isLoad && latlang != null
    ? ContentWidget()
    : LoadingWidget();
}
```

### Selection State
```dart
// Di ExploreController
final selectedFood = <Map<String, dynamic>>[].obs;

// Di UI
Obx(() => Text('Selected: ${expC.selectedFood.length}'))
```

## Error Handling

### Network Errors
```dart
try {
  await getPlacesData();
} catch (e) {
  if (e is NetworkException) {
    DialogHelper.showSnackBar(
      'Gagal mengambil data resto. Periksa koneksi internet Anda.',
      title: 'Error'
    );
  }
}
```

### Data Validation
```dart
void validateData(Map<String, dynamic> placeData) {
  if (placeData['title'] == null || placeData['address'] == null) {
    throw Exception('Invalid place data');
  }
}
```

## Performance Optimization

### Lazy Loading
```dart
ListView.builder(
  itemCount: placesData.length,
  itemBuilder: (context, index) {
    // Hanya build item yang visible
    return contactItem(
      placesData[index]['title'],
      placesData[index]['address'],
      // ... other params
    );
  },
)
```

### Image Optimization
```dart
Widget PhotoContainer(String photos) {
  return Container(
    width: 70.0,
    height: 70.0,
    decoration: BoxDecoration(
      image: photos == 'none'
          ? const AssetImage('assets/default.png')
          : NetworkImage('${AppConstans.PLACE_PHOTO}$photos'),
    ),
  );
}
```

## Integration with External Services

### Google Places API
```dart
// Di ExploreController
Future<void> getNearbyPlace({
  required String keyword,
  required String rankby,
  required String type,
  required String location,
}) async {
  final response = await placesApi.getNearbyPlaces(
    keyword: keyword,
    location: location,
    rankby: rankby,
    type: type,
  );
  
  nearbyFood.value = response.results;
}
```

### Distance Matrix API
```dart
// Di HomeController
Future<String> distance(String origin, String destination) async {
  final response = await distanceApi.getDistance(
    origin: origin,
    destination: destination,
  );
  return response.distance;
}
```

## Testing Guidelines

### Widget Tests
```dart
testWidgets('SearchPlace shows resto list', (tester) async {
  await tester.pumpWidget(SearchPlace(type: 'create'));
  
  expect(find.text('Rekomendasi Resto Terdekat'), findsOneWidget);
  expect(find.byType(Card), findsNWidgets(placesData.length));
});
```

### Integration Tests
```dart
testWidgets('Can select multiple restos', (tester) async {
  await tester.pumpWidget(SearchPlace(type: 'create'));
  
  await tester.tap(find.byType(Card).first);
  await tester.tap(find.byType(Card).at(1));
  
  expect(expC.selectedFood.length, equals(2));
});
```

## Tips Penggunaan

### 1. Pemilihan Resto
- Tap card resto untuk memilih/membatalkan pilihan
- Indicator centang menunjukkan resto terpilih
- Bisa memilih multiple resto

### 2. Filter dan Sorting
- Resto diurutkan berdasarkan jarak terdekat
- Status halal ditunjukkan dengan icon berbeda
- Jarak ditampilkan dalam kilometer

### 3. Navigasi
- Tombol back untuk kembali ke halaman rencana
- Tap resto untuk melihat detail
- Update button untuk menyimpan pilihan

## Debug Tips
```dart
// Logging selected places
print('Selected places: ${expC.selectedFood.length}');
print('Place details: ${json.encode(placesData[index])}');

// Checking location
print('Current location: $latlang');
```
