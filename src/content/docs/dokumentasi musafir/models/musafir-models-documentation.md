---
title: Model Documentation Basic
description: Penjelasan Mendasar Model Keseluruhan musafir app.
---

# Dokumentasi Model Musafir App

## Lokasi File
Semua file model berada di direktori: `lib/models/`

## Daftar Model
1. Address Model (`address_model.dart`)
2. Distance Model (`distance_model.dart`)
3. Geocode Model (`geocode_model.dart`)
4. GetPlaces Model (`getplaces_model.dart`)
5. Nearby Model (`nearby_model.dart`)
6. Response Model (`response_model.dart`)
7. SignUp Body Model (`signup_body_model.dart`)
8. Users Model (`users_model.dart`)

## Detail Model

### 1. Address Model (`address_model.dart`)

#### Struktur Kelas
- `UserMode`
- `CountryModel`
- `ProvinceModel`
- `CityModel`
- `StringExtension`

#### UserMode
Model untuk mengelola data pengguna.

**Properti:**
- `id`: String - ID unik pengguna
- `createdAt`: DateTime - Waktu pembuatan
- `name`: String - Nama pengguna
- `avatar`: String - URL avatar

**Method:**
```dart
// Membuat objek dari JSON
factory UserMode.fromJson(Map<String, dynamic> json)

// Membuat list objek dari JSON
static List<UserMode> fromJsonList(List list)

// Mengubah user menjadi string
String userAsString()

// Filter berdasarkan tanggal pembuatan
bool userFilterByCreationDate(String filter)

// Membandingkan dua user
bool isEqual(UserMode model)
```

**Contoh Penggunaan:**
```dart
final user = UserMode.fromJson({
  "id": "1",
  "createdAt": "2024-02-20T10:00:00Z",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg"
});

print(user.userAsString()); // Output: #1 John Doe
```

#### CountryModel
Model untuk data negara.

**Properti:**
- `id`: String
- `name`: String
- `iso`: String (kode ISO negara)

#### ProvinceModel
Model untuk data provinsi.

**Properti:**
- `id`: String
- `name`: String
- `countryId`: String (referensi ke CountryModel)

#### CityModel
Model untuk data kota.

**Properti:**
- `id`: String
- `name`: String
- `provinceId`: String (referensi ke ProvinceModel)

### 2. Distance Model (`distance_model.dart`)

Model untuk mengelola data jarak dan durasi dari Google Maps Distance Matrix API.

#### Struktur Kelas
- `DistanceMod`
- `DistanceModel`
- `Elements`
- `Distance`

**Contoh Penggunaan:**
```dart
final distance = DistanceMod.fromJson({
  "destination_addresses": ["Jakarta"],
  "origin_addresses": ["Bandung"],
  "rows": [
    {
      "elements": [
        {
          "distance": {
            "text": "151 km",
            "value": 151000
          },
          "duration": {
            "text": "3 hours",
            "value": 10800
          },
          "status": "OK"
        }
      ]
    }
  ],
  "status": "OK"
});
```

### 3. Geocode Model (`geocode_model.dart`)

Model untuk hasil geocoding dari Google Maps Geocoding API.

#### Struktur Kelas
- `Geocode`
- `GeocodeModel`
- `AddressComponents`
- `Geometry`
- `Location`

**Kegunaan:**
- Mengkonversi alamat menjadi koordinat (latitude/longitude)
- Memformat alamat lengkap
- Memecah komponen alamat (jalan, kota, provinsi, dll)

### 4. GetPlaces Model (`getplaces_model.dart`)

Model untuk hasil pencarian tempat dari Google Places API.

#### Struktur Kelas
- `GetPlaces`
- `GetPlacesModel`
- `StructuredFormatting`
- `MainTextMatchedSubstrings`

**Contoh Penggunaan:**
```dart
final places = GetPlaces.fromJson({
  "predictions": [
    {
      "description": "Monas, Jakarta",
      "place_id": "ChIJ17cyhEl71i0R0M-q5s5njF4",
      "reference": "...",
      "structured_formatting": {
        "main_text": "Monas",
        "secondary_text": "Jakarta"
      }
    }
  ],
  "status": "OK"
});
```

### 5. Nearby Model (`nearby_model.dart`)

Model untuk hasil pencarian tempat terdekat dari Google Places API.

#### Struktur Kelas
- `NearbyPlace`
- `NearbyPlaceModel`
- `Geometry`
- `Location`
- `Viewport`
- `OpeningHours`
- `Photos`
- `PlusCode`

**Properti Penting NearbyPlaceModel:**
- `name`: Nama tempat
- `rating`: Rating (0-5)
- `vicinity`: Alamat singkat
- `photos`: Foto-foto tempat
- `priceLevel`: Level harga (0-4)
- `openingHours`: Info jam buka

### 6. Response Model (`response_model.dart`)

Model sederhana untuk respons API.

**Properti:**
- `_isSuccess`: boolean - Status keberhasilan
- `_message`: String - Pesan respons

**Contoh Penggunaan:**
```dart
final response = ResponseModel(true, "Berhasil mendaftar");
print(response.isSuccess); // true
print(response.message); // "Berhasil mendaftar"
```

### 7. SignUp Body Model (`signup_body_model.dart`)

Model untuk request body saat registrasi.

**Properti:**
- `email`: String
- `password`: String

**Method:**
```dart
Map<String, dynamic> toJson()
```

### 8. Users Model (`users_model.dart`)

Model untuk manajemen data pengguna dengan pagination.

#### Struktur Kelas
- `Users` (container dengan pagination)
- `UsersModel` (data pengguna individual)
- `Support` (informasi dukungan)

**Properti Users:**
- `page`: Halaman saat ini
- `perPage`: Jumlah item per halaman
- `total`: Total seluruh data
- `totalPages`: Total halaman
- `data`: List<UsersModel>

**Contoh Penggunaan:**
```dart
final users = Users.fromJson({
  "page": 1,
  "per_page": 10,
  "total": 100,
  "total_pages": 10,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
});
```

## Catatan Penting
1. Semua model mengimplementasikan `fromJson` untuk deserialisasi data dari API
2. Beberapa model memiliki `toJson` untuk serialisasi data ke API
3. Model-model yang berhubungan dengan Google Maps API (`Distance`, `Geocode`, `GetPlaces`, `Nearby`) mengikuti struktur respons API Google Maps
4. Penggunaan `late` untuk variabel yang diinisialisasi setelah deklarasi
5. Implementasi proper null safety dengan penggunaan `?` untuk properti opsional

## Best Practices yang Diimplementasikan
1. Penggunaan factory constructor untuk pembuatan objek dari JSON
2. Proper error handling dengan null safety
3. Pemisahan model berdasarkan fungsi
4. Dokumentasi kode yang jelas
5. Implementasi method pembantu untuk operasi umum

## Penggunaan Extension
```dart
extension StringExtension on String {
  String toCapitalized()
  String toTitleCase()
}
```

Digunakan untuk memformat string menjadi proper case, contoh:
```dart
"hello world".toTitleCase() // "Hello World"
"heLLo".toCapitalized() // "Hello"
```
