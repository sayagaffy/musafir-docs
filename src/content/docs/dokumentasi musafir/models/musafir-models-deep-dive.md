---
title: "Model Documentation Deep Dive"
description: "Penjelasan Mendalam Keseluruhan Model Musafir App"
---

# Deep Dive: Model Implementation Musafir App

## Analisis Mendalam Model & Implementasi

### 1. Pattern dan Arsitektur

#### Factory Pattern Implementation
```dart
factory UserMode.fromJson(Map<String, dynamic> json) {
  return UserMode(
    id: json["id"],
    createdAt: DateTime.parse(json["createdAt"]),
    name: json["name"],
    avatar: json["avatar"],
  );
}
```

**Kenapa Menggunakan Factory?**
1. **Fleksibilitas Konstruksi**: Factory memungkinkan pembuatan objek dengan cara yang lebih fleksibel
2. **Caching**: Bisa mengimplementasikan caching jika diperlukan
3. **Error Handling**: Dapat menangani error konstruksi dengan lebih baik

#### Implementasi Immutable Object
```dart
class CountryModel {
  final String id;
  final String name;
  final String iso;

  const CountryModel({
    required this.id,
    required this.name,
    required this.iso,
  });
}
```

**Keuntungan:**
1. Thread-safe
2. Predictable state
3. Mencegah perubahan tidak disengaja

### 2. Error Handling & Null Safety

#### Defensive Programming dalam Model
```dart
factory CityModel.fromJson(Map<String, dynamic> json) {
  return CityModel(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    provinceId: json['province_id'] ?? '',
  );
}
```

**Strategi Null Safety:**
1. Penggunaan operator `??` untuk default value
2. Penggunaan `required` untuk parameter wajib
3. Nullable types (`String?`) untuk data opsional

### 3. Google Maps API Integration Details

#### Distance Matrix Implementation
```dart
class DistanceMod {
  late List<String> _destinationAddresses;
  late List<String> _originAddresses;
  late List<DistanceModel> _results;
  String? _status;

  List<String> get destinationAddresses => _destinationAddresses;
  List<String> get originAddresses => _originAddresses;
  List<DistanceModel> get results => _results;
}
```

**Penggunaan:**
```dart
// Contoh request jarak antara dua lokasi
final distanceResult = DistanceMod.fromJson({
  "destination_addresses": ["Jl. Sudirman, Jakarta"],
  "origin_addresses": ["Jl. Asia Afrika, Bandung"],
  "rows": [{
    "elements": [{
      "distance": {
        "text": "151 km",
        "value": 151000
      },
      "duration": {
        "text": "3 jam",
        "value": 10800
      }
    }]
  }],
  "status": "OK"
});

// Mengakses data
print(distanceResult.destinationAddresses[0]); // Jl. Sudirman, Jakarta
print(distanceResult.results[0].elements?[0].distance?.text); // 151 km
```

### 4. Geocoding Implementation Details

#### Full Address Component Handling
```dart
class AddressComponents {
  String? longName;
  String? shortName;
  List<String>? types;

  // Contoh types: ["street_number", "route", "locality", "administrative_area_level_1"]
  
  // Helper method untuk mendapatkan komponen alamat spesifik
  String? getComponentByType(String type) {
    final index = types?.indexOf(type) ?? -1;
    return index != -1 ? longName : null;
  }
}
```

**Penggunaan untuk Formatting Alamat:**
```dart
final geocodeResult = GeocodeModel.fromJson(/* json response */);

// Mendapatkan komponen alamat terpisah
final streetNumber = geocodeResult.addressComponents
    ?.firstWhere((comp) => comp.types?.contains('street_number') ?? false)
    .longName;

final route = geocodeResult.addressComponents
    ?.firstWhere((comp) => comp.types?.contains('route') ?? false)
    .longName;

// Membuat alamat terformat
final formattedAddress = '$streetNumber $route';
```

### 5. Places API Integration

#### Nearby Search Implementation Detail
```dart
class NearbyPlaceModel {
  // ... properti lain ...

  // Helper method untuk rating format
  String get formattedRating {
    if (rating == null) return 'Belum ada rating';
    return '$rating/5.0 (${userRatingsTotal ?? 0} ulasan)';
  }

  // Helper untuk status operasional
  String get operationalStatus {
    if (businessStatus == 'OPERATIONAL' && openingHours?.openNow == true) {
      return 'Buka';
    }
    return 'Tutup';
  }

  // Helper untuk level harga
  String get priceDescription {
    switch (priceLevel) {
      case 0:
        return 'Gratis';
      case 1:
        return 'Murah';
      case 2:
        return 'Sedang';
      case 3:
        return 'Mahal';
      case 4:
        return 'Sangat Mahal';
      default:
        return 'Tidak ada informasi harga';
    }
  }
}
```

