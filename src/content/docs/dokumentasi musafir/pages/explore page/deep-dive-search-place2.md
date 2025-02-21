# Deep Dive: search_place2.dart

## Overview
`search_place2.dart` adalah komponen yang menangani pencarian dan pemilihan masjid atau tempat ibadah dalam aplikasi Musafir. File ini merupakan turunan dari search_place.dart dengan modifikasi khusus untuk pencarian masjid. Fitur utama meliputi:
- Pencarian masjid terdekat
- Pemilihan multiple masjid
- Kalkulasi jarak ke masjid
- Integrasi dengan Google Places API khusus untuk masjid

## Perbedaan dengan search_place.dart
1. Fokus pencarian pada tempat ibadah (masjid)
2. Tidak ada filter status halal
3. UI yang lebih sederhana
4. Query khusus untuk tipe tempat 'mosque'

## Struktur Kelas

### SearchPlace2 (StatefulWidget)
```dart
class SearchPlace2 extends StatefulWidget {
  final String type;  // Menentukan mode edit atau create
  const SearchPlace2({super.key, required this.type});
  
  @override
  State<SearchPlace2> createState() => _SearchPlace2State();
}
```

### _SearchPlace2State
```dart
class _SearchPlace2State extends State<SearchPlace2> {
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
- **Kegunaan**: Mendapatkan lokasi user untuk pencarian masjid terdekat
- **Source**: User data dari Firestore atau LocationController sebagai fallback
- **Format Output**: "latitude,longitude"

### getPlacesData()
```dart
void getPlacesData() async {
  if (expC.nearbyMosque.isNotEmpty) {
    for (var i in expC.nearbyMosque) {
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
- **Kegunaan**: Memproses data masjid dari API
- **Input**: Data dari nearbyMosque (Google Places API)
- **Proses**:
  1. Iterasi setiap masjid
  2. Kalkulasi jarak
  3. Format data untuk UI
  4. Update state

### check()
```dart
Future<bool?> check(String placeId) async {
  bool status = false;
  var check = expC.selectedMosque.where((x) => x['place_id'] == placeId);
  if (check.isNotEmpty) {
    status = true;
  }
  return status;
}
```
- **Kegunaan**: Verifikasi status seleksi masjid
- **Logic**: Mencari placeId di dalam selectedMosque list

## UI Components

### Header
```dart
Widget header(BuildContext context) {
  return Container(
    width: double.infinity,
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(color: kBackgroundColor),
    child: Row(
      children: [
        BackButton(
          onPressed: () async {
            homeC.clearSearchPlace();
            await expC.trigerUpdate();
            if (widget.type == 'edit') {
              Get.offNamed(RouteHelper.getRencanaPageEdit());
            } else {
              Get.offNamed(RouteHelper.getRencanaPage());
            }
          },
        ),
        RekomendasiTitle(
          title: 'Rekomendasi Masjid Terdekat',
          onTap: () {},
        ),
      ],
    ),
  );
}
```

### Mosque List Item
```dart
Widget contactItem(
  String title, 
  String address, 
  bool isSelected, 
  int index,
  String destination, 
  String photos, 
  String placeId
) {
  return Card(
    elevation: 1,
    shadowColor: kNeutral20,
    color: kBackgroundColor,
    child: ListTile(
      leading: MosquePhoto(photos),
      title: MosqueInfo(title, address),
      subtitle: DistanceInfo(destination),
      trailing: SelectionIndicator(isSelected),
      onTap: () => handleSelection(index),
    ),
  );
}
```

### Action Button
```dart
Widget bxButton() {
  return Padding(
    padding: const EdgeInsets.all(18),
    child: CustomButton(
      title: 'Update Masjid',
      onPressed: () {
        var textStatus = widget.type == 'edit' ? 'update' : 'menambahkan';
        DialogHelper.showSnackBar(
          "Berhasil $textStatus Masjid yang di kunjungi",
          title: 'Successfuly',
          backgroundColor: kSuccessMain,
        );
        handleNavigation();
      }
    ),
  );
}
```

## State Management

### Selection State
```dart
void handleSelection(int index) {
  setState(() {
    placesData[index]['selected'] = !placesData[index]['selected'];
    
    if (placesData[index]['selected']) {
      expC.selectedMosque.add({
        'place_id': placeId,
        'title': title,
        'address': address,
        'selected': true,
        'jarak': destination,
        'photos': photos,
      });
    } else {
      expC.selectedMosque.removeWhere(
        (element) => element['place_id'] == placesData[index]['place_id'],
      );
    }
  });
}
```

### Loading State
```dart
Widget buildContent() {
  return isLoad 
    ? ListView.builder(
        itemCount: placesData.length,
        itemBuilder: (context, index) => contactItem(...),
      )
    : const Center(child: CircularProgressIndicator());
}
```

## Navigation Logic

### Route Handling
```dart
void handleNavigation() {
  if (widget.type == 'edit') {
    Get.offNamed(RouteHelper.getRencanaPageEdit());
  } else {
    Get.offNamed(RouteHelper.getRencanaPage());
  }
}
```

## Error Handling

### API Error Handling
```dart
Future<void> fetchData() async {
  try {
    await getPlacesData();
  } catch (e) {
    DialogHelper.showSnackBar(
      "Gagal mengambil data masjid",
      title: "Error"
    );
    print('Error fetching mosque data: $e');
  }
}
```

### Input Validation
```dart
bool validateMosqueData(Map<String, dynamic> mosque) {
  if (mosque['title'].isEmpty || mosque['address'].isEmpty) {
    DialogHelper.showSnackBar(
      "Data masjid tidak lengkap",
      title: "Validasi"
    );
    return false;
  }
  return true;
}
```

## Performance Optimization

### List Optimization
```dart
ListView.builder(
  itemCount: placesData.length,
  itemBuilder: (context, index) {
    final item = placesData[index];
    // Menggunakan const untuk child widgets yang static
    return const MosqueListItem(
      key: ValueKey(item['place_id']),
      data: item,
    );
  },
)
```

### Image Loading
```dart
Widget MosquePhoto(String photoUrl) {
  return Container(
    width: 70.0,
    height: 70.0,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(8),
      image: photoUrl == 'none'
          ? const DecorationImage(
              fit: BoxFit.cover,
              image: AssetImage('assets/default_mosque.png'),
            )
          : DecorationImage(
              fit: BoxFit.cover,
              image: NetworkImage('${AppConstans.PLACE_PHOTO}$photoUrl'),
            ),
    ),
  );
}
```

## Best Practices

### 1. State Management
- Gunakan GetX untuk global state
- setState untuk local UI updates
- Proper error handling

### 2. Code Organization
- Separate business logic
- Reusable widgets
- Clear naming conventions

### 3. Performance
- Lazy loading for lists
- Image optimization
- Proper disposal of controllers

## Testing Guidelines

### Widget Tests
```dart
testWidgets('SearchPlace2 UI elements', (tester) async {
  await tester.pumpWidget(const SearchPlace2(type: 'create'));
  
  expect(find.text('Rekomendasi Masjid Terdekat'), findsOneWidget);
  expect(find.byType(ListView), findsOneWidget);
});
```

### Integration Tests
```dart
testWidgets('Mosque selection works', (tester) async {
  await tester.pumpWidget(const SearchPlace2(type: 'create'));
  
  final mosqueCard = find.byType(Card).first;
  await tester.tap(mosqueCard);
  await tester.pump();
  
  expect(find.byIcon(Icons.check_circle), findsOneWidget);
});
```

## Debugging Tips

### Common Issues
1. API Response Format
```dart
print('API Response: ${json.encode(expC.nearbyMosque)}');
```

2. Selection State
```dart
print('Selected Mosques: ${expC.selectedMosque.length}');
```

3. Location Issues
```dart
print('Current Location: $latlang');
```

## Tips Penggunaan

### 1. Pencarian Masjid
- Masjid diurutkan berdasarkan jarak
- Tap untuk memilih/membatalkan
- Multiple selection diperbolehkan

### 2. Navigasi
- Back button untuk kembali
- Update untuk menyimpan
- Bisa lihat detail masjid

### 3. Optimasi Performa
- Lazy loading untuk list panjang
- Cache gambar
- Proper state management
