---
title: Dokumentasi FavoritePage
description: FavoritePage adalah halaman yang menampilkan daftar tempat favorit yang telah disimpan oleh pengguna. Halaman ini menggunakan StatefulWidget dan menampilkan data dalam bentuk grid layout.
---


# Dokumentasi FavoritePage

## Lokasi File
```
lib/
└── ui/
    └── pages/
        └── favorite/
            └── favorite_page.dart
```

## Deskripsi Umum
FavoritePage adalah halaman yang menampilkan daftar tempat favorit yang telah disimpan oleh pengguna. Halaman ini menggunakan StatefulWidget dan menampilkan data dalam bentuk grid layout.

## Struktur Kode

### Import yang Digunakan
```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:musafir/controllers/home_controller.dart';
import 'package:musafir/data/firestore/user_store.dart';
import 'package:musafir/routes/routes_helper.dart';
import 'package:musafir/shared/theme.dart';
import 'package:musafir/ui/widgets/favorite_card.dart';
import 'package:musafir/ui/widgets/skeleton_card_rekomendasi.dart';
import 'package:musafir/utilitis/apps_constants.dart';
```

### State Management
- Menggunakan GetX untuk state management (`Get.find<HomeController>`)
- Menggunakan StatefulWidget untuk manajemen state lokal

## Komponen Utama

### 1. Future favorite
```dart
Future favorite = UserStore().bookmarkList().then((value) {
  if (value != null) {
    return value['place'];
  } else {
    return null;
  }
});
```
- **Fungsi**: Mengambil daftar bookmark dari UserStore
- **Return**: List tempat favorit atau null jika tidak ada data
- **Penggunaan**: Digunakan dalam FutureBuilder untuk menampilkan data

### 2. Widget header()
```dart
Widget header() {
  return Padding(
    padding: const EdgeInsets.only(top: 30, bottom: 30),
    child: Container(
      margin: const EdgeInsets.only(top: 21),
      width: double.infinity,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Center(
            child: Text(
              'Favorite',
              style: blackTextStyle.copyWith(
                fontSize: 16,
                fontWeight: extraBold,
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
```
- **Fungsi**: Menampilkan header halaman dengan judul "Favorite"
- **Style**: Menggunakan blackTextStyle dengan ukuran 16px dan weight extraBold
- **Layout**: Centered text dengan padding atas dan bawah

### 3. Widget listCard()
```dart
Widget listCard() {
  return FutureBuilder(
    future: favorite,
    builder: ((context, snapshot) {
      // Implementation
    }),
  );
}
```
- **Fungsi**: Menampilkan grid layout dari kartu-kartu tempat favorit
- **Komponen**:
  - GridView.builder untuk layout grid
  - FavoriteCard untuk setiap item
  - SkeletonCardRekomendasi untuk loading state
- **Fitur**:
  - Menampilkan pesan jika tidak ada data favorit
  - Loading state dengan skeleton loader
  - Navigasi ke detail tempat saat kartu diklik

#### Detail GridView
- maxCrossAxisExtent: 206
- mainAxisExtent: 190
- crossAxisSpacing: 15
- mainAxisSpacing: 15

#### Properti FavoriteCard
- name: Nama tempat
- city: Alamat
- imgUrl: URL foto tempat (menggunakan AppConstans.PLACE_PHOTO)
- km: Jarak (menggunakan index sebagai dummy data)
- isMasjid: Boolean berdasarkan type tempat

### 4. Navigation Logic
```dart
onTap: () {
  var homecontroller = Get.find<HomeController>();
  homecontroller.placeDetail(item['place_id']);

  Get.toNamed(RouteHelper.getHomeDetailPage(
    item['place_id'],
    item['place_name'],
    'favorite',
    item['type'],
  ));
}
```
- **Fungsi**: Menangani navigasi ke halaman detail
- **Parameter**:
  - place_id: ID tempat
  - place_name: Nama tempat
  - source: 'favorite' (menandakan asal navigasi)
  - type: Tipe tempat

## State dan Error Handling

### Loading State
- Menggunakan SkeletonCardRekomendasi saat loading
- Implementasi dalam FutureBuilder

### Error State
- Menampilkan pesan "Kamu belum memiliki favorite place" jika tidak ada data
- Pengecekan null pada data bookmark

## Penggunaan Widget

### Contoh Penggunaan FavoritePage
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => const FavoritePage()),
);
```

### Contoh Data Structure
```dart
{
  "place": [
    {
      "place_id": "123",
      "place_name": "Masjid Al-Akbar",
      "address": "Surabaya",
      "photo": "photo_url.jpg",
      "type": "mosque"
    }
  ]
}
```

## Dependensi
- GetX untuk state management
- UserStore untuk akses data bookmark
- FavoriteCard untuk tampilan item
- SkeletonCardRekomendasi untuk loading state
- RouteHelper untuk navigasi

## Catatan Penting
1. Widget menggunakan StatefulWidget untuk manajemen state lokal
2. Data loading menggunakan FutureBuilder untuk handle async operations
3. Menggunakan GetX untuk state management global
4. Grid layout digunakan untuk tampilan responsif
5. Implementasi loading state dengan skeleton loader

## Best Practices yang Diimplementasi
1. Pemisahan widget menjadi method terpisah untuk maintainability
2. Penggunaan konstan untuk URL foto
3. Implementasi loading state
4. Error handling untuk data null
5. Responsive layout dengan GridView

## Tips Pengembangan
1. Tambahkan refresh mechanism (pull to refresh)
2. Implementasi caching untuk data favorit
3. Tambahkan animasi transisi
4. Implementasi error boundary
5. Tambahkan fitur hapus favorit