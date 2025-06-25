---
title: Main Navigation & UI Structure
description: Complete guide to Musafir's main navigation system, routing, and UI structure implementation
---

# Main Navigation & UI Structure

Dokumentasi lengkap sistem navigasi utama aplikasi Musafir yang mencakup bottom navigation, routing system, dan struktur UI keseluruhan.

## 🏗️ Arsitektur Navigasi

### Overview

Sistem navigasi Musafir menggunakan **persistent bottom navigation** dengan **GetX routing** untuk memberikan pengalaman navigasi yang smooth dan consistent.

### Navigation Stack

```
SplashScreen → Authentication → MainPage (Bottom Navigation)
                                      ├── HomePage
                                      ├── ExplorePage
                                      └── AccountPage
```

## 📂 Struktur File Navigation

```
lib/
├── ui/
│   ├── pages/
│   │   ├── main_page.dart               # Main container dengan bottom nav
│   │   ├── splash_screen.dart           # Splash screen
│   │   ├── splash_widget.dart           # Splash widget components
│   │   ├── home/home_page.dart          # Home tab content
│   │   ├── explore/explore_pages.dart   # Explore tab content
│   │   └── account/account_page.dart    # Account tab content
│   └── widgets/
│       └── tab_config.dart              # Bottom navigation configuration
├── routes/
│   └── routes_helper.dart               # Centralized routing
└── shared/
    └── theme.dart                       # UI constants & themes
```

## 🚀 Main Page Implementation

### 1. MainPage Container

```dart
class MainPage extends StatelessWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PersistentTabView(
      context,
      controller: _controller,
      screens: _buildScreens(),
      items: _navBarsItems(),
      confineInSafeArea: true,
      backgroundColor: Colors.white,
      handleAndroidBackButtonPress: true,
      resizeToAvoidBottomInset: true,
      stateManagement: true,
      hideNavigationBarWhenKeyboardShows: true,
      decoration: NavBarDecoration(
        borderRadius: BorderRadius.circular(10.0),
        colorBehindNavBar: Colors.white,
      ),
      popAllScreensOnTapOfSelectedTab: true,
      popActionScreens: PopActionScreensType.all,
      itemAnimationProperties: const ItemAnimationProperties(
        duration: Duration(milliseconds: 200),
        curve: Curves.ease,
      ),
      screenTransitionAnimation: const ScreenTransitionAnimation(
        animateTabTransition: true,
        curve: Curves.ease,
        duration: Duration(milliseconds: 200),
      ),
      navBarStyle: NavBarStyle.style1,
    );
  }
}
```

### 2. Tab Configuration (tab_config.dart)

```dart
import 'package:flutter/material.dart';
import 'package:musafir/ui/pages/home/home_page.dart';
import 'package:musafir/ui/pages/explore/explore_pages.dart';
import 'package:musafir/ui/pages/account/account_page.dart';
import 'package:persistent_bottom_nav_bar_v2/persistent_bottom_nav_bar_v2.dart';
import 'package:musafir/shared/theme.dart';

List<PersistentTabConfig> buildTabConfigs() {
  return [
    // Home Tab
    PersistentTabConfig(
      screen: const HomePage(),
      item: ItemConfig(
        icon: const ImageIcon(
          AssetImage("assets/icon_home.png"),
        ),
        title: "Home",
        activeForegroundColor: kBlueColor,
        inactiveForegroundColor: kGreyColor,
      ),
    ),

    // Explore/Itinerary Tab
    PersistentTabConfig(
      screen: const ExplorePage(),
      item: ItemConfig(
        icon: const ImageIcon(
          AssetImage("assets/icon_explore.png"),
        ),
        title: "Itinerary",
        activeForegroundColor: kBlueColor,
        inactiveForegroundColor: kGreyColor,
      ),
    ),

    // Account Tab
    PersistentTabConfig(
      screen: const AccountPage(),
      item: ItemConfig(
        icon: const ImageIcon(
          AssetImage("assets/icon_account.png"),
        ),
        title: "Account",
        activeForegroundColor: kBlueColor,
        inactiveForegroundColor: kGreyColor,
      ),
    ),
  ];
}
```

