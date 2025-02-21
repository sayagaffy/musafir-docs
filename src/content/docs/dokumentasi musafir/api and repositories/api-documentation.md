---
title: "api documentation"
description: "adalah kelas utama yang menangani semua komunikasi HTTP dengan backend utama aplikasi. Kelas ini menggunakan GetX untuk manajemen state dan konektivitas."
---

# Dokumentasi API Client Musafir
Lokasi: `lib/data/api/`

## Daftar Isi
1. [ApiClient](#apiclient)
2. [ApiGoogle](#apigoogle)

## ApiClient

### Gambaran Umum
`ApiClient` adalah kelas utama yang menangani semua komunikasi HTTP dengan backend utama aplikasi. Kelas ini menggunakan GetX untuk manajemen state dan konektivitas.

### Struktur Kelas
```dart
class ApiClient extends GetConnect implements GetxService {
  late String token;
  final String appBaseUrl;
  late SharedPreferences sharedPreferences;
  late Map<String, String> _mainHeaders;
}
```

### Properti Utama
- `token`: Menyimpan token autentikasi untuk request API
- `appBaseUrl`: URL dasar untuk semua endpoint API
- `sharedPreferences`: Instance SharedPreferences untuk menyimpan data lokal
- `_mainHeaders`: Header default untuk setiap request API

### Konstruktor
```dart
ApiClient({required this.appBaseUrl, required sharedPreferences})
```

#### Parameter:
- `appBaseUrl`: URL base API yang akan digunakan
- `sharedPreferences`: Instance SharedPreferences untuk manajemen token

#### Fungsi:
1. Menginisialisasi URL dasar
2. Mengatur timeout request (30 detik)
3. Mengambil token dari SharedPreferences
4. Menyiapkan header default untuk request

### Method-method

#### 1. updateHeader
```dart
void updateHeader(String token)
```

**Kegunaan**: Memperbarui header autentikasi ketika token berubah

**Contoh Penggunaan**:
```dart
apiClient.updateHeader("new_token_here");
```

#### 2. getData
```dart
Future<Response> getData(String uri)
```

**Kegunaan**: Melakukan HTTP GET request ke endpoint tertentu

**Parameter**:
- `uri`: Path endpoint yang dituju

**Return**: 
- `Response`: Object response dari server

**Error Handling**:
- Mengembalikan Response dengan statusCode 1 jika terjadi error
- Menyertakan pesan error dalam statusText

**Contoh Penggunaan**:
```dart
final response = await apiClient.getData("/users/profile");
if (response.statusCode == 200) {
  // Handle success
} else {
  // Handle error
}
```

#### 3. posData
```dart
Future<Response> posData(String uri, dynamic body)
```

**Kegunaan**: Melakukan HTTP POST request ke endpoint tertentu

**Parameter**:
- `uri`: Path endpoint yang dituju
- `body`: Data yang akan dikirim dalam format JSON

**Return**: 
- `Response`: Object response dari server

**Error Handling**:
- Mengembalikan Response dengan statusCode 1 jika terjadi error
- Menyertakan pesan error dalam statusText

**Contoh Penggunaan**:
```dart
final data = {
  "username": "user123",
  "password": "pass123"
};
final response = await apiClient.posData("/auth/login", data);
```

## ApiGoogle

### Gambaran Umum
`ApiGoogle` adalah kelas khusus untuk menangani komunikasi dengan API Google. Lebih sederhana dari ApiClient karena hanya menangani GET request dan tidak memerlukan autentikasi token.

### Struktur Kelas
```dart
class ApiGoogle extends GetConnect implements GetxService {
  final String appBaseUrlGoogle;
}
```

### Properti Utama
- `appBaseUrlGoogle`: URL dasar untuk API Google

### Konstruktor
```dart
ApiGoogle({required this.appBaseUrlGoogle})
```

#### Parameter:
- `appBaseUrlGoogle`: URL base API Google yang akan digunakan

#### Fungsi:
1. Menginisialisasi URL dasar
2. Mengatur timeout request (30 detik)

### Method

#### getData
```dart
Future<Response> getData(String uri)
```

**Kegunaan**: Melakukan HTTP GET request ke endpoint Google API

**Parameter**:
- `uri`: Path endpoint Google API yang dituju

**Return**: 
- `Response`: Object response dari server

**Error Handling**:
- Mengembalikan Response dengan statusCode 1 jika terjadi error
- Menyertakan pesan error dalam statusText

**Contoh Penggunaan**:
```dart
final googleApi = ApiGoogle(appBaseUrlGoogle: "https://maps.googleapis.com");
final response = await googleApi.getData("/maps/api/place/details/json?place_id=123");
```

## Best Practices Penggunaan

### 1. Inisialisasi API Client
```dart
final apiClient = ApiClient(
  appBaseUrl: "https://api.musafir.com",
  sharedPreferences: await SharedPreferences.getInstance()
);
```

### 2. Handle Response
```dart
try {
  final response = await apiClient.getData("/endpoint");
  if (response.statusCode == 200) {
    // Parse dan handle data
    final data = response.body;
  } else {
    // Handle error
    print("Error: ${response.statusText}");
  }
} catch (e) {
  // Handle exception
  print("Exception: $e");
}
```

### 3. Update Token
```dart
// Setelah login berhasil
final token = "new_token_from_server";
apiClient.updateHeader(token);
await sharedPreferences.setString(AppConstans.TOKEN, token);
```

## Catatan Penting
1. Semua request memiliki timeout 30 detik
2. Token disimpan di SharedPreferences dengan key AppConstans.TOKEN
3. Header default menggunakan format Bearer token
4. Response error selalu memiliki statusCode 1
5. Semua method mengembalikan Future<Response>

## Debugging Tips
1. Uri logging aktif di getData untuk memudahkan debugging
2. posData memiliki logging yang dinonaktifkan (dalam comments)
3. Cek status code dan status text untuk error handling