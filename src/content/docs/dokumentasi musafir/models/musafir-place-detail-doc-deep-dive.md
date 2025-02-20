---
title: PlaceDetail Model Deep Dive
description: Penjelasan Mendalam Model PlaceDetail
---

# Deep Dive Documentation: PlaceDetail Model
**Path**: `lib/models/place_detail_model.dart`

## 1. Analisis Arsitektur Model

### 1.1 Hierarki Model
```
PlaceDetail
└── PlaceDetailModel
    ├── AddressComponents
    ├── Geometry
    │   ├── Location
    │   └── Viewport
    ├── OpeningHours
    │   └── Periods
    │       └── Close
    ├── Photos
    ├── PlusCode
    └── Reviews
```

### 1.2 Struktur Data Internal
Setiap kelas mengimplementasikan pola desain berikut:
- Properti privat dengan getter publik
- Konstruktor bernama untuk parsing JSON
- Null-safety di semua level

## 2. Analisis Mendalam per Komponen

### 2.1 PlaceDetail (Wrapper Class)
```dart
class PlaceDetail {
  PlaceDetailModel? _result;
  String? _status;
}
```

#### 2.1.1 Karakteristik Penting
- Berfungsi sebagai wrapper untuk response API
- Mengimplementasikan pattern "Result Container"
- Memungkinkan penanganan status response

#### 2.1.2 Use Cases Detail
```dart
// 1. Success Case
final successResponse = PlaceDetail.fromJson({
  'result': {/* valid data */},
  'status': 'OK'
});

// 2. Error Case
final errorResponse = PlaceDetail.fromJson({
  'status': 'ZERO_RESULTS'
});

// 3. Partial Data Case
final partialResponse = PlaceDetail.fromJson({
  'result': {'name': 'Test Place'},
  'status': 'OK'
});
```

### 2.2 PlaceDetailModel (Core Data Model)

#### 2.2.1 Properti Kritikal dan Penggunaannya
```dart
class PlaceDetailModel {
  // Identity Properties
  String? name;        // Nama tempat (wajib)
  String? placeId;     // ID unik Google Places
  String? reference;   // Reference ID (deprecated tapi masih digunakan)
  
  // Location Properties
  Geometry? geometry;  // Koordinat dan viewport
  String? vicinity;    // Alamat singkat
  String? formattedAddress; // Alamat lengkap
  
  // Business Properties
  String? businessStatus;  // OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY
  double? rating;         // 1.0 - 5.0
  int? userRatingsTotal; // Total review
  int? priceLevel;      // 1-4 (murah ke mahal)
}
```

#### 2.2.2 Validasi dan Transformasi Data
```dart
// Contoh validasi rating
void validateRating() {
  if (rating != null) {
    assert(rating! >= 1.0 && rating! <= 5.0, 'Rating harus antara 1.0 dan 5.0');
  }
}

// Contoh transformasi business status
String getReadableStatus() {
  switch (businessStatus) {
    case 'OPERATIONAL': return 'Buka';
    case 'CLOSED_TEMPORARILY': return 'Tutup Sementara';
    case 'CLOSED_PERMANENTLY': return 'Tutup Permanen';
    default: return 'Status Tidak Diketahui';
  }
}
```

### 2.3 Geometry dan Location (Spatial Data)

#### 2.3.1 Detail Implementation
```dart
class Geometry {
  Location? location;    // Titik tengah lokasi
  Viewport? viewport;    // Bounding box untuk map view
}

class Location {
  double? lat;
  double? lng;
  
  // Helper method untuk Maps URL
  String toGoogleMapsUrl() {
    return 'https://www.google.com/maps?q=$lat,$lng';
  }
  
  // Kalkulasi jarak dengan lokasi lain
  double distanceTo(Location other) {
    // Implementasi formula Haversine
    // ...
  }
}
```

#### 2.3.2 Use Cases Spatial
```dart
// 1. Membuat map bounds
void setMapBounds(Geometry geometry) {
  final ne = geometry.viewport?.northeast;
  final sw = geometry.viewport?.southwest;
  // Gunakan untuk setting Google Maps camera bounds
}

// 2. Cek lokasi dalam radius
bool isWithinRadius(Location centerPoint, Location targetPoint, double radiusKm) {
  return centerPoint.distanceTo(targetPoint) <= radiusKm;
}
```

### 2.4 OpeningHours (Temporal Data)

