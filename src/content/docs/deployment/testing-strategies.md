---
title: Testing Strategies
description: Comprehensive testing guide untuk Musafir app dengan Unit Testing, Widget Testing, dan Integration Testing.
---

# 🧪 Testing Strategies - Phase 5

Comprehensive testing strategy untuk Musafir app yang mencakup Unit Testing, Widget Testing, Integration Testing, dan End-to-End Testing untuk memastikan kualitas dan reliability aplikasi.

---

## 📋 **TESTING PYRAMID OVERVIEW**

### Testing Levels Structure

```
        E2E Tests (10%)
      ├─────────────────┤
    Integration Tests (20%)
  ├─────────────────────────┤
   Unit + Widget Tests (70%)
├─────────────────────────────┤
```

**Strategi Testing:**

- **70% Unit & Widget Tests** - Fast, isolated, reliable
- **20% Integration Tests** - Component interaction testing
- **10% E2E Tests** - Full user journey testing

---

## 🔧 **UNIT TESTING**

### Dependencies Setup

**File Location:** `pubspec.yaml`

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.4
  build_runner: ^2.4.7
  mocktail: ^1.0.3
  fake_async: ^1.3.1
  test: ^1.24.9
  firebase_auth_mocks: ^0.13.0
  fake_cloud_firestore: ^2.4.6
```

### Testing Controllers

#### 1. HomeController Testing

**File Location:** `test/unit/controllers/home_controller_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:get/get.dart';
import 'package:musafir/controller/home_controller.dart';
import 'package:musafir/controller/location_controller.dart';

class MockLocationController extends Mock implements LocationController {}

void main() {
  group('HomeController Tests', () {
    late HomeController homeController;
    late MockLocationController mockLocationController;

    setUp(() {
      Get.testMode = true;
      mockLocationController = MockLocationController();
      Get.put<LocationController>(mockLocationController);
      homeController = HomeController();
    });

    tearDown(() {
      Get.reset();
    });

    group('getNearbyPlace', () {
      test('should fetch nearby places successfully', () async {
        // Arrange
        when(mockLocationController.latitude).thenReturn(-6.2088);
        when(mockLocationController.longitude).thenReturn(106.8456);

        // Act
        await homeController.getNearbyPlace('restaurant');

        // Assert
        expect(homeController.nearbyFood.isNotEmpty, true);
        expect(homeController.isLoading, false);
      });

      test('should handle empty results', () async {
        // Arrange
        when(mockLocationController.latitude).thenReturn(0.0);
        when(mockLocationController.longitude).thenReturn(0.0);

        // Act
        await homeController.getNearbyPlace('restaurant');

        // Assert
        expect(homeController.nearbyFood.isEmpty, true);
        expect(homeController.isLoading, false);
      });
    });

    group('getSearchPlace', () {
      test('should search places with debouncing', () async {
        // Arrange
        const query = 'Pizza';

        // Act
        homeController.getSearchPlace(query, 'restaurant');

        // Wait for debouncing
        await Future.delayed(Duration(milliseconds: 600));

        // Assert
        expect(homeController.searchResult.length, greaterThan(0));
      });

      test('should clear search results for empty query', () {
        // Act
        homeController.getSearchPlace('', 'restaurant');

        // Assert
        expect(homeController.searchResult.isEmpty, true);
      });
    });

    group('distance calculation', () {
      test('should calculate distance correctly', () {
        // Arrange
        double lat1 = -6.2088;
        double lon1 = 106.8456;
        double lat2 = -6.2000;
        double lon2 = 106.8400;

        // Act
        double distance = homeController.distance(lat1, lon1, lat2, lon2);

        // Assert
        expect(distance, greaterThan(0));
        expect(distance, lessThan(100)); // Should be less than 100 km
      });
    });
  });
}
```

#### 2. ExploreController Testing

**File Location:** `test/unit/controllers/explore_controller_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:get/get.dart';
import 'package:musafir/controller/explore_controller.dart';