### 3. Navigation Features

#### Persistent Navigation

- **State Preservation**: Setiap tab mempertahankan state-nya
- **Deep Navigation**: Navigasi dalam tab tidak mempengaruhi tab lain
- **Back Button Handling**: Smart back button behavior

#### Visual Features

```dart
// Navigation styling
decoration: NavBarDecoration(
  borderRadius: BorderRadius.circular(10.0),
  colorBehindNavBar: Colors.white,
  border: Border.all(color: kGreyColor.withOpacity(0.2)),
),

// Animation configuration
itemAnimationProperties: const ItemAnimationProperties(
  duration: Duration(milliseconds: 200),
  curve: Curves.ease,
),

screenTransitionAnimation: const ScreenTransitionAnimation(
  animateTabTransition: true,
  curve: Curves.ease,
  duration: Duration(milliseconds: 200),
),
```

## 🎯 Routing System (routes_helper.dart)

### 1. Route Constants

```dart
class RouteHelper {
  // Core navigation
  static const String splashPage = "/splash-page";
  static const String initial = "/main";

  // Authentication
  static const String sigIn = "/sign-in";
  static const String sigUp = "/sign-up";
  static const String resetPassword = "/resetpassword";

  // Home module
  static const String home = "/home";
  static const String homedetail = "/home-detail";
  static const String homeSearch = "/home-search";
  static const String addPlace = "/home-add-place";
  static const String reviewPlace = "/home-review-place";
  static const String listCard = "/home-list-card";
  static const String listPlacesCard = "/home-list-places-card";
  static const String listKategory = "/home-list-kategory";
  static const String setLocation = "/home-set-location";
  static const String custom = "/home-custom";

  // Explore module
  static const String explore = "/explore";
  static const String rencana = "/explore-rencana";
  static const String rencanaEdit = "/explore-rencana-edit";
  static const String exploreSearch = "/explore-search";
  static const String searchPlace = "/explore-search-place";
  static const String searchPlace2 = "/explore-search-place2";

  // Account module
  static const String infoProfile = "/account-info-profile";
  static const String faq = "/account-faq";
  static const String privasi = "/account-privasi";

  // Admin
  static const String adminReports = "/admin-reports";

  // Search
  static const String textFieldSearchGoogle = "/search-textfield-google";
}
```

### 2. Route Getters

```dart
class RouteHelper {
  // Getter methods for type-safe navigation
  static String getSplashPage() => splashPage;
  static String getInitial() => initial;
  static String getsigInPage() => sigIn;
  static String getsigUpPage() => sigUp;
  static String getResetPasswordPage() => resetPassword;

  // Home routes
  static String getHomePage() => home;
  static String getHomeDetailPage() => homedetail;
  static String getHomeSearchPage() => homeSearch;
  static String getAddPlacePage() => addPlace;
  static String getReviewPlacePage() => reviewPlace;

  // Explore routes
  static String getExplorePage() => explore;
  static String getRencanaPage() => rencana;
  static String getRencanaPageEdit() => rencanaEdit;
  static String getExploreSearchPage() => exploreSearch;

  // Account routes
  static String getInfoProfilePage() => infoProfile;
  static String getFaqPage() => faq;
  static String getPrivasiPage() => privasi;

  // Admin routes
  static String getAdminReportsPage() => adminReports;
}
```

### 3. Route Configuration

