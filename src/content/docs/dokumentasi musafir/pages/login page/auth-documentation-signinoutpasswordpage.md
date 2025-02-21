# Dokumentasi Autentikasi Musafir App

## Lokasi File
Path: `lib/ui/pages/account/`

## Struktur File
1. reset_password.dart
2. sign_in_page.dart
3. sign_up_page.dart

## Deskripsi Umum
File-file ini menangani seluruh proses autentikasi dalam aplikasi Musafir, termasuk:
- Login dengan email dan password
- Login dengan Google
- Registrasi pengguna baru
- Reset password

## Detail Implementasi

### 1. Reset Password (reset_password.dart)

#### Komponen Utama
- Widget: `ResetPassword` (StatefulWidget)
- Controller: `AuthController`

#### Fungsi-fungsi Utama

##### `_reset(AuthController _authController, context)`
```dart
void _reset(AuthController _authController, context) {
  String email = emailController.text.trim();
  // ... validasi dan proses reset
}
```
- **Kegunaan**: Memvalidasi dan mengirim permintaan reset password
- **Parameter**:
  - `_authController`: Controller untuk manajemen autentikasi
  - `context`: BuildContext untuk navigasi
- **Validasi**:
  1. Email tidak boleh kosong
  2. Format email harus valid
- **Contoh Penggunaan**:
```dart
_reset(Get.find<AuthController>(), context);
```

### 2. Sign In (sign_in_page.dart)

#### Komponen Utama
- Widget: `SignInPage1` (StatefulWidget)
- Controllers: 
  - `AuthController`
  - `LocationController`

#### Fungsi-fungsi Utama

##### `_login(AuthController _authController, context)`
```dart
void _login(AuthController _authController, context) {
  String email = emailController.text.trim();
  String password = passwordController.text.trim();
  // ... validasi dan proses login
}
```
- **Kegunaan**: Menangani proses login dengan email dan password
- **Validasi**:
  1. Password tidak boleh kosong
  2. Email tidak boleh kosong
  3. Format email harus valid
  4. Password minimal 6 karakter

##### Social Login
```dart
CustomButtonSosial(
  title: 'Masuk lewat Google',
  onPressed: () {
    var authController = Get.find<AuthController>();
    authController.signInWithGoogle(context);
    locationC.determinePosition();
  },
  icon: "assets/icon_google.png",
)
```
- **Kegunaan**: Implementasi login dengan Google
- **Fitur**: Otomatis mendeteksi lokasi setelah login berhasil

### 3. Sign Up (sign_up_page.dart)

#### Komponen Utama
- Widget: `SignUpPage1` (StatelessWidget)
- Controller: `AuthController`

#### Fungsi-fungsi Utama

##### `_registration()`
```dart
void _registration() {
  var authController = Get.find<AuthController>();
  // ... proses validasi dan registrasi
}
```
- **Kegunaan**: Menangani proses registrasi pengguna baru
- **Data yang Dibutuhkan**:
  1. Nama Depan
  2. Nama Belakang
  3. Nomor HP
  4. Email
  5. Password
  6. Konfirmasi Password
- **Validasi**:
  - Semua field wajib diisi
  - Format email harus valid
  - Password minimal 6 karakter
  - Password dan konfirmasi password harus sama

## Fitur UI/UX

### Komponen UI yang Digunakan
1. `CustomLoader`: Menampilkan loading state
2. `CustomButton`: Button standar aplikasi
3. `CustomButtonSosial`: Button untuk social login
4. `TextFieldText`: Input field untuk text biasa
5. `TextFieldPassword`: Input field khusus password

### Navigasi
- Menggunakan GetX untuk manajemen route
- Transisi halaman dengan durasi 300ms
- Back button untuk kembali ke halaman sebelumnya

### State Management
- Menggunakan GetX untuk state management
- `GetBuilder` untuk memantau perubahan state pada AuthController
- Loading state ditangani secara terpusat

## Tema dan Styling

### Warna
- `kBackgroundColor`: Warna latar belakang
- `kBlueColor`: Warna aksen utama
- `kGreyColor`: Warna untuk teks sekunder
- `kNeutral70`: Warna netral untuk divider dan teks hint

### Typography
- `blackTextStyle`: Style untuk teks utama
- `greyTextStyle`: Style untuk teks sekunder
- `noColorTextStyle`: Style dasar tanpa warna
- Font weight: `bold`, `extraBold`

## Best Practices yang Diimplementasikan

1. **Validasi Input**
   - Validasi email menggunakan `GetUtils.isEmail`
   - Trim pada input untuk menghindari whitespace
   - Validasi panjang password minimal 6 karakter

2. **Error Handling**
   - Menggunakan `showCustomSnackBar` untuk menampilkan error
   - Pesan error yang spesifik untuk setiap jenis kesalahan

3. **Loading State**
   - Menggunakan `CustomLoader` saat proses berjalan
   - State loading dikelola melalui AuthController

4. **Code Organization**
   - Pemisahan logic ke dalam controller
   - Penggunaan konstanta untuk styling
   - Widget yang reusable (CustomButton, TextFieldText, dll)

## Catatan Penting

1. **Keamanan**
   - Password minimal 6 karakter
   - Validasi email format
   - Tidak menyimpan password dalam plaintext

2. **Performa**
   - Menggunakan `BouncingScrollPhysics` untuk scroll behavior
   - Lazy loading dengan GetBuilder
   - Optimasi import

3. **Maintenance**
   - Komentar pada fungsi kompleks
   - Penamaan variabel yang deskriptif
   - Struktur folder yang terorganisir

## Contoh Flow Penggunaan

### Flow Login
1. User membuka aplikasi
2. Navigasi ke halaman login
3. Input email dan password
4. Sistem melakukan validasi
5. Jika valid, proses login
6. Redirect ke home page

### Flow Registrasi
1. User memilih "Daftar"
2. Mengisi form registrasi
3. Sistem validasi setiap field
4. Jika semua valid, proses registrasi
5. Redirect ke login page

### Flow Reset Password
1. User memilih "Lupa kata sandi"
2. Input email
3. Sistem validasi email
4. Kirim link reset password
5. Konfirmasi ke user

## Troubleshooting

### Masalah Umum
1. **Login Gagal**
   - Cek format email
   - Pastikan password minimal 6 karakter
   - Periksa koneksi internet

2. **Registrasi Gagal**
   - Pastikan semua field terisi
   - Cek kesesuaian password dan konfirmasi
   - Validasi format email dan nomor HP

3. **Reset Password Gagal**
   - Validasi format email
   - Periksa koneksi internet
   - Cek status server

## Dependencies
- GetX: State management dan routing
- Firebase Auth: Autentikasi
- Google Sign In: Login dengan Google

## Pengembangan Ke Depan
1. Implementasi biometric authentication
2. Penambahan social login (Facebook, Apple)
3. Implementasi two-factor authentication
4. Peningkatan validasi password (kompleksitas)