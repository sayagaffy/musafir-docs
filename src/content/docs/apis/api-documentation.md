---
title: API Documentation
description: Complete API documentation for Musafir app including Google Places API, Firebase APIs, and internal service endpoints.
---

# 📡 API Documentation - Complete Guide

Comprehensive API documentation untuk Musafir app yang mencakup semua external APIs (Google Places, Firebase) dan internal service endpoints yang digunakan dalam aplikasi.

---

## 📋 **API OVERVIEW**

### **API Stack Architecture**

```
┌─────────────────────────────────────┐
│            Musafir App              │
├─────────────────────────────────────┤
│        Repository Layer             │
├─────────────────────────────────────┤
│    External APIs    │ Internal APIs │
├────────────────────┼────────────────┤
│ • Google Places    │ • Firebase     │
│ • Google Maps      │ • Firestore    │
│ • Google Geocoding │ • Auth Service │
│ • Distance Matrix  │ • Analytics    │
└────────────────────┴────────────────┘
```

### **API Categories**

- **🗺️ Google Places API** - Places search, details, nearby
- **📍 Google Maps API** - Geocoding, distance calculation
- **🔥 Firebase APIs** - Authentication, Firestore, Analytics
- **🏗️ Internal Services** - Repository layer, business logic

---

## 🗺️ **GOOGLE PLACES API**

### **Base Configuration**

```dart
class AppConstants {
  // Google Places API Base URLs
  static const String MAPS_API_BASE = 'https://maps.googleapis.com/maps/api';

  // API Endpoints
  static const String NEARBYSEARCH = '$MAPS_API_BASE/place/nearbysearch/json';
  static const String PLACE_DETAIL = '$MAPS_API_BASE/place/details/json';
  static const String SEARCH = '$MAPS_API_BASE/place/autocomplete/json';
  static const String PLACE_TEXTSEARCH = '$MAPS_API_BASE/place/textsearch/json';
  static const String GEOCODE = '$MAPS_API_BASE/geocode/json';
  static const String DISTANCE = '$MAPS_API_BASE/distancematrix/json';

  // API Key (Environment Variable)
  static const String API_GKEY = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
}
```

### **1. Nearby Search API**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/place/nearbysearch/json
```

#### **Implementation**

```dart
Future<Response> getNearbyPlace({
  required double latitude,
  required double longitude,
  required String type,
  int radius = 1500,
  String? keyword,
  String? rankby,
  String? pagetoken,
}) async {
  final queryParams = {
    'location': '$latitude,$longitude',
    'radius': radius.toString(),
    'type': type,
    'key': AppConstans.API_GKEY,
    'language': 'id',
  };

  if (keyword != null) queryParams['keyword'] = keyword;
  if (rankby != null) queryParams['rankby'] = rankby;
  if (pagetoken != null) queryParams['pagetoken'] = pagetoken;

  return await apiClient.get(AppConstans.NEARBYSEARCH, query: queryParams);
}
```

#### **Parameters**

| Parameter   | Type    | Required | Description                                   |
| ----------- | ------- | -------- | --------------------------------------------- |
| `location`  | String  | ✅       | Latitude,longitude (e.g., "-6.2088,106.8456") |
| `radius`    | Integer | ✅       | Search radius in meters (max 50000)           |
| `type`      | String  | ✅       | Place type ("restaurant", "mosque", "food")   |
| `keyword`   | String  | ❌       | Search keyword                                |
| `rankby`    | String  | ❌       | "prominence" or "distance"                    |
| `pagetoken` | String  | ❌       | Token for next page results                   |
| `key`       | String  | ✅       | Google API key                                |
| `language`  | String  | ❌       | Language code ("id" for Indonesian)           |

#### **Response Example**

```json
{
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Restoran Padang Sederhana",
      "vicinity": "Jl. Sudirman No. 123, Jakarta",
      "geometry": {
        "location": {
          "lat": -6.2088,
          "lng": 106.8456
        }
      },
      "rating": 4.2,
      "user_ratings_total": 150,
      "price_level": 2,
      "photos": [
        {
          "photo_reference": "ATtYBwI...",
          "height": 1536,
          "width": 2048
        }
      ],
      "opening_hours": {
        "open_now": true
      },
      "types": ["restaurant", "food", "establishment"]
    }
  ],
  "status": "OK",
  "next_page_token": "ATtYBwI..."
}
```

#### **Error Responses**

```json
{
  "error_message": "This API project is not authorized to use this API.",
  "results": [],
  "status": "REQUEST_DENIED"
}
```

**Common Error Codes:**

- `OK` - Success
- `ZERO_RESULTS` - No places found
- `OVER_QUERY_LIMIT` - API quota exceeded
- `REQUEST_DENIED` - API key invalid or unauthorized
- `INVALID_REQUEST` - Missing required parameters

### **2. Place Details API**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/place/details/json
```

