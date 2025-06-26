---
title: Advanced Features - Account & Favorites Management
description: Complete documentation of Account Module, Favorite Module, and Firebase Data Management implementation
---

# Advanced Features - Account & Favorites Management

Dokumentasi lengkap implementasi Advanced Features yang mencakup Account management, Favorites system, dan Data persistence dengan Firebase integration.

## 🏗️ Arsitektur Advanced Features

### Overview

Advanced Features Module mengintegrasikan **Firebase Firestore**, **SharedPreferences**, dan **GetX State Management** untuk memberikan user experience yang personal dan persistent.

### Architecture Pattern

```
UI Layer ↔ State Management ↔ Data Layer ↔ Firebase/Local Storage
    ↕              ↕              ↕              ↕
Account    ↔   AuthController ↔ UserStore  ↔  Firestore
Favorites  ↔   HomeController ↔ UserStore  ↔  Firestore
Settings   ↔      GetX        ↔ SharedPref ↔  Local Storage
```

---

## 📂 Struktur File Advanced Features

```
lib/
├── ui/pages/
│   ├── account/
│   │   ├── account_page.dart           # Main account page
│   │   ├── info_profile.dart          # Profile editing
│   │   ├── faq.dart                   # FAQ page
│   │   └── privasi.dart               # Privacy policy
│   └── favorite/
│       └── favorite_page.dart         # Favorites management
├── controllers/
│   └── auth_controller.dart           # Account management logic
├── data/firestore/
│   └── user_store.dart               # Firebase operations
└── routes/
    └── routes_helper.dart            # Advanced features routing
```

---

## 🎭 Account Module

### 1. Account Page (account_page.dart)

Main account dashboard dengan profile information dan navigation menu.

#### Key Features:

- User profile display (avatar, nama, level)
- Navigation ke sub-modules
- Logout functionality
- Points/level system

#### Core Implementation:

##### State Management

```dart
class _AccountPageState extends State<AccountPage> {
  String namaDepan = '';
  String namaBelakang = '';

  @override
  void initState() {
    getDataUser();
    super.initState();
  }

  void getDataUser() async {
    UserStore().getUserDetail().then((value) {
      setState(() {
        namaDepan = value['firstName'] ?? value['username'];
        namaBelakang = value['lastName'] ?? '';
      });
    });
  }
}
```

##### String Extension untuk Title Case

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

#### UI Structure:

1. **Profile Section**:

   - Avatar placeholder
   - User full name dengan title case formatting
   - Level guide display
   - Points system

2. **Menu Options**:
   ```dart
   // Navigation menu items
   - Info Profile → edit personal information
   - Privasi → privacy policy
   - FAQ → help and support
   - Komunitas → community features (future)
   - Rencana Perjalanan → travel plans
   - Keluar → logout
   ```

##### Logout Implementation:

```dart
void handleLogout() {
  var authC = Get.find<AuthController>();
  var mainPageC = Get.find<MainPageController>();

  // Reset navigation to home tab
  mainPageC.menuTabController.value = 0;

  // Perform logout
  authC.logout();
}
```

### 2. Info Profile (info_profile.dart)

Profile editing page dengan form untuk update user information.

#### Features:

- Form fields untuk data personal
- Avatar upload (placeholder)
- Validation dan error handling
- Update ke Firebase

#### Implementation Structure:

```dart
class _InfoProfileState extends State<InfoProfile> {
  String namaDepan = '';
  String namaBelakang = '';
  String bio = '';
  String phone = '';
  String email = '';

  void updateUserDetail() async {
    try {
      await UserStore().updateUser({
        'firstName': namaDepan,
        'lastName': namaBelakang,
        'bio': bio,
        'phone': phone,
      });

      DialogHelper.showSnackBar(
        'Profile berhasil diupdate',
        isError: false,
        backgroundColor: kSuccessMain,
      );
    } catch (e) {
      DialogHelper.showSnackBar(
        'Gagal update profile',
        isError: true,
        backgroundColor: kWarningMain,
      );
    }
  }
}
```

### 3. FAQ Page (faq.dart)

Comprehensive FAQ dengan multiple sections.

#### Content Sections:

1. **Pertanyaan Umum** - Basic app usage
2. **Makanan Halal dan Restoran** - Halal verification system
3. **Perencanaan Perjalanan** - Travel planning features
4. **Komunitas dan Fitur Sosial** - Social features
5. **Pertanyaan Tambahan** - Technical support

#### Widget Structure:

```dart
Widget sectionBox(String title, String content) {
  return Container(
    margin: EdgeInsets.only(bottom: 15),
    padding: EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: kWhiteColor,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: kGreyColor.withOpacity(0.3)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: blackTextStyle.copyWith(fontWeight: bold)),
        SizedBox(height: 8),
        Text(content, style: greyTextStyle),
      ],
    ),
  );
}
```