void main() {
  group('ExploreController Tests', () {
    late ExploreController exploreController;

    setUp(() {
      Get.testMode = true;
      exploreController = ExploreController();
    });

    tearDown(() {
      Get.reset();
    });

    group('setTujuan', () {
      test('should set destination correctly', () {
        // Arrange
        Map<String, dynamic> destination = {
          'place_id': 'test_place_id',
          'name': 'Test Restaurant',
          'vicinity': 'Test Location'
        };

        // Act
        exploreController.setTujuan(destination);

        // Assert
        expect(exploreController.tujuan['name'], 'Test Restaurant');
        expect(exploreController.tujuan['place_id'], 'test_place_id');
      });
    });

    group('addSelectedFood', () {
      test('should add food to selected list', () {
        // Arrange
        Map<String, dynamic> food = {
          'place_id': 'food_1',
          'name': 'Pizza Place',
          'rating': 4.5
        };

        // Act
        exploreController.addSelectedFood(food);

        // Assert
        expect(exploreController.selectedFood.length, 1);
        expect(exploreController.selectedFood.first['name'], 'Pizza Place');
      });

      test('should not add duplicate food', () {
        // Arrange
        Map<String, dynamic> food = {
          'place_id': 'food_1',
          'name': 'Pizza Place',
          'rating': 4.5
        };

        // Act
        exploreController.addSelectedFood(food);
        exploreController.addSelectedFood(food); // Add same food twice

        // Assert
        expect(exploreController.selectedFood.length, 1);
      });
    });
  });
}
```

### Testing Repositories

#### UserStore Testing

**File Location:** `test/unit/repositories/user_store_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:fake_cloud_firestore/fake_cloud_firestore.dart';
import 'package:firebase_auth_mocks/firebase_auth_mocks.dart';
import 'package:musafir/repository/user_store.dart';

void main() {
  group('UserStore Tests', () {
    late UserStore userStore;
    late FakeFirebaseFirestore fakeFirestore;
    late MockFirebaseAuth mockAuth;

    setUp(() {
      fakeFirestore = FakeFirebaseFirestore();
      mockAuth = MockFirebaseAuth();
      userStore = UserStore();
      // Inject fake instances
    });

    group('createUser', () {
      test('should create user successfully', () async {
        // Arrange
        const userData = {
          'username': 'testuser',
          'firstName': 'Test',
          'lastName': 'User',
          'email': 'test@example.com'
        };

        // Act
        await userStore.createUser(
          username: userData['username']!,
          firstName: userData['firstName']!,
          lastName: userData['lastName']!,
          email: userData['email']!,
        );

        // Assert
        final userDoc = await fakeFirestore
            .collection('users')
            .doc('test@example.com')
            .get();
        expect(userDoc.exists, true);
        expect(userDoc.data()!['username'], 'testuser');
      });
    });

    group('bookmarkPlace', () {
      test('should add place to bookmarks', () async {
        // Arrange
        const placeData = {
          'place_id': 'test_place',
          'name': 'Test Restaurant',
          'rating': 4.5
        };

        // Act
        await userStore.bookmarkPlace(placeData);

        // Assert
        final bookmarks = await userStore.bookmarkList();
        expect(bookmarks!['place'].length, 1);
        expect(bookmarks['place'][0]['name'], 'Test Restaurant');
      });
    });
  });
}
```

---

## 🖼️ **WIDGET TESTING**

### Testing UI Components

#### 1. Home Page Widget Testing

**File Location:** `test/widget/home_page_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:musafir/ui/pages/home/home_page.dart';
import 'package:musafir/controller/home_controller.dart';

class MockHomeController extends GetxController {
  final nearbyFood = <Map<String, dynamic>>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    // Mock initialization
  }
}