```dart
static List<GetPage> routes = [
  // Splash & Main
  GetPage(
    name: splashPage,
    page: () => const SplashScreen(),
    transition: Transition.fadeIn,
  ),
  GetPage(
    name: initial,
    page: () => const MainPage(),
    transition: Transition.fadeIn,
  ),

  // Authentication
  GetPage(
    name: sigIn,
    page: () => const SignInPage1(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: sigUp,
    page: () => const SignUpPage1(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: resetPassword,
    page: () => const ResetPassword(),
    transition: Transition.rightToLeft,
  ),

  // Home module
  GetPage(
    name: homedetail,
    page: () => const DetailCard(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: homeSearch,
    page: () => const HomeSearch(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: addPlace,
    page: () => const AddPlace(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: reviewPlace,
    page: () => const ReviewPlace(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: listCard,
    page: () => const LlistCard(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: listPlacesCard,
    page: () => const LlistPlacesCard(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: listKategory,
    page: () => const ListKategory(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: setLocation,
    page: () => const SetLocation(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: custom,
    page: () => const Custom(),
    transition: Transition.rightToLeft,
  ),

  // Explore module
  GetPage(
    name: rencana,
    page: () => const RencanaPage(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: rencanaEdit,
    page: () => const RencanaPageEdit(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: exploreSearch,
    page: () => const ExploreSearch(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: searchPlace,
    page: () => const SearchPlace(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: searchPlace2,
    page: () => const SearchPlace2(),
    transition: Transition.rightToLeft,
  ),

  // Account module
  GetPage(
    name: infoProfile,
    page: () => const InfoProfile(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: faq,
    page: () => const Faq(),
    transition: Transition.rightToLeft,
  ),
  GetPage(
    name: privasi,
    page: () => const Privasi(),
    transition: Transition.rightToLeft,
  ),

  // Admin
  GetPage(
    name: adminReports,
    page: () => const AdminReportsDashboard(),
    transition: Transition.rightToLeft,
  ),

  // Utility
  GetPage(
    name: textFieldSearchGoogle,
    page: () => const TextFieldSearchGoogle(),
    transition: Transition.rightToLeft,
  ),
];
```

## 🎨 Splash Screen Implementation

### 1. Splash Screen Structure