### 4. Privacy Policy (privasi.dart)

Legal compliance page dengan privacy policy content.

#### Content Structure:

1. Kebijakan Privasi overview
2. Informasi yang dikumpulkan
3. Teknologi pengumpulan informasi
4. Privasi anak-anak
5. Penggunaan dan berbagi informasi
6. Perlindungan informasi
7. Hak pengguna
8. Link ke website lain
9. Perubahan kebijakan

---

## 💖 Favorite Module

### Favorite Page (favorite_page.dart)

Grid-based display untuk user's favorite places dengan Firebase integration.

#### Key Features:

- Grid layout responsif
- Skeleton loading states
- Navigation ke detail pages
- Integration dengan HomeController

#### Core Implementation:

##### Data Loading

```dart
class _FavoritePageState extends State<FavoritePage> {
  Future favorite = UserStore().bookmarkList().then((value) {
    if (value != null) {
      return value['place'];
    } else {
      return null;
    }
  });
}
```

##### Grid Layout Configuration

```dart
GridView.builder(
  physics: const NeverScrollableScrollPhysics(),
  shrinkWrap: true,
  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
    maxCrossAxisExtent: 206,        // Max width per item
    mainAxisExtent: 190,            // Height per item
    crossAxisSpacing: 15,           // Horizontal spacing
    mainAxisSpacing: 15,            // Vertical spacing
  ),
  itemCount: snapshot.data.length,
  itemBuilder: (context, index) {
    var item = snapshot.data[index];
    return FavoriteCard(
      name: item['place_name'],
      city: item['address'],
      imgUrl: item['photo'],
      km: '${index + 1}', // Dummy distance data
      isMasjid: item['type'] == 'mosque',
      onTap: () => _navigateToDetail(item),
    );
  },
)
```

##### Navigation Integration

```dart
void _navigateToDetail(Map<String, dynamic> item) {
  var homeController = Get.find<HomeController>();

  // Pre-load place details
  homeController.placeDetail(item['place_id']);

  // Navigate to detail page
  Get.toNamed(RouteHelper.getHomeDetailPage(
    item['place_id'],
    item['place_name'],
    'favorite',              // Source identifier
    item['type'],
  ));
}
```

#### States Management:

##### Loading State

```dart
if (snapshot.connectionState == ConnectionState.done) {
  return snapshot.hasData
    ? GridView.builder(...)  // Show content
    : Center(child: Text('Kamu belum memiliki favorite place'));
} else {
  return const SkeletonCardRekomendasi();  // Loading skeleton
}
```

##### Empty State

```dart
Container(
  width: double.infinity,
  margin: EdgeInsets.only(top: 100),
  child: Column(
    children: [
      Icon(Icons.favorite_border, size: 64, color: kGreyColor),
      SizedBox(height: 16),
      Text(
        'Kamu belum memiliki favorite place',
        style: greyTextStyle.copyWith(fontSize: 16),
        textAlign: TextAlign.center,
      ),
    ],
  ),
)
```

---

## 🗄️ Data Management

### 1. UserStore (Firebase Operations)

Central repository untuk semua Firebase Firestore operations.

#### User Data Operations:

##### getUserDetail() - Get User Profile

```dart
Future<Map<String, dynamic>> getUserDetail() async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;
    DocumentSnapshot doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .get();

    if (doc.exists) {
      return doc.data() as Map<String, dynamic>;
    } else {
      return {};
    }
  } catch (e) {
    throw Exception('Failed to get user details: $e');
  }
}
```

##### updateUser() - Update Profile

```dart
Future<void> updateUser(Map<String, dynamic> data) async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;
    await FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .update({
      ...data,
      'updated_at': FieldValue.serverTimestamp(),
    });
  } catch (e) {
    throw Exception('Failed to update user: $e');
  }
}
```

##### createUser() - Initial User Creation

```dart
Future<void> createUser({
  required String username,
  String? firstName,
  String? lastName,
  String? phone,
  String? provider,
}) async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;
    await FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .set({
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'provider': provider,
      'level': 1,
      'points': 0,
      'created_at': FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
    });
  } catch (e) {
    throw Exception('Failed to create user: $e');
  }
}
```

#### Bookmark/Favorites Operations:

##### bookmarkList() - Get User's Favorites

```dart
Future<Map<String, dynamic>?> bookmarkList() async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;
    DocumentSnapshot doc = await FirebaseFirestore.instance
        .collection('bookmarks')
        .doc(uid)
        .get();

    if (doc.exists) {
      return doc.data() as Map<String, dynamic>;
    } else {
      return null;
    }
  } catch (e) {
    throw Exception('Failed to get bookmarks: $e');
  }
}
```