void main() {
  group('HomePage Widget Tests', () {
    late MockHomeController mockController;

    setUp(() {
      mockController = MockHomeController();
      Get.put<HomeController>(mockController);
    });

    tearDown(() {
      Get.reset();
    });

    testWidgets('should display app bar with correct title', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: HomePage(),
        ),
      );

      // Assert
      expect(find.text('Assalamualaikum, Gaffy A'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('should display search functionality', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: HomePage(),
        ),
      );

      // Assert
      expect(find.byIcon(Icons.search), findsOneWidget);
      expect(find.text('Cari resto atau ruang sholat di Musafir?'), findsOneWidget);
    });

    testWidgets('should display loading indicator when loading', (tester) async {
      // Arrange
      mockController.isLoading.value = true;

      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: HomePage(),
        ),
      );
      await tester.pump();

      // Assert
      expect(find.byType(CircularProgressIndicator), findsWidgets);
    });

    testWidgets('should display nearby restaurants', (tester) async {
      // Arrange
      mockController.nearbyFood.value = [
        {
          'name': 'Test Restaurant',
          'vicinity': 'Test Location',
          'rating': 4.5,
          'place_id': 'test_id'
        }
      ];

      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: HomePage(),
        ),
      );
      await tester.pump();

      // Assert
      expect(find.text('Test Restaurant'), findsOneWidget);
      expect(find.text('Test Location'), findsOneWidget);
    });
  });
}
```

#### 2. Detail Card Widget Testing

**File Location:** `test/widget/detail_card_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:musafir/ui/pages/home/detail_card.dart';

void main() {
  group('DetailCard Widget Tests', () {
    final testPlace = {
      'name': 'Test Restaurant',
      'vicinity': 'Test Address',
      'rating': 4.5,
      'place_id': 'test_place_id',
      'photos': [
        {'photo_reference': 'test_photo_ref'}
      ]
    };

    testWidgets('should display place information correctly', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: DetailCard(),
          ),
        ),
      );

      // Assert
      expect(find.text('Test Restaurant'), findsOneWidget);
      expect(find.text('Test Address'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsWidgets);
    });

    testWidgets('should handle bookmark functionality', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: DetailCard(),
          ),
        ),
      );

      // Find and tap bookmark button
      final bookmarkButton = find.byIcon(Icons.bookmark_border);
      expect(bookmarkButton, findsOneWidget);

      await tester.tap(bookmarkButton);
      await tester.pump();

      // Assert bookmark state changed
      expect(find.byIcon(Icons.bookmark), findsOneWidget);
    });

    testWidgets('should open directions when direction button tapped', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: DetailCard(),
          ),
        ),
      );

      // Find and tap direction button
      final directionButton = find.byIcon(Icons.directions);
      expect(directionButton, findsOneWidget);

      await tester.tap(directionButton);
      await tester.pumpAndSettle();

      // Assert direction functionality triggered
      // This would typically open external map app
    });
  });
}
```

### Testing Forms and Input Widgets

#### Authentication Form Testing

**File Location:** `test/widget/sign_in_form_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:musafir/ui/pages/auth/sign_in_page.dart';

