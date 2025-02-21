---
title: Dokumentasi AddPlace Widget
description: AddPlace adalah widget StatefulWidget yang digunakan untuk menambahkan atau mengedit tempat baru dalam aplikasi Musafir.
---




# Dokumentasi AddPlace Widget
**Path**: `lib/ui/pages/favorite/add_place.dart`

## Deskripsi Umum
AddPlace adalah widget StatefulWidget yang digunakan untuk menambahkan atau mengedit tempat baru dalam aplikasi Musafir. Widget ini menangani input data tempat seperti nama, lokasi, status halal, dan informasi administratif (negara, provinsi, kota).

## Struktur Data

### State Variables
```dart
// Controllers untuk form input
TextEditingController nameController;       // Nama tempat
TextEditingController placeidController;    // ID tempat dari Google Places
TextEditingController latController;        // Latitude
TextEditingController lngController;        // Longitude
TextEditingController subtitleController;   // Subtitle/deskripsi
TextEditingController phoneController;      // Nomor telepon
TextEditingController addressController;    // Alamat lengkap
TextEditingController webController;        // Website

// Data lokasi administratif
String? countryId;    // ID negara
int? provinceId;      // ID provinsi
int? cityId;         // ID kota
int? halalCode;      // Kode status halal
```

## Fungsi-Fungsi Utama

### 1. initState()
```dart
@override
void initState() {
  setState(() {
    nameController = TextEditingController(text: homeC.placeDtl?.name);
    // ... inisialisasi controller lainnya
  });
  super.initState();
}
```
**Kegunaan**: Menginisialisasi semua controller dengan data yang ada jika sedang mengedit tempat yang sudah ada.

### 2. getData(), getDataProvinci(), getDataCity()
```dart
Future<List<CountryModel>> getData(filter) async {
  QuerySnapshot snapshot = await FirebaseFirestore.instance
      .collection('countries')
      .get();
  return snapshot.docs
      .map((doc) => CountryModel.fromJson(doc.data() as Map<String, dynamic>))
      .toList();
}
```
**Kegunaan**: 
- `getData()`: Mengambil daftar negara dari Firestore
- `getDataProvinci()`: Mengambil daftar provinsi berdasarkan negara terpilih
- `getDataCity()`: Mengambil daftar kota berdasarkan provinsi terpilih

### 3. getPhotos()
```dart
Future getPhotos() async {
  List photos = homeC.placeDtl?.photos ?? [];
  List photosFilter = photos.map((item) => item.photoReference).toList();
  return photosFilter;
}
```
**Kegunaan**: Mengambil dan memfilter referensi foto dari tempat yang sedang diedit.

### 4. addplace()
```dart
Future<void> addplace() async {
  int id = await PlacesStore().placesId().then((value) => value['id']);
  // ... validasi dan proses penambahan data
}
```
**Kegunaan**: Fungsi utama untuk menambahkan atau mengupdate data tempat ke Firestore.

## Widget Components

### 1. Custom Popup Builders
```dart
Widget _customPopupItemBuilderExample2(
    BuildContext context, CountryModel item, bool isSelected) {
  // ... kode builder
}
```
**Kegunaan**: Membangun tampilan custom untuk dropdown pemilihan negara, provinsi, dan kota.

### 2. Form Fields
Widget menggunakan kombinasi dari:
- `TextFieldText`: Input teks custom
- `DropdownSearch`: Dropdown dengan kemampuan pencarian
- `CustomButton`: Tombol submit

## Alur Kerja

1. **Inisialisasi**:
   - Widget menerima `placeid`, `lat`, dan `lng` sebagai parameter wajib
   - Controller diinisialisasi dengan data yang ada jika mode edit

2. **Input Data**:
   - User mengisi form dengan data tempat
   - Dropdown location (negara -> provinsi -> kota) memiliki ketergantungan bertingkat
   - Status halal dipilih dari opsi yang tersedia

3. **Validasi & Submission**:
   - Cek kelengkapan data lokasi administratif
   - Generate ID baru untuk tempat
   - Upload data ke Firestore
   - Redirect ke halaman detail setelah sukses

## Error Handling
```dart
if (countryId == null) {
  DialogHelper.showSnackBar(
    'Pilih Negara Terlebih Dahulu',
    title: 'Select Country',
    backgroundColor: kWarningMain,
  );
}
```
Widget menerapkan validasi untuk:
- Pemilihan negara
- Pemilihan provinsi
- Pemilihan kota
- Status halal

## State Management
Widget menggunakan GetX untuk state management:
- `HomeController` untuk data tempat
- `GetBuilder` untuk reactive UI updates

## Contoh Penggunaan

### Membuka Form Tambah Tempat Baru
```dart
Get.to(() => AddPlace(
  placeid: "ChIJ...", // Google Place ID
  lat: -6.2088,       // Latitude
  lng: 106.8456       // Longitude
));
```

### Menangani Hasil Submit
```dart
CustomButton(
  title: 'Simpan Place',
  onPressed: () async {
    await addplace();
    // Handle response
  },
)
```

## Dependencies
- dropdown_search
- get (GetX)
- cloud_firestore
- intl

## Tips Pengembangan
1. Pastikan validasi input lengkap sebelum submit
2. Implementasikan error handling untuk kegagalan network
3. Tambahkan loading indicator saat proses fetch data
4. Optimalkan query Firestore untuk performa lebih baik

## Catatan Penting
- Widget ini membutuhkan koneksi ke Firebase
- Perlu setup proper di `firebase_options.dart`
- Status halal menggunakan kode numerik (1: Certified, 2: Friendly, 3: Halal)
- Format tanggal menggunakan pattern "dd/MM/yyyy kk:mm"