##### addBookmark() - Add to Favorites

```dart
Future<void> addBookmark({
  required String placeId,
  required String placeName,
  required String address,
  String? photo,
  required String type,
}) async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;

    // Get existing bookmarks
    DocumentSnapshot doc = await FirebaseFirestore.instance
        .collection('bookmarks')
        .doc(uid)
        .get();

    List<dynamic> places = [];
    if (doc.exists) {
      places = doc.data()?['place'] ?? [];
    }

    // Check if already bookmarked
    bool alreadyExists = places.any((place) => place['place_id'] == placeId);

    if (!alreadyExists) {
      places.add({
        'place_id': placeId,
        'place_name': placeName,
        'address': address,
        'photo': photo,
        'type': type,
        'added_at': FieldValue.serverTimestamp(),
      });

      await FirebaseFirestore.instance
          .collection('bookmarks')
          .doc(uid)
          .set({
        'place': places,
        'updated_at': FieldValue.serverTimestamp(),
      });
    }
  } catch (e) {
    throw Exception('Failed to add bookmark: $e');
  }
}
```

##### removeBookmark() - Remove from Favorites

```dart
Future<void> removeBookmark(String placeId) async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;

    DocumentSnapshot doc = await FirebaseFirestore.instance
        .collection('bookmarks')
        .doc(uid)
        .get();

    if (doc.exists) {
      List<dynamic> places = doc.data()?['place'] ?? [];
      places.removeWhere((place) => place['place_id'] == placeId);

      await FirebaseFirestore.instance
          .collection('bookmarks')
          .doc(uid)
          .update({
        'place': places,
        'updated_at': FieldValue.serverTimestamp(),
      });
    }
  } catch (e) {
    throw Exception('Failed to remove bookmark: $e');
  }
}
```

#### Travel Plans Operations:

##### exploreList() - Get Travel Plans

```dart
Future<QuerySnapshot> exploreList() async {
  try {
    String uid = FirebaseAuth.instance.currentUser!.uid;
    return await FirebaseFirestore.instance
        .collection('explore_plans')
        .where('user_id', isEqualTo: uid)
        .orderBy('created_at', descending: true)
        .get();
  } catch (e) {
    throw Exception('Failed to get travel plans: $e');
  }
}
```

### 2. Local Storage dengan SharedPreferences

#### App Settings Management:

```dart
class AppPreferences {
  static const String _keyFirstTime = 'first_time';
  static const String _keyUserLocation = 'user_location';
  static const String _keyAppTheme = 'app_theme';

  static Future<bool> isFirstTime() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyFirstTime) ?? true;
  }

  static Future<void> setFirstTime(bool value) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyFirstTime, value);
  }

  static Future<void> saveUserLocation(double lat, double lng) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserLocation, '$lat,$lng');
  }

  static Future<String?> getUserLocation() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserLocation);
  }
}
```

---

## 🔄 Integration Flows

### 1. Account Management Flow

```
User opens Account → Load profile data →
Display menu options → User selects option →
Navigate to specific page → Perform action →
Update Firebase → Show feedback
```

### 2. Profile Update Flow

```
User taps Info Profile → Load current data →
User edits fields → Validate input →
Update Firebase → Show success message →
Refresh account page
```

### 3. Favorites Management Flow

```
User opens Favorites → Load bookmarks from Firebase →
Display in grid → User taps favorite →
Load place details → Navigate to detail page
```

### 4. Add to Favorites Flow

```
User views place detail → Taps favorite button →
Check if already favorited → Add to Firestore →
Update UI state → Show feedback
```

---

## 🛠️ Error Handling & Validation

### 1. Form Validation

```dart
bool validateProfileForm() {
  if (namaDepan.trim().isEmpty) {
    DialogHelper.showSnackBar(
      'Nama depan tidak boleh kosong',
      title: 'Validasi',
      backgroundColor: kWarningMain,
    );
    return false;
  }

  if (phone.isNotEmpty && !RegExp(r'^\+?[0-9]{10,13}$').hasMatch(phone)) {
    DialogHelper.showSnackBar(
      'Format nomor telepon tidak valid',
      title: 'Validasi',
      backgroundColor: kWarningMain,
    );
    return false;
  }

  return true;
}
```

### 2. Firebase Error Handling

```dart
Future<void> handleFirebaseOperation(Future<void> operation) async {
  try {
    await operation;
  } on FirebaseException catch (e) {
    String message;
    switch (e.code) {
      case 'permission-denied':
        message = 'Tidak memiliki izin untuk mengakses data';
        break;
      case 'unavailable':
        message = 'Layanan tidak tersedia, coba lagi nanti';
        break;
      case 'network-request-failed':
        message = 'Periksa koneksi internet Anda';
        break;
      default:
        message = 'Terjadi kesalahan: ${e.message}';
    }

    DialogHelper.showSnackBar(
      message,
      isError: true,
      backgroundColor: kRedColor,
    );
  } catch (e) {
    DialogHelper.showSnackBar(
      'Terjadi kesalahan tak terduga',
      isError: true,
      backgroundColor: kRedColor,
    );
  }
}
```

