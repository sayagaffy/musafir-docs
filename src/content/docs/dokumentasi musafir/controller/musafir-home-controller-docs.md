---
title: Dokumentasi Home Controller
description: Penjelasan tentan HomeController di Musafir app.
---

# Dokumentasi HomeController

## Lokasi File
`lib/controllers/home_controller.dart`

## Deskripsi Umum
HomeController adalah sebuah controller yang menggunakan GetX untuk mengelola state dan logika bisnis terkait halaman utama aplikasi Musafir. Controller ini menangani berbagai fungsi seperti pencarian tempat terdekat, detail tempat, geocoding, dan manajemen lokasi.

## Dependensi
- cloud_firestore
- firebase_auth
- flutter
- geocoding
- get
- google_repo (custom repository)

## State Management
Controller ini menggunakan GetX untuk state management dengan berbagai variabel observable:

### Variabel Status Loading
```dart
bool _loading = false;
bool get loading => _loading;
```
- Digunakan untuk menandakan status loading global

### Variabel Nearby Places
```dart
// Restaurant
bool _isLoadedFood = false;
List<dynamic> _nearbyFood = [].obs;
String _nextPageTokenFood;

// Mosque
bool _isLoadedMosque = false;
List<dynamic> _nearbyMosque = [].obs;
String _nextPageTokenMosque;

// Food Category
bool _isLoadedFoodKategory = false;
List<dynamic> _nearbyFoodKategory = [];
String _nextPageTokenFoodKategory;
```

## Fungsi-Fungsi Utama

### 1. Lifecycle Methods
```dart
void onInit()
void onReady()
void onClose()
```
- `onInit`: Dipanggil saat controller dibuat
- `onReady`: Dipanggil setelah widget dirender, memuat data awal
- `onClose`: Dipanggil saat controller dihapus dari memori

### 2. Manajemen Data

#### clearList()
```dart
void clearList()
```
Membersihkan semua list data termasuk:
- Nearby food
- Nearby mosque
- Food category
- Address collection
- Search place
- Local place

**Contoh Penggunaan:**
```dart
homeController.clearList();
```

#### getNearbyPlace()
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
Mengambil data tempat terdekat dari Google Places API.

**Parameter:**
- keyword: Kata kunci pencarian
- rankby: Pengurutan hasil
- type: Tipe tempat (restaurant, mosque, food)
- pagetoken: Token untuk pagination
- location: Koordinat lokasi
- radius: Radius pencarian

**Contoh Penggunaan:**
```dart
await homeController.getNearbyPlace(
  keyword: 'restaurant',
  rankby: 'distance',
  type: 'restaurant',
  location: '-6.123,106.456'
);
```

### 3. Place Details

#### placeDetail()
```dart
Future<void> placeDetail(String placeId)
```
Mengambil detail tempat berdasarkan place ID dari Google Places API.

**Contoh Penggunaan:**
```dart
await homeController.placeDetail('ChIJN1t_tDeuEmsRUsoyG83frY4');
```

### 4. Geocoding

#### getGeoCodeAddress()
```dart
Future<void> getGeoCodeAddress(String address, String type)
```
Mengubah alamat text menjadi koordinat (geocoding).

**Contoh Penggunaan:**
```dart
await homeController.getGeoCodeAddress('Jalan Sudirman Jakarta', 'setLoc');
```

### 5. Search Places

#### getSearchPlace()
```dart
Future<void> getSearchPlace(String textSearch, String latlang)
```
Mencari tempat berdasarkan text dan koordinat dengan debouncing.

**Contoh Penggunaan:**
```dart
await homeController.getSearchPlace('Restoran Padang', '-6.123,106.456');
```

### 6. Location Management

#### setAddress()
```dart
Future<void> setAddress(double lat, double lng, String type)
```
Mengatur alamat berdasarkan koordinat dengan reverse geocoding.

**Contoh Penggunaan:**
```dart
await homeController.setAddress(-6.123, 106.456, 'set');
```

#### getPlaceMarks()
```dart
Future<void> getPlaceMarks()
```
Mengambil detail lokasi (placemark) dari koordinat yang tersimpan atau lokasi saat ini.

### 7. Distance Calculation

#### distance()
```dart
Future<String> distance(String destinations, String origins)
```
Menghitung jarak antara dua lokasi menggunakan Google Distance Matrix API.

**Contoh Penggunaan:**
```dart
String jarak = await homeController.distance(
  '-6.123,106.456', // origin
  '-6.234,106.567'  // destination
);
```

## Fitur Khusus

### Debouncer
```dart
class Debouncer {
  final Duration duration;
  Timer? _timer;
  
  void run(VoidCallback action)
}
```
Kelas untuk mengelola debouncing pada fungsi pencarian, mencegah terlalu banyak API call.

### Filter Management
```dart
String _filterType = 'default';
int _rate = 0;
```
Mengelola filter untuk halaman list:
- Filter type: Tipe filter yang digunakan
- Rate: Filter berdasarkan rating

## Best Practices & Tips
1. Selalu gunakan `update()` setelah mengubah state untuk memastikan UI terupdate
2. Gunakan debouncer untuk fungsi pencarian
3. Pastikan untuk membersihkan list sebelum memuat data baru
4. Handle error dengan proper error handling
5. Gunakan proper null checking untuk data yang mungkin null

## Error Handling
Controller ini menggunakan custom snackbar untuk menampilkan error:
```dart
showCustomSnackBar(
  isError: false,
  'Pesan Error',
  title: 'Error',
  backgroundColor: kRedColor,
);
```

## Catatan Penting
1. Controller ini sangat bergantung pada Google Places API
2. Memerlukan konfigurasi Firebase yang tepat
3. Memerlukan izin lokasi dari pengguna
4. Perlu memperhatikan rate limiting dari Google API
5. Pastikan API key sudah dikonfigurasi dengan benar

## Debugging Tips
1. Gunakan print statements yang sudah ada untuk debug
2. Perhatikan status loading untuk setiap operasi
3. Cek response API di fungsi getNearbyPlace
4. Monitor penggunaan memory dengan clearList
5. Perhatikan lifecycle methods untuk debugging

## Pengembangan Kedepan
1. Implementasi caching untuk hasil API
2. Optimisasi performa dengan pagination
3. Implementasi offline mode
4. Peningkatan error handling
5. Penambahan unit tests