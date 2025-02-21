---
title: "Dokumentasi Community Page"
description: "File ini merupakan implementasi halaman komunitas dalam aplikasi Musafir yang menggunakan framework Flutter dengan state management GetX."
---



# Dokumentasi Community Page

## Informasi Umum
**Lokasi File:** `lib/ui/pages/community/community_page.dart`

## Deskripsi
File ini merupakan implementasi halaman komunitas dalam aplikasi Musafir yang menggunakan framework Flutter dengan state management GetX. Halaman ini saat ini berfokus pada fungsionalitas untuk mendapatkan alamat menggunakan Google Geocoding API.

## Struktur File
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:musafir/controllers/google_controller.dart';
import 'package:musafir/shared/theme.dart';
import 'package:musafir/ui/widgets/custom_button.dart';
```

### Import yang Digunakan
1. **flutter/material.dart**: Framework utama Flutter untuk UI
2. **get/get.dart**: Package GetX untuk state management
3. **google_controller.dart**: Controller kustom untuk menangani operasi Google API
4. **theme.dart**: Konfigurasi tema aplikasi
5. **custom_button.dart**: Widget tombol kustom

## Komponen Utama

### CommunityPage
```dart
class CommunityPage extends StatelessWidget {
  const CommunityPage({super.key});
}
```

**Tipe**: StatelessWidget
**Deskripsi**: Halaman utama yang menampilkan fitur komunitas

### Layout Struktur
```dart
Scaffold(
  body: Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      CustomButton(...),
      GetBuilder<GoogleController>(...),
    ],
  ),
)
```

## Komponen-komponen Detail

### 1. CustomButton
```dart
CustomButton(
  title: 'Get Address',
  onPressed: () {
    Get.find<GoogleController>().getGeoCode();
  },
  width: 200,
)
```

**Fungsi**: 
- Menampilkan tombol untuk memicu proses geocoding
- Memanggil method getGeoCode() dari GoogleController
- Lebar tombol diset ke 200 logical pixels

### 2. GetBuilder
```dart
GetBuilder<GoogleController>(
  builder: (geocode) {
    return geocode.isLoaded
      ? Container(
          width: 200,
          margin: const EdgeInsets.all(10),
          child: Text(geocode.geoCode[0].formattedAddress),
        )
      : CircularProgressIndicator(color: kRedColor);
  },
)
```

**Fungsi**:
- Widget reaktif yang memantau perubahan state di GoogleController
- Menampilkan loading indicator saat proses geocoding berlangsung
- Menampilkan alamat hasil geocoding ketika data sudah tersedia

## State Management

### GoogleController
Controller ini (yang diimpor dari `controllers/google_controller.dart`) mengelola:
1. Status loading (`isLoaded`)
2. Data geocoding (`geoCode`)
3. Method untuk melakukan geocoding (`getGeoCode()`)

## Alur Kerja
1. Halaman dimuat dengan tombol "Get Address"
2. Pengguna menekan tombol
3. `getGeoCode()` dipanggil dari GoogleController
4. Loading indicator ditampilkan selama proses
5. Hasil alamat ditampilkan setelah proses selesai

## Contoh Penggunaan

### 1. Inisialisasi Controller
```dart
// Di file main.dart atau bindings
void main() {
  Get.put(GoogleController());
  runApp(MyApp());
}
```

### 2. Navigasi ke Halaman
```dart
// Dari halaman lain
Get.to(() => const CommunityPage());
```

### 3. Penggunaan dalam Route
```dart
// Di file routes.dart
GetPage(
  name: '/community',
  page: () => const CommunityPage(),
  binding: BindingsBuilder(() {
    Get.lazyPut(() => GoogleController());
  }),
)
```

## Dependensi Penting
1. GetX: Untuk state management dan navigasi
2. Google Maps Services: Untuk geocoding
3. Custom Widgets: CustomButton

## Best Practices yang Diimplementasikan
1. Penggunaan StatelessWidget untuk UI statis
2. Pemisahan logic ke dalam controller
3. Reactive state management dengan GetBuilder
4. Loading state handling
5. Error handling implisit melalui controller

## Catatan Pengembangan
1. Implementasi saat ini masih basic dan fokus pada fungsi geocoding
2. Bisa dikembangkan dengan menambahkan:
   - Error handling yang lebih robust
   - Caching hasil geocoding
   - Fitur komunitas lainnya
   - UI yang lebih kompleks

## Troubleshooting Umum
1. Loading tidak muncul:
   - Pastikan GoogleController sudah diinisialisasi
   - Periksa koneksi internet

2. Alamat tidak muncul:
   - Periksa response dari Google API
   - Pastikan format data di controller sesuai

3. Tombol tidak responsif:
   - Periksa binding controller
   - Periksa implementasi CustomButton

## Tips Pengembangan Lanjutan
1. Tambahkan error handling eksplisit
2. Implementasikan caching untuk hasil geocoding
3. Tambahkan animasi transisi
4. Integrasikan dengan fitur komunitas lainnya

## Referensi API
- `getGeoCode()`: Mendapatkan alamat dari koordinat
- `isLoaded`: Status loading proses geocoding
- `geoCode`: Data hasil geocoding

## Keamanan
1. Pastikan API key Google tersimpan dengan aman
2. Implementasikan rate limiting untuk panggilan API
3. Validasi input sebelum melakukan geocoding

## Performa
1. Gunakan lazy loading untuk controller
2. Implementasikan caching untuk mengurangi panggilan API
3. Optimalkan rebuild widget dengan GetBuilder