### 3. Network State Handling

```dart
class NetworkStateManager {
  static bool _isOnline = true;

  static bool get isOnline => _isOnline;

  static void checkConnectivity() async {
    var connectivityResult = await Connectivity().checkConnectivity();
    _isOnline = connectivityResult != ConnectivityResult.none;

    if (!_isOnline) {
      DialogHelper.showSnackBar(
        'Tidak ada koneksi internet',
        title: 'Offline',
        backgroundColor: kWarningMain,
      );
    }
  }
}
```

---

## 📊 Performance Optimizations

### 1. Data Caching Strategy

```dart
class CacheManager {
  static final Map<String, CacheEntry> _cache = {};

  static void cacheUserData(String uid, Map<String, dynamic> data) {
    _cache[uid] = CacheEntry(
      data: data,
      timestamp: DateTime.now(),
      ttl: Duration(minutes: 30),
    );
  }

  static Map<String, dynamic>? getCachedUserData(String uid) {
    final entry = _cache[uid];
    if (entry != null && !entry.isExpired) {
      return entry.data;
    }
    return null;
  }
}

class CacheEntry {
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final Duration ttl;

  CacheEntry({
    required this.data,
    required this.timestamp,
    required this.ttl,
  });

  bool get isExpired => DateTime.now().difference(timestamp) > ttl;
}
```

### 2. Image Loading Optimization

```dart
Widget buildOptimizedImage(String imageUrl) {
  return CachedNetworkImage(
    imageUrl: '${AppConstants.PLACE_PHOTO}$imageUrl',
    placeholder: (context, url) => const ShimmerLoader(),
    errorWidget: (context, url, error) => const Icon(Icons.error),
    memCacheWidth: 206,
    memCacheHeight: 190,
    fadeInDuration: Duration(milliseconds: 300),
  );
}
```

### 3. Lazy Loading Implementation

```dart
class LazyLoadingGrid extends StatefulWidget {
  @override
  _LazyLoadingGridState createState() => _LazyLoadingGridState();
}

class _LazyLoadingGridState extends State<LazyLoadingGrid> {
  final ScrollController _scrollController = ScrollController();
  List<dynamic> _items = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitialItems();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      _loadMoreItems();
    }
  }

  Future<void> _loadMoreItems() async {
    if (_isLoading) return;

    setState(() => _isLoading = true);

    // Load more items from Firebase
    final newItems = await loadMoreFavorites(_items.length);

    setState(() {
      _items.addAll(newItems);
      _isLoading = false;
    });
  }
}
```

---

## 🧪 Testing Strategies

### 1. Unit Testing untuk UserStore

```dart
group('UserStore Tests', () {
  test('should get user details successfully', () async {
    // Mock Firebase
    when(mockFirestore.collection('users'))
        .thenReturn(mockCollectionReference);

    final result = await userStore.getUserDetail();

    expect(result, isA<Map<String, dynamic>>());
    expect(result['username'], equals('testuser'));
  });

  test('should handle Firebase errors gracefully', () async {
    when(mockFirestore.collection('users'))
        .thenThrow(FirebaseException(plugin: 'firestore'));

    expect(
      () => userStore.getUserDetail(),
      throwsA(isA<Exception>()),
    );
  });
});
```

### 2. Widget Testing untuk Account Pages

```dart
testWidgets('AccountPage displays user information', (WidgetTester tester) async {
  // Mock UserStore
  when(mockUserStore.getUserDetail())
      .thenAnswer((_) async => {'firstName': 'John', 'lastName': 'Doe'});

  await tester.pumpWidget(MaterialApp(home: AccountPage()));
  await tester.pumpAndSettle();

  expect(find.text('John Doe'), findsOneWidget);
  expect(find.text('Info Profile'), findsOneWidget);
  expect(find.text('FAQ'), findsOneWidget);
});
```

---

Dokumentasi ini mencakup implementasi lengkap Advanced Features dengan fokus pada Account management, Favorites system, dan Data persistence. Semua fitur terintegrasi dengan Firebase untuk cloud storage dan GetX untuk state management yang efficient.

**File location untuk dokumentasi ini:**
`src/content/docs/advanced-features/account-favorites-management.md`

**Related Documentation:**

- [Core Features](../core-features/home-module.md) - Base functionality
- [Authentication System](../authentication/authentication-system.md) - User management
- [Firebase Integration](./firebase-integration.md) - Database operations