#### 2.4.1 Struktur Detail
```dart
class OpeningHours {
  bool? openNow;
  List<Periods>? periods;     // Detail jam per hari
  List<String>? weekdayText; // Format human-readable
}

class Periods {
  Close? close;  // Waktu tutup
  Close? open;   // Waktu buka
}

class Close {
  int? day;     // 0 (Minggu) - 6 (Sabtu)
  String? time; // Format "HHMM"
}
```

#### 2.4.2 Helper Methods dan Use Cases
```dart
extension OpeningHoursHelper on OpeningHours {
  // Cek apakah buka pada waktu tertentu
  bool isOpenAt(DateTime dateTime) {
    final day = dateTime.weekday % 7; // Konversi ke format API
    final time = '${dateTime.hour}${dateTime.minute.toString().padLeft(2, '0')}';
    
    return periods?.any((period) {
      final openDay = period.open?.day;
      final openTime = period.open?.time;
      final closeDay = period.close?.day;
      final closeTime = period.close?.time;
      
      // Implementasi logika cek waktu
      // ...
    }) ?? false;
  }
  
  // Get jam operasional hari ini
  String? getTodayHours() {
    final today = DateTime.now().weekday % 7;
    return weekdayText?[today];
  }
}
```

### 2.5 Reviews (User Feedback Data)

#### 2.5.1 Detail Properties dan Penggunaan
```dart
class Reviews {
  String? authorName;
  String? authorUrl;
  String? language;
  String? originalLanguage;
  String? profilePhotoUrl;
  double? rating;
  String? relativeTimeDescription;
  String? text;
  int? time;
  bool? translated;
  
  // Helper untuk format waktu
  DateTime? get reviewDateTime => 
    time != null ? DateTime.fromMillisecondsSinceEpoch(time! * 1000) : null;
    
  // Helper untuk cek review asli/terjemahan
  bool get isTranslated => translated ?? false;
  
  // Get teks review yang sesuai bahasa
  String? getLocalizedText(String preferredLanguage) {
    if (language == preferredLanguage) return text;
    if (translated ?? false) return text;
    return null; // Perlu translation
  }
}
```

## 3. Edge Cases dan Penanganannya

### 3.1 Null Safety dan Data Validation
```dart
// Contoh extension untuk validasi data
extension PlaceDetailValidation on PlaceDetail {
  bool get hasValidBasicInfo =>
    result?.name != null && 
    result?.placeId != null &&
    result?.geometry?.location != null;
    
  bool get hasValidBusinessInfo =>
    result?.businessStatus != null &&
    result?.rating != null &&
    result?.userRatingsTotal != null;
    
  bool get hasCompleteAddress =>
    result?.formattedAddress != null &&
    (result?.addressComponents?.isNotEmpty ?? false);
}
```

### 3.2 Error Handling Pattern
```dart
// Wrapper untuk safe data access
class PlaceDetailAccessor {
  final PlaceDetail _detail;
  
  PlaceDetailAccessor(this._detail);
  
  String getBusinessStatus() {
    try {
      return _detail.result?.businessStatus ?? 'UNKNOWN';
    } catch (e) {
      return 'ERROR';
    }
  }
  
  List<String> getPhotoUrls(String apiKey) {
    final photos = _detail.result?.photos ?? [];
    return photos.map((photo) => 
      'https://maps.googleapis.com/maps/api/place/photo'
      '?maxwidth=${photo.width}'
      '&photo_reference=${photo.photoReference}'
      '&key=$apiKey'
    ).toList();
  }
}
```

## 4. Performance Considerations

### 4.1 Memory Management
- Gunakan lazy loading untuk photos dan reviews
- Implement caching untuk data yang sering diakses
- Clear references saat objek tidak digunakan

### 4.2 Data Serialization
```dart
// Optimize serialization untuk data besar
extension SerializationOptimization on PlaceDetail {
  Map<String, dynamic> toMinimalJson() {
    return {
      'name': result?.name,
      'place_id': result?.placeId,
      'geometry': {
        'location': {
          'lat': result?.geometry?.location?.lat,
          'lng': result?.geometry?.location?.lng
        }
      }
    };
  }
}
```

## 5. Testing Strategies

### 5.1 Unit Test Examples
```dart
void main() {
  group('PlaceDetail Tests', () {
    test('should parse complete JSON correctly', () {
      final json = {/* complete valid json */};
      final detail = PlaceDetail.fromJson(json);
      expect(detail.hasValidBasicInfo, true);
    });
    
    test('should handle missing optional fields', () {
      final json = {/* minimal valid json */};
      final detail = PlaceDetail.fromJson(json);
      expect(detail.result?.name, isNotNull);
      expect(detail.result?.photos, isNull);
    });
  });
}
```