```dart
class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  void _initializeApp() async {
    // Initialize dependencies
    await _initializeDependencies();

    // Check authentication status
    await _checkAuthenticationStatus();

    // Navigate to appropriate screen
    _navigateToNextScreen();
  }

  Future<void> _initializeDependencies() async {
    // Initialize GetX controllers
    Get.put(AuthController());
    Get.put(LocationController());
    Get.put(HomeController());
    Get.put(ExploreController());

    // Initialize Firebase if needed
    await Firebase.initializeApp();
  }

  Future<void> _checkAuthenticationStatus() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user != null && user.emailVerified) {
      // User is authenticated and verified
      // Pre-load essential data
      final homeController = Get.find<HomeController>();
      await homeController.loadInitialData();

      final locationController = Get.find<LocationController>();
      await locationController.determinePosition();
    }
  }

  void _navigateToNextScreen() {
    final User? user = FirebaseAuth.instance.currentUser;

    Timer(const Duration(seconds: 2), () {
      if (user != null && user.emailVerified) {
        Get.offNamed(RouteHelper.getInitial());
      } else {
        Get.offNamed(RouteHelper.getsigInPage());
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlueColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App logo
            ClipOval(
              child: Container(
                width: 120,
                height: 120,
                color: Colors.white,
                child: Image.asset(
                  'assets/brandBlue.png',
                  width: 80,
                  height: 80,
                ),
              ),
            ),
            const SizedBox(height: 30),

            // App name
            Text(
              'Musafir',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 10),

            // Tagline
            Text(
              'Seamless Travel for Muslim Explorers',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 50),

            // Loading indicator
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2. Splash Widget Components

```dart
class SplashWidget extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget? child;

  const SplashWidget({
    Key? key,
    required this.title,
    required this.subtitle,
    this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            kBlueColor,
            kBlueColor.withOpacity(0.8),
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Custom content
            if (child != null) child!,

            const SizedBox(height: 30),

            Text(
              title,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 15),

            Text(
              subtitle,
              style: TextStyle(
                fontSize: 16,
                color: Colors.white.withOpacity(0.9),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
```

## 🧭 Navigation Patterns & Best Practices

### 1. Navigation Methods

#### Standard Navigation

```dart
// Push new screen (can go back)
Get.toNamed(RouteHelper.getHomeDetailPage());

// Push with arguments
Get.toNamed(RouteHelper.getHomeDetailPage(), arguments: {
  'placeId': 'place123',
  'placeName': 'Masjid Al-Ikhlas',
});

// Push and clear current route
Get.offNamed(RouteHelper.getHomeSearchPage());

// Push and clear all previous routes
Get.offAllNamed(RouteHelper.getInitial());
```

#### Advanced Navigation

```dart
// Navigate with custom transition
Get.to(
  () => const DetailCard(),
  transition: Transition.fadeIn,
  duration: const Duration(milliseconds: 300),
);

// Navigate with result handling
final result = await Get.toNamed(RouteHelper.getAddPlacePage());
if (result != null) {
  // Handle returned data
  refreshHomeData();
}

// Conditional navigation
if (user.isAuthenticated) {
  Get.offAllNamed(RouteHelper.getInitial());
} else {
  Get.offAllNamed(RouteHelper.getsigInPage());
}
```

### 2. Argument Passing

#### Sending Arguments

```dart
// Simple arguments
Get.toNamed(RouteHelper.getHomeDetailPage(), arguments: placeId);

// Complex arguments
Get.toNamed(RouteHelper.getHomeDetailPage(), arguments: {
  'place': placeData,
  'fromSearch': true,
  'userLocation': currentLocation,
});

// Parameters in URL
Get.toNamed('/home-detail/$placeId');
```

#### Receiving Arguments

```dart
class DetailCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Get simple argument
    final String placeId = Get.arguments ?? '';

    // Get complex arguments
    final Map<String, dynamic> args = Get.arguments ?? {};
    final PlaceData place = args['place'];
    final bool fromSearch = args['fromSearch'] ?? false;

    return Scaffold(
      // Widget implementation
    );
  }
}
```

### 3. Back Button Handling

```dart
class CustomPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Custom back button logic
        bool shouldPop = await showExitDialog();
        return shouldPop;
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              // Custom back action
              Get.back(result: {'updated': true});
            },
          ),
        ),
        // Page content
      ),
    );
  }

  Future<bool> showExitDialog() async {
    return await Get.dialog<bool>(
      AlertDialog(
        title: Text('Konfirmasi'),
        content: Text('Apakah Anda yakin ingin kembali?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            child: Text('Batal'),
          ),
          TextButton(
            onPressed: () => Get.back(result: true),
            child: Text('Ya'),
          ),
        ],
      ),
    ) ?? false;
  }
}
```

## 🎨 UI Theme & Styling

### 1. Theme Configuration (shared/theme.dart)

```dart
// Color Constants
const Color kBlueColor = Color(0xFF5B9BD5);
const Color kGreyColor = Color(0xFF9E9E9E);
const Color kBackgroundColor = Color(0xFFF5F5F5);
const Color kWhiteColor = Color(0xFFFFFFFF);
const Color kBlackColor = Color(0xFF000000);
const Color kGreenColor = Color(0xFF4CAF50);
const Color kRedColor = Color(0xFFF44336);
const Color kSuccessMain = Color(0xFF10B981);
const Color kNeutral70 = Color(0xFF6B7280);

// Text Styles
TextStyle blackTextStyle = GoogleFonts.poppins(
  color: kBlackColor,
);

TextStyle greyTextStyle = GoogleFonts.poppins(
  color: kGreyColor,
);

TextStyle blueTextStyle = GoogleFonts.poppins(
  color: kBlueColor,
);

TextStyle whiteTextStyle = GoogleFonts.poppins(
  color: kWhiteColor,
);

