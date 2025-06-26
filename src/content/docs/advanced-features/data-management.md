---
title: Data Management - Firebase & Local Storage
description: Comprehensive guide to data management, Firebase integration, shared preferences, and offline functionality in Musafir app
---

# Data Management - Firebase & Local Storage

Dokumentasi lengkap sistem data management aplikasi Musafir yang mengintegrasikan Firebase Firestore, SharedPreferences, dan strategi caching untuk performa optimal.

## 🏗️ Arsitektur Data Management

### Overview

Data Management Layer bertindak sebagai abstraction layer antara UI dan data sources, dengan support untuk online/offline scenarios dan data synchronization.

### Architecture Pattern

```
UI Layer ↔ Controllers ↔ Repository Layer ↔ Data Sources
    ↕          ↕             ↕              ↕
  Pages ↔ HomeController ↔ UserStore ↔ Firebase Firestore
        ↔ AuthController ↔ GoogleRepo ↔ Google Places API
        ↔ ExploreController ↔ AppPrefs ↔ SharedPreferences
```

---

## 📂 Data Management Structure

```
lib/
├── data/
│   ├── repository/
│   │   ├── google_repo.dart          # Google APIs repository
│   │   └── base_repository.dart      # Base repository pattern
│   ├── firestore/
│   │   └── user_store.dart           # Firebase operations
│   ├── local/
│   │   ├── shared_preferences.dart   # Local storage
│   │   └── cache_manager.dart        # Caching strategy
│   └── models/
│       ├── user_model.dart           # Data models
│       ├── place_model.dart
│       └── response_models.dart
├── utilitis/
│   └── apps_constants.dart           # API endpoints & constants
└── services/
    ├── network_service.dart          # Network connectivity
    └── sync_service.dart             # Data synchronization
```

---

## 🔥 Firebase Firestore Integration

### 1. UserStore - Central Firebase Repository

**Lokasi**: `lib/data/firestore/user_store.dart`

Core class untuk semua Firebase operations dengan comprehensive error handling.

#### Authentication & User Management:

##### Firebase Auth Instance

```dart
class UserStore {
  final FirebaseAuth auth = FirebaseAuth.instance;
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  // Get current user ID safely
  String? get currentUserId => auth.currentUser?.uid;

  // Check if user is authenticated
  bool get isAuthenticated => auth.currentUser != null;
}
```

##### User Profile Operations

```dart
// Create new user profile
Future<void> createUser({
  required String username,
  String? firstName,
  String? lastName,
  String? phone,
  String? provider,
}) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    await firestore.collection('users').doc(currentUserId).set({
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'provider': provider ?? 'email',
      'level': 1,
      'points': 0,
      'avatar': null,
      'bio': '',
      'preferences': {
        'notifications': true,
        'location_sharing': true,
        'theme': 'light',
      },
      'created_at': FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
      'last_login': FieldValue.serverTimestamp(),
    });

    print('User profile created successfully');
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to create user: $e');
  }
}

// Get user profile with caching
Future<Map<String, dynamic>> getUserDetail() async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    // Check cache first
    final cachedData = CacheManager.getCachedUserData(currentUserId!);
    if (cachedData != null) {
      return cachedData;
    }

    DocumentSnapshot doc = await firestore
        .collection('users')
        .doc(currentUserId)
        .get();

    if (doc.exists) {
      final data = doc.data() as Map<String, dynamic>;

      // Cache the data
      CacheManager.cacheUserData(currentUserId!, data);

      return data;
    } else {
      throw Exception('User profile not found');
    }
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to get user details: $e');
  }
}

// Update user profile
Future<void> updateUser(Map<String, dynamic> data) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    // Add metadata
    data['updated_at'] = FieldValue.serverTimestamp();

    await firestore
        .collection('users')
        .doc(currentUserId)
        .update(data);

    // Invalidate cache
    CacheManager.invalidateUserCache(currentUserId!);

    print('User profile updated successfully');
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to update user: $e');
  }
}
```

#### Bookmarks/Favorites Management:

##### Bookmark Operations

