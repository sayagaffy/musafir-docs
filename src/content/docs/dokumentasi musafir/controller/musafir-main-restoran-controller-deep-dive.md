---
title: "MainPage & Restoran Controller"
description: "Dokumentasi penjelasan MainPageController dan RestoranController"
---

# Deep Dive: MainPage & Restoran Controller

## Part 1: MainPage Controller

### Overview
MainPageController adalah controller sederhana yang menangani navigasi halaman utama dan state management untuk tab navigation.

### Implementation
```dart
class MainPageController extends GetxController implements GetxService {
  RxInt menuTabController = 0.obs;
}
```

### Komponen Utama
1. **Tab Controller State**
   - Menggunakan `RxInt` untuk reactive state
   - Nilai default 0 (tab pertama)
   - Observable untuk auto-update UI

### Penggunaan

#### 1. Basic Setup
```dart
final mainPageC = Get.put(MainPageController());
```

#### 2. Tab Navigation
```dart
BottomNavigationBar(
  currentIndex: mainPageC.menuTabController.value,
  onTap: (index) {
    mainPageC.menuTabController.value = index;
  },
  items: [
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: 'Home'
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.explore),
      label: 'Explore'
    ),
    // ... more items
  ],
)
```

#### 3. Content Switching
```dart
Obx(() => IndexedStack(
  index: mainPageC.menuTabController.value,
  children: [
    HomePage(),
    ExplorePage(),
    // ... more pages
  ],
))
```

### Tips Penggunaan
1. **State Management**
   ```dart
   // Reset tab
   void resetTab() {
     menuTabController.value = 0;
   }
   
   // Check current tab
   bool isHomeTab() {
     return menuTabController.value == 0;
   }
   ```

2. **Navigation Guard**
   ```dart
   void switchTab(int index) {
     // Cek apakah user sudah login
     if (Get.find<AuthController>().isLoggedIn) {
       menuTabController.value = index;
     } else {
       Get.toNamed('/login');
     }
   }
   ```

## Part 2: Restoran Controller

### Overview
RestoranController menangani operasi CRUD untuk data restoran di Firestore, termasuk upload gambar.

### Implementation
```dart
class RestoranController extends GetxController {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
}
```

### Komponen Utama

#### 1. Data Model
```dart
// Struktur data restoran di Firestore
{
  'name': String,
  'address': String,
  'location': GeoPoint,
  'halalStatus': String,
  'operationalHours': String,
  'imagePath': String
}
```

#### 2. Add Restoran Method
```dart
Future<void> addRestoran(
  String name,
  String address,
  LatLng? location,
  String? halalStatus,
  String operationalHours,
  XFile? image
) async {
  CollectionReference restorans = _firestore.collection('restorans');
  
  await restorans.add({
    'name': name,
    'address': address,
    'location': location != null 
      ? GeoPoint(location.latitude, location.longitude)
      : null,
    'halalStatus': halalStatus,
    'operationalHours': operationalHours,
    'imagePath': image?.path,
  });
}
```

### Extended Functionality

#### 1. CRUD Operations
```dart
// Get restoran by ID 
Future<DocumentSnapshot> getRestoran(String id) async {
  return await _firestore.collection('restorans').doc(id).get();
}

// Update restoran
Future<void> updateRestoran(String id, Map<String, dynamic> data) async {
  await _firestore.collection('restorans').doc(id).update(data);
}

// Delete restoran
Future<void> deleteRestoran(String id) async {
  await _firestore.collection('restorans').doc(id).delete();
}
```

#### 2. Query Operations
```dart
// Get nearby restorans
Future<QuerySnapshot> getNearbyRestorans(GeoPoint center, double radius) async {
  return await _firestore
    .collection('restorans')
    .where('location', isGreaterThan: calculateMinBound(center, radius))
    .where('location', isLessThan: calculateMaxBound(center, radius))
    .get();
}

// Get halal restorans
Future<QuerySnapshot> getHalalRestorans() async {
  return await _firestore
    .collection('restorans')
    .where('halalStatus', isEqualTo: 'Halal')
    .get();
}
```

### Integration Examples

#### 1. Add New Restoran
```dart
final restoranC = Get.find<RestoranController>();

// Form submission
ElevatedButton(
  onPressed: () async {
    try {
      await restoranC.addRestoran(
        nameController.text,
        addressController.text,
        selectedLocation,
        'Halal',
        hoursController.text,
        selectedImage
      );
      
      Get.snackbar('Success', 'Restoran berhasil ditambahkan');
      Get.back();
    } catch (e) {
      Get.snackbar('Error', 'Gagal menambahkan restoran');
    }
  },
  child: Text('Simpan'),
)
```

#### 2. Display Restoran List
```dart
StreamBuilder<QuerySnapshot>(
  stream: _firestore.collection('restorans').snapshots(),
  builder: (context, snapshot) {
    if (snapshot.hasData) {
      return ListView.builder(
        itemCount: snapshot.data!.docs.length,
        itemBuilder: (context, index) {
          var restoran = snapshot.data!.docs[index];
          return ListTile(
            title: Text(restoran['name']),
            subtitle: Text(restoran['address']),
            trailing: Text(restoran['halalStatus']),
          );
        },
      );
    }
    return CircularProgressIndicator();
  },
)
```

### Error Handling

#### 1. Add Restoran Error Handling
```dart
try {
  await addRestoran(...);
  Get.snackbar('Success', 'Restoran Added');
} catch (error) {
  Get.snackbar('Error', 'Failed to add restoran: $error');
  print('Error adding restoran: $error');
}
```

#### 2. Validation
```dart
bool validateRestoranData(
  String name,
  String address,
  LatLng? location,
  String operationalHours
) {
  if (name.isEmpty || address.isEmpty || operationalHours.isEmpty) {
    Get.snackbar('Error', 'Semua field harus diisi');
    return false;
  }
  
  if (location == null) {
    Get.snackbar('Error', 'Pilih lokasi restoran');
    return false;
  }
  
  return true;
}
```

### Best Practices

#### 1. State Management
```dart
// Reactive state untuk loading
final RxBool isLoading = false.obs;

// Reactive state untuk list restoran
final RxList<DocumentSnapshot> restorans = <DocumentSnapshot>[].obs;

// Update state
void updateRestoransList(List<DocumentSnapshot> newRestorans) {
  restorans.value = newRestorans;
}
```

#### 2. Memory Management
```dart
@override
void onClose() {
  // Clear any resources
  restorans.clear();
  super.onClose();
}
```

### Testing Scenarios

#### 1. CRUD Operations
- Add restoran with valid data
- Add restoran with invalid data
- Update existing restoran
- Delete restoran
- Get restoran details

#### 2. Query Operations
- Get nearby restorans
- Filter by halal status
- Search by name
- Sort by rating

#### 3. Error Cases
- Network errors
- Invalid data
- Permission issues
- Missing fields

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restorans/{restoran} {
      allow read: if true;
      allow write: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
  }
}
```

### Tips Development
1. Selalu gunakan transaksi untuk operasi multiple write
2. Implementasikan caching untuk query yang sering digunakan
3. Batasi jumlah read/write untuk optimasi biaya
4. Gunakan indexes untuk query yang kompleks
5. Implementasikan pagination untuk data yang besar

