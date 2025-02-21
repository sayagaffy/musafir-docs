---
title: "Deep Dive: explore_pages.dart"
description: "adalah file utama yang menangani tampilan dan logika untuk halaman explore dalam aplikasi Musafir."
---

# Deep Dive: explore_pages.dart

## Overview
`explore_pages.dart` adalah file utama yang menangani tampilan dan logika untuk halaman explore dalam aplikasi Musafir. File ini bertanggung jawab untuk menampilkan daftar rencana perjalanan pengguna dan menyediakan fungsionalitas untuk melihat, mengedit, dan mengelola rencana tersebut.

## Struktur Kelas

### ExplorePage (StatefulWidget)
```dart
class ExplorePage extends StatefulWidget {
  const ExplorePage({super.key});
  
  @override
  State<ExplorePage> createState() => _ExplorePageState();
}
```

### _ExplorePageState
```dart
class _ExplorePageState extends State<ExplorePage> {
  List dataPlans = [];
  var authController = Get.find<AuthController>();
}
```

#### State Variables
- `dataPlans`: List untuk menyimpan semua rencana perjalanan
- `authController`: Controller untuk menangani autentikasi

## Lifecycle Methods

### initState()
```dart
@override
void initState() {
  getData();
  super.initState();
}
```
- Dipanggil saat widget pertama kali dibuat
- Memanggil `getData()` untuk mengambil data rencana perjalanan

## Core Functions

### getData()
```dart
void getData() async {
  UserStore().exploreList().then((value) {
    setState(() {
      for (var i in value.docs) {
        Map<String, dynamic> payload = {
          "place_id": i.data()['place_id'],
          'place_name': i.data()['place_name'],
          'start_time': i.data()['start_time'],
          'end_time': i.data()['end_time'],
          'name_plan': i.data()['name_plan'],
          'lat': i.data()['lat'],
          'lng': i.data()['lng'],
          'resto': i.data()['resto'],
          'mosque': i.data()['mosque'],
          'id': i.id
        };
        dataPlans.add(payload);
      }
    });
  });
}
```

#### Cara Kerja:
1. Memanggil `exploreList()` dari `UserStore`
2. Mengiterasi setiap dokumen hasil query
3. Membuat Map dengan data yang diperlukan
4. Menambahkan ke list `dataPlans`

#### Use Cases:
- Saat aplikasi pertama dibuka
- Setelah refresh halaman
- Setelah perubahan data

### navigasiPeta()
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

#### Cara Kerja:
1. Mengecek maps yang tersedia di device
2. Membuka maps dengan koordinat yang dipilih
3. Menampilkan marker dengan nama tempat

#### Error Handling:
```dart
try {
  final availableMaps = await MapLauncher.installedMaps;
  if (availableMaps.isEmpty) {
    throw Exception('No maps available');
  }
  // ... rest of the code
} catch (e) {
  // Handle error
}
```

### edit()
```dart
void edit(int indexParent) async {
  var explorC = Get.find<ExploreController>();
  explorC.namePlan.text = dataPlans[indexParent]['name_plan'];
  explorC.searchPlace.text = dataPlans[indexParent]['place_name'];
  explorC.startDtTime.text = dataPlans[indexParent]['start_time'];
  explorC.endDtTime.text = dataPlans[indexParent]['end_time'];
  explorC.placeIdX.value = dataPlans[indexParent]['place_id'];
  explorC.updateLatLng(
    dataPlans[indexParent]['lat'], 
    dataPlans[indexParent]['lng']
  );
  explorC.selectedFood = dataPlans[indexParent]['resto'];
  explorC.selectedMosque = dataPlans[indexParent]['mosque'];
  explorC.idDocument = dataPlans[indexParent]['id'];

  Get.offNamed(RouteHelper.getRencanaPageEdit());
}
```

#### Cara Kerja:
1. Mengambil instance ExploreController
2. Mengisi data ke controller
3. Navigasi ke halaman edit

## UI Components