```dart
// Get user's bookmarks
Future<Map<String, dynamic>?> bookmarkList() async {
  try {
    if (!isAuthenticated) return null;

    DocumentSnapshot doc = await firestore
        .collection('bookmarks')
        .doc(currentUserId)
        .get();

    if (doc.exists) {
      return doc.data() as Map<String, dynamic>;
    }

    return null;
  } on FirebaseException catch (e) {
    print('Firebase error getting bookmarks: ${e.message}');
    return null;
  } catch (e) {
    print('Error getting bookmarks: $e');
    return null;
  }
}

// Add place to bookmarks
Future<void> addBookmark({
  required String placeId,
  required String placeName,
  required String address,
  String? photo,
  required String type,
  double? rating,
  String? vicinity,
}) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    // Get existing bookmarks
    DocumentSnapshot doc = await firestore
        .collection('bookmarks')
        .doc(currentUserId)
        .get();

    List<dynamic> places = [];
    if (doc.exists) {
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
      places = data['place'] ?? [];
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
        'rating': rating,
        'vicinity': vicinity,
        'added_at': FieldValue.serverTimestamp(),
      });

      await firestore
          .collection('bookmarks')
          .doc(currentUserId)
          .set({
        'place': places,
        'updated_at': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      print('Bookmark added successfully');
    } else {
      print('Place already bookmarked');
    }
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to add bookmark: $e');
  }
}

// Remove bookmark
Future<void> removeBookmark(String placeId) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    DocumentSnapshot doc = await firestore
        .collection('bookmarks')
        .doc(currentUserId)
        .get();

    if (doc.exists) {
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
      List<dynamic> places = data['place'] ?? [];

      places.removeWhere((place) => place['place_id'] == placeId);

      await firestore
          .collection('bookmarks')
          .doc(currentUserId)
          .update({
        'place': places,
        'updated_at': FieldValue.serverTimestamp(),
      });

      print('Bookmark removed successfully');
    }
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to remove bookmark: $e');
  }
}

// Check if place is bookmarked
Future<bool> isBookmarked(String placeId) async {
  try {
    final bookmarks = await bookmarkList();
    if (bookmarks == null) return false;

    List<dynamic> places = bookmarks['place'] ?? [];
    return places.any((place) => place['place_id'] == placeId);
  } catch (e) {
    print('Error checking bookmark status: $e');
    return false;
  }
}
```

#### Travel Plans Management:

##### Explore Plans Operations

```dart
// Add new travel plan
Future<void> addExplore({
  required String placeId,
  required String placeName,
  required String startTime,
  required String endTime,
  required String namePlan,
  required List resto,
  required List mosque,
  required double lat,
  required double lng,
}) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    await firestore.collection('explore_plans').add({
      'place_id': placeId,
      'place_name': placeName,
      'start_time': startTime,
      'end_time': endTime,
      'name_plan': namePlan,
      'resto': resto,
      'mosque': mosque,
      'lat': lat,
      'lng': lng,
      'user_id': currentUserId,
      'status': 'active',
      'created_at': FieldValue.serverTimestamp(),
      'updated_at': FieldValue.serverTimestamp(),
    });

    print('Travel plan added successfully');
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to add travel plan: $e');
  }
}

// Get user's travel plans
Future<QuerySnapshot> exploreList() async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    return await firestore
        .collection('explore_plans')
        .where('user_id', isEqualTo: currentUserId)
        .where('status', isEqualTo: 'active')
        .orderBy('created_at', descending: true)
        .get();
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to get travel plans: $e');
  }
}

// Update travel plan
Future<void> updateExplore({
  required String documentId,
  required Map<String, dynamic> data,
}) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    data['updated_at'] = FieldValue.serverTimestamp();

    await firestore
        .collection('explore_plans')
        .doc(documentId)
        .update(data);

    print('Travel plan updated successfully');
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to update travel plan: $e');
  }
}

// Delete travel plan (soft delete)
Future<void> deleteExplore(String documentId) async {
  try {
    if (!isAuthenticated) throw Exception('User not authenticated');

    await firestore
        .collection('explore_plans')
        .doc(documentId)
        .update({
      'status': 'deleted',
      'deleted_at': FieldValue.serverTimestamp(),
    });

    print('Travel plan deleted successfully');
  } on FirebaseException catch (e) {
    throw Exception('Firebase error: ${e.message}');
  } catch (e) {
    throw Exception('Failed to delete travel plan: $e');
  }
}
```

---

## 🗄️ Local Storage dengan SharedPreferences

### 1. AppPreferences - Local Settings Management

**Lokasi**: `lib/data/local/shared_preferences.dart`

#### Core Preferences Management:

