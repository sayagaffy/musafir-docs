---
title: "Modul Account [account page, faq, info profile, privasi]"
description: "dokumentasi modul akun"
---

# Dokumentasi Modul Account - Musafir App

## Struktur Folder
```
lib/
└── ui/
    └── pages/
        └── account/
            ├── account_page.dart
            ├── faq.dart 
            ├── info_profile.dart
            └── privasi.dart
```

## Overview
Modul Account menangani semua fungsionalitas terkait manajemen akun pengguna dalam aplikasi Musafir. Modul ini terdiri dari beberapa halaman utama yang menangani berbagai aspek informasi dan pengaturan akun pengguna.

## 1. Account Page (account_page.dart)

### Deskripsi
Halaman utama untuk menampilkan dan mengelola informasi akun pengguna. Halaman ini menampilkan profil pengguna dan berbagai opsi pengaturan.

### Komponen Utama
- Avatar pengguna
- Informasi profil dasar (nama depan, nama belakang)
- Level panduan lokal
- Menu pengaturan

### Class dan Method

#### AccountPage (StatefulWidget)
```dart
class AccountPage extends StatefulWidget {
  const AccountPage({super.key});
}
```

#### _AccountPageState
State management untuk AccountPage.

##### Variabel State:
- `namaDepan`: String untuk menyimpan nama depan pengguna
- `namaBelakang`: String untuk menyimpan nama belakang pengguna

##### Method:

###### initState()
```dart
@override
void initState() {
  getDataUser();
  super.initState();
}
```
- Dipanggil saat widget pertama kali dibuat
- Memanggil `getDataUser()` untuk mengambil data pengguna

###### getDataUser()
```dart
void getDataUser() async {
  UserStore().getUserDetail().then((value) {
    setState(() {
      namaDepan = value['firstName'] ?? value['username'];
      namaBelakang = value['lastName'];
    });
  });
}
```
- Mengambil detail pengguna dari UserStore
- Memperbarui state dengan nama depan dan belakang pengguna
- Menggunakan fallback ke username jika firstName tidak ada

##### Widget Tree
1. Background dengan warna #F5F5F5
2. SingleChildScrollView dengan BouncingScrollPhysics
3. Profil Section:
   - Avatar
   - Nama Lengkap
   - Level Guide
   - Point
4. Menu Options:
   - Info Profile
   - Privasi
   - FAQ
   - Komunitas
   - Rencana Perjalanan
   - Keluar

### Extension
```dart
extension StringExtension on String {
  String toCapitalized() =>
      length > 0 ? '${this[0].toUpperCase()}${substring(1).toLowerCase()}' : '';
  String toTitleCase() => replaceAll(RegExp(' +'), ' ')
      .split(' ')
      .map((str) => str.toCapitalized())
      .join(' ');
}
```
- Extension untuk manipulasi string
- `toCapitalized()`: Mengubah huruf pertama menjadi kapital
- `toTitleCase()`: Mengubah setiap kata menjadi format Title Case

## 2. Info Profile (info_profile.dart)

### Deskripsi
Halaman untuk mengedit informasi profil pengguna. Menampilkan form dengan data pengguna yang dapat diubah.

### Komponen Utama
- Form edit profil
- Avatar upload
- Fields:
  - Email (readonly)
  - Nama Depan
  - Nama Belakang
  - Bio
  - Phone

### Class dan Method

#### InfoProfile (StatefulWidget)
```dart
class InfoProfile extends StatefulWidget {
  const InfoProfile({super.key});
}
```

#### _InfoProfileState
State management untuk InfoProfile.

##### Variabel State:
- `namaDepan`: String
- `namaBelakang`: String
- `bio`: String
- `phone`: String
- `email`: String

##### Method:

###### getDataUser()
```dart
void getDataUser() async {
  UserStore().getUserDetail().then((value) {
    setState(() {
      namaDepan = value['firstName'];
      namaBelakang = value['lastName'];
      bio = value['bio'];
      phone = value['phone'];
      email = UserStore().auth.currentUser!.email;
    });
  });
}
```
- Mengambil detail user dari UserStore
- Memperbarui state dengan data pengguna

###### updateUserDetail()
```dart
Future<void> updateUserDetail() async {
  // Validasi input
  // Update data ke UserStore
  // Tampilkan feedback ke user
}
```
- Memvalidasi input form
- Mengupdate data pengguna
- Menampilkan feedback sukses/error