### header()
```dart
Widget header() {
  return Container(
    margin: const EdgeInsets.only(top: 21, bottom: 20),
    width: double.infinity,
    child: Center(
      child: Text(
        'Explore',
        style: blackTextStyle.copyWith(
          fontSize: 16,
          fontWeight: extraBold,
        ),
      ),
    ),
  );
}
```

### cardPerjalanan()
```dart
Widget cardPerjalanan() {
  return Container(
    margin: const EdgeInsets.only(left: 18, right: 18),
    decoration: BoxDecoration(
      color: const Color(0xFFF5F5F5),
      borderRadius: BorderRadius.circular(10),
    ),
    // ... child widgets
  );
}
```

### listPlan()
```dart
Widget listPlan(int indexParent) {
  return Theme(
    data: ThemeData().copyWith(dividerColor: Colors.transparent),
    child: ExpansionTile(
      // ... ExpansionTile configuration
    ),
  );
}
```

## State Management dengan GetX

### Controllers
1. AuthController: Menangani autentikasi
2. ExploreController: Menangani state explore
3. LocationController: Menangani state lokasi

### Examples:
```dart
// Mengambil controller
var authController = Get.find<AuthController>();
var exploreController = Get.find<ExploreController>();

// Menggunakan controller
authController.checkUserSignin();
exploreController.updateLatLng(lat, lng);
```

## Firebase Integration

### Firestore Operations
```dart
// Read data
UserStore().exploreList().then((value) {
  // Process data
});

// Update data
UserStore().explorePlanUpdates(
  id,
  placeId,
  placeName,
  startTime,
  endTime,
  // ... other parameters
);
```

## Error Handling

### Network Errors
```dart
try {
  await getData();
} catch (e) {
  if (e is FirebaseException) {
    // Handle Firebase specific errors
  } else if (e is NetworkException) {
    // Handle network errors
  }
}
```

### UI Error States
```dart
Widget build(BuildContext context) {
  if (error != null) {
    return ErrorWidget(message: error.toString());
  }
  
  if (loading) {
    return LoadingWidget();
  }
  
  return MainContent();
}
```

## Best Practices Implementation

### 1. Proper State Management
```dart
// Menggunakan GetX untuk reactive state
final count = 0.obs;
// Menggunakan setState untuk local state
setState(() {
  dataPlans.add(newPlan);
});
```

### 2. Code Organization
- Widgets dipisah menjadi method terpisah
- Logic kompleks dipisah ke controller
- Constants disimpan di file terpisah

### 3. Error Handling
```dart
try {
  await operation();
} catch (e) {
  DialogHelper.showError(e.toString());
} finally {
  DialogHelper.hideLoading();
}
```

## Tips Penggunaan

### 1. Refresh Data
```dart
// Pull to refresh implementation
RefreshIndicator(
  onRefresh: () async {
    await getData();
  },
  child: ListView(...)
)
```

### 2. Performance Optimization
```dart
// Menggunakan const constructor
const SizedBox(height: 20)

// Menggunakan ListView.builder untuk list panjang
ListView.builder(
  itemCount: dataPlans.length,
  itemBuilder: (context, index) => ListItem(data: dataPlans[index])
)
```

### 3. Memory Management
```dart
@override
void dispose() {
  // Clean up resources
  controller.dispose();
  super.dispose();
}
```

## Debugging Tips

### 1. State Tracking
```dart
print('DataPlans length: ${dataPlans.length}');
print('Current state: ${controller.state}');
```

### 2. Error Logging
```dart
try {
  await operation();
} catch (e, stackTrace) {
  print('Error: $e');
  print('Stack trace: $stackTrace');
}
```

## Testing Considerations

### Widget Tests
```dart
testWidgets('ExplorePage shows header', (WidgetTester tester) async {
  await tester.pumpWidget(const ExplorePage());
  expect(find.text('Explore'), findsOneWidget);
});
```

### Integration Tests
```dart
testWidgets('Can navigate to edit page', (WidgetTester tester) async {
  await tester.tap(find.byType(EditButton));
  await tester.pumpAndSettle();
  expect(find.byType(RencanaPageEdit), findsOneWidget);
});
```