```dart
class AppPreferences {
  static const String _keyFirstTime = 'first_time';
  static const String _keyUserLocation = 'user_location';
  static const String _keyAppTheme = 'app_theme';
  static const String _keyLanguage = 'app_language';
  static const String _keyNotifications = 'notifications_enabled';
  static const String _keyLocationPermission = 'location_permission';
  static const String _keyLastSync = 'last_sync_time';
  static const String _keyOfflineData = 'offline_data';

  // First time user experience
  static Future<bool> isFirstTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyFirstTime) ?? true;
  }

  static Future<void> setFirstTime(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyFirstTime, value);
  }

  // User location preferences
  static Future<void> saveUserLocation(double lat, double lng) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserLocation, '$lat,$lng');
    print('User location saved: $lat, $lng');
  }

  static Future<Map<String, double>?> getUserLocation() async {
    final prefs = await SharedPreferences.getInstance();
    final locationString = prefs.getString(_keyUserLocation);

    if (locationString != null) {
      final parts = locationString.split(',');
      if (parts.length == 2) {
        return {
          'lat': double.parse(parts[0]),
          'lng': double.parse(parts[1]),
        };
      }
    }
    return null;
  }

  // App theme preferences
  static Future<void> setTheme(String theme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyAppTheme, theme);
  }

  static Future<String> getTheme() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAppTheme) ?? 'light';
  }

  // Language preferences
  static Future<void> setLanguage(String language) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLanguage, language);
  }

  static Future<String> getLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyLanguage) ?? 'id';
  }

  // Notification preferences
  static Future<void> setNotificationsEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyNotifications, enabled);
  }

  static Future<bool> areNotificationsEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyNotifications) ?? true;
  }

  // Sync management
  static Future<void> setLastSyncTime(DateTime time) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyLastSync, time.toIso8601String());
  }

  static Future<DateTime?> getLastSyncTime() async {
    final prefs = await SharedPreferences.getInstance();
    final timeString = prefs.getString(_keyLastSync);
    return timeString != null ? DateTime.parse(timeString) : null;
  }

  // Clear all preferences (logout)
  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    print('All preferences cleared');
  }
}
```

### 2. Offline Data Caching

```dart
class OfflineDataManager {
  static const String _keyRecentSearches = 'recent_searches';
  static const String _keyOfflinePlaces = 'offline_places';
  static const String _keyOfflineFavorites = 'offline_favorites';

  // Recent searches caching
  static Future<void> saveRecentSearch(String query) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> searches = await getRecentSearches();

    // Remove if exists and add to top
    searches.remove(query);
    searches.insert(0, query);

    // Keep only last 10 searches
    if (searches.length > 10) {
      searches = searches.take(10).toList();
    }

    await prefs.setStringList(_keyRecentSearches, searches);
  }

  static Future<List<String>> getRecentSearches() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keyRecentSearches) ?? [];
  }

  // Offline places caching
  static Future<void> cachePlace(Map<String, dynamic> place) async {
    final prefs = await SharedPreferences.getInstance();
    final places = await getCachedPlaces();

    places[place['place_id']] = place;

    // Convert to JSON string
    final jsonString = jsonEncode(places);
    await prefs.setString(_keyOfflinePlaces, jsonString);
  }

  static Future<Map<String, dynamic>> getCachedPlaces() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_keyOfflinePlaces);

    if (jsonString != null) {
      return Map<String, dynamic>.from(jsonDecode(jsonString));
    }
    return {};
  }

  static Future<Map<String, dynamic>?> getCachedPlace(String placeId) async {
    final places = await getCachedPlaces();
    return places[placeId];
  }

  // Offline favorites caching
  static Future<void> cacheFavorites(List<dynamic> favorites) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode({'place': favorites});
    await prefs.setString(_keyOfflineFavorites, jsonString);
  }

  static Future<List<dynamic>> getCachedFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = prefs.getString(_keyOfflineFavorites);

    if (jsonString != null) {
      final data = jsonDecode(jsonString);
      return data['place'] ?? [];
    }
    return [];
  }
}
```

---

## 🌐 Google APIs Repository

### GoogleRepo - External API Management

**Lokasi**: `lib/data/repository/google_repo.dart`

#### Core API Operations:

