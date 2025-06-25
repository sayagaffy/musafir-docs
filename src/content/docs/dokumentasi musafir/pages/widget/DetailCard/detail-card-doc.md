---
title: "Detail Card Widget Documentation"
description: "Widget kompleks untuk menampilkan informasi detail tempat dalam aplikasi Musafir dengan fitur bookmark, rating, ulasan, dan informasi lokasi terintegrasi."
---

# Dokumentasi DetailCard Widget

## Lokasi File
```
lib/ui/pages/home/detail_card.dart
```

## Deskripsi Umum
DetailCard adalah widget stateful yang menampilkan informasi lengkap tentang suatu tempat dalam aplikasi Musafir. Widget ini mengintegrasikan berbagai fitur seperti informasi kehalalan, bookmark, rating, ulasan, dan peta lokasi.

## Parameter Konstruktor
```dart
const DetailCard({
  super.key,
  required this.pageId,    // ID unik tempat
  required this.page,      // Nama tempat/halaman
  required this.from,      // Halaman asal navigasi
  required this.type,      // Tipe tempat (resto/masjid)
});
```

## State Management
```dart
class _DetailCardState extends State<DetailCard> {
  bool statusBookmark = false;  // Status bookmark
  String addressCom = '';       // Alamat lengkap
  String? latlang;             // Koordinat lokasi
  final locationC = Get.find<LocationController>();
}
```

## Fungsi-Fungsi Utama

### 1. getData()
**Deskripsi**: Mengambil data lokasi pengguna saat ini.
**Kegunaan**: Inisialisasi koordinat untuk perhitungan jarak.
```dart
void getData() async {
  UserStore().getUserDetail().then((value) {
    setState(() {
      latlang = value['lat'] != null 
        ? '${value['lat']},${value['lng']}' 
        : locationC.latlng.toString();
    });
  });
}
```

### 2. addressComponent()
**Deskripsi**: Memproses komponen alamat dari Google Places API.
**Kegunaan**: Menyusun alamat lengkap yang mudah dibaca.
```dart
void addressComponent(home) {
  var area4 = '';
  var area2 = '';
  var area3 = '';
  
  // Ekstrak komponen alamat
  for (var i in home.placeDtl.addressComponents) {
    if (i.types.first == "administrative_area_level_2") {
      area2 = i.longName;
    }
    // ... area3 dan area4
  }
  addressCom = '$area4, $area3, $area2';
}
```

### 3. Widget bookmark()
**Deskripsi**: Mengelola tampilan dan fungsi bookmark.
**Kegunaan**: 
- Menampilkan ikon bookmark
- Mengecek status bookmark dari UserStore
- Menangani perubahan status bookmark

```dart
Widget bookmark() {
  dynamic checkBookmark = UserStore().checkBookmark(widget.pageId);
  return FutureBuilder(
    future: checkBookmark,
    builder: ((context, snapshot) {
      // Logic status bookmark
    })
  );
}
```

### 4. Widget backgroundImage()
**Deskripsi**: Menampilkan gambar latar dan informasi dasar tempat.
**Fitur**:
- Gambar dari Google Places API
- Overlay gradien
- Tombol navigasi
- Informasi nama dan tipe tempat
- Tombol bookmark dan tambah tempat

### 5. Widget tileReview()
**Deskripsi**: Menampilkan informasi ringkas dalam bentuk tile.
**Komponen**:
- Rating bintang
- Jumlah ulasan
- Jarak lokasi
- Level harga
- Status prayer space

### 6. Widget content()
**Deskripsi**: Menampilkan informasi status kehalalan dan alamat.
**Fitur**:
- Status halal dengan warna indikator
- Informasi verifikasi
- Alamat lengkap
- Dialog informasi tambahan

### 7. Widget mapLocation()
**Deskripsi**: Menampilkan peta Google Maps.
**Fitur**:
- Marker lokasi
- Zoom control
- Info window

### 8. Widget rating() dan ulasan()
**Deskripsi**: Mengelola sistem rating dan ulasan.
**Fitur**:
- Input rating
- Daftar ulasan
- Format tanggal
- Foto profil reviewer
- Pagination ulasan

## Dialog dan Modal

### 1. _dialogBuilder()
**Deskripsi**: Dialog untuk menu lanjutan.
**Opsi**:
- Laporkan tempat
- Batalkan

### 2. _showReportBuilder()
**Deskripsi**: Modal untuk laporan tempat.
**Opsi**:
- Tempat tutup
- Status halal
- Input custom

### 3. _reportBuilder()
**Deskripsi**: Konfirmasi laporan.
**Tampilan**:
- Pesan terima kasih
- Informasi tindak lanjut

## Contoh Penggunaan

### 1. Navigasi ke Detail Tempat
```dart
Get.to(() => DetailCard(
  pageId: "tempat123",
  page: "Restoran ABC",
  from: "homePage",
  type: "restaurant"
));
```

### 2. Penggunaan dalam HomeScreen
```dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemBuilder: (context, index) {
        return GestureDetector(
          onTap: () => Get.to(() => DetailCard(
            pageId: places[index].id,
            page: places[index].name,
            from: "homePage",
            type: places[index].type
          )),
          child: PlaceCard(place: places[index])
        );
      }
    );
  }
}
```

## State Management dan Data Flow

### 1. GetX Controller Integration
```dart
final HomeController home = Get.find<HomeController>();
final LocationController locationC = Get.find<LocationController>();
```

### 2. Data Loading Flow
1. Widget dimuat
2. getData() dipanggil di initState
3. Location data diinisialisasi
4. UI diupdate dengan setState

### 3. Error Handling
- Fallback image untuk foto tidak tersedia
- Nilai default untuk data kosong
- Loading state dengan Skeletonizer

## Styling dan Theming

### 1. Warna dan Typography
```dart
style: blackTextStyle.copyWith(
  fontSize: 16,
  fontWeight: bold,
)
```

### 2. Layout Constants
```dart
const EdgeInsets.symmetric(
  horizontal: 15,
  vertical: 15,
)
```

## Tips Pengembangan
1. Gunakan GetX untuk state management
2. Implementasikan caching untuk data Places
3. Optimalkan loading gambar
4. Pertimbangkan offline support

## Catatan Penting
- Widget ini bergantung pada Google Places API
- Memerlukan konfigurasi Google Maps
- Perlu handle permission lokasi
- Pertimbangkan lazy loading untuk performa

## Dependensi
- google_maps_flutter
- flutter_rating_bar
- get
- skeletonizer
- intl
