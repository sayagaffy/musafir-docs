---
title: "Place Detail Model Basic"
description: "S"
---

# Dokumentasi Model PlaceDetail
**Path**: `lib/models/place_detail_model.dart`

## Deskripsi Umum
File ini berisi model data untuk detail tempat yang diambil dari Google Places API. Model ini digunakan untuk memetakan respons JSON dari API ke objek Dart yang terstruktur.

## Struktur Kelas Utama

### 1. PlaceDetail
Kelas pembungkus utama yang menyimpan hasil response dari API.

#### Properti:
- `_result`: Objek PlaceDetailModel
- `_status`: Status response dari API

#### Constructor:
```dart
PlaceDetail({PlaceDetailModel? result, String? status})
```

#### Method:
- `fromJson`: Mengkonversi JSON ke objek PlaceDetail
```dart
// Contoh penggunaan:
final placeDetail = PlaceDetail.fromJson({
  'result': {/* data detail tempat */},
  'status': 'OK'
});
```

### 2. PlaceDetailModel
Kelas utama yang menyimpan seluruh detail tempat.

#### Properti Utama:
- `name`: Nama tempat
- `rating`: Rating tempat (double)
- `formattedAddress`: Alamat lengkap
- `geometry`: Lokasi geografis
- `photos`: Daftar foto
- `openingHours`: Jam operasional
- `reviews`: Ulasan pengguna
- `priceLevel`: Level harga (1-4)

#### Fitur Kuliner:
- `servesBeer`: Menyediakan bir
- `servesBreakfast`: Menyediakan sarapan
- `servesBrunch`: Menyediakan brunch
- `servesDinner`: Menyediakan makan malam
- `servesLunch`: Menyediakan makan siang
- `servesWine`: Menyediakan wine

#### Layanan:
- `delivery`: Layanan antar
- `takeout`: Layanan bawa pulang
- `dineIn`: Makan di tempat
- `reservable`: Bisa reservasi
- `curbsidePickup`: Layanan ambil di pinggir jalan

### 3. AddressComponents
Komponen detail alamat tempat.

#### Properti:
- `longName`: Nama panjang komponen alamat
- `shortName`: Nama pendek/singkatan
- `types`: Tipe komponen alamat

```dart
// Contoh penggunaan:
final addressComponent = AddressComponents.fromJson({
  'long_name': 'Jakarta',
  'short_name': 'JKT',
  'types': ['locality', 'political']
});
```

### 4. Geometry
Informasi geografis tempat.

#### Sub-kelas:
- `Location`: Koordinat latitude dan longitude
- `Viewport`: Batas tampilan peta

```dart
// Contoh penggunaan:
final geometry = Geometry.fromJson({
  'location': {
    'lat': -6.2088,
    'lng': 106.8456
  },
  'viewport': {/* data viewport */}
});
```

### 5. OpeningHours
Informasi jam operasional.

#### Properti:
- `openNow`: Status buka saat ini
- `periods`: Periode jam operasional
- `weekdayText`: Teks jam operasional per hari

```dart
// Contoh penggunaan:
final openingHours = OpeningHours.fromJson({
  'open_now': true,
  'periods': [/* data periode */],
  'weekday_text': ['Senin: 09:00-22:00', /* dst */]
});
```

### 6. Reviews
Ulasan pengguna untuk tempat.

#### Properti:
- `authorName`: Nama pemberi ulasan
- `rating`: Rating yang diberikan
- `text`: Isi ulasan
- `time`: Waktu ulasan
- `language`: Bahasa ulasan
- `translated`: Status terjemahan

```dart
// Contoh penggunaan:
final review = Reviews.fromJson({
  'author_name': 'John Doe',
  'rating': 4.5,
  'text': 'Tempat yang bagus',
  'time': 1635739200
});
```

## Penggunaan Umum

### 1. Membuat objek dari JSON
```dart
final jsonResponse = {
  'result': {
    'name': 'Restoran ABC',
    'rating': 4.5,
    'formatted_address': 'Jl. Example No.123',
    // ... data lainnya
  },
  'status': 'OK'
};

final placeDetail = PlaceDetail.fromJson(jsonResponse);
```

### 2. Mengakses Data
```dart
// Mengakses nama tempat
final placeName = placeDetail.result?.name;

// Mengakses rating
final rating = placeDetail.result?.rating;

// Mengakses alamat
final address = placeDetail.result?.formattedAddress;

// Mengecek status buka
final isOpen = placeDetail.result?.openingHours?.openNow;
```

## Catatan Penting
1. Semua properti menggunakan tipe nullable (?) untuk menghindari null errors
2. Model menggunakan konvensi penamaan snake_case untuk JSON dan camelCase untuk Dart
3. Konversi tipe data otomatis dilakukan dalam fromJson (misal: double untuk rating)
4. File ini crucial untuk integrasi dengan Google Places API

## Use Cases

### 1. Menampilkan Detail Tempat
```dart
void displayPlaceDetails(PlaceDetail place) {
  final details = place.result;
  print('Nama: ${details?.name}');
  print('Alamat: ${details?.formattedAddress}');
  print('Rating: ${details?.rating}/5.0');
  print('Total Review: ${details?.userRatingsTotal}');
}
```

### 2. Menampilkan Jam Operasional
```dart
void displayOpeningHours(PlaceDetail place) {
  final hours = place.result?.openingHours;
  if (hours?.openNow == true) {
    print('Status: Buka');
    print('Jam Operasional:');
    hours?.weekdayText?.forEach((day) => print(day));
  } else {
    print('Status: Tutup');
  }
}
```

### 3. Menampilkan Review
```dart
void displayReviews(PlaceDetail place) {
  final reviews = place.result?.reviews;
  reviews?.forEach((review) {
    print('Reviewer: ${review.authorName}');
    print('Rating: ${review.rating}/5.0');
    print('Ulasan: ${review.text}');
    print('---');
  });
}
```

## Debugging Tips
1. Gunakan null checks saat mengakses properti nested
2. Perhatikan tipe data saat parsing JSON
3. Gunakan try-catch saat parsing untuk menangkap FormatException

## Best Practices
1. Selalu validasi response sebelum parsing
2. Gunakan null safety untuk menghindari runtime errors
3. Implementasikan error handling untuk kasus API error
4. Dokumentasikan perubahan model sesuai dengan perubahan API