## 6. Integration Examples

### 6.1 Repository Pattern
```dart
class PlaceDetailRepository {
  Future<PlaceDetail> getPlaceDetail(String placeId) async {
    try {
      final response = await dio.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        queryParameters: {
          'place_id': placeId,
          'key': apiKey,
        },
      );
      
      return PlaceDetail.fromJson(response.data);
    } catch (e) {
      throw PlaceDetailException('Failed to fetch place details');
    }
  }
}
```

### 6.2 ViewModel Integration
```dart
class PlaceDetailViewModel extends ChangeNotifier {
  PlaceDetail? _placeDetail;
  
  Future<void> loadPlaceDetail(String placeId) async {
    try {
      _placeDetail = await repository.getPlaceDetail(placeId);
      notifyListeners();
    } catch (e) {
      // Handle error
    }
  }
  
  String get displayName => _placeDetail?.result?.name ?? 'Unknown Place';
  bool get isOpen => _placeDetail?.result?.openingHours?.openNow ?? false;
  String get address => _placeDetail?.result?.formattedAddress ?? 'No address';
}
```

## 7. Maintenance dan Versioning

### 7.1 Backward Compatibility
```dart
// Support untuk versi API lama
class PlaceDetailBackwardCompat {
  static PlaceDetail convertFromLegacy(Map<String, dynamic> legacyJson) {
    // Konversi format lama ke format baru
    return PlaceDetail.fromJson({
      'result': {
        // Mapping field
      },
      'status': legacyJson['status']
    });
  }
}
```

### 7.2 Migration Strategy
```dart
// Helper untuk migrasi data
class PlaceDetailMigration {
  static Map<String, dynamic> migrateToV2(Map<String, dynamic> v1Data) {
    // Implementasi migrasi data
    return {
      // Updated format
    };
  }
}
```

## 8. Security Considerations

### 8.1 Data Sanitization
```dart
extension SecurityHelper on PlaceDetail {
  // Sanitize sensitive data sebelum display
  String getSafeAddress() {
    final address = result?.formattedAddress ?? '';
    return address.replaceAll(RegExp(r'\d{6}'), '******'); // Mask kode pos
  }
  
  // Remove data sensitif untuk logging
  Map<String, dynamic> toSafeLog() {
    return {
      'place_id': result?.placeId,
      'name': result?.name,
      'has_photos': result?.photos?.isNotEmpty ?? false,
      'review_count': result?.reviews?.length ?? 0
    };
  }
}
```

## 9. Tips Pengembangan Lanjutan

### 9.1 Extension Methods
```dart
extension PlaceTypeHelper on PlaceDetailModel {
  bool get isRestaurant => 
    types?.contains('restaurant') ?? false;
    
  bool get isCafe =>
    types?.contains('cafe') ?? false;
    
  bool get isShoppingMall =>
    types?.contains('shopping_mall') ?? false;
}

extension RatingHelper on PlaceDetailModel {
  String get ratingText {
    if (rating == null) return 'No Rating';
    return '$rating/5.0 ($userRatingsTotal reviews)';
  }
  
  String get priceRangeText {
    switch (priceLevel) {
      case 1: return '$ (Murah)';
      case 2: return '$$ (Menengah)';
      case 3: return '$$$ (Mahal)';
      case 4: return '$$$$ (Sangat Mahal)';
      default: return 'Harga tidak tersedia';
    }
  }
}
```

## 10. Debugging dan Troubleshooting

### 10.1 Common Issues
1. Data Parsing Errors
```dart
try {
  final detail = PlaceDetail.fromJson(json);
} on FormatException catch (e) {
  print('Format JSON tidak valid: ${e.message}');
} catch (e) {
  print('Error tidak dikenal: $e');
}
```

2. Missing Required Fields
```dart
void validateRequiredFields() {
  assert(result?.placeId != null, 'Place ID is required');
  assert(result?.name != null, 'Name is required');
  assert(result?.geometry?.location != null, 'Location is required');
}
```

### 10.2 Logging Utilities
```dart
extension LoggingHelper on PlaceDetail {
  void logDetailedInfo() {
    print('=== Place Detail Info ===');
    print('Name: ${result?.name}');
    print('ID: ${result?.placeId}');
    print('Status: $_status');
    print('Location: ${result?.geometry?.location?.lat}, '
          '${result?.geometry?.location?.lng}');
    print('=====================');
  }
}
```