// Font Weights
FontWeight light = FontWeight.w300;
FontWeight regular = FontWeight.w400;
FontWeight medium = FontWeight.w500;
FontWeight semiBold = FontWeight.w600;
FontWeight bold = FontWeight.w700;
FontWeight extraBold = FontWeight.w800;
FontWeight black = FontWeight.w900;
```

### 2. App Theme Setup

```dart
// Main App Theme
ThemeData appTheme = ThemeData(
  primarySwatch: MaterialColor(0xFF5B9BD5, {
    50: kBlueColor.withOpacity(0.1),
    100: kBlueColor.withOpacity(0.2),
    200: kBlueColor.withOpacity(0.3),
    300: kBlueColor.withOpacity(0.4),
    400: kBlueColor.withOpacity(0.5),
    500: kBlueColor,
    600: kBlueColor.withOpacity(0.7),
    700: kBlueColor.withOpacity(0.8),
    800: kBlueColor.withOpacity(0.9),
    900: kBlueColor,
  }),

  fontFamily: GoogleFonts.poppins().fontFamily,

  appBarTheme: AppBarTheme(
    backgroundColor: kBlueColor,
    foregroundColor: kWhiteColor,
    elevation: 0,
    centerTitle: true,
    titleTextStyle: whiteTextStyle.copyWith(
      fontSize: 18,
      fontWeight: semiBold,
    ),
  ),

  bottomNavigationBarTheme: BottomNavigationBarTheme(
    backgroundColor: kWhiteColor,
    selectedItemColor: kBlueColor,
    unselectedItemColor: kGreyColor,
    type: BottomNavigationBarType.fixed,
    elevation: 8,
  ),

  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: kBlueColor,
      foregroundColor: kWhiteColor,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      textStyle: whiteTextStyle.copyWith(
        fontWeight: semiBold,
      ),
    ),
  ),

  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: kGreyColor),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: kBlueColor, width: 2),
    ),
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
  ),
);
```

## 📱 Responsive Design

### 1. Screen Size Handling

```dart
class ResponsiveHelper {
  static double getScreenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double getScreenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  static bool isTablet(BuildContext context) {
    return getScreenWidth(context) >= 768;
  }

  static bool isDesktop(BuildContext context) {
    return getScreenWidth(context) >= 1024;
  }

  static double getResponsiveFontSize(BuildContext context, double size) {
    double screenWidth = getScreenWidth(context);
    if (screenWidth < 360) {
      return size * 0.9;
    } else if (screenWidth > 414) {
      return size * 1.1;
    }
    return size;
  }
}
```

### 2. Adaptive Navigation

```dart
class AdaptiveNavigation {
  static Widget buildNavigation(BuildContext context) {
    if (ResponsiveHelper.isTablet(context)) {
      return _buildSideNavigation();
    } else {
      return _buildBottomNavigation();
    }
  }

  static Widget _buildBottomNavigation() {
    return PersistentTabView(
      // Bottom navigation implementation
      navBarStyle: NavBarStyle.style1,
    );
  }

  static Widget _buildSideNavigation() {
    return Row(
      children: [
        NavigationRail(
          destinations: [
            NavigationRailDestination(
              icon: ImageIcon(AssetImage("assets/icon_home.png")),
              label: Text('Home'),
            ),
            NavigationRailDestination(
              icon: ImageIcon(AssetImage("assets/icon_explore.png")),
              label: Text('Itinerary'),
            ),
            NavigationRailDestination(
              icon: ImageIcon(AssetImage("assets/icon_account.png")),
              label: Text('Account'),
            ),
          ],
        ),
        Expanded(
          child: _getCurrentScreen(),
        ),
      ],
    );
  }
}
```

## 🔧 Performance Optimization

### 1. Lazy Loading

```dart
class LazyLoadingHelper {
  static Widget buildLazyScreen(Widget Function() builder) {
    return Builder(
      builder: (context) {
        // Only build when actually needed
        return builder();
      },
    );
  }
}

// Usage in routes
GetPage(
  name: homedetail,
  page: () => LazyLoadingHelper.buildLazyScreen(
    () => const DetailCard(),
  ),
  transition: Transition.rightToLeft,
),
```

### 2. Memory Management

```dart
class NavigationController extends GetxController {
  static const int maxCachedPages = 5;
  final List<String> _pageStack = [];

