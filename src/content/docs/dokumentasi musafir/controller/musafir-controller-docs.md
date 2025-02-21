---
title: "Controller Docs"
description: "Dokumentasi Controller musafir app"
---

# Dokumentasi Controller Musafir App

## Struktur Folder
```
lib/
└── controllers/
    ├── auth_controller.dart
    ├── explore_controller.dart
    ├── google_controller.dart
    ├── location_controller.dart
    ├── main_page_controller.dart
    └── restoran_controller.dart
```

## 1. AuthController
Controller untuk menangani autentikasi pengguna menggunakan Firebase Authentication.

### Dependencies
- Firebase Auth
- Google Sign In
- Cloud Firestore
- GetX

### Variabel Penting
```dart
final FirebaseAuth _auth = FirebaseAuth.instance;
FirebaseFirestore firestore = FirebaseFirestore.instance;
bool _isLoading = false;
String? _tokenGoogle;
```

### Method-method Utama

#### 1.1 logins()
```dart
void logins(String emailAddress, String password, BuildContext context)
```
**Kegunaan**: Melakukan login dengan email dan password.

**Proses**:
1. Menampilkan loading indicator
2. Melakukan sign in dengan Firebase Auth
3. Mengecek email verification
4. Redirect ke halaman utama jika berhasil
5. Menampilkan dialog verifikasi email jika belum terverifikasi

**Contoh Penggunaan**:
```dart
authController.logins("user@email.com", "password123", context);
```

#### 1.2 signInWithGoogle()
```dart
void signInWithGoogle(context)
```
**Kegunaan**: Melakukan login menggunakan akun Google.

**Proses**:
1. Memunculkan dialog Google Sign In
2. Mendapatkan credentials
3. Membuat user baru jika belum ada
4. Redirect ke halaman utama

**Contoh Penggunaan**:
```dart
authController.signInWithGoogle(context);
```

#### 1.3 signUp()
```dart
void signUp(String emailAddress, String password, String namaDepan, 
           String namaBelakang, String phone, context)
```
**Kegunaan**: Mendaftarkan user baru.

**Proses**:
1. Membuat akun di Firebase Auth
2. Menyimpan data user di Firestore
3. Mengirim email verifikasi
4. Menampilkan notifikasi sukses

**Contoh Penggunaan**:
```dart
authController.signUp(
  "user@email.com",
  "password123",
  "John",
  "Doe",
  "08123456789",
  context
);
```

## 2. ExploreController
Controller untuk menangani fitur eksplorasi tempat.

### Dependencies
- Google Maps Flutter
- GetX

### Variabel Penting
```dart
RxString placeIdX = ''.obs;
TextEditingController searchPlace = TextEditingController();
List selectedFood = [];
List selectedMosque = [];
```

### Method-method Utama

#### 2.1 getNearbyPlace()
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
**Kegunaan**: Mendapatkan tempat-tempat terdekat berdasarkan parameter.

**Parameter**:
- keyword: Kata kunci pencarian
- rankby: Pengurutan hasil
- type: Tipe tempat (resto/mosque)
- pagetoken: Token untuk pagination
- location: Koordinat lokasi
- radius: Radius pencarian dalam meter

**Contoh Penggunaan**:
```dart
await exploreController.getNearbyPlace(
  keyword: "halal food",
  type: "resto",
  location: "-6.2088,106.8456",
  radius: 1000
);
```

## 3. GoogleController
Controller untuk interaksi dengan Google Maps API.

### Dependencies
- Google Maps Flutter
- GetX

### Method-method Utama

#### 3.1 getGeoCode()
```dart
Future<void> getGeoCode()
```
**Kegunaan**: Mendapatkan informasi alamat dari koordinat.

#### 3.2 getNearbyPlace()
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
**Kegunaan**: Mencari tempat terdekat dengan filter tertentu.

## 4. LocationController
Controller untuk menangani lokasi pengguna.

### Dependencies
- Geolocator
- Google Maps Flutter
- GetX

### Method-method Utama

#### 4.1 getCurrentPosition()
```dart
Future<void> getCurrentPosition()
```
**Kegunaan**: Mendapatkan posisi pengguna saat ini.

#### 4.2 determinePosition()
```dart
Future<void> determinePosition()
```
**Kegunaan**: Mengecek dan meminta izin lokasi.

## 5. MainPageController
Controller sederhana untuk menangani navigasi halaman utama.

### Variabel
```dart
RxInt menuTabController = 0.obs;
```

## 6. RestoranController
Controller untuk manajemen data restoran.

### Dependencies
- Cloud Firestore
- Image Picker
- GetX

### Method Utama

#### 6.1 addRestoran()
```dart
Future<void> addRestoran(
  String name, 
  String address, 
  LatLng? location,
  String? halalStatus, 
  String operationalHours, 
  XFile? image
)
```
**Kegunaan**: Menambahkan data restoran baru ke Firestore.

**Contoh Penggunaan**:
```dart
await restoranController.addRestoran(
  "Warung Padang",
  "Jl. Sudirman No. 123",
  LatLng(-6.2088, 106.8456),
  "Halal",
  "08:00-21:00",
  imageFile
);
```

## Penggunaan Controller

### Inisialisasi
```dart
final authController = Get.put(AuthController(authRepo: Get.find()));
final exploreController = Get.put(ExploreController(googleRepo: Get.find()));
final locationController = Get.put(LocationController(googleRepo: Get.find()));
```

### Dependency Injection
```dart
void main() {
  Get.lazyPut(() => AuthRepo());
  Get.lazyPut(() => GoogleRepo());
  // ... inisialisasi controller lainnya
}
```

## State Management
Aplikasi menggunakan GetX untuk state management dengan fitur:
- Reactive state dengan `.obs`
- State mutation dengan `.value` atau `update()`
- Dependency injection dengan `Get.put()` dan `Get.find()`

## Error Handling
Setiap controller memiliki error handling untuk:
- Network errors
- Authentication errors
- Permission errors
- Firebase errors

## Tips Penggunaan
1. Selalu gunakan try-catch block untuk operasi async
2. Perhatikan lifecycle controller dengan `onInit()` dan `onClose()`
3. Gunakan `GetxService` untuk controller yang perlu persist
4. Manfaatkan reactive programming dengan `.obs` untuk UI updates
