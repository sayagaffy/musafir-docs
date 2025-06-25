---
title: Project Overview & Architecture
description: Comprehensive overview of Musafir mobile application - structure, architecture, and core concepts
---

# Musafir Mobile Application - Project Overview & Architecture

## 📱 Tentang Musafir

**Musafir** adalah aplikasi mobile yang dirancang khusus untuk membantu wisatawan Muslim menemukan tempat makan halal dan masjid terdekat saat bepergian. Aplikasi ini menyediakan solusi "seamless travel for Muslim explorers" dengan fitur-fitur yang memudahkan perencanaan perjalanan yang ramah Muslim.

### 🎯 Tujuan Aplikasi

1. **Memudahkan Pencarian Tempat Halal**: Menemukan restoran dan tempat makan yang sudah terverifikasi halal
2. **Lokasi Ibadah**: Mencari masjid dan ruang sholat terdekat dengan mudah
3. **Perencanaan Perjalanan**: Membuat itinerary perjalanan dengan daftar tempat yang ingin dikunjungi
4. **Komunitas Muslim**: Menyediakan platform untuk berbagi informasi dan review tempat-tempat ramah Muslim

## 🏗️ Arsitektur Aplikasi

### Tech Stack Overview

```yaml
Platform: Flutter (Cross-platform)
Language: Dart
State Management: GetX
Backend: Firebase (Authentication, Firestore, Crashlytics)
Maps: Google Maps API
External APIs: Google Places API
Storage: SharedPreferences (local), Firestore (cloud)
Authentication: Firebase Auth + Google Sign-In + Facebook Auth
```

### 🎨 Design Pattern

Aplikasi Musafir menggunakan **MVC (Model-View-Controller)** pattern dengan **GetX** sebagai state management:

```
lib/
├── controllers/        # Business Logic & State Management
├── models/            # Data Models & Entities
├── ui/                # User Interface (Views)
│   ├── pages/         # Screen/Page Components
│   └── widgets/       # Reusable UI Components
├── data/              # Data Layer (API, Database)
├── routes/            # Navigation & Routing
├── shared/            # Constants, Themes, Utils
└── services/          # External Services Integration
```

## 📂 Struktur Project Detail

### **Controllers** (`lib/controllers/`)

Berisi logic bisnis dan state management menggunakan GetX:

- `auth_controller.dart` - Manajemen autentikasi
- `explore_controller.dart` - Logic untuk fitur explore/itinerary
- `home_controller.dart` - Logic untuk halaman home
- `favorite_controller.dart` - Manajemen data favorit

### **Models** (`lib/models/`)

Data classes dan entities:

- `user_model.dart` - Model data user
- `place_model.dart` - Model data tempat/lokasi
- `report_model.dart` - Model untuk laporan/feedback
- `place_detail_model.dart` - Detail lengkap tempat dari Google Places API

### **UI Layer** (`lib/ui/`)

#### **Pages** (`lib/ui/pages/`)

Organized by features:

```
pages/
├── auth/              # Authentication screens
│   ├── sign_in_page.dart
│   ├── sign_up_page.dart
│   └── reset_password.dart
├── home/              # Home feature screens
│   ├── home_page.dart
│   ├── detail_card.dart
│   ├── add_place.dart
│   └── search/
├── explore/           # Travel planning features
│   ├── explore_pages.dart
│   ├── rencana_page.dart
│   └── search_place.dart
├── account/           # User account management
│   ├── account_page.dart
│   ├── info_profile.dart
│   └── settings/
└── admin/             # Admin dashboard
    └── admin_reports_dashboard.dart
```

#### **Widgets** (`lib/ui/widgets/`)

Reusable UI components:

- `tab_config.dart` - Bottom navigation configuration
- `custom_widgets.dart` - Custom reusable widgets

### **Data Layer** (`lib/data/`)

```
data/
├── firestore/         # Firestore database operations
│   └── firestore_helper.dart
├── api/               # External API calls
├── repositories/      # Data repositories
└── local/             # Local storage operations
```

### **Routes** (`lib/routes/`)

- `routes_helper.dart` - Centralized route management dengan GetX

### **Shared** (`lib/shared/`)

- `theme.dart` - App theme dan styling constants
- `constants.dart` - Global constants
- `utils.dart` - Utility functions

## 🔧 Dependencies Utama

### **Core Dependencies**

```yaml
flutter: sdk
get: ^4.6.6 # State management & routing
```

### **UI & UX**

```yaml
google_fonts: ^6.1.0 # Custom fonts
persistent_bottom_nav_bar_v2: ^5.0.0 # Bottom navigation
skeletonizer: ^1.0.1 # Loading skeleton UI
flutter_rating_bar: ^4.0.1 # Rating display
device_preview: ^1.1.0 # Device testing
```

### **Firebase Integration**

```yaml
firebase_core: ^2.31.0 # Firebase core
firebase_auth: ^4.17.9 # Authentication
cloud_firestore: ^4.15.9 # Database
firebase_crashlytics: ^3.4.18 # Crash reporting
```