  @override
  void onClose() {
    // Clean up resources
    _clearPageCache();
    super.onClose();
  }

  void _clearPageCache() {
    if (_pageStack.length > maxCachedPages) {
      // Remove oldest pages from memory
      _pageStack.removeRange(0, _pageStack.length - maxCachedPages);
    }
  }
}
```

### 3. Preloading Strategy

```dart
class PreloadingService {
  static Future<void> preloadEssentialScreens() async {
    // Preload critical screens data
    await Future.wait([
      _preloadHomeData(),
      _preloadUserData(),
      _preloadLocationData(),
    ]);
  }

  static Future<void> _preloadHomeData() async {
    final homeController = Get.find<HomeController>();
    await homeController.loadNearbyPlaces();
  }

  static Future<void> _preloadUserData() async {
    final authController = Get.find<AuthController>();
    await authController.loadUserProfile();
  }

  static Future<void> _preloadLocationData() async {
    final locationController = Get.find<LocationController>();
    await locationController.getCurrentLocation();
  }
}
```

## 🧪 Testing Navigation

### 1. Navigation Testing

```dart
void main() {
  group('Navigation Tests', () {
    testWidgets('Should navigate to home detail', (WidgetTester tester) async {
      await tester.pumpWidget(MyApp());

      // Navigate to detail page
      Get.toNamed(RouteHelper.getHomeDetailPage());
      await tester.pumpAndSettle();

      // Verify navigation
      expect(find.byType(DetailCard), findsOneWidget);
    });

    testWidgets('Should handle back navigation', (WidgetTester tester) async {
      await tester.pumpWidget(MyApp());

      // Navigate forward
      Get.toNamed(RouteHelper.getHomeDetailPage());
      await tester.pumpAndSettle();

      // Navigate back
      Get.back();
      await tester.pumpAndSettle();

      // Verify back navigation
      expect(find.byType(HomePage), findsOneWidget);
    });
  });
}
```

### 2. Route Testing

```dart
void main() {
  group('Route Tests', () {
    test('Should return correct route paths', () {
      expect(RouteHelper.getHomePage(), '/home');
      expect(RouteHelper.getExplorePage(), '/explore');
      expect(RouteHelper.getsigInPage(), '/sign-in');
    });

    test('Should have all required routes configured', () {
      final routes = RouteHelper.routes;
      final routeNames = routes.map((r) => r.name).toList();

      expect(routeNames, contains('/main'));
      expect(routeNames, contains('/sign-in'));
      expect(routeNames, contains('/home-detail'));
    });
  });
}
```

## 📋 Integration Checklist

### Setup Requirements

- [ ] Persistent Bottom Nav Bar package installed
- [ ] GetX configured for routing
- [ ] Theme constants defined
- [ ] Route helper implemented
- [ ] Splash screen configured
- [ ] Authentication check integrated

### Features Verification

- [ ] Bottom navigation works between tabs
- [ ] State preserved in each tab
- [ ] Deep navigation within tabs
- [ ] Back button handling
- [ ] Splash screen with auth check
- [ ] Smooth transitions between screens
- [ ] Proper loading states

### Performance Checks

- [ ] Fast navigation transitions
- [ ] Memory usage optimized
- [ ] Lazy loading implemented
- [ ] No memory leaks in navigation

---

## 📋 Next Steps

Setelah memahami Main Navigation & UI Structure, lanjut ke:

1. **[Home Module](./home-module.md)** - Core home features
2. **[Explore Module](./explore-module.md)** - Travel planning features
3. **[Account Module](./account-module.md)** - User profile management

---

_Dokumentasi ini mencakup semua aspek navigasi dan struktur UI di Musafir. Sistem navigasi ini dirancang untuk memberikan pengalaman yang smooth dan intuitif bagi pengguna._