void main() {
  group('SignIn Form Tests', () {
    testWidgets('should validate email input', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: SignInPage(),
        ),
      );

      // Enter invalid email
      await tester.enterText(find.byType(TextFormField).first, 'invalid-email');
      await tester.tap(find.text('Masuk'));
      await tester.pump();

      // Assert validation error
      expect(find.text('Please enter a valid email'), findsOneWidget);
    });

    testWidgets('should validate password input', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: SignInPage(),
        ),
      );

      // Enter short password
      await tester.enterText(find.byType(TextFormField).last, '123');
      await tester.tap(find.text('Masuk'));
      await tester.pump();

      // Assert validation error
      expect(find.text('Password must be at least 6 characters'), findsOneWidget);
    });

    testWidgets('should enable login button with valid inputs', (tester) async {
      // Act
      await tester.pumpWidget(
        GetMaterialApp(
          home: SignInPage(),
        ),
      );

      // Enter valid credentials
      await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
      await tester.enterText(find.byType(TextFormField).last, 'password123');
      await tester.pump();

      // Assert login button is enabled
      final loginButton = find.text('Masuk');
      expect(tester.widget<ElevatedButton>(loginButton).enabled, true);
    });
  });
}
```

---

## 🔗 **INTEGRATION TESTING**

### Testing Complete User Flows

#### 1. Authentication Flow Integration Test

**File Location:** `test/integration/auth_flow_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:musafir/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow Integration Tests', () {
    testWidgets('Complete sign up and sign in flow', (tester) async {
      // Launch app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to sign up
      await tester.tap(find.text('Daftar'));
      await tester.pumpAndSettle();

      // Fill sign up form
      await tester.enterText(
        find.byKey(Key('firstName_field')),
        'Test'
      );
      await tester.enterText(
        find.byKey(Key('lastName_field')),
        'User'
      );
      await tester.enterText(
        find.byKey(Key('email_field')),
        'test@example.com'
      );
      await tester.enterText(
        find.byKey(Key('password_field')),
        'password123'
      );
      await tester.enterText(
        find.byKey(Key('confirmPassword_field')),
        'password123'
      );

      // Submit sign up
      await tester.tap(find.text('Daftar'));
      await tester.pumpAndSettle(Duration(seconds: 5));

      // Verify navigation to main page
      expect(find.byType(BottomNavigationBar), findsOneWidget);
    });

    testWidgets('Google Sign-In flow', (tester) async {
      // Launch app
      app.main();
      await tester.pumpAndSettle();

      // Tap Google Sign-In button
      await tester.tap(find.byKey(Key('google_signin_button')));
      await tester.pumpAndSettle(Duration(seconds: 10));

      // Verify successful sign in
      expect(find.text('Assalamualaikum'), findsOneWidget);
    });
  });
}
```

#### 2. Place Search and Bookmark Integration Test

**File Location:** `test/integration/place_search_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:musafir/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Place Search and Bookmark Integration Tests', () {
    testWidgets('Search for restaurant and add to bookmark', (tester) async {
      // Launch app and ensure user is logged in
      app.main();
      await tester.pumpAndSettle();

      // Navigate to search
      await tester.tap(find.byIcon(Icons.search));
      await tester.pumpAndSettle();

      // Search for restaurant
      await tester.enterText(
        find.byType(TextField),
        'Pizza'
      );
      await tester.pumpAndSettle(Duration(seconds: 3));

      // Verify search results
      expect(find.byType(ListTile), findsWidgets);

      // Tap on first result
      await tester.tap(find.byType(ListTile).first);
      await tester.pumpAndSettle();

      // Add to bookmark
      await tester.tap(find.byIcon(Icons.bookmark_border));
      await tester.pumpAndSettle();

      // Verify bookmark added
      expect(find.byIcon(Icons.bookmark), findsOneWidget);

      // Navigate to favorites page
      await tester.tap(find.text('Favorit'));
      await tester.pumpAndSettle();

      // Verify place appears in favorites
      expect(find.text('Pizza'), findsWidgets);
    });
  });
}
```

---

## 🚀 **END-TO-END TESTING**

### Testing Complete User Journeys

#### Travel Planning E2E Test

**File Location:** `test/e2e/travel_planning_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:musafir/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Travel Planning E2E Tests', () {
    testWidgets('Complete travel plan creation flow', (tester) async {
      // Launch app
      app.main();
      await tester.pumpAndSettle();

      // Navigate to Explore tab
      await tester.tap(find.text('Jelajah'));
      await tester.pumpAndSettle();

      // Create new travel plan
      await tester.tap(find.byIcon(Icons.add));
      await tester.pumpAndSettle();

      // Fill travel plan details
      await tester.enterText(
        find.byKey(Key('plan_name_field')),
        'Jakarta Food Tour'
      );
      await tester.enterText(
        find.byKey(Key('plan_date_field')),
        '2024-12-25'
      );

      // Set destination
      await tester.tap(find.text('Pilih Tujuan'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField), 'Jakarta');
      await tester.pumpAndSettle(Duration(seconds: 2));

      await tester.tap(find.byType(ListTile).first);
      await tester.pumpAndSettle();

      // Add restaurants to plan
      await tester.tap(find.text('Tambah Restoran'));
      await tester.pumpAndSettle();

      // Select restaurants
      await tester.tap(find.byType(Checkbox).first);
      await tester.tap(find.byType(Checkbox).at(1));
      await tester.pumpAndSettle();

      // Save selections
      await tester.tap(find.text('Simpan Pilihan'));
      await tester.pumpAndSettle();

      // Add mosques to plan
      await tester.tap(find.text('Tambah Masjid'));
      await tester.pumpAndSettle();

      await tester.tap(find.byType(Checkbox).first);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Simpan Pilihan'));
      await tester.pumpAndSettle();

      // Save travel plan
      await tester.tap(find.text('Simpan Rencana'));
      await tester.pumpAndSettle();

      // Verify plan saved successfully
      expect(find.text('Jakarta Food Tour'), findsOneWidget);
      expect(find.text('Rencana berhasil disimpan'), findsOneWidget);
    });
  });
}
```

---

## 🏃‍♂️ **RUNNING TESTS**

### Running Different Test Types

```bash
# Run all unit tests
flutter test test/unit/

