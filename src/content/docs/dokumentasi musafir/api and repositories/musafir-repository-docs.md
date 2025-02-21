---
title: "Repository Basic Explanation"
description: "Penjelasan mendasar repository di musafir app"
---

# Dokumentasi Repository Musafir App

## Lokasi File
```
lib/
└── data/
    └── repository/
        ├── auth_repo.dart
        └── google_repo.dart
```

## 1. Auth Repository (auth_repo.dart)

### Deskripsi Umum
File `auth_repo.dart` menangani semua operasi terkait autentikasi dalam aplikasi Musafir. Repository ini bertanggung jawab untuk:
- Registrasi pengguna baru
- Login pengguna
- Manajemen token
- Penyimpanan kredensial pengguna
- Logout

### Dependensi
```dart
import 'dart:convert';
import 'package:get/get.dart';
import 'package:shared_preferences.dart';
import 'package:musafir/data/api/api_client.dart';
import 'package:musafir/models/signup_body_model.dart';
import 'package:musafir/utilitis/apps_constants.dart';
```

### Konstruktor
```dart
AuthRepo({
  required this.apiClient,
  required this.sharedPreferences,
});
```

### Method-Method

#### 1. registration
```dart
Future<Response> registration(SignUpBody signUpBody)
```
**Kegunaan**: Mendaftarkan pengguna baru ke sistem.

**Parameter**:
- `signUpBody`: Object yang berisi data registrasi pengguna

**Contoh Penggunaan**:
```dart
final signUpBody = SignUpBody(
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
);
final response = await authRepo.registration(signUpBody);
```

#### 2. userLoggedIn
```dart
bool userLoggedIn()
```
**Kegunaan**: Memeriksa status login pengguna.

**Return**: Boolean yang menunjukkan status login pengguna.

**Contoh Penggunaan**:
```dart
if (authRepo.userLoggedIn()) {
  // Navigasi ke home screen
} else {
  // Navigasi ke login screen
}
```

#### 3. getUserToken
```dart
Future<String> getUserToken()
```
**Kegunaan**: Mengambil token autentikasi pengguna dari penyimpanan lokal.

**Return**: Token pengguna atau "None" jika tidak ada.

**Contoh Penggunaan**:
```dart
String token = await authRepo.getUserToken();
if (token != "None") {
  // Gunakan token untuk request
}
```

#### 4. login
```dart
Future<Response> login(String email, String password)
```
**Kegunaan**: Melakukan autentikasi pengguna.

**Parameter**:
- `email`: Email pengguna
- `password`: Password pengguna

**Contoh Penggunaan**:
```dart
final response = await authRepo.login("user@example.com", "password123");
if (response.statusCode == 200) {
  // Login berhasil
}
```

#### 5. saveUserToken
```dart
Future<bool> saveUserToken(String token)
```
**Kegunaan**: Menyimpan token autentikasi ke penyimpanan lokal dan memperbarui header API.

**Parameter**:
- `token`: Token autentikasi yang akan disimpan

**Contoh Penggunaan**:
```dart
if (await authRepo.saveUserToken("xyz123")) {
  print("Token berhasil disimpan");
}
```

#### 6. svaeUserNumerNadPassword
```dart
Future<void> svaeUserNumerNadPassword(String numer, String password)
```
**Kegunaan**: Menyimpan nomor telepon dan password pengguna ke penyimpanan lokal.

**Parameter**:
- `numer`: Nomor telepon pengguna
- `password`: Password pengguna

**Catatan**: Terdapat typo pada nama method yang seharusnya "saveUserNumberAndPassword"

**Contoh Penggunaan**:
```dart
try {
  await authRepo.svaeUserNumerNadPassword("081234567890", "password123");
} catch (e) {
  print("Gagal menyimpan kredensial: $e");
}
```

#### 7. clearShared
```dart
bool clearShared()
```
**Kegunaan**: Menghapus semua data autentikasi dari penyimpanan lokal (logout).

**Return**: Boolean yang menunjukkan keberhasilan operasi.

**Contoh Penggunaan**:
```dart
if (authRepo.clearShared()) {
  // Navigasi ke login screen
}
```

## 2. Google Repository (google_repo.dart)