```dart
class GoogleRepo {
  final String baseUrl = 'https://maps.googleapis.com/maps/api';
  final String apiKey = AppConstants.GOOGLE_MAPS_API_KEY;
  final http.Client httpClient;

  GoogleRepo({http.Client? httpClient}) : httpClient = httpClient ?? http.Client();

  // Nearby Places Search
  Future<http.Response> getNearbyPlace(String query) async {
    try {
      final url = Uri.parse('$baseUrl/place/nearbysearch/json?$query&key=$apiKey');

      print('Making nearby places request: $url');

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'OK') {
          return response;
        } else {
          throw Exception('API Error: ${data['status']} - ${data['error_message'] ?? 'Unknown error'}');
        }
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in getNearbyPlace: $e');
      rethrow;
    }
  }

  // Place Details
  Future<http.Response> getPlaceDetail(String placeId) async {
    try {
      final url = Uri.parse('$baseUrl/place/details/json?place_id=$placeId&key=$apiKey');

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'OK') {
          return response;
        } else {
          throw Exception('API Error: ${data['status']}');
        }
      } else {
        throw Exception('HTTP Error: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in getPlaceDetail: $e');
      rethrow;
    }
  }

  // Text Search
  Future<http.Response> getSearchPlace(String query) async {
    try {
      final url = Uri.parse('$baseUrl/place/autocomplete/json?$query&key=$apiKey');

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      return response;
    } catch (e) {
      print('Error in getSearchPlace: $e');
      rethrow;
    }
  }

  // Distance Matrix
  Future<http.Response> getDistance(String origins, String destinations) async {
    try {
      final url = Uri.parse(
        '$baseUrl/distancematrix/json?origins=$origins&destinations=$destinations&key=$apiKey'
      );

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      return response;
    } catch (e) {
      print('Error in getDistance: $e');
      rethrow;
    }
  }

  // Geocoding
  Future<http.Response> getGeocode(String address) async {
    try {
      final url = Uri.parse('$baseUrl/geocode/json?address=${Uri.encodeComponent(address)}&key=$apiKey');

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      return response;
    } catch (e) {
      print('Error in getGeocode: $e');
      rethrow;
    }
  }

  // Reverse Geocoding
  Future<http.Response> getReverseGeocode(double lat, double lng) async {
    try {
      final url = Uri.parse('$baseUrl/geocode/json?latlng=$lat,$lng&key=$apiKey');

      final response = await httpClient.get(url).timeout(
        Duration(seconds: 30),
        onTimeout: () => throw TimeoutException('Request timeout'),
      );

      return response;
    } catch (e) {
      print('Error in getReverseGeocode: $e');
      rethrow;
    }
  }
}
```

---

## 💾 Caching Strategy

### 1. CacheManager - Memory & Disk Caching

```dart
class CacheManager {
  static final Map<String, CacheEntry> _memoryCache = {};
  static const Duration defaultTTL = Duration(minutes: 30);

  // Cache user data
  static void cacheUserData(String uid, Map<String, dynamic> data) {
    _memoryCache[_getUserCacheKey(uid)] = CacheEntry(
      data: data,
      timestamp: DateTime.now(),
      ttl: Duration(hours: 1), // User data cached longer
    );
  }

  static Map<String, dynamic>? getCachedUserData(String uid) {
    final entry = _memoryCache[_getUserCacheKey(uid)];
    if (entry != null && !entry.isExpired) {
      return entry.data;
    }
    return null;
  }

  // Cache place data
  static void cachePlaceData(String placeId, Map<String, dynamic> data) {
    _memoryCache[_getPlaceCacheKey(placeId)] = CacheEntry(
      data: data,
      timestamp: DateTime.now(),
      ttl: defaultTTL,
    );

    // Also cache to disk for offline access
    OfflineDataManager.cachePlace(data);
  }

  static Map<String, dynamic>? getCachedPlaceData(String placeId) {
    final entry = _memoryCache[_getPlaceCacheKey(placeId)];
    if (entry != null && !entry.isExpired) {
      return entry.data;
    }
    return null;
  }

  // Cache search results
  static void cacheSearchResults(String query, List<dynamic> results) {
    _memoryCache[_getSearchCacheKey(query)] = CacheEntry(
      data: {'results': results},
      timestamp: DateTime.now(),
      ttl: Duration(minutes: 15), // Search results cached shorter
    );
  }

  static List<dynamic>? getCachedSearchResults(String query) {
    final entry = _memoryCache[_getSearchCacheKey(query)];
    if (entry != null && !entry.isExpired) {
      return entry.data['results'];
    }
    return null;
  }

  // Cache invalidation
  static void invalidateUserCache(String uid) {
    _memoryCache.remove(_getUserCacheKey(uid));
  }

  static void invalidatePlaceCache(String placeId) {
    _memoryCache.remove(_getPlaceCacheKey(placeId));
  }

  static void clearAllCache() {
    _memoryCache.clear();
  }

  // Helper methods
  static String _getUserCacheKey(String uid) => 'user_$uid';
  static String _getPlaceCacheKey(String placeId) => 'place_$placeId';
  static String _getSearchCacheKey(String query) => 'search_${query.hashCode}';
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

---

## 🔄 Data Synchronization

### 1. SyncService - Online/Offline Sync

```dart
class SyncService {
  static bool _isSyncing = false;
  static Timer? _syncTimer;

