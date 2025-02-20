---
title: Firestore Services Musafir
description: Dokumentasi Firestore musafir
---

# Dokumentasi Firestore Services Musafir
Lokasi: `lib/data/firestore/`

## Daftar Isi
1. [GeoStore](#geostore)
2. [PlacesStore](#placesstore)
3. [UserStore](#userstore)

## GeoStore
File: `geo_store.dart`

### Gambaran Umum
Kelas ini menangani operasi geografis dengan mengakses koleksi data lokasi di Firestore seperti negara, provinsi, dan kota.

### Collection References
```dart
final CollectionReference dbCity = FirebaseFirestore.instance.collection('city_List');
final CollectionReference dbProvince = FirebaseFirestore.instance.collection('province_list');
final CollectionReference dbCountry = FirebaseFirestore.instance.collection('country_list');
```

### Method-method

#### 1. placesCountry
```dart
Future placesCountry(String iso)
```

**Kegunaan**: Mencari data negara berdasarkan kode ISO

**Parameter**:
- `iso`: Kode ISO negara

**Contoh Penggunaan**:
```dart
final countryData = await geoStore.placesCountry("ID");
```

#### 2. placesProvince
```dart
Future placesProvince(String provinsi)
```

**Kegunaan**: Mencari data provinsi berdasarkan nama

**Parameter**:
- `provinsi`: Nama provinsi

**Contoh Penggunaan**:
```dart
final provinceData = await geoStore.placesProvince("Jawa Barat");
```

#### 3. placesCity
```dart
Future placesCity(String cty)
```

**Kegunaan**: Mencari data kota berdasarkan nama

**Parameter**:
- `cty`: Nama kota

**Contoh Penggunaan**:
```dart
final cityData = await geoStore.placesCity("Bandung");
```

## PlacesStore
File: `place_store.dart`

### Gambaran Umum
Kelas ini menangani operasi CRUD untuk tempat-tempat (places) dalam aplikasi.

### Collection Reference
```dart
final CollectionReference dbPlaces = FirebaseFirestore.instance.collection('places');
```

### Method-method

#### 1. placesList
```dart
Future placesList(int countryId, int cityId)
```

**Kegunaan**: Mengambil daftar tempat berdasarkan ID negara dan kota

**Parameter**:
- `countryId`: ID negara
- `cityId`: ID kota

**Contoh Penggunaan**:
```dart
final places = await placesStore.placesList(1, 2);
```

#### 2. placesListWhere
```dart
Future placesListWhere(int countryId, int cityId, int halalstatus)
```

**Kegunaan**: Mengambil daftar tempat dengan filter status halal

**Parameter**:
- `countryId`: ID negara
- `cityId`: ID kota
- `halalstatus`: Status halal (angka)

**Contoh Penggunaan**:
```dart
final halalPlaces = await placesStore.placesListWhere(1, 2, 1);
```

#### 3. checkPlaces
```dart
Future checkPlaces(String placeid)
```

**Kegunaan**: Memeriksa keberadaan tempat berdasarkan ID

**Parameter**:
- `placeid`: ID tempat

**Contoh Penggunaan**:
```dart
final exists = await placesStore.checkPlaces("place123");
```

#### 4. placesId
```dart
Future placesId()
```

**Kegunaan**: Mengambil ID tempat terakhir (untuk auto-increment)

**Contoh Penggunaan**:
```dart
final lastPlace = await placesStore.placesId();
```

#### 5. addPlaceToInternal
```dart
Future addPlaceToInternal(payload)
```

**Kegunaan**: Menambahkan tempat baru ke database

**Parameter**:
- `payload`: Data tempat yang akan ditambahkan

**Contoh Penggunaan**:
```dart
final placeData = {
  "name": "Restoran ABC",
  "halal_status": 1,
  "address": "Jl. Example No. 123"
};
await placesStore.addPlaceToInternal(placeData);
```

## UserStore
File: `user_store.dart`

### Gambaran Umum
Kelas ini menangani semua operasi terkait user termasuk profil, review, bookmark, dan rencana eksplorasi.

### Collection References
```dart
final CollectionReference dbUsers = FirebaseFirestore.instance.collection('users');
final CollectionReference dbReviews = FirebaseFirestore.instance.collection('reviews');
final CollectionReference dbBookmark = FirebaseFirestore.instance.collection('bookmark');
final CollectionReference dbExplore = FirebaseFirestore.instance.collection('explore');
```

### Method-method

#### User Profile Operations

##### 1. createUser
```dart
Future createUser({
  String? username,
  String? bio,
  String? photoURL,
  String? firstName,
  String? lastName,
  String? phone,
  String? provider,
  String? address,
  String? latlang,
})
```

**Kegunaan**: Membuat profil user baru

**Contoh Penggunaan**:
```dart
await userStore.createUser(
  username: "john_doe",
  firstName: "John",
  lastName: "Doe",
  phone: "+62812345678"
);
```

##### 2. getUserDetail
```dart
Future getUserDetail()
```

**Kegunaan**: Mengambil detail profil user yang sedang login

**Contoh Penggunaan**:
```dart
final userProfile = await userStore.getUserDetail();
```

##### 3. updateUserData
```dart
Future updateUserData(dynamic data)
```

**Kegunaan**: Memperbarui data profil user

**Contoh Penggunaan**:
```dart
await userStore.updateUserData({
  "bio": "New bio text",
  "phone": "new_phone_number"
});
```

#### Review Operations

##### 1. postingReview
```dart
Future postingReview(
  String placeid,
  String latlang,
  String authorName,
  String authorEmail,
  String authorPhotoUrl,
  String rating,
  String review,
  String page,
  String from,
)
```

**Kegunaan**: Menambahkan review baru untuk tempat

**Contoh Penggunaan**:
```dart
await userStore.postingReview(
  "place123",
  "-6.123,106.456",
  "John Doe",
  "john@example.com",
  "photo_url",
  "4.5",
  "Great place!",
  "detail",
  "home"
);
```

##### 2. checkUserReview
```dart
Future checkUserReview(String placeId)
```

**Kegunaan**: Memeriksa apakah user sudah memberikan review

#### Bookmark Operations

##### 1. bookmarkPlace
```dart
Future bookmarkPlace(
  String placeid,
  String latlang,
  String page,
  String from,
  String address,
  String halalStatus,
  String type,
  String photoUrl
)
```

**Kegunaan**: Menambah/menghapus bookmark tempat

##### 2. checkBookmark
```dart
Future checkBookmark(String placeid)
```

**Kegunaan**: Memeriksa status bookmark tempat

##### 3. bookmarkList
```dart
Future bookmarkList()
```

**Kegunaan**: Mengambil daftar bookmark user

#### Explore Operations

##### 1. explorePlan
```dart
Future explorePlan(
  String placeId,
  String address,
  String startTime,
  String endTime,
  String namePlan,
  List resto,
  List mosque,
  double lat,
  double lng
)
```

**Kegunaan**: Membuat rencana eksplorasi baru

##### 2. explorePlanUpdates
```dart
Future explorePlanUpdates(
  String id,
  String placeId,
  String address,
  String startTime,
  String endTime,
  String namePlan,
  List resto,
  List mosque,
  double lat,
  double lng
)
```

**Kegunaan**: Memperbarui rencana eksplorasi

##### 3. exploreDelete
```dart
Future exploreDelete(String id)
```

**Kegunaan**: Menghapus rencana eksplorasi

##### 4. exploreList
```dart
Future exploreList()
```

**Kegunaan**: Mengambil daftar rencana eksplorasi user

### Error Handling
Semua method menggunakan:
- `DialogHelper` untuk menampilkan loading dan pesan sukses/error
- `try-catch` untuk menangani error
- Debug print untuk logging error

### Best Practices

1. **Autentikasi User**
```dart
// Selalu cek status autentikasi sebelum operasi
if (auth.currentUser == null) {
  throw 'User not authenticated';
}
```

2. **Batch Operations**
```dart
// Gunakan batch untuk multiple operations
final batch = FirebaseFirestore.instance.batch();
// Add operations to batch
await batch.commit();
```

3. **Error Handling**
```dart
try {
  await operation();
  DialogHelper.showSnackBar('Success');
} catch (e) {
  DialogHelper.showErroDialog(description: e.toString());
}
```

### Catatan Penting
1. Semua operasi menggunakan email user sebagai identifier
2. Bookmark menggunakan array untuk menyimpan multiple places
3. Review memerlukan informasi author lengkap
4. Explore plan menyimpan data resto dan masjid dalam array
5. Semua timestamp menggunakan DateTime.now()