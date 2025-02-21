---
title: Dokumentasi Fitur Explore Musafir
description: Semua file berada di direktori: `lib/ui/pages/explore/`
---


# Dokumentasi Fitur Explore Musafir

## Lokasi File
Semua file berada di direktori: `lib/ui/pages/explore/`

## Struktur Files
1. explore_pages.dart
2. explore_search.dart 
3. rencana_page.dart
4. rencana_page_edit.dart
5. search_place.dart
6. search_place2.dart

## Deskripsi Umum
Fitur Explore pada aplikasi Musafir adalah sistem yang memungkinkan pengguna untuk:
- Mencari dan merencanakan perjalanan
- Mencari tempat makan halal
- Mencari masjid terdekat
- Menyimpan dan mengedit rencana perjalanan
- Melihat detail lokasi di peta

## Detail Implementasi Per File

### 1. explore_pages.dart

#### Fungsi Utama
File ini menangani tampilan utama halaman explore yang menampilkan daftar rencana perjalanan pengguna.

#### State Management
```dart
class _ExplorePageState extends State<ExplorePage> {
  List dataPlans = [];
  var authController = Get.find<AuthController>();
}
```

#### Fungsi-fungsi Kunci

##### getData()
```dart
void getData() async {
  UserStore().exploreList().then((value) {
    setState(() {
      for (var i in value.docs) {
        Map<String, dynamic> payload = {
          "place_id": i.data()['place_id'],
          'place_name': i.data()['place_name'],
          // ... data lainnya
        };
        dataPlans.add(payload);
      }
    });
  });
}
```
- **Kegunaan**: Mengambil daftar rencana perjalanan dari Firestore
- **Trigger**: Dipanggil saat halaman pertama kali dibuka (initState)
- **Output**: Mengisi variable dataPlans dengan data dari database

##### navigasiPeta()
```dart
void navigasiPeta(int indexParent) async {
  final availableMaps = await MapLauncher.installedMaps;
  await availableMaps.first.showMarker(
    coords: Coords(dataPlans[indexParent]['lat'], dataPlans[indexParent]['lng']),
    title: "${dataPlans[indexParent]['place_name']}",
  );
}
```
- **Kegunaan**: Membuka lokasi di aplikasi peta
- **Parameter**: indexParent (index dari rencana perjalanan yang dipilih)
- **Dependencies**: Menggunakan package map_launcher

##### edit()
```dart
void edit(int indexParent) async {
  var explorC = Get.find<ExploreController>();
  explorC.namePlan.text = dataPlans[indexParent]['name_plan'];
  // ... set data lainnya
  Get.offNamed(RouteHelper.getRencanaPageEdit());
}
```
- **Kegunaan**: Mempersiapkan data untuk halaman edit
- **Flow**: 
  1. Mengambil data dari dataPlans
  2. Mengisi controller dengan data tersebut
  3. Navigasi ke halaman edit

#### Widgets Utama

##### header()
- Menampilkan judul "Explore"
- Styling menggunakan blackTextStyle

##### cardPerjalanan()
- Widget untuk tampilan ketika belum ada rencana perjalanan
- Berisi CTA untuk membuat rencana pertama

##### listPlan()
- Widget untuk menampilkan setiap rencana perjalanan
- Menggunakan ExpansionTile untuk tampilan yang bisa dibuka/tutup
- Menampilkan detail resto dan masjid yang dipilih

### 2. explore_search.dart

#### Fungsi Utama
Menangani pencarian lokasi tujuan dengan integrasi Place API.

#### Controller Dependencies
```dart
var locationController = Get.find<LocationController>();
```

#### Fungsi-fungsi Kunci

##### getData()
```dart
void getData() async {
  UserStore().getUserDetail().then((value) {
    setState(() {
      address = value['address'] ?? 'none';
    });
  });
}
```
- **Kegunaan**: Mengambil alamat default user
- **Output**: Mengisi variable address

#### Widgets Utama

##### header()
- SearchBar untuk mencari lokasi
- Integrasi dengan Google Places API
- Auto-complete suggestions

##### listDataSearch()
- Menampilkan hasil pencarian
- Menggunakan LocationListTile untuk setiap hasil

[Dokumentasi berlanjut dengan detail implementasi file lainnya...]

## Integrasi dengan Firebase

### Firestore Collections
1. **explore_plans**
   - place_id: String
   - place_name: String
   - start_time: String
   - end_time: String
   - name_plan: String
   - resto: Array
   - mosque: Array
   - lat: Double
   - lng: Double

### Authentication
Menggunakan Firebase Authentication untuk:
- Google Sign In
- Email/Password Authentication

## State Management
Aplikasi menggunakan GetX untuk state management dengan beberapa controller utama:
1. ExploreController
2. LocationController
3. AuthController

## Dependencies Utama
```yaml
dependencies:
  get: ^4.6.1
  firebase_core: ^2.4.1
  firebase_auth: ^4.2.5
  cloud_firestore: ^4.3.1
  google_sign_in: ^5.4.2
  map_launcher: ^2.5.0+1
```

## Alur Penggunaan

### Membuat Rencana Perjalanan Baru
1. User membuka halaman Explore
2. Klik tombol "Buat Rencana"
3. Pilih lokasi tujuan menggunakan search
4. Isi detail rencana (nama, tanggal)
5. Pilih resto halal (opsional)
6. Pilih masjid terdekat (opsional)
7. Simpan rencana

### Mengedit Rencana
1. Buka detail rencana yang ada
2. Klik tombol edit
3. Modifikasi detail yang diinginkan
4. Simpan perubahan

### Melihat Lokasi di Peta
1. Buka detail rencana
2. Klik "Lihat Peta"
3. Aplikasi akan membuka peta default device

## Tips Pengembangan
1. Selalu handle error dari API calls
2. Validasi input user
3. Implementasi loading state
4. Cache data untuk performa
5. Implementasi retry mechanism untuk network calls

## Masalah Umum dan Solusi

### 1. Load Data Lambat
```dart
// Implementasi caching
final prefs = await SharedPreferences.getInstance();
final cachedData = prefs.getString('explore_data');
if (cachedData != null) {
  // Use cached data
} else {
  // Fetch new data
}
```

### 2. Google Sign In Gagal
```dart
try {
  final result = await GoogleSignIn().signIn();
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error is PlatformException) {
    // Handle platform specific errors
  }
}
```

## Best Practices
1. Gunakan constants untuk strings
2. Implementasi proper error handling
3. Validasi input user
4. Implementasi loading states
5. Gunakan proper state management
6. Cache data untuk performa
7. Implementasi proper logging

## Pengembangan Kedepan
1. Implementasi offline mode
2. Optimize network calls
3. Add unit tests
4. Implement CI/CD
5. Add analytics
6. Improve error handling
7. Add more features