  // Initialize periodic sync
  static void initializeSync() {
    _syncTimer = Timer.periodic(Duration(minutes: 15), (timer) {
      if (NetworkService.isOnline && !_isSyncing) {
        syncData();
      }
    });
  }

  // Manual sync trigger
  static Future<void> syncData() async {
    if (_isSyncing) return;

    _isSyncing = true;

    try {
      await Future.wait([
        _syncUserData(),
        _syncFavorites(),
        _syncTravelPlans(),
      ]);

      await AppPreferences.setLastSyncTime(DateTime.now());
      print('Data sync completed successfully');
    } catch (e) {
      print('Error during sync: $e');
    } finally {
      _isSyncing = false;
    }
  }

  // Sync user data
  static Future<void> _syncUserData() async {
    try {
      final userStore = UserStore();
      final userData = await userStore.getUserDetail();

      // Cache locally for offline access
      final uid = userStore.currentUserId;
      if (uid != null) {
        CacheManager.cacheUserData(uid, userData);
      }
    } catch (e) {
      print('Error syncing user data: $e');
    }
  }

  // Sync favorites
  static Future<void> _syncFavorites() async {
    try {
      final userStore = UserStore();
      final favorites = await userStore.bookmarkList();

      if (favorites != null) {
        await OfflineDataManager.cacheFavorites(favorites['place'] ?? []);
      }
    } catch (e) {
      print('Error syncing favorites: $e');
    }
  }

  // Sync travel plans
  static Future<void> _syncTravelPlans() async {
    try {
      final userStore = UserStore();
      final plans = await userStore.exploreList();

      final plansList = plans.docs.map((doc) => {
        'id': doc.id,
        ...doc.data() as Map<String, dynamic>,
      }).toList();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cached_travel_plans', jsonEncode(plansList));
    } catch (e) {
      print('Error syncing travel plans: $e');
    }
  }

  // Stop sync service
  static void stopSync() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }
}
```

### 2. NetworkService - Connectivity Management

```dart
class NetworkService {
  static bool _isOnline = true;
  static late StreamSubscription<ConnectivityResult> _connectivitySubscription;

  static bool get isOnline => _isOnline;

  // Initialize connectivity monitoring
  static void initialize() {
    _connectivitySubscription = Connectivity()
        .onConnectivityChanged
        .listen(_onConnectivityChanged);

    // Check initial connectivity
    _checkConnectivity();
  }

  static void _onConnectivityChanged(ConnectivityResult result) {
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;

    if (!wasOnline && _isOnline) {
      // Back online - trigger sync
      print('Connection restored - triggering sync');
      SyncService.syncData();
    } else if (wasOnline && !_isOnline) {
      // Gone offline
      print('Connection lost - switching to offline mode');
    }
  }

  static Future<void> _checkConnectivity() async {
    final result = await Connectivity().checkConnectivity();
    _onConnectivityChanged(result);
  }

  static void dispose() {
    _connectivitySubscription.cancel();
  }
}
```

---

## 🛡️ Error Handling & Retry Logic

### 1. Comprehensive Error Handling

```dart
class DataError extends Exception {
  final String message;
  final String? code;
  final dynamic originalError;

  DataError(this.message, {this.code, this.originalError});

  @override
  String toString() => 'DataError: $message';
}

