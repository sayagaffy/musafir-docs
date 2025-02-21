---
title: "Deep Dive: rencana_page.dart"
description: "rencana_page.dart adalah file yang menangani pembuatan rencana perjalanan baru dalam aplikasi Musafir. File ini berisi form untuk input detail perjalanan, integrasi dengan Google Calendar, dan pemilihan tempat makan dan masjid."
---


# Deep Dive: rencana_page.dart

## Overview
`rencana_page.dart` adalah file yang menangani pembuatan rencana perjalanan baru dalam aplikasi Musafir. File ini berisi form untuk input detail perjalanan, integrasi dengan Google Calendar, dan pemilihan tempat makan dan masjid.

## Struktur Kelas

### RencanaPage (StatefulWidget)
```dart
class RencanaPage extends StatefulWidget {
  const RencanaPage({super.key});
  
  @override
  State<RencanaPage> createState() => _RencanaPageState();
}
```

### _RencanaPageState
```dart
class _RencanaPageState extends State<RencanaPage> {
  var exploreController = Get.find<ExploreController>();
  var authController = Get.find<AuthController>();
  
  TextEditingController startDateTime = TextEditingController();
  TextEditingController endDateTime = TextEditingController();
  TextEditingController startFormat = TextEditingController();
  TextEditingController endFormat = TextEditingController();
}
```

## Core Functions

### addPlace()
```dart
void addPlace(String type) async {
  String nameplan = exploreController.namePlan.text.trim();
  String search = exploreController.searchPlace.text.trim();
  String start = exploreController.startDtTime.text.trim();
  String end = exploreController.endDtTime.text.trim();

  // Validasi input
  if (nameplan.isEmpty) {
    DialogHelper.showSnackBar('Nama Rencana Perjalanan tidak boleh kosong',
        title: 'Nama');
    return;
  }
  
  // Proses pencarian tempat
  if (type == 'resto') {
    await exploreController.getNearbyPlace(
      keyword: 'resto+food',
      rankby: 'distance',
      type: type,
      location: '${exploreController.latlng!.latitude}, ${exploreController.latlng!.longitude}',
    );
    Get.offNamed(RouteHelper.getSearchPlaceExplore(type));
  }
}
```

#### Cara Kerja:
1. Mengambil nilai dari form inputs
2. Melakukan validasi
3. Mencari tempat terdekat sesuai tipe (resto/masjid)
4. Navigasi ke halaman pencarian

### Google Calendar Integration
```dart
Future<String?> signInWithGoogle2() async {
  try {
    GoogleSignInAccount? googleSignIn = await GoogleSignIn(
      clientId: '335848098890-tlfac39k149ape15nr3g784u11n9svft.apps.googleusercontent.com',
      scopes: <String>[
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    ).signIn();

    GoogleSignInAuthentication? googleAuth = await googleSignIn?.authentication;
    
    // Create Firebase credential
    OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth?.accessToken,
      idToken: googleAuth?.idToken,
    );

    UserCredential userCredential = await _auth.signInWithCredential(credential);
    return googleAuth?.accessToken;
  } catch (e) {
    handleError(e);
    return null;
  }
}
```

### Posting Rencana

#### _posting2()
```dart
Future<void> _posting2() async {
  // Validasi input
  if (!validateInputs()) return;
  
  DialogHelper.showLoading('Posting Rencana Perjalanan');

  try {
    await UserStore().explorePlan(
      exploreController.placeIdX.value,
      exploreController.searchPlace.text,
      exploreController.startDtTime.text,
      exploreController.endDtTime.text,
      exploreController.namePlan.text,
      exploreController.selectedFood,
      exploreController.selectedMosque,
      exploreController.latlng!.latitude,
      exploreController.latlng!.longitude,
    );
  } catch (e) {
    handleError(e);
  } finally {
    DialogHelper.hideLoading();
  }
}
```

## UI Components

### Form Fields
```dart
Widget contentPlan(BuildContext context) {
  return Container(
    margin: const EdgeInsets.only(top: 34),
    padding: const EdgeInsets.symmetric(horizontal: 18),
    child: Column(
      children: [
        TextFdCustom(
          textController: exploreController.searchPlace,
          labelText: 'Ketik Tujuanmu',
          icon: Icons.search_rounded,
          onTap: () => Get.offNamed(RouteHelper.getExploreSearch()),
          readOnly: true,
        ),
        
        TextFdCustom(
          textController: exploreController.namePlan,
          labelText: 'Nama Rencana Perjalanan',
          icon: Icons.store,
        ),
        
        TextfieldDatetimePick(
          textController: exploreController.startDtTime,
          labelText: 'Tanggal Berangkat',
          textdatetime: startFormat,
        ),
        
        // ... other form fields
      ],
    ),
  );
}
```