### **Authentication**

```yaml
google_sign_in: ^6.2.1 # Google OAuth
flutter_facebook_auth: ^6.1.1 # Facebook OAuth
```

### **Maps & Location**

```yaml
google_maps_flutter: ^2.5.3 # Maps display
geocoding: ^3.0.0 # Address conversion
geolocator: ^10.0.1 # Location services
map_launcher: ^3.5.0 # External map apps
```

### **Network & Data**

```yaml
http: ^1.2.0 # HTTP requests
dio: ^5.5.0+1 # Advanced HTTP client
shared_preferences: ^2.2.2 # Local storage
```

### **Utilities**

```yaml
image_picker: ^0.8.4+4 # Image selection
omni_datetime_picker: ^1.0.9 # Date/time picker
dropdown_search: ^5.0.6 # Advanced dropdown
flutter_svg: ^2.0.17 # SVG support
device_info_plus: ^10.1.0 # Device information
permission_handler: ^11.3.1 # Runtime permissions
fl_chart: ^0.66.2 # Charts for admin dashboard
```

## 🔐 Konfigurasi Keamanan

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data hanya bisa diakses oleh user yang bersangkutan
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public data (places, reviews) bisa dibaca semua user
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### API Keys Protection

- Google Maps API key dikonfigurasi di platform level (Android/iOS)
- Firebase config dilindungi dengan app-specific configuration
- Sensitive data tidak di-hardcode di source code

## 🎨 Theme & Design System

### Color Palette

```dart
// lib/shared/theme.dart
const Color kBlueColor = Color(0xFF5B9BD5);     // Primary blue
const Color kGreyColor = Color(0xFF9E9E9E);     // Secondary grey
const Color kWhiteColor = Color(0xFFFFFFFF);    // White
const Color kBlackColor = Color(0xFF000000);    // Black
const Color kGreenColor = Color(0xFF4CAF50);    // Success green
const Color kRedColor = Color(0xFFF44336);      // Error red
```

### Typography

- **Primary Font**: Google Fonts integration
- **Font Sizes**: Responsive sizing menggunakan MediaQuery
- **Font Weights**: Regular, Medium, Bold variations

## 🔄 State Management Pattern

### GetX Implementation

```dart
// Example Controller
class HomeController extends GetxController {
  // Observable variables
  var isLoading = false.obs;
  var places = <Place>[].obs;

  // Methods
  Future<void> fetchPlaces() async {
    isLoading.value = true;
    try {
      // Fetch data logic
      places.value = await PlaceRepository.getPlaces();
    } catch (e) {
      // Error handling
    } finally {
      isLoading.value = false;
    }
  }
}

// Usage in UI
class HomePage extends StatelessWidget {
  final HomeController controller = Get.find<HomeController>();

  @override
  Widget build(BuildContext context) {
    return Obx(() => controller.isLoading.value
        ? CircularProgressIndicator()
        : ListView.builder(/* ... */)
    );
  }
}
```

## 🚀 Build Configuration

### Android Configuration

```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

### iOS Configuration

```xml
<!-- ios/Runner/Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to find nearby halal restaurants and mosques.</string>
```

## 📱 Platform Support

- **Android**: Minimum SDK 21 (Android 5.0)
- **iOS**: iOS 12.0+
- **Web**: Supported (dengan keterbatan fitur location)

## 🔍 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Pages dan widgets di-load sesuai kebutuhan
2. **Image Caching**: Implementasi caching untuk gambar dari network
3. **Database Indexing**: Firestore indexes untuk query optimization
4. **Memory Management**: Proper disposal of controllers dan streams

### Monitoring & Analytics

- **Firebase Crashlytics**: Crash reporting dan error tracking
- **Performance Monitoring**: Firebase Performance untuk tracking app performance
- **User Analytics**: Basic user behavior tracking (privacy-compliant)

## 🔮 Arsitektur Skalabilitas

### Modularity

- **Feature-based organization**: Setiap fitur dalam folder terpisah
- **Dependency Injection**: GetX dependency injection untuk loose coupling
- **Repository Pattern**: Abstraction layer untuk data access

### Future Enhancements Ready

- **Offline Support**: Struktur sudah siap untuk implementasi offline-first
- **Multi-language**: I18n support structure
- **Theming**: Dark/Light mode support structure
- **Microservices**: Backend bisa di-scale ke microservices architecture

---

## 📋 Next Steps

Setelah memahami overview dan arsitektur, lanjut ke:

1. **[Development Environment Setup](./development-setup.md)** - Setup development environment
2. **[Authentication System](./authentication-system.md)** - Deep dive authentication
3. **[Core Features](./core-features.md)** - Detailed feature documentation

---

_Dokumentasi ini akan terus diupdate seiring development aplikasi. Untuk pertanyaan atau kontribusi, silakan hubungi tim development._