class ErrorHandler {
  static DataError handleFirebaseError(FirebaseException e) {
    switch (e.code) {
      case 'permission-denied':
        return DataError('Tidak memiliki izin untuk mengakses data', code: e.code);
      case 'unavailable':
        return DataError('Layanan tidak tersedia, coba lagi nanti', code: e.code);
      case 'network-request-failed':
        return DataError('Periksa koneksi internet Anda', code: e.code);
      case 'quota-exceeded':
        return DataError('Kuota database terlampaui', code: e.code);
      default:
        return DataError('Terjadi kesalahan: ${e.message}', code: e.code);
    }
  }

  static DataError handleNetworkError(Exception e) {
    if (e is TimeoutException) {
      return DataError('Request timeout, periksa koneksi internet');
    } else if (e is SocketException) {
      return DataError('Tidak dapat terhubung ke server');
    } else {
      return DataError('Terjadi kesalahan jaringan');
    }
  }
}
```

### 2. Retry Logic with Exponential Backoff

```dart
class RetryManager {
  static Future<T> executeWithRetry<T>(
    Future<T> Function() operation,
    {int maxRetries = 3, Duration initialDelay = const Duration(seconds: 1)}
  ) async {
    int attempt = 0;
    Duration delay = initialDelay;

    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (e) {
        attempt++;

        if (attempt >= maxRetries) {
          rethrow;
        }

        print('Operation failed (attempt $attempt/$maxRetries), retrying in ${delay.inSeconds}s...');
        await Future.delayed(delay);

        // Exponential backoff
        delay = Duration(seconds: delay.inSeconds * 2);
      }
    }

    throw Exception('Max retries exceeded');
  }
}

// Usage example:
/*
final userData = await RetryManager.executeWithRetry(() =>
  UserStore().getUserDetail()
);
*/
```

---

## 📊 Performance Monitoring

### 1. Data Access Performance Tracking

```dart
class PerformanceTracker {
  static final Map<String, Stopwatch> _operations = {};

  static void startTracking(String operationName) {
    _operations[operationName] = Stopwatch()..start();
  }

  static void endTracking(String operationName) {
    final stopwatch = _operations[operationName];
    if (stopwatch != null) {
      stopwatch.stop();
      final duration = stopwatch.elapsedMilliseconds;

      print('Operation $operationName took ${duration}ms');

      // Log slow operations
      if (duration > 2000) {
        print('WARNING: Slow operation detected - $operationName: ${duration}ms');
      }

      _operations.remove(operationName);
    }
  }

  static Future<T> trackOperation<T>(
    String operationName,
    Future<T> Function() operation,
  ) async {
    startTracking(operationName);
    try {
      final result = await operation();
      endTracking(operationName);
      return result;
    } catch (e) {
      endTracking(operationName);
      rethrow;
    }
  }
}

// Usage example:
/*
final userData = await PerformanceTracker.trackOperation(
  'getUserDetail',
  () => UserStore().getUserDetail(),
);
*/
```

---

## 🧪 Testing Data Layer

### 1. Unit Testing for UserStore

```dart
group('UserStore Tests', () {
  late UserStore userStore;
  late MockFirebaseFirestore mockFirestore;
  late MockFirebaseAuth mockAuth;

  setUp(() {
    mockFirestore = MockFirebaseFirestore();
    mockAuth = MockFirebaseAuth();
    userStore = UserStore();
  });

  test('should create user successfully', () async {
    // Arrange
    when(mockAuth.currentUser).thenReturn(MockUser());
    when(mockFirestore.collection('users')).thenReturn(mockCollection);

    // Act
    await userStore.createUser(
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    );

    // Assert
    verify(mockCollection.doc(any).set(any)).called(1);
  });

  test('should handle Firebase errors gracefully', () async {
    // Arrange
    when(mockFirestore.collection('users'))
        .thenThrow(FirebaseException(plugin: 'firestore'));

    // Act & Assert
    expect(
      () => userStore.getUserDetail(),
      throwsA(isA<Exception>()),
    );
  });
});
```

### 2. Integration Testing for Data Flow

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Data Management Integration Tests', () {
    testWidgets('should save and retrieve user data', (tester) async {
      // Initialize app
      await tester.pumpWidget(MyApp());

      // Create user
      final userStore = UserStore();
      await userStore.createUser(
        username: 'integrationtest',
        firstName: 'Integration',
        lastName: 'Test',
      );

      // Retrieve user data
      final userData = await userStore.getUserDetail();

      // Verify
      expect(userData['username'], equals('integrationtest'));
      expect(userData['firstName'], equals('Integration'));
    });
  });
}
```

