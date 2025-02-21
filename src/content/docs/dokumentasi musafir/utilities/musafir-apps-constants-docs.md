---
title: "Dokumentasi File apps_constants.dart"
description: "penjelasan file apps_constant.dart"
---

# Dokumentasi apps_constants.dart

## Lokasi File
```
lib/
└── utilities/
    └── apps_constants.dart
```

## Deskripsi Umum
File `apps_constants.dart` adalah file konfigurasi utama yang menyimpan semua konstanta yang digunakan dalam aplikasi Musafir. File ini berperan sebagai sumber tunggal untuk semua nilai konstanta yang dibutuhkan aplikasi, mulai dari nama aplikasi hingga URL endpoint API.

## Struktur Kelas
File ini mendefinisikan satu kelas tunggal bernama `AppConstans` yang berisi semua konstanta sebagai static members.

## Konstanta-konstanta

### Informasi Aplikasi
```dart
static const String APP_NAME = "Musafir app";
static const int APP_VERSION = 1;
```
- **Kegunaan**: Menyimpan informasi dasar aplikasi
- **Penggunaan**:
  ```dart
  String appName = AppConstans.APP_NAME; // Mengambil nama aplikasi
  int version = AppConstans.APP_VERSION; // Mengambil versi aplikasi
  ```

### URL Dasar API
```dart
static const String BASE_URL = "https://reqres.in";
static const String USERS_LIST = "/api/users";
```
- **Kegunaan**: Mendefinisikan URL base untuk API dan endpoint users
- **Catatan**: Terdapat URL alternatif yang dikomentari (`https://mvs.bslmeiyu.com`)
- **Penggunaan**:
  ```dart
  String apiUrl = "${AppConstans.BASE_URL}${AppConstans.USERS_LIST}";
  // Hasil: https://reqres.in/api/users
  ```

### Endpoint Autentikasi
```dart
static const String LOGIN_URI = "/api/login";
static const String REGISTRATION_URI = "/api/register";
```
- **Kegunaan**: Endpoint untuk proses login dan registrasi
- **Catatan**: Terdapat endpoint alternatif yang dikomentari (`/api/v1/auth/login` dan `/api/v1/auth/register`)
- **Penggunaan**:
  ```dart
  String loginUrl = "${AppConstans.BASE_URL}${AppConstans.LOGIN_URI}";
  String registerUrl = "${AppConstans.BASE_URL}${AppConstans.REGISTRATION_URI}";
  ```

### Konfigurasi Google Maps API
```dart
static const String BASE_URL_GOOGLE = "https://maps.googleapis.com/maps/api";
static const String API_GKEY = "AIzaSyD1YcOyL2SqkMUA9iPe4EfiH15rjRXz8LY";
```
- **Kegunaan**: Konfigurasi dasar untuk integrasi Google Maps
- **Endpoint Maps**:
  - `GEOCODE`: Konversi alamat ke koordinat dan sebaliknya
  - `SEARCH`: Pencarian tempat otomatis
  - `NEARBYSEARCH`: Pencarian tempat terdekat
  - `PLACE_DETAIL`: Detail informasi tempat
  - `PLACE_PHOTO`: URL untuk mengambil foto tempat
  - `PLACE_TEXTSEARCH`: Pencarian tempat berdasarkan teks
  - `DISTANCE`: Perhitungan jarak antar lokasi

#### Contoh Penggunaan Google Maps API
```dart
// Mencari tempat terdekat
String nearbyUrl = "${AppConstans.BASE_URL_GOOGLE}${AppConstans.NEARBYSEARCH}?location=$lat,$lng&radius=1500&type=restaurant&key=${AppConstans.API_GKEY}";

// Mengambil foto tempat
String photoUrl = "${AppConstans.PLACE_PHOTO}$photoReference";

// Mencari detail tempat
String placeDetailUrl = "${AppConstans.BASE_URL_GOOGLE}${AppConstans.PLACE_DETAIL}?place_id=$placeId&key=${AppConstans.API_GKEY}";
```

### Konstanta Autentikasi
```dart
static const String TOKEN = "";
static const String PHONE = "";
static const String PASSWORD = "";
```
- **Kegunaan**: Placeholder untuk menyimpan informasi autentikasi
- **Catatan**: Nilai default kosong untuk keamanan

## Best Practices & Keamanan

1. **API Key Protection**:
   - API Key Google Maps sebaiknya tidak disimpan langsung dalam kode
   - Gunakan environment variables atau encrypted storage
   - Implementasikan rate limiting dan domain restriction di Google Cloud Console

2. **URL Management**:
   - Gunakan sistem environment untuk switch antara development dan production URL
   - Implementasikan URL versioning untuk backward compatibility

3. **Penggunaan dalam Kode**:
   - Selalu gunakan konstanta ini daripada hard-coded strings
   - Manfaatkan auto-completion IDE untuk menghindari typo
   ```dart
   // BENAR
   var baseUrl = AppConstans.BASE_URL;
   
   // SALAH
   var baseUrl = "https://reqres.in";
   ```

## Catatan Pengembangan
1. Perlu implementasi environment-based configuration
2. Pertimbangkan penggunaan secure storage untuk sensitive constants
3. Tambahkan dokumentasi untuk setiap penambahan konstanta baru
4. Pertimbangkan penggunaan enum untuk nilai-nilai yang terbatas

## Integrasi dengan Firebase
File ini nantinya bisa ditambahkan dengan konstanta Firebase seperti:
```dart
static const String FIREBASE_COLLECTION_USERS = "users";
static const String FIREBASE_COLLECTION_PLACES = "places";
```

## Pengembangan Selanjutnya
1. Implementasi sistem konfigurasi berbasis environment
2. Penambahan konstanta untuk fitur baru
3. Pemisahan konstanta berdasarkan modul
4. Implementasi sistem caching untuk nilai-nilai yang sering digunakan