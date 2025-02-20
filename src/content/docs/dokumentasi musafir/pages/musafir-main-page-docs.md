---
title: Main Page Dokumentation
description: Dokumen Penjelasan main_page.dart
---

# Dokumentasi Komprehensif Musafir App

## Struktur File
File-file yang dianalisis berada di direktori `lib/ui/`:
- `main_page.dart`
- `splash_widget.dart`

## 1. Main Page (main_page.dart)

### Lokasi File
```
lib/ui/pages/main_page.dart
```

### Deskripsi Umum
Main Page merupakan halaman utama aplikasi yang menampilkan navigasi bottom bar dan mengatur perpindahan antar tab/halaman. File ini menggunakan GetX untuk state management dan persistent_bottom_nav_bar_v2 untuk navigasi.

### Komponen Utama

#### 1. MainPage Widget
```dart
class MainPage extends StatelessWidget
```
- **Tipe**: Stateless Widget
- **Fungsi**: Widget utama yang membungkus seluruh konten halaman utama
- **Kegunaan**: Menampilkan layout utama aplikasi dengan bottom navigation bar dan floating action button

#### 2. Controller
```dart
var mainPageC = Get.find<MainPageController>();
```
- **Tipe**: GetX Controller
- **Fungsi**: Mengelola state untuk tab navigation
- **Kegunaan**: Menyimpan dan mengupdate indeks tab yang aktif

#### 3. PersistentTabController
```dart
PersistentTabController _controller = PersistentTabController(
    initialIndex: mainPageC.menuTabController.value
);
```
- **Tipe**: Controller untuk bottom navigation
- **Fungsi**: Mengatur state tab yang aktif
- **Kegunaan**: Mengelola perpindahan antar tab dan menyimpan posisi tab aktif

### Method-Method Utama

#### 1. build()
```dart
Widget build(BuildContext context)
```
- **Parameter**: BuildContext context
- **Return**: Widget
- **Fungsi**: Membangun UI utama aplikasi
- **Komponen**:
  - Scaffold sebagai container utama
  - Stack untuk menumpuk widget
  - PersistentTabView untuk navigasi
  - FloatingActionButton untuk aksi tambah

#### 2. _displayBottomSheet()
```dart
Future _displayBottomSheet(BuildContext context)
```
- **Parameter**: BuildContext context
- **Return**: Future
- **Fungsi**: Menampilkan bottom sheet menu
- **Trigger**: Ketika FAB ditekan
- **Implementasi**: Menggunakan showModalBottomSheet

### Contoh Penggunaan

1. Navigasi Tab
```dart
// Pindah ke tab tertentu
mainPageC.menuTabController.value = 2;
```

2. Menampilkan Bottom Sheet
```dart
_displayBottomSheet(context);
```

## 2. Splash Page (splash_widget.dart)

### Lokasi File
```
lib/ui/pages/splash_widget.dart
```

### Deskripsi Umum
Splash Page merupakan halaman pembuka aplikasi yang menampilkan logo dan tombol untuk sign in atau sign up. Menggunakan StatefulWidget untuk manajemen state internal.

### Komponen Utama

#### 1. SplashPage Widget
```dart
class SplashPage extends StatefulWidget
```
- **Tipe**: Stateful Widget
- **Fungsi**: Menampilkan halaman splash dengan logo dan tombol aksi
- **State**: _SplashPageState

#### 2. Layout Components
- **Logo Container**:
  - Menggunakan AssetImage untuk menampilkan logo
  - Responsive sizing dengan Expanded widget
- **Action Buttons**:
  - Sign In button
  - Sign Up button
  - Styling menggunakan TextButton dengan custom style

### Method-Method Utama

#### 1. build()
```dart
Widget build(BuildContext context)
```
- **Parameter**: BuildContext context
- **Return**: Widget
- **Fungsi**: Membangun UI splash page
- **Komponen**:
  - Background biru (kBlueColor)
  - Column untuk layout vertikal
  - Logo dan tombol-tombol aksi

### Navigasi

1. Sign In Navigation
```dart
Get.to(
  () => const SignInPage1(),
  transition: Transition.fadeIn,
  duration: const Duration(milliseconds: 300),
);
```
- **Trigger**: Ketika tombol "Masuk" ditekan
- **Transisi**: Fade in
- **Durasi**: 300ms

2. Sign Up Navigation
```dart
Get.to(
  () => const SignUpPage1(),
  transition: Transition.fadeIn,
  duration: const Duration(milliseconds: 300),
);
```
- **Trigger**: Ketika tombol "Daftar" ditekan
- **Transisi**: Fade in
- **Durasi**: 300ms

### Styling

1. Tombol Style
```dart
TextButton.styleFrom(
  backgroundColor: kBlueSurface,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(defaultRadius),
  ),
)
```
- **Background**: kBlueSurface
- **Shape**: Rounded corners
- **Border Radius**: defaultRadius

2. Text Style
```dart
blackTextStyle.copyWith(
  fontSize: 16,
  fontWeight: bold,
  color: kBluePressed,
  height: 0.6,
)
```
- **Size**: 16
- **Weight**: Bold
- **Color**: kBluePressed
- **Line Height**: 0.6

### Responsive Design
- Penggunaan Expanded untuk logo container
- Fixed width untuk tombol (339)
- Margin dan padding yang konsisten
- SizedBox untuk spacing

### Best Practices yang Diimplementasikan
1. Penggunaan konstanta untuk warna dan style
2. Pemisahan widget menjadi komponen logical
3. Penggunaan GetX untuk navigasi yang clean
4. Proper widget hierarchy untuk performance
5. Konsisten dalam penggunaan spacing dan sizing

### Catatan Penting
1. File menggunakan GetX untuk state management dan navigasi
2. Implementasi transisi halaman yang smooth
3. Penggunaan asset gambar yang proper
4. Styling yang konsisten dengan theme aplikasi
5. Error handling minimal (perlu ditambahkan)

### Rekomendasi Pengembangan
1. Tambahkan loading state
2. Implementasi error handling
3. Tambahkan animasi untuk logo
4. Optimize image loading
5. Tambahkan unit testing

### Dependencies
1. flutter/material.dart
2. get/get.dart (GetX)
3. Theme custom (shared/theme.dart)
4. Auth pages
5. persistent_bottom_nav_bar_v2