---

Data Management layer ini menyediakan foundation yang solid untuk aplikasi Musafir dengan support untuk offline functionality, caching, dan synchronization. Semua operations di-design untuk handle network failures gracefully dan provide optimal user experience baik online maupun offline.

**File location untuk dokumentasi ini:**
`src/content/docs/advanced-features/data-management.md`

**Related Documentation:**

- [Account & Favorites Management](./account-favorites-management.md) - UI layer implementation
- [Authentication System](../authentication/authentication-system.md) - User authentication
- [Core Features](../core-features/home-module.md) - Feature integration

---

## 📋 Quick Reference

### Common Data Operations

#### User Management:

```dart
// Create user
await UserStore().createUser(username: 'user', firstName: 'John');

// Get user data
final userData = await UserStore().getUserDetail();

// Update user
await UserStore().updateUser({'firstName': 'Jane'});
```

#### Bookmarks:

```dart
// Add bookmark
await UserStore().addBookmark(
  placeId: 'place123',
  placeName: 'Restaurant',
  address: 'Address',
  type: 'restaurant',
);

// Check if bookmarked
final isBookmarked = await UserStore().isBookmarked('place123');

// Remove bookmark
await UserStore().removeBookmark('place123');
```

#### Local Storage:

```dart
// Save user location
await AppPreferences.saveUserLocation(-6.2088, 106.8456);

// Get user location
final location = await AppPreferences.getUserLocation();

// Cache data offline
await OfflineDataManager.cachePlace(placeData);
```

#### Error Handling:

```dart
try {
  final data = await UserStore().getUserDetail();
} on FirebaseException catch (e) {
  final error = ErrorHandler.handleFirebaseError(e);
  showError(error.message);
} catch (e) {
  showError('Unexpected error occurred');
}
```

---

## 🚀 Performance Best Practices

### 1. **Use Caching Strategically**

- Cache frequently accessed data
- Set appropriate TTL based on data volatility
- Implement cache invalidation properly

### 2. **Optimize Firebase Queries**

- Use compound queries where possible
- Implement pagination for large datasets
- Index frequently queried fields

### 3. **Handle Offline Scenarios**

- Cache critical data locally
- Provide meaningful offline experiences
- Sync data when connection is restored

### 4. **Monitor Performance**

- Track slow operations
- Monitor Firebase usage
- Implement proper error logging

---

## 🔧 Troubleshooting Guide

### Common Issues:

#### 1. **Firebase Permission Denied**

```dart
// Solution: Check Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### 2. **Network Timeout**

```dart
// Solution: Implement proper timeout handling
final response = await httpClient.get(url).timeout(
  Duration(seconds: 30),
  onTimeout: () => throw TimeoutException('Request timeout'),
);
```

#### 3. **Cache Memory Issues**

```dart
// Solution: Implement cache size limits
class CacheManager {
  static const int maxCacheSize = 100;

  static void _cleanupCache() {
    if (_memoryCache.length > maxCacheSize) {
      // Remove oldest entries
      final sortedEntries = _memoryCache.entries.toList()
        ..sort((a, b) => a.value.timestamp.compareTo(b.value.timestamp));

      for (int i = 0; i < sortedEntries.length - maxCacheSize; i++) {
        _memoryCache.remove(sortedEntries[i].key);
      }
    }
  }
}
```

#### 4. **Sync Conflicts**

```dart
// Solution: Implement conflict resolution
static Future<void> resolveConflict(
  Map<String, dynamic> localData,
  Map<String, dynamic> serverData,
) async {
  // Use server timestamp for resolution
  final localTimestamp = DateTime.parse(localData['updated_at']);
  final serverTimestamp = DateTime.parse(serverData['updated_at']);

  if (serverTimestamp.isAfter(localTimestamp)) {
    // Server data is newer, use server data
    await updateLocalData(serverData);
  } else {
    // Local data is newer, push to server
    await pushLocalData(localData);
  }
}
```

---

Dokumentasi Data Management ini memberikan foundation yang comprehensive untuk semua aspek data handling di aplikasi Musafir. Dengan implementasi yang proper dari patterns ini, aplikasi akan memiliki performa yang optimal, reliability yang tinggi, dan user experience yang smooth baik dalam kondisi online maupun offline.