### Resto & Mosque Selection
```dart
Widget selectedRestoList() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('Restoran Tujuan ${exploreController.selectedFood.length}'),
          GestureDetector(
            onTap: () => addPlace('resto'),
            child: Text('Tambahkan lainnya'),
          ),
        ],
      ),
      ListView.builder(
        itemCount: exploreController.selectedFood.length,
        itemBuilder: (context, index) => RestoItem(
          data: exploreController.selectedFood[index]
        ),
      ),
    ],
  );
}
```

## State Management

### ExploreController Usage
```dart
var exploreController = Get.find<ExploreController>();

// Form state
exploreController.namePlan.text = 'New Plan';
exploreController.searchPlace.text = 'Location';

// Selected places
exploreController.selectedFood.add(newResto);
exploreController.selectedMosque.add(newMosque);

// Location
exploreController.updateLatLng(lat, lng);
```

## Firebase Integration

### Saving Plan
```dart
Future<void> savePlan() async {
  await UserStore().explorePlan(
    placeId: exploreController.placeIdX.value,
    placeName: exploreController.searchPlace.text,
    startTime: exploreController.startDtTime.text,
    endTime: exploreController.endDtTime.text,
    namePlan: exploreController.namePlan.text,
    selectedFood: exploreController.selectedFood,
    selectedMosque: exploreController.selectedMosque,
    latitude: exploreController.latlng!.latitude,
    longitude: exploreController.latlng!.longitude,
  );
}
```

## Error Handling

### Input Validation
```dart
bool validateInputs() {
  if (exploreController.searchPlace.text.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum memilih Tujuanmu",
        title: "Tujuanmu");
    return false;
  }
  
  if (exploreController.namePlan.text.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum mengisi nama perjalananmu",
        title: "Nama perjalanan");
    return false;
  }
  
  // ... other validations
  
  return true;
}
```

### API Error Handling
```dart
try {
  await operation();
} catch (e) {
  if (e is FirebaseException) {
    handleFirebaseError(e);
  } else if (e is NetworkException) {
    handleNetworkError(e);
  } else {
    handleGenericError(e);
  }
}
```

## Best Practices

### 1. Form Validation
- Validasi input sebelum submit
- Tampilkan error message yang jelas
- Hindari submit form kosong

### 2. State Management
- Gunakan GetX untuk state management
- Pisahkan business logic ke controller
- Gunakan reactive state untuk UI updates

### 3. Error Handling
- Handle semua kemungkinan error
- Berikan feedback yang jelas ke user
- Log error untuk debugging

## Tips Implementasi

### 1. Date Picker
```dart
Future<void> showDatePicker() async {
  final DateTime? picked = await showDateTimePicker(
    context: context,
    initialDate: DateTime.now(),
    firstDate: DateTime.now(),
    lastDate: DateTime(2025),
  );
  
  if (picked != null) {
    exploreController.startDtTime.text = formatDate(picked);
  }
}
```

### 2. Location Selection
```dart
void handleLocationSelect(Place place) {
  exploreController.searchPlace.text = place.name;
  exploreController.placeIdX.value = place.placeId;
  exploreController.updateLatLng(place.lat, place.lng);
}
```

### 3. Dynamic Lists
```dart
void addSelectedResto(Resto resto) {
  setState(() {
    exploreController.selectedFood.add({
      'place_id': resto.placeId,
      'title': resto.name,
      'address': resto.address,
      'photos': resto.photos,
    });
  });
}
```

## Testing Guidelines

### Widget Tests
```dart
testWidgets('RencanaPage form validation', (tester) async {
  await tester.pumpWidget(const RencanaPage());
  
  await tester.tap(find.byType(ElevatedButton));
  await tester.pump();
  
  expect(find.text('Kamu belum memilih Tujuanmu'), findsOneWidget);
});
```

### Integration Tests
```dart
testWidgets('Can add resto to plan', (tester) async {
  await tester.tap(find.text('Tambahkan lainnya'));
  await tester.pumpAndSettle();
  
  expect(find.byType(SearchPlace), findsOneWidget);
});
```