## 3. FAQ Page (faq.dart)

### Deskripsi
Halaman yang menampilkan Frequently Asked Questions seputar aplikasi Musafir.

### Komponen Utama
- Header dengan logo
- Sections FAQ dengan kategori:
  - Pertanyaan Umum
  - Makanan Halal dan Restoran
  - Perencanaan Perjalanan
  - Komunitas dan Fitur Sosial
  - Pertanyaan Tambahan

### Widget Builders

#### bigTitle()
```dart
Widget bigTitle() {
  return SizedBox(
    child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [Text('MUSAFIR', style: ...)],
    ),
  );
}
```
- Menampilkan judul "MUSAFIR" dengan styling khusus

#### heading(title)
```dart
Widget heading(title) {
  return SizedBox(
    child: Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [Text(title, style: ...)],
    ),
  );
}
```
- Menampilkan heading section

#### sectionBox(title, content)
```dart
Widget sectionBox(title, content) {
  // Membuat box berisi QnA
}
```
- Membuat container untuk menampilkan Q&A
- Styling dengan border radius dan background color

## 4. Privasi Page (privasi.dart)

### Deskripsi
Halaman yang menampilkan kebijakan privasi aplikasi Musafir.

### Sections
1. Kebijakan Privasi
2. Informasi yang dikumpulkan
3. Teknologi pengumpulan informasi
4. Informasi dari pendaftaran
5. Privasi anak-anak
6. Penggunaan dan berbagi informasi
7. Perlindungan informasi
8. Hak pengguna
9. Link ke website lain
10. Perubahan kebijakan

### Widget Builders
Menggunakan widget builders yang sama dengan FAQ page:
- bigTitle()
- heading()
- line()

## Integrasi dengan Services

### UserStore
```dart
UserStore().getUserDetail()
```
- Mengambil detail pengguna dari Firebase
- Digunakan di AccountPage dan InfoProfile

### AuthController
```dart
var authC = Get.find<AuthController>();
authC.logout();
```
- Menangani proses logout
- Digunakan di AccountPage

### MainPageController
```dart
var mainPageC = Get.find<MainPageController>();
mainPageC.menuTabController.value = 0;
```
- Mengatur navigasi tab
- Reset ke tab awal saat logout

## State Management
- Menggunakan GetX untuk state management
- Local state dengan setState untuk UI updates

## Contoh Penggunaan

### 1. Mengakses Account Page
```dart
Get.toNamed(RouteHelper.getAccount());
```

### 2. Update Profil
```dart
// Di InfoProfile
await updateUserDetail({
  'firstName': 'John',
  'lastName': 'Doe',
  'bio': 'Travel Enthusiast',
  'phone': '081234567890'
});
```

### 3. Logout
```dart
var authC = Get.find<AuthController>();
var mainPageC = Get.find<MainPageController>();
mainPageC.menuTabController.value = 0;
authC.logout();
```

## Error Handling

### Dialog Helper
```dart
DialogHelper.showSnackBar(
  'Nama depan tidak boleh kosong',
  title: 'Nama Depan',
  backgroundColor: kWarningMain,
);
```
- Menampilkan feedback ke user
- Digunakan untuk validasi form dan error handling

## Styling

### Theme Constants
```dart
final blackTextStyle = TextStyle(...);
final kWhiteColor = Color(0xFFFFFFFF);
final kWarningMain = Color(...);
final kSuccessMain = Color(...);
```
- Penggunaan konstanta untuk konsistensi styling
- Definisi warna dan text style

### Layout Constants
```dart
const EdgeInsets.symmetric(vertical: 50);
const EdgeInsets.only(left: 18, right: 18, bottom: 14, top: 20);
```
- Padding dan margin standar
- Memastikan konsistensi layout

## Best Practices
1. Penggunaan extension untuk string manipulation
2. Implementasi loading state untuk network calls
3. Validasi input sebelum update
4. Feedback visual untuk user actions
5. Consistent error handling dengan DialogHelper
6. Reusable widgets untuk komponen umum
7. Clean architecture dengan separation of concerns
8. Proper null handling dengan null safety

## Catatan Pengembangan
1. Tambahkan image upload functionality
2. Implementasi caching untuk user data
3. Tambahkan offline support
4. Improve form validation
5. Tambahkan unit tests
6. Implementasi deep linking
7. Tambahkan analytics tracking