#### **Implementation**

```dart
Future<Response> getPlaceDetail(String placeId) async {
  final queryParams = {
    'place_id': placeId,
    'fields': 'place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,opening_hours,photos,reviews,international_phone_number,website,url',
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  return await apiClient.get(AppConstans.PLACE_DETAIL, query: queryParams);
}
```

#### **Parameters**

| Parameter  | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `place_id` | String | ✅       | Unique place identifier                  |
| `fields`   | String | ❌       | Comma-separated list of fields to return |
| `language` | String | ❌       | Language for results                     |
| `key`      | String | ✅       | Google API key                           |

#### **Response Example**

```json
{
  "result": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Restoran Padang Sederhana",
    "formatted_address": "Jl. Sudirman No. 123, Tanah Abang, Jakarta Pusat, DKI Jakarta 10220, Indonesia",
    "geometry": {
      "location": {
        "lat": -6.2088,
        "lng": 106.8456
      }
    },
    "rating": 4.2,
    "user_ratings_total": 150,
    "price_level": 2,
    "opening_hours": {
      "open_now": true,
      "periods": [
        {
          "close": {
            "day": 0,
            "time": "2200"
          },
          "open": {
            "day": 0,
            "time": "0600"
          }
        }
      ],
      "weekday_text": [
        "Monday: 6:00 AM – 10:00 PM",
        "Tuesday: 6:00 AM – 10:00 PM"
      ]
    },
    "photos": [
      {
        "photo_reference": "ATtYBwI...",
        "height": 1536,
        "width": 2048
      }
    ],
    "reviews": [
      {
        "author_name": "Ahmad Rizki",
        "author_url": "https://www.google.com/maps/contrib/...",
        "profile_photo_url": "https://lh3.googleusercontent.com/...",
        "rating": 5,
        "relative_time_description": "2 weeks ago",
        "text": "Makanan enak dan halal. Pelayanan ramah.",
        "time": 1609459200
      }
    ],
    "international_phone_number": "+62 21 1234567",
    "website": "http://www.restoranpadang.com",
    "url": "https://maps.google.com/?cid=..."
  },
  "status": "OK"
}
```

### **3. Text Search API**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/place/textsearch/json
```

#### **Implementation**

```dart
Future<Response> getTextSearch({
  required String query,
  required double latitude,
  required double longitude,
  int radius = 5000,
}) async {
  final queryParams = {
    'query': query,
    'location': '$latitude,$longitude',
    'radius': radius.toString(),
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  return await apiClient.get(AppConstans.PLACE_TEXTSEARCH, query: queryParams);
}
```

#### **Parameters**

| Parameter  | Type    | Required | Description                                    |
| ---------- | ------- | -------- | ---------------------------------------------- |
| `query`    | String  | ✅       | Search text (e.g., "halal restaurant jakarta") |
| `location` | String  | ❌       | Latitude,longitude for location bias           |
| `radius`   | Integer | ❌       | Search radius in meters                        |
| `language` | String  | ❌       | Language code                                  |
| `key`      | String  | ✅       | Google API key                                 |

### **4. Autocomplete API**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/place/autocomplete/json
```

#### **Implementation**

```dart
Future<Response> getPlaceAutocomplete({
  required String input,
  double? latitude,
  double? longitude,
  int radius = 5000,
  String? types,
}) async {
  final queryParams = {
    'input': input,
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  if (latitude != null && longitude != null) {
    queryParams['location'] = '$latitude,$longitude';
    queryParams['radius'] = radius.toString();
  }

  if (types != null) queryParams['types'] = types;

  return await apiClient.get(AppConstans.SEARCH, query: queryParams);
}
```

#### **Response Example**

```json
{
  "predictions": [
    {
      "description": "Restoran Padang Sederhana, Jalan Sudirman, Jakarta",
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "reference": "ATtYBwI...",
      "matched_substrings": [
        {
          "length": 8,
          "offset": 0
        }
      ],
      "structured_formatting": {
        "main_text": "Restoran Padang Sederhana",
        "main_text_matched_substrings": [
          {
            "length": 8,
            "offset": 0
          }
        ],
        "secondary_text": "Jalan Sudirman, Jakarta"
      },
      "terms": [
        {
          "offset": 0,
          "value": "Restoran"
        },
        {
          "offset": 9,
          "value": "Padang"
        }
      ],
      "types": ["restaurant", "food", "establishment"]
    }
  ],
  "status": "OK"
}
```

---

## 📍 **GOOGLE MAPS GEOCODING API**

### **1. Reverse Geocoding (Coordinates to Address)**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/geocode/json
```

#### **Implementation**

```dart
Future<Response> getGeocode({
  required double latitude,
  required double longitude,
}) async {
  final queryParams = {
    'latlng': '$latitude,$longitude',
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  return await apiClient.get(AppConstans.GEOCODE, query: queryParams);
}
```

#### **Response Example**

```json
{
  "results": [
    {
      "address_components": [
        {
          "long_name": "123",
          "short_name": "123",
          "types": ["street_number"]
        },
        {
          "long_name": "Jalan Sudirman",
          "short_name": "Jl. Sudirman",
          "types": ["route"]
        },
        {
          "long_name": "Tanah Abang",
          "short_name": "Tanah Abang",
          "types": ["administrative_area_level_4", "political"]
        },
        {
          "long_name": "Jakarta Pusat",
          "short_name": "Jakarta Pusat",
          "types": ["administrative_area_level_2", "political"]
        }
      ],
      "formatted_address": "Jl. Sudirman No. 123, Tanah Abang, Jakarta Pusat, DKI Jakarta 10220, Indonesia",
      "geometry": {
        "location": {
          "lat": -6.2088,
          "lng": 106.8456
        },
        "location_type": "ROOFTOP",
        "viewport": {
          "northeast": {
            "lat": -6.207451,
            "lng": 106.846949
          },
          "southwest": {
            "lat": -6.210149,
            "lng": 106.844251
          }
        }
      },
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "types": ["street_address"]
    }
  ],
  "status": "OK"
}
```

### **2. Forward Geocoding (Address to Coordinates)**

#### **Implementation**

```dart
Future<Response> getGeocodeAddress(String address) async {
  final queryParams = {
    'address': address,
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  return await apiClient.get(AppConstans.GEOCODE, query: queryParams);
}
```

### **3. Distance Matrix API**

#### **Endpoint**

```
GET https://maps.googleapis.com/maps/api/distancematrix/json
```

#### **Implementation**

```dart
Future<Response> getDistance({
  required String origins,
  required String destinations,
  String mode = 'driving',
  String units = 'metric',
}) async {
  final queryParams = {
    'origins': origins,
    'destinations': destinations,
    'mode': mode,
    'units': units,
    'language': 'id',
    'key': AppConstans.API_GKEY,
  };

  return await apiClient.get(AppConstans.DISTANCE, query: queryParams);
}
```

#### **Response Example**

```json
{
  "destination_addresses": ["Jl. Sudirman No. 123, Jakarta"],
  "origin_addresses": ["Jl. Thamrin No. 456, Jakarta"],
  "rows": [
    {
      "elements": [
        {
          "distance": {
            "text": "2.5 km",
            "value": 2500
          },
          "duration": {
            "text": "8 mins",
            "value": 480
          },
          "status": "OK"
        }
      ]
    }
  ],
  "status": "OK"
}
```

---

## 🔥 **FIREBASE APIs**

### **1. Firebase Authentication API**

#### **Email/Password Authentication**

```dart
class AuthRepository {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _mapAuthException(e);
    }
  }

  Future<UserCredential> createUserWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _mapAuthException(e);
    }
  }

  AuthException _mapAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return AuthException('User tidak ditemukan');
      case 'wrong-password':
        return AuthException('Password salah');
      case 'email-already-in-use':
        return AuthException('Email sudah digunakan');
      case 'weak-password':
        return AuthException('Password terlalu lemah');
      default:
        return AuthException('Terjadi kesalahan: ${e.message}');
    }
  }
}
```

#### **Google Sign-In Integration**

```dart
Future<UserCredential> signInWithGoogle() async {
  try {
    // Trigger Google Sign-In flow
    final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

    if (googleUser == null) {
      throw AuthException('Google Sign-In dibatalkan');
    }

    // Get authentication details
    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

    // Create credential
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    return await _auth.signInWithCredential(credential);
  } catch (e) {
    throw AuthException('Google Sign-In gagal: $e');
  }
}
```

### **2. Cloud Firestore API**

#### **User Management**

```dart
class UserStore {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Collection references
  CollectionReference get users => _firestore.collection('users');
  CollectionReference get places => _firestore.collection('places');
  CollectionReference get travelPlans => _firestore.collection('travel_plans');

  Future<void> createUser({
    required String email,
    required String username,
    String? firstName,
    String? lastName,
    String? phone,
    String? photoURL,
    String provider = 'email',
  }) async {
    try {
      await users.doc(email).set({
        'username': username,
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'photoURL': photoURL,
        'email': email,
        'provider': provider,
        'createdAt': FieldValue.serverTimestamp(),
        'lastLogin': FieldValue.serverTimestamp(),
        'isActive': true,
      });
    } catch (e) {
      throw FirestoreException('Gagal membuat user: $e');
    }
  }

  Future<Map<String, dynamic>?> getUser(String email) async {
    try {
      final doc = await users.doc(email).get();
      return doc.exists ? doc.data() as Map<String, dynamic> : null;
    } catch (e) {
      throw FirestoreException('Gagal mengambil user: $e');
    }
  }
}
```

#### **Bookmarks Management**

```dart
Future<void> bookmarkPlace(Map<String, dynamic> placeData) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) throw AuthException('User not authenticated');

  try {
    await users.doc(user.email).collection('bookmarks').add({
      'placeId': placeData['place_id'],
      'name': placeData['name'],
      'vicinity': placeData['vicinity'],
      'rating': placeData['rating'],
      'photos': placeData['photos'],
      'geometry': placeData['geometry'],
      'types': placeData['types'],
      'bookmarkedAt': FieldValue.serverTimestamp(),
    });
  } catch (e) {
    throw FirestoreException('Gagal menyimpan bookmark: $e');
  }
}

Future<List<Map<String, dynamic>>> getBookmarks() async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) throw AuthException('User not authenticated');

  try {
    final querySnapshot = await users
        .doc(user.email)
        .collection('bookmarks')
        .orderBy('bookmarkedAt', descending: true)
        .get();

    return querySnapshot.docs
        .map((doc) => {'id': doc.id, ...doc.data() as Map<String, dynamic>})
        .toList();
  } catch (e) {
    throw FirestoreException('Gagal mengambil bookmarks: $e');
  }
}
```

#### **Travel Plans Management**

```dart
Future<String> saveTravelPlan({
  required String planName,
  required String destination,
  required DateTime startDate,
  required DateTime endDate,
  required List<Map<String, dynamic>> restaurants,
  required List<Map<String, dynamic>> mosques,
}) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) throw AuthException('User not authenticated');

  try {
    final docRef = await travelPlans.add({
      'userId': user.uid,
      'userEmail': user.email,
      'planName': planName,
      'destination': destination,
      'startDate': Timestamp.fromDate(startDate),
      'endDate': Timestamp.fromDate(endDate),
      'restaurants': restaurants,
      'mosques': mosques,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
      'isActive': true,
    });

    return docRef.id;
  } catch (e) {
    throw FirestoreException('Gagal menyimpan travel plan: $e');
  }
}
```

---

## 🔒 **API SECURITY & AUTHENTICATION**

### **1. Google API Key Security**

```dart
class ApiKeyManager {
  static String get googleMapsApiKey {
    const apiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
    if (apiKey.isEmpty) {
      throw Exception('Google Maps API key not configured');
    }
    return apiKey;
  }

  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'User-Agent': 'Musafir-App/1.0',
  };
}
```

### **2. Firebase Security Rules**

#### **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;

      // User bookmarks
      match /bookmarks/{bookmarkId} {
        allow read, write: if request.auth != null && request.auth.token.email == email;
      }
    }

    // Travel plans - users can only access their own plans
    match /travel_plans/{planId} {
      allow read, write: if request.auth != null &&
        request.auth.token.email == resource.data.userEmail;
    }

    // Public places data (read-only)
    match /places/{placeId} {
      allow read: if true;
      allow write: if false; // Only admin can write
    }
  }
}
```

---

## 📈 **API RATE LIMITING & OPTIMIZATION**

### **1. Request Throttling**

```dart
class ApiThrottler {
  static final Map<String, List<DateTime>> _requestHistory = {};
  static const int maxRequestsPerMinute = 60;

  static Future<bool> canMakeRequest(String endpoint) async {
    final now = DateTime.now();
    final history = _requestHistory[endpoint] ?? [];

    // Remove requests older than 1 minute
    history.removeWhere((time) =>
      now.difference(time).inMinutes >= 1);

    if (history.length >= maxRequestsPerMinute) {
      throw ApiException('Rate limit exceeded for $endpoint');
    }

    history.add(now);
    _requestHistory[endpoint] = history;

    return true;
  }
}
```

### **2. Response Caching**

```dart
class ApiCache {
  static final Map<String, CacheEntry> _cache = {};
  static const Duration defaultTtl = Duration(minutes: 5);

  static Future<T?> get<T>(String key) async {
    final entry = _cache[key];
    if (entry == null || entry.isExpired) {
      _cache.remove(key);
      return null;
    }
    return entry.data as T;
  }

  static void set(String key, dynamic data, {Duration? ttl}) {
    _cache[key] = CacheEntry(
      data: data,
      expiresAt: DateTime.now().add(ttl ?? defaultTtl),
    );
  }

  static String generateCacheKey(String endpoint, Map<String, dynamic> params) {
    final sortedParams = Map.fromEntries(
      params.entries.toList()..sort((a, b) => a.key.compareTo(b.key))
    );
    return '$endpoint${sortedParams.toString()}';
  }
}

class CacheEntry {
  final dynamic data;
  final DateTime expiresAt;

  CacheEntry({required this.data, required this.expiresAt});

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
```

---

## 🚨 **ERROR HANDLING**

### **1. Custom Exception Classes**

```dart
abstract class ApiException implements Exception {
  final String message;
  final String code;
  final int? statusCode;

  ApiException(this.message, this.code, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (Code: $code)';
}

class GoogleApiException extends ApiException {
  GoogleApiException(String message, String code) : super(message, code);

  factory GoogleApiException.fromResponse(Map<String, dynamic> response) {
    final status = response['status'] as String;
    final errorMessage = response['error_message'] as String?;

    switch (status) {
      case 'ZERO_RESULTS':
        return GoogleApiException('No results found', 'ZERO_RESULTS');
      case 'OVER_QUERY_LIMIT':
        return GoogleApiException('API quota exceeded', 'QUOTA_EXCEEDED');
      case 'REQUEST_DENIED':
        return GoogleApiException('Request denied', 'ACCESS_DENIED');
      case 'INVALID_REQUEST':
        return GoogleApiException('Invalid request parameters', 'INVALID_REQUEST');
      default:
        return GoogleApiException(
          errorMessage ?? 'Unknown error occurred',
          status,
        );
    }
  }
}

class FirestoreException extends ApiException {
  FirestoreException(String message) : super(message, 'FIRESTORE_ERROR');
}

class AuthException extends ApiException {
  AuthException(String message) : super(message, 'AUTH_ERROR');
}
```

### **2. Error Recovery Strategies**

```dart
class ApiRetryManager {
  static Future<T> executeWithRetry<T>(
    Future<T> Function() operation, {
    int maxRetries = 3,
    Duration delay = const Duration(seconds: 1),
    bool Function(Exception)? shouldRetry,
  }) async {
    int attempts = 0;

    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (e) {
        attempts++;

        if (attempts >= maxRetries ||
            (shouldRetry != null && !shouldRetry(e as Exception))) {
          rethrow;
        }

        // Exponential backoff
        await Future.delayed(delay * attempts);
      }
    }

    throw Exception('Max retry attempts exceeded');
  }
}
```

---

## 📊 **API MONITORING & ANALYTICS**

### **1. Request Logging**

```dart
class ApiLogger {
  static void logRequest({
    required String method,
    required String endpoint,
    Map<String, dynamic>? parameters,
    int? statusCode,
    Duration? duration,
    String? error,
  }) {
    final logData = {
      'timestamp': DateTime.now().toIso8601String(),
      'method': method,
      'endpoint': endpoint,
      'parameters': parameters,
      'statusCode': statusCode,
      'duration_ms': duration?.inMilliseconds,
      'error': error,
    };

    // Log to console in debug mode
    if (kDebugMode) {
      print('API Request: ${jsonEncode(logData)}');
    }

    // Send to analytics in production
    if (kReleaseMode) {
      FirebaseAnalytics.instance.logEvent(
        name: 'api_request',
        parameters: {
          'endpoint': endpoint,
          'method': method,
          'status_code': statusCode ?? 0,
          'duration_ms': duration?.inMilliseconds ?? 0,
          'success': error == null,
        },
      );
    }
  }
}
```

### **2. Performance Metrics**

```dart
class ApiMetrics {
  static final Map<String, List<int>> _responseTimes = {};
  static final Map<String, int> _requestCounts = {};
  static final Map<String, int> _errorCounts = {};

  static void recordRequest({
    required String endpoint,
    required Duration responseTime,
    bool success = true,
  }) {
    // Record response time
    _responseTimes.putIfAbsent(endpoint, () => [])
        .add(responseTime.inMilliseconds);

    // Record request count
    _requestCounts[endpoint] = (_requestCounts[endpoint] ?? 0) + 1;

    // Record error count
    if (!success) {
      _errorCounts[endpoint] = (_errorCounts[endpoint] ?? 0) + 1;
    }
  }

  static Map<String, dynamic> getMetrics() {
    final metrics = <String, dynamic>{};

    for (final endpoint in _requestCounts.keys) {
      final responseTimes = _responseTimes[endpoint] ?? [];
      final requestCount = _requestCounts[endpoint] ?? 0;
      final errorCount = _errorCounts[endpoint] ?? 0;

      metrics[endpoint] = {
        'request_count': requestCount,
        'error_count': errorCount,
        'error_rate': requestCount > 0 ? errorCount / requestCount : 0,
        'avg_response_time': responseTimes.isNotEmpty
            ? responseTimes.reduce((a, b) => a + b) / responseTimes.length
            : 0,
        'max_response_time': responseTimes.isNotEmpty
            ? responseTimes.reduce((a, b) => a > b ? a : b)
            : 0,
      };
    }

    return metrics;
  }
}
```

---

## 🧪 **API TESTING**

### **1. Unit Tests for API Calls**

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:http/http.dart' as http;

class MockClient extends Mock implements http.Client {}

void main() {
  group('Google Places API Tests', () {
    late GoogleRepository googleRepo;
    late MockClient mockClient;

    setUp(() {
      mockClient = MockClient();
      googleRepo = GoogleRepository(client: mockClient);
    });

    test('should fetch nearby places successfully', () async {
      // Arrange
      const expectedResponse = '''
      {
        "results": [
          {
            "place_id": "test_place_id",
            "name": "Test Restaurant",
            "vicinity": "Test Location",
            "rating": 4.5
          }
        ],
        "status": "OK"
      }
      ''';

      when(mockClient.get(any)).thenAnswer(
        (_) async => http.Response(expectedResponse, 200),
      );

      // Act
      final result = await googleRepo.getNearbyPlace(
        latitude: -6.2088,
        longitude: 106.8456,
        type: 'restaurant',
      );

      // Assert
      expect(result['status'], 'OK');
      expect(result['results'], isA<List>());
      expect(result['results'].length, 1);
    });

    test('should handle API errors gracefully', () async {
      // Arrange
      const errorResponse = '''
      {
        "error_message": "Request denied",
        "results": [],
        "status": "REQUEST_DENIED"
      }
      ''';

      when(mockClient.get(any)).thenAnswer(
        (_) async => http.Response(errorResponse, 403),
      );

      // Act & Assert
      expect(
        () => googleRepo.getNearbyPlace(
          latitude: -6.2088,
          longitude: 106.8456,
          type: 'restaurant',
        ),
        throwsA(isA<GoogleApiException>()),
      );
    });
  });
}
```

### **2. Integration Tests**

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:musafir/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('API Integration Tests', () {
    testWidgets('should fetch real places data', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Trigger API call
      final googleRepo = GoogleRepository();

      final result = await googleRepo.getNearbyPlace(
        latitude: -6.2088,
        longitude: 106.8456,
        type: 'restaurant',
      );

      // Verify real API response
      expect(result['status'], 'OK');
      expect(result['results'], isA<List>());
    });
  });
}
```

---

## 📋 **API USAGE EXAMPLES**

### **1. Complete Restaurant Search Flow**

```dart
class RestaurantSearchExample {
  final GoogleRepository _googleRepo = Get.find<GoogleRepository>();

  Future<List<Restaurant>> searchNearbyRestaurants({
    required double latitude,
    required double longitude,
    String keyword = 'halal',
  }) async {
    try {
      // Step 1: Get nearby places
      final response = await _googleRepo.getNearbyPlace(
        latitude: latitude,
        longitude: longitude,
        type: 'restaurant',
        keyword: keyword,
        radius: 1500,
      );

      if (response['status'] != 'OK') {
        throw GoogleApiException.fromResponse(response);
      }

      final places = response['results'] as List;
      final restaurants = <Restaurant>[];

      // Step 2: Get detailed information for each place
      for (final place in places) {
        final placeId = place['place_id'] as String;

        try {
          final detailResponse = await _googleRepo.getPlaceDetail(placeId);

          if (detailResponse['status'] == 'OK') {
            final restaurant = Restaurant.fromGooglePlace(
              detailResponse['result'],
            );
            restaurants.add(restaurant);
          }
        } catch (e) {
          // Log error but continue with other places
          print('Error fetching details for $placeId: $e');
        }

        // Add delay to respect API rate limits
        await Future.delayed(Duration(milliseconds: 100));
      }

      return restaurants;

    } catch (e) {
      // Log error for monitoring
      ApiLogger.logRequest(
        method: 'GET',
        endpoint: 'nearby_restaurants',
        error: e.toString(),
      );

      rethrow;
    }
  }
}
```

### **2. User Authentication Flow**

```dart
class AuthenticationExample {
  final AuthRepository _authRepo = Get.find<AuthRepository>();
  final UserStore _userStore = Get.find<UserStore>();

  Future<User> signUpWithEmail({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    try {
      // Step 1: Create Firebase Auth user
      final credential = await _authRepo.createUserWithEmail(
        email: email,
        password: password,
      );

      // Step 2: Send email verification
      await credential.user?.sendEmailVerification();

      // Step 3: Create user profile in Firestore
      await _userStore.createUser(
        email: email,
        username: email.split('@')[0],
        firstName: firstName,
        lastName: lastName,
        phone: phone,
      );

      // Step 4: Log analytics event
      await FirebaseAnalytics.instance.logSignUp(
        signUpMethod: 'email',
      );

      return credential.user!;

    } catch (e) {
      // Log error for monitoring
      await FirebaseCrashlytics.instance.recordError(
        e,
        StackTrace.current,
        reason: 'Sign up failed',
      );

      rethrow;
    }
  }
}
```

### **3. Travel Plan Management**

```dart
class TravelPlanExample {
  final UserStore _userStore = Get.find<UserStore>();
  final GoogleRepository _googleRepo = Get.find<GoogleRepository>();

  Future<String> createTravelPlan({
    required String planName,
    required String destination,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    try {
      // Step 1: Geocode destination
      final geocodeResponse = await _googleRepo.getGeocodeAddress(destination);

      if (geocodeResponse['status'] != 'OK') {
        throw Exception('Invalid destination');
      }

      final location = geocodeResponse['results'][0]['geometry']['location'];
      final lat = location['lat'] as double;
      final lng = location['lng'] as double;

      // Step 2: Find nearby restaurants
      final restaurantResponse = await _googleRepo.getNearbyPlace(
        latitude: lat,
        longitude: lng,
        type: 'restaurant',
        keyword: 'halal',
      );

      // Step 3: Find nearby mosques
      final mosqueResponse = await _googleRepo.getNearbyPlace(
        latitude: lat,
        longitude: lng,
        type: 'mosque',
      );

      // Step 4: Process and save travel plan
      final restaurants = restaurantResponse['results'] as List;
      final mosques = mosqueResponse['results'] as List;

      final planId = await _userStore.saveTravelPlan(
        planName: planName,
        destination: destination,
        startDate: startDate,
        endDate: endDate,
        restaurants: restaurants.cast<Map<String, dynamic>>(),
        mosques: mosques.cast<Map<String, dynamic>>(),
      );

      // Step 5: Log analytics
      await FirebaseAnalytics.instance.logEvent(
        name: 'travel_plan_created',
        parameters: {
          'destination': destination,
          'restaurants_count': restaurants.length,
          'mosques_count': mosques.length,
        },
      );

      return planId;

    } catch (e) {
      await FirebaseCrashlytics.instance.recordError(
        e,
        StackTrace.current,
        reason: 'Travel plan creation failed',
      );

      rethrow;
    }
  }
}
```

---

## 🔧 **API CONFIGURATION**

### **1. Environment Configuration**

```dart
class ApiConfig {
  static const Map<String, String> _endpoints = {
    'development': 'https://dev-api.musafir.com',
    'staging': 'https://staging-api.musafir.com',
    'production': 'https://api.musafir.com',
  };

  static String get baseUrl {
    const environment = String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');
    return _endpoints[environment] ?? _endpoints['development']!;
  }

  static bool get isProduction =>
      const String.fromEnvironment('ENVIRONMENT') == 'production';

  static Duration get requestTimeout =>
      isProduction ? Duration(seconds: 30) : Duration(seconds: 10);

  static int get maxRetries => isProduction ? 3 : 1;
}
```

### **2. HTTP Client Setup**

```dart
class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.requestTimeout,
      receiveTimeout: ApiConfig.requestTimeout,
      sendTimeout: ApiConfig.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Musafir-App/1.0.0',
      },
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    // Request interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Add authentication token
        final token = AuthService.currentToken;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }

        // Log request
        ApiLogger.logRequest(
          method: options.method,
          endpoint: options.path,
          parameters: options.queryParameters,
        );

        handler.next(options);
      },
      onResponse: (response, handler) {
        // Log successful response
        ApiLogger.logRequest(
          method: response.requestOptions.method,
          endpoint: response.requestOptions.path,
          statusCode: response.statusCode,
          duration: Duration(milliseconds: response.requestOptions.responseType.index),
        );

        handler.next(response);
      },
      onError: (error, handler) {
        // Log error response
        ApiLogger.logRequest(
          method: error.requestOptions.method,
          endpoint: error.requestOptions.path,
          statusCode: error.response?.statusCode,
          error: error.message,
        );

        handler.next(error);
      },
    ));

    // Retry interceptor
    _dio.interceptors.add(RetryInterceptor(
      dio: _dio,
      options: RetryOptions(
        retries: ApiConfig.maxRetries,
        retryInterval: Duration(seconds: 1),
      ),
    ));
  }
}
```

---

## 📚 **API DOCUMENTATION TOOLS**

### **1. Postman Collection**

```json
{
  "info": {
    "name": "Musafir API Collection",
    "description": "Complete API collection for Musafir app",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://maps.googleapis.com/maps/api"
    },
    {
      "key": "api_key",
      "value": "{{GOOGLE_MAPS_API_KEY}}"
    }
  ],
  "item": [
    {
      "name": "Places",
      "item": [
        {
          "name": "Nearby Search",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/place/nearbysearch/json?location=-6.2088,106.8456&radius=1500&type=restaurant&key={{api_key}}",
              "host": ["{{base_url}}"],
              "path": ["place", "nearbysearch", "json"],
              "query": [
                {
                  "key": "location",
                  "value": "-6.2088,106.8456"
                },
                {
                  "key": "radius",
                  "value": "1500"
                },
                {
                  "key": "type",
                  "value": "restaurant"
                },
                {
                  "key": "key",
                  "value": "{{api_key}}"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

### **2. OpenAPI Specification**

```yaml
openapi: 3.0.0
info:
  title: Musafir API Documentation
  description: Complete API specification for Musafir app
  version: 1.0.0
  contact:
    name: Musafir Development Team
    email: dev@musafir.com

servers:
  - url: https://maps.googleapis.com/maps/api
    description: Google Maps API
  - url: https://api.musafir.com
    description: Musafir Internal API

paths:
  /place/nearbysearch/json:
    get:
      summary: Search for nearby places
      description: Returns a list of places within a specified area
      operationId: nearbySearch
      parameters:
        - name: location
          in: query
          required: true
          schema:
            type: string
            example: "-6.2088,106.8456"
        - name: radius
          in: query
          required: true
          schema:
            type: integer
            example: 1500
        - name: type
          in: query
          required: true
          schema:
            type: string
            enum: [restaurant, mosque, food]
        - name: key
          in: query
          required: true
          schema:
            type: string
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/NearbySearchResponse"
        "400":
          description: Bad request
        "403":
          description: Forbidden - API key issues

components:
  schemas:
    NearbySearchResponse:
      type: object
      properties:
        results:
          type: array
          items:
            $ref: "#/components/schemas/Place"
        status:
          type: string
          enum:
            [
              OK,
              ZERO_RESULTS,
              OVER_QUERY_LIMIT,
              REQUEST_DENIED,
              INVALID_REQUEST,
            ]
        next_page_token:
          type: string

    Place:
      type: object
      properties:
        place_id:
          type: string
        name:
          type: string
        vicinity:
          type: string
        rating:
          type: number
        geometry:
          $ref: "#/components/schemas/Geometry"

    Geometry:
      type: object
      properties:
        location:
          type: object
          properties:
            lat:
              type: number
            lng:
              type: number
```

---

## ✅ **API IMPLEMENTATION CHECKLIST**

### **✅ Google Places API**

- [x] Nearby Search implementation
- [x] Place Details integration
- [x] Text Search functionality
- [x] Autocomplete integration
- [x] Error handling
- [x] Rate limiting
- [x] Response caching
- [x] Unit testing

### **✅ Google Maps API**

- [x] Geocoding (reverse and forward)
- [x] Distance Matrix calculation
- [x] API key management
- [x] Error handling
- [x] Request throttling

### **✅ Firebase APIs**

- [x] Authentication (Email/Password, Google)
- [x] Firestore CRUD operations
- [x] Security rules
- [x] Real-time listeners
- [x] Offline support
- [x] Error handling

### **✅ Internal Services**

- [x] Repository pattern implementation
- [x] Service layer abstraction
- [x] Dependency injection
- [x] Error handling
- [x] Logging and monitoring
- [x] Unit testing

---

## 📋 **NEXT STEPS**

Setelah memahami API Documentation, Anda dapat:

1. **[Implement API Services](../guides/phase5-integration.md)** - Step-by-step implementation
2. **[Setup Monitoring](../deployment/monitoring.md)** - API monitoring and analytics
3. **[Configure Testing](../deployment/testing-strategies.md)** - API testing strategies
4. **[Deploy to Production](../deployment/build-release.md)** - Production deployment

---

## 🎯 **API BEST PRACTICES SUMMARY**

### **🔒 Security**

- ✅ API key protection and rotation
- ✅ Authentication token management
- ✅ Request rate limiting
- ✅ Input validation and sanitization
- ✅ Error message sanitization

### **⚡ Performance**

- ✅ Response caching strategies
- ✅ Request throttling
- ✅ Lazy loading implementation
- ✅ Batch request optimization
- ✅ Connection pooling

### **🔄 Reliability**

- ✅ Retry mechanisms with exponential backoff
- ✅ Circuit breaker pattern
- ✅ Graceful error handling
- ✅ Fallback strategies
- ✅ Health checks

### **📊 Monitoring**

- ✅ Request/response logging
- ✅ Performance metrics tracking
- ✅ Error rate monitoring
- ✅ API usage analytics
- ✅ Real-time alerting

---

_API Documentation ini mencakup semua aspek integrasi API dalam Musafir app. Gunakan sebagai referensi untuk implementasi yang robust dan scalable._

---

_Last Updated: December 2024 | API Documentation v1.0_