**Contoh Penggunaan Lengkap:**
```dart
final place = NearbyPlaceModel.fromJson(/* json response */);

print('''
Nama: ${place.name}
Rating: ${place.formattedRating}
Status: ${place.operationalStatus}
Harga: ${place.priceDescription}
Lokasi: ${place.vicinity}
''');
```

### 6. Advanced User Management

#### User Authentication State
```dart
class UserAuthState {
  final UserMode user;
  final String token;
  final DateTime tokenExpiry;

  bool get isAuthenticated => 
    token.isNotEmpty && tokenExpiry.isAfter(DateTime.now());

  bool get needsRefresh =>
    tokenExpiry.difference(DateTime.now()).inMinutes <= 15;
}
```

#### Pagination Implementation
```dart
class PaginatedResponse<T> {
  final List<T> items;
  final int currentPage;
  final int totalPages;
  final int totalItems;
  final int itemsPerPage;

  bool get hasNextPage => currentPage < totalPages;
  bool get hasPreviousPage => currentPage > 1;

  int get nextPage => hasNextPage ? currentPage + 1 : currentPage;
  int get previousPage => hasPreviousPage ? currentPage - 1 : currentPage;

  List<int> get availablePages {
    return List.generate(totalPages, (index) => index + 1);
  }
}
```

### 7. String Extension Utilities

#### Advanced String Manipulation
```dart
extension StringExtension on String {
  String toCapitalized() =>
      length > 0 ? '${this[0].toUpperCase()}${substring(1).toLowerCase()}' : '';

  String toTitleCase() => replaceAll(RegExp(' +'), ' ')
      .split(' ')
      .map((str) => str.toCapitalized())
      .join(' ');

  // Tambahan utility methods
  String truncate(int maxLength, {String suffix = '...'}) =>
      length > maxLength ? '${substring(0, maxLength)}$suffix' : this;

  String removeSpecialCharacters() =>
      replaceAll(RegExp(r'[^\w\s]+'), '');

  bool isValidEmail() =>
      RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
}
```

### 8. Security Considerations

#### Sensitive Data Handling
```dart
class SignUpBody {
  final String email;
  final String password;

  // Konstruktor dengan validasi
  SignUpBody._({required this.email, required this.password});

  // Factory dengan validasi
  static SignUpBody? create({
    required String email,
    required String password,
  }) {
    if (!email.isValidEmail()) return null;
    if (password.length < 8) return null;
    
    return SignUpBody._(
      email: email,
      password: password,
    );
  }

  // Prevent exposure of sensitive data
  @override
  String toString() => 'SignUpBody(email: $email, password: ***)';
}
```

### 9. Performance Optimizations

#### Lazy Loading Implementation
```dart
class LazyLoadedPlace {
  final String placeId;
  PlaceDetails? _details;

  Future<PlaceDetails> get details async {
    if (_details == null) {
      // Load details from API
      _details = await loadPlaceDetails();
    }
    return _details!;
  }
}
```

### 10. Testing Considerations

#### Model Testing Template
```dart
void main() {
  group('UserMode Tests', () {
    test('fromJson creates valid object', () {
      final json = {
        'id': '1',
        'createdAt': '2024-02-20T10:00:00Z',
        'name': 'Test User',
        'avatar': 'https://example.com/avatar.jpg'
      };

      final user = UserMode.fromJson(json);

      expect(user.id, '1');
      expect(user.name, 'Test User');
      expect(user.avatar, 'https://example.com/avatar.jpg');
    });

    test('userAsString returns correct format', () {
      final user = UserMode(
        id: '1',
        createdAt: DateTime.now(),
        name: 'Test User',
        avatar: 'avatar.jpg'
      );

      expect(user.userAsString(), '#1 Test User');
    });
  });
}
```

## Best Practices untuk Pengembangan Model

### 1. Immutability
- Gunakan `final` untuk properti yang tidak perlu diubah
- Implementasikan `const` constructor bila memungkinkan
- Hindari setter methods

### 2. Validasi Data
- Lakukan validasi di constructor atau factory methods
- Gunakan assertion untuk memastikan data valid
- Implementasikan proper error handling

### 3. Documentation
- Dokumentasikan setiap method dengan detail
- Berikan contoh penggunaan
- Jelaskan asumsi dan batasan

### 4. Testing
- Unit test untuk setiap model
- Test case untuk edge cases
- Integration test untuk workflow kompleks

### 5. Performance
- Implementasikan lazy loading untuk data berat
- Gunakan caching bila diperlukan
- Optimalkan serialisasi/deserialisasi

## Kesimpulan

Model-model dalam aplikasi Musafir diimplementasikan dengan mempertimbangkan:
1. Keamanan data
2. Performa
3. Maintainability
4. Scalability
5. Testability

Setiap model dirancang untuk menangani kasus spesifik dengan tetap mempertahankan fleksibilitas untuk pengembangan masa depan.