### Deskripsi Umum
File `google_repo.dart` menangani semua operasi terkait layanan Google Maps dalam aplikasi. Repository ini menggunakan Google Maps API untuk:
- Geocoding (konversi koordinat ke alamat dan sebaliknya)
- Pencarian tempat
- Pencarian tempat terdekat
- Detail tempat
- Perhitungan jarak

### Dependensi
```dart
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:musafir/data/api/api_google.dart';
import 'package:musafir/utilitis/apps_constants.dart';
```

### Method-Method

#### 1. getGeocode
```dart
Future<Response> getGeocode(LatLng latLng)
```
**Kegunaan**: Mengkonversi koordinat latitude dan longitude menjadi alamat (reverse geocoding).

**Parameter**:
- `latLng`: Object LatLng yang berisi latitude dan longitude

**Contoh Penggunaan**:
```dart
final latLng = LatLng(-6.2088, 106.8456);
final response = await googleRepo.getGeocode(latLng);
```

#### 2. getGeocodeAddress
```dart
Future<Response> getGeocodeAddress(String address)
```
**Kegunaan**: Mengkonversi alamat menjadi koordinat (forward geocoding).

**Parameter**:
- `address`: String alamat yang akan dikonversi

**Contoh Penggunaan**:
```dart
final response = await googleRepo.getGeocodeAddress("Monas, Jakarta");
```

#### 3. getPlace
```dart
Future<Response> getPlace(String query)
```
**Kegunaan**: Mencari tempat berdasarkan kata kunci.

**Parameter**:
- `query`: Kata kunci pencarian

**Contoh Penggunaan**:
```dart
final response = await googleRepo.getPlace("Restoran Halal Jakarta");
```

#### 4. getNearbyPlace
```dart
Future<Response> getNearbyPlace(String query)
```
**Kegunaan**: Mencari tempat terdekat berdasarkan parameter tertentu.

**Parameter**:
- `query`: String parameter pencarian (location, radius, type, dll)

**Contoh Penggunaan**:
```dart
final query = "location=-6.2088,106.8456&radius=1000&type=restaurant&";
final response = await googleRepo.getNearbyPlace(query);
```

#### 5. getPlaceDetail
```dart
Future<Response> getPlaceDetail(String placeId)
```
**Kegunaan**: Mengambil detail lengkap suatu tempat.

**Parameter**:
- `placeId`: ID tempat dari Google Places API

**Contoh Penggunaan**:
```dart
final response = await googleRepo.getPlaceDetail("ChIJ2c-gxz71aS4R5SYEC2vo2Yk");
```

#### 6. getTextSearch
```dart
Future<Response> getTextSearch(String latlang, String textSearch)
```
**Kegunaan**: Melakukan pencarian tempat berdasarkan teks dan lokasi.

**Parameter**:
- `latlang`: String koordinat dalam format "lat,lng"
- `textSearch`: Kata kunci pencarian

**Contoh Penggunaan**:
```dart
final response = await googleRepo.getTextSearch(
  "-6.2088,106.8456",
  "Masjid"
);
```

#### 7. getDistance
```dart
Future<Response> getDistance(String destinations, String origins)
```
**Kegunaan**: Menghitung jarak antara dua lokasi.

**Parameter**:
- `destinations`: Koordinat tujuan
- `origins`: Koordinat asal

**Contoh Penggunaan**:
```dart
final response = await googleRepo.getDistance(
  "-6.2088,106.8456", // Tujuan
  "-6.1751,106.8650"  // Asal
);
```

## Catatan Penting

1. **Keamanan**:
   - Token disimpan di SharedPreferences
   - Password disimpan di SharedPreferences (sebaiknya dienkripsi)
   - API Key Google Maps harus dijaga kerahasiaannya

2. **Error Handling**:
   - Sebagian besar method mengembalikan Future<Response>
   - Perlu implementasi try-catch untuk handling error
   - Validasi input sebelum melakukan request

3. **Optimasi**:
   - Cache hasil geocoding untuk mengurangi request
   - Batasi rate request ke Google Maps API
   - Implementasi timeout untuk request

4. **Pengembangan Selanjutnya**:
   - Implementasi refresh token
   - Enkripsi data sensitif
   - Logging untuk debugging
   - Unit testing untuk repository