# Run all widget tests
flutter test test/widget/

# Run integration tests
flutter test integration_test/

# Run specific test file
flutter test test/unit/controllers/home_controller_test.dart

# Run tests with coverage
flutter test --coverage
```

### Generate Test Coverage Report

```bash
# Install lcov (macOS)
brew install lcov

# Generate HTML coverage report
genhtml coverage/lcov.info -o coverage/html

# Open coverage report
open coverage/html/index.html
```

---

## 📊 **TEST AUTOMATION & CI/CD**

### GitHub Actions Configuration

**File Location:** `.github/workflows/test.yml`

```yaml
name: Test Musafir App

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: "3.16.x"

      - name: Install dependencies
        run: flutter pub get

      - name: Run unit tests
        run: flutter test test/unit/ --coverage

      - name: Run widget tests
        run: flutter test test/widget/

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info
```

### Test Quality Gates

```yaml
# In pubspec.yaml
dev_dependencies:
  test_coverage: ^0.5.0

# Minimum coverage threshold
coverage:
  minimum: 80 # 80% minimum coverage
  exclude:
    - "lib/**/*.g.dart"
    - "lib/**/*.freezed.dart"
```

---

## 📋 **TESTING BEST PRACTICES**

### 1. Test Structure and Naming

```dart
// Good test naming
group('HomeController', () {
  group('getNearbyPlace', () {
    test('should fetch nearby places when location is available', () {
      // Test implementation
    });

    test('should return empty list when location is unavailable', () {
      // Test implementation
    });

    test('should handle API errors gracefully', () {
      // Test implementation
    });
  });
});
```

### 2. Test Data Management

```dart
// Create test data factories
class TestDataFactory {
  static Map<String, dynamic> createRestaurant({
    String? name,
    double? rating,
    String? placeId,
  }) {
    return {
      'name': name ?? 'Test Restaurant',
      'rating': rating ?? 4.5,
      'place_id': placeId ?? 'test_place_id',
      'vicinity': 'Test Address',
      'photos': [
        {'photo_reference': 'test_photo_ref'}
      ]
    };
  }
}
```

### 3. Mock Management

```dart
// Centralized mock setup
class TestSetup {
  static void setupMocks() {
    Get.testMode = true;
    Get.put<LocationController>(MockLocationController());
    Get.put<HomeController>(MockHomeController());
    // Register other mocks
  }

  static void tearDown() {
    Get.reset();
  }
}
```

---

## ✅ **TESTING CHECKLIST**

### Pre-Development Testing Setup

- [ ] Test dependencies added to `pubspec.yaml`
- [ ] Test folder structure created
- [ ] Mock classes generated
- [ ] Test data factories created
- [ ] CI/CD pipeline configured

### Unit Testing Coverage

- [ ] All controller methods tested
- [ ] Repository CRUD operations tested
- [ ] Utility functions tested
- [ ] Error handling tested
- [ ] Edge cases covered

### Widget Testing Coverage

- [ ] All major UI components tested
- [ ] Form validation tested
- [ ] User interactions tested
- [ ] Loading states tested
- [ ] Error states tested

### Integration Testing Coverage

- [ ] Authentication flows tested
- [ ] Navigation flows tested
- [ ] Data persistence tested
- [ ] API integration tested
- [ ] End-to-end user journeys tested

### Performance Testing

- [ ] Widget rendering performance
- [ ] Memory usage under load
- [ ] Network request optimization
- [ ] Battery usage optimization

---

## 📋 Next Steps

Setelah memahami Testing Strategies, lanjut ke:

1. **[Deployment & CI/CD](../deployment/build-release.md)** - Build and release process
2. **[Monitoring & Analytics](../deployment/monitoring.md)** - App monitoring setup
3. **[Code Quality Guide](../guides/code-quality.md)** - Code quality standards

---

_Testing adalah foundation yang penting untuk memastikan aplikasi Musafir berjalan dengan baik. Implementasikan strategi testing ini secara bertahap sesuai dengan prioritas pengembangan._
