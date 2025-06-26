---
title: Deployment & CI/CD
description: Complete guide untuk build configurations, release process, dan continuous integration/deployment setup untuk Musafir app.
---

# 🚀 Deployment & CI/CD - Phase 5

Comprehensive guide untuk deployment dan continuous integration/deployment setup untuk Musafir app, mencakup build configurations, release process, dan automation workflows.

---

## 📋 **DEPLOYMENT OVERVIEW**

### Deployment Targets

- **Android**: Google Play Store & APK distribution
- **iOS**: Apple App Store & TestFlight
- **Web**: Firebase Hosting (optional)
- **Development**: Internal testing builds

### Build Environments

- **Development**: Local development builds
- **Staging**: Testing environment with production-like data
- **Production**: Live app for end users

---

## 🔧 **BUILD CONFIGURATIONS**

### Environment Setup

#### 1. Flutter Build Flavors

**File Location:** `android/app/build.gradle`

```gradle
android {
    // ... existing configurations

    flavorDimensions "environment"

    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            manifestPlaceholders = [appName: "Musafir Dev"]
        }

        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            manifestPlaceholders = [appName: "Musafir Staging"]
        }

        prod {
            dimension "environment"
            manifestPlaceholders = [appName: "Musafir"]
        }
    }

    buildTypes {
        debug {
            debuggable true
            applicationIdSuffix ".debug"
        }

        release {
            debuggable false
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            // Signing config
            signingConfig signingConfigs.release
        }
    }
}
```

#### 2. iOS Build Configurations

**File Location:** `ios/Runner/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>$(APP_DISPLAY_NAME)</string>

    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>

    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>

    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>

    <!-- Environment-specific configurations -->
    <key>GOOGLE_MAPS_API_KEY</key>
    <string>$(GOOGLE_MAPS_API_KEY)</string>

    <key>FIREBASE_PROJECT_ID</key>
    <string>$(FIREBASE_PROJECT_ID)</string>
</dict>
</plist>
```

#### 3. Environment Variables Configuration

**File Location:** `lib/config/environment.dart`

```dart
class Environment {
  static const String _environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'dev',
  );

  static bool get isDevelopment => _environment == 'dev';
  static bool get isStaging => _environment == 'staging';
  static bool get isProduction => _environment == 'prod';

  // API Configuration
  static String get apiBaseUrl {
    switch (_environment) {
      case 'prod':
        return 'https://api.musafir.com';
      case 'staging':
        return 'https://staging-api.musafir.com';
      default:
        return 'https://dev-api.musafir.com';
    }
  }

  // Firebase Configuration
  static String get firebaseProjectId {
    switch (_environment) {
      case 'prod':
        return 'musafir-prod';
      case 'staging':
        return 'musafir-staging';
      default:
        return 'musafir-dev';
    }
  }

  // Google Maps API Key
  static String get googleMapsApiKey {
    return const String.fromEnvironment('GOOGLE_MAPS_API_KEY');
  }

  // Debug Settings
  static bool get enableLogging => !isProduction;
  static bool get enableCrashlytics => isProduction || isStaging;
}
```

#### 4. Firebase Configuration per Environment

**File Location:** `lib/config/firebase_config.dart`

```dart
import 'package:firebase_core/firebase_core.dart';
import 'environment.dart';

class FirebaseConfig {
  static Future<void> initialize() async {
    if (Environment.isProduction) {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: 'production-api-key',
          appId: 'production-app-id',
          messagingSenderId: 'production-sender-id',
          projectId: 'musafir-prod',
        ),
      );
    } else if (Environment.isStaging) {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: 'staging-api-key',
          appId: 'staging-app-id',
          messagingSenderId: 'staging-sender-id',
          projectId: 'musafir-staging',
        ),
      );
    } else {
      await Firebase.initializeApp(
        options: const FirebaseOptions(
          apiKey: 'dev-api-key',
          appId: 'dev-app-id',
          messagingSenderId: 'dev-sender-id',
          projectId: 'musafir-dev',
        ),
      );
    }
  }
}
```

---

## 🔐 **CODE SIGNING & SECURITY**

### Android Signing

#### 1. Create Keystore

```bash
# Generate release keystore
keytool -genkey -v -keystore ~/musafir-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias musafir

# Verify keystore
keytool -list -v -keystore ~/musafir-release-key.jks -alias musafir
```

#### 2. Configure Signing

**File Location:** `android/key.properties`

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=musafir
storeFile=/path/to/musafir-release-key.jks
```

**File Location:** `android/app/build.gradle`

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### iOS Signing

#### 1. Configure Code Signing

**File Location:** `ios/Runner.xcodeproj/project.pbxproj`

```xml
<!-- Configure in Xcode -->
<!-- 1. Select Runner target -->
<!-- 2. Go to Signing & Capabilities -->
<!-- 3. Set Team and Bundle Identifier -->
<!-- 4. Enable Automatic Signing for Development -->
<!-- 5. Use Manual Signing for Distribution -->
```

#### 2. Provisioning Profiles

```bash
# Development Profile
# Distribution Profile (App Store)
# Ad Hoc Profile (TestFlight)
```

---

## 📦 **BUILD SCRIPTS**

### Automated Build Scripts

#### 1. Development Build Script

**File Location:** `scripts/build_dev.sh`

```bash
#!/bin/bash

echo "🚀 Building Musafir Development Version..."

# Clean previous builds
flutter clean
flutter pub get

# Build Android Debug
echo "📱 Building Android Debug APK..."
flutter build apk --debug --flavor dev --dart-define=ENVIRONMENT=dev

# Build iOS Debug (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS Debug..."
    flutter build ios --debug --flavor dev --dart-define=ENVIRONMENT=dev
fi

echo "✅ Development build completed!"
echo "APK location: build/app/outputs/flutter-apk/app-dev-debug.apk"
```

#### 2. Staging Build Script

**File Location:** `scripts/build_staging.sh`

```bash
#!/bin/bash

echo "🚀 Building Musafir Staging Version..."

# Clean and prepare
flutter clean
flutter pub get

# Run tests before building
echo "🧪 Running tests..."
flutter test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Build aborted."
    exit 1
fi

# Build Android Release
echo "📱 Building Android Staging APK..."
flutter build apk --release --flavor staging --dart-define=ENVIRONMENT=staging

# Build Android App Bundle for Play Console
echo "📦 Building Android App Bundle..."
flutter build appbundle --release --flavor staging --dart-define=ENVIRONMENT=staging

# Build iOS Release (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS Staging..."
    flutter build ios --release --flavor staging --dart-define=ENVIRONMENT=staging
fi

echo "✅ Staging build completed!"
```

#### 3. Production Build Script

**File Location:** `scripts/build_prod.sh`

```bash
#!/bin/bash

echo "🚀 Building Musafir Production Version..."

# Verify we're on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Production builds must be from main branch. Current: $BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Uncommitted changes detected. Please commit all changes before production build."
    exit 1
fi

# Clean and prepare
flutter clean
flutter pub get

# Run full test suite
echo "🧪 Running full test suite..."
flutter test --coverage

if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Production build aborted."
    exit 1
fi

# Build Android Production
echo "📱 Building Android Production..."
flutter build appbundle --release --flavor prod --dart-define=ENVIRONMENT=prod --obfuscate --split-debug-info=build/debug-info

# Build iOS Production (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS Production..."
    flutter build ios --release --flavor prod --dart-define=ENVIRONMENT=prod --obfuscate --split-debug-info=build/debug-info
fi

# Generate version info
echo "📝 Generating version info..."
flutter --version > build/version-info.txt
git rev-parse HEAD >> build/version-info.txt

echo "✅ Production build completed!"
echo "Android AAB: build/app/outputs/bundle/prodRelease/app-prod-release.aab"
```

---

## 🤖 **CI/CD PIPELINE**

### GitHub Actions Workflows

#### 1. Main CI/CD Pipeline

**File Location:** `.github/workflows/ci_cd.yml`

```yaml
name: Musafir CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  FLUTTER_VERSION: "3.16.x"
  JAVA_VERSION: "17"

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: "zulu"
          java-version: ${{ env.JAVA_VERSION }}

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Analyze code
        run: flutter analyze

      - name: Run unit tests
        run: flutter test --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  build_android:
    name: Build Android
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: "zulu"
          java-version: ${{ env.JAVA_VERSION }}

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Configure Keystore
        run: |
          echo '${{ secrets.KEYSTORE_BASE64 }}' | base64 --decode > android/app/keystore.jks
          echo 'storeFile=keystore.jks' >> android/key.properties
          echo 'keyAlias=${{ secrets.KEY_ALIAS }}' >> android/key.properties
          echo 'storePassword=${{ secrets.STORE_PASSWORD }}' >> android/key.properties
          echo 'keyPassword=${{ secrets.KEY_PASSWORD }}' >> android/key.properties

      - name: Build APK (Development)
        if: github.ref == 'refs/heads/develop'
        run: flutter build apk --flavor dev --dart-define=ENVIRONMENT=dev

      - name: Build App Bundle (Production)
        if: github.ref == 'refs/heads/main'
        run: flutter build appbundle --release --flavor prod --dart-define=ENVIRONMENT=prod

      - name: Upload Android artifacts
        uses: actions/upload-artifact@v3
        with:
          name: android-build
          path: |
            build/app/outputs/flutter-apk/*.apk
            build/app/outputs/bundle/**/*.aab

  build_ios:
    name: Build iOS
    needs: test
    runs-on: macos-latest
    if: github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Setup iOS certificates
        uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.IOS_CERT_BASE64 }}
          p12-password: ${{ secrets.IOS_CERT_PASSWORD }}

      - name: Setup provisioning profile
        uses: apple-actions/download-provisioning-profiles@v1
        with:
          bundle-id: com.example.musafir
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_PRIVATE_KEY }}

      - name: Build iOS (Development)
        if: github.ref == 'refs/heads/develop'
        run: flutter build ios --flavor dev --dart-define=ENVIRONMENT=dev --no-codesign

      - name: Build iOS (Production)
        if: github.ref == 'refs/heads/main'
        run: flutter build ios --release --flavor prod --dart-define=ENVIRONMENT=prod

      - name: Build IPA
        if: github.ref == 'refs/heads/main'
        run: |
          xcodebuild -workspace ios/Runner.xcworkspace -scheme prod -configuration Release archive -archivePath build/ios/archive/Runner.xcarchive
          xcodebuild -exportArchive -archivePath build/ios/archive/Runner.xcarchive -exportPath build/ios/ipa -exportOptionsPlist ios/ExportOptions.plist

      - name: Upload iOS artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ios-build
          path: build/ios/ipa/*.ipa

  deploy_android:
    name: Deploy to Play Store
    needs: build_android
    runs-on: ubuntu-latest
    if: github.event_name == 'release' && github.event.action == 'published'

    steps:
      - name: Download Android artifacts
        uses: actions/download-artifact@v3
        with:
          name: android-build

      - name: Deploy to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.example.musafir
          releaseFiles: build/app/outputs/bundle/prodRelease/app-prod-release.aab
          track: production
          status: completed

  deploy_ios:
    name: Deploy to App Store
    needs: build_ios
    runs-on: macos-latest
    if: github.event_name == 'release' && github.event.action == 'published'

    steps:
      - name: Download iOS artifacts
        uses: actions/download-artifact@v3
        with:
          name: ios-build

      - name: Deploy to App Store
        run: |
          xcrun altool --upload-app -f build/ios/ipa/*.ipa -u ${{ secrets.APPLE_ID_EMAIL }} -p ${{ secrets.APPLE_ID_PASSWORD }}
```

#### 2. Pull Request Workflow

**File Location:** `.github/workflows/pr_checks.yml`

```yaml
name: Pull Request Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  code_quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: "3.16.x"
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Check formatting
        run: dart format --output=none --set-exit-if-changed lib/ test/

      - name: Analyze code
        run: flutter analyze --fatal-infos

      - name: Run tests
        run: flutter test --coverage --reporter=github

      - name: Check test coverage
        uses: VeryGoodOpenSource/very_good_coverage@v2
        with:
          path: coverage/lcov.info
          min_coverage: 80

  security_scan:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: "security-scan-results.sarif"
```

---

## 📱 **DEPLOYMENT TO STORES**

### Google Play Store Deployment

#### 1. Play Console Setup

```bash
# 1. Create Google Play Developer Account
# 2. Create app in Play Console
# 3. Upload App Bundle
# 4. Configure store listing
# 5. Set up release tracks (Internal, Alpha, Beta, Production)
```

#### 2. Automated Play Store Upload

**File Location:** `scripts/deploy_android.sh`

```bash
#!/bin/bash

VERSION_NAME=$1
VERSION_CODE=$2
TRACK=${3:-internal}  # internal, alpha, beta, production

if [ -z "$VERSION_NAME" ] || [ -z "$VERSION_CODE" ]; then
    echo "Usage: ./deploy_android.sh <version_name> <version_code> [track]"
    exit 1
fi

echo "🚀 Deploying to Play Store..."
echo "Version: $VERSION_NAME ($VERSION_CODE)"
echo "Track: $TRACK"

# Build production app bundle
flutter build appbundle --release --flavor prod \
    --dart-define=ENVIRONMENT=prod \
    --build-name=$VERSION_NAME \
    --build-number=$VERSION_CODE

# Upload to Play Store using fastlane
cd android
fastlane supply --aab ../build/app/outputs/bundle/prodRelease/app-prod-release.aab \
    --track $TRACK \
    --release_status completed \
    --version_name $VERSION_NAME \
    --version_code $VERSION_CODE

echo "✅ Android deployment completed!"
```

### Apple App Store Deployment

#### 1. App Store Connect Setup

```bash
# 1. Create Apple Developer Account
# 2. Create app in App Store Connect
# 3. Configure app information
# 4. Set up TestFlight for beta testing
# 5. Submit for App Store review
```

#### 2. Automated App Store Upload

**File Location:** `scripts/deploy_ios.sh`

```bash
#!/bin/bash

VERSION_NAME=$1
BUILD_NUMBER=$2

if [ -z "$VERSION_NAME" ] || [ -z "$BUILD_NUMBER" ]; then
    echo "Usage: ./deploy_ios.sh <version_name> <build_number>"
    exit 1
fi

echo "🚀 Deploying to App Store..."
echo "Version: $VERSION_NAME ($BUILD_NUMBER)"

# Build production iOS
flutter build ios --release --flavor prod \
    --dart-define=ENVIRONMENT=prod \
    --build-name=$VERSION_NAME \
    --build-number=$BUILD_NUMBER

# Archive and upload using fastlane
cd ios
fastlane beta

echo "✅ iOS deployment completed!"
```

---

## 🔄 **RELEASE MANAGEMENT**

### Versioning Strategy

#### 1. Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0 - Initial release
1.1.0 - New features
1.1.1 - Bug fixes
2.0.0 - Breaking changes
```

#### 2. Automated Version Bumping

**File Location:** `scripts/bump_version.sh`

```bash
#!/bin/bash

TYPE=${1:-patch}  # major, minor, patch

echo "🔢 Bumping $TYPE version..."

# Read current version
CURRENT_VERSION=$(grep 'version:' pubspec.yaml | sed 's/version: //' | sed 's/+.*//')
CURRENT_BUILD=$(grep 'version:' pubspec.yaml | sed 's/.*+//')

# Calculate new version
if [ "$TYPE" = "major" ]; then
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print ($1+1)".0.0"}')
elif [ "$TYPE" = "minor" ]; then
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."($2+1)".0"}')
else
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."($3+1)}')
fi

NEW_BUILD=$((CURRENT_BUILD + 1))

# Update pubspec.yaml
sed -i "s/version: .*/version: $NEW_VERSION+$NEW_BUILD/" pubspec.yaml

echo "✅ Version updated: $CURRENT_VERSION+$CURRENT_BUILD → $NEW_VERSION+$NEW_BUILD"

# Create git tag
git add pubspec.yaml
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"

echo "🏷️ Git tag created: v$NEW_VERSION"
```

### Release Notes Generation

**File Location:** `scripts/generate_release_notes.sh`

```bash
#!/bin/bash

LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD")

echo "# Release Notes - $CURRENT_TAG"
echo ""

if [ -n "$LAST_TAG" ]; then
    echo "## Changes since $LAST_TAG"
    echo ""

    # Features
    echo "### 🎉 New Features"
    git log $LAST_TAG..HEAD --oneline --grep="feat:" --pretty=format:"- %s" | sed 's/feat: //'
    echo ""

    # Bug fixes
    echo "### 🐛 Bug Fixes"
    git log $LAST_TAG..HEAD --oneline --grep="fix:" --pretty=format:"- %s" | sed 's/fix: //'
    echo ""

    # Other changes
    echo "### 🔧 Other Changes"
    git log $LAST_TAG..HEAD --oneline --invert-grep --grep="feat:" --grep="fix:" --pretty=format:"- %s"
    echo ""
else
    echo "## Initial Release"
    echo ""
    echo "- First version of Musafir app"
    echo "- Core features: Restaurant and mosque finder"
    echo "- Travel planning functionality"
    echo "- User authentication and favorites"
fi

echo "## 📱 Downloads"
echo ""
echo "- [Android APK](link-to-apk)"
echo "- [Google Play Store](link-to-play-store)"
echo "- [Apple App Store](link-to-app-store)"
```

---

## ⚡ **OPTIMIZATION & PERFORMANCE**

### Build Optimization

#### 1. Android Optimization

**File Location:** `android/app/proguard-rules.pro`

```pro
# Keep Musafir specific classes
-keep class com.example.musafir.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Google Maps
-keep class com.google.android.gms.maps.** { *; }

# GetX
-keep class get.** { *; }

# Dio HTTP
-keep class dio.** { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
```

#### 2. iOS Optimization

**File Location:** `ios/Runner/Info.plist`

```xml
<!-- Optimize iOS bundle -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>arm64</string>
</array>

<!-- Enable bitcode -->
<key>ENABLE_BITCODE</key>
<true/>

<!-- Optimize for size -->
<key>SWIFT_OPTIMIZATION_LEVEL</key>
<string>-O</string>
```

### Asset Optimization

**File Location:** `scripts/optimize_assets.sh`

```bash
#!/bin/bash

echo "🖼️ Optimizing app assets..."

# Optimize images
find assets/images -name "*.png" -exec pngquant --force --ext .png {} \;
find assets/images -name "*.jpg" -exec jpegoptim --max=85 {} \;

# Generate different density assets for Android
flutter pub run flutter_launcher_icons:main

# Update app icon and splash screen
flutter pub run flutter_native_splash:create

echo "✅ Asset optimization completed!"
```

---

## 📊 **MONITORING & ANALYTICS**

### Build Monitoring

#### 1. Build Time Tracking

**File Location:** `.github/workflows/build_metrics.yml`

```yaml
name: Build Metrics

on:
  push:
    branches: [main, develop]

jobs:
  track_build_time:
    runs-on: ubuntu-latest

    steps:
      - name: Record build start time
        run: echo "BUILD_START=$(date +%s)" >> $GITHUB_ENV

      - name: Checkout and build
        uses: actions/checkout@v4
        # ... build steps

      - name: Calculate build time
        run: |
          BUILD_END=$(date +%s)
          BUILD_TIME=$((BUILD_END - BUILD_START))
          echo "Build completed in ${BUILD_TIME} seconds"

          # Send to analytics service
          curl -X POST https://analytics.example.com/build-metrics \
            -H "Content-Type: application/json" \
            -d "{\"project\":\"musafir\",\"build_time\":$BUILD_TIME,\"branch\":\"$GITHUB_REF_NAME\"}"
```

#### 2. Deployment Success Tracking

```bash
# Track successful deployments
echo "Deployment successful" | \
  curl -X POST https://analytics.example.com/deployment \
  -H "Content-Type: application/json" \
  -d @-
```

---

## ✅ **DEPLOYMENT CHECKLIST**

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code review completed
- [ ] Version bumped correctly
- [ ] Release notes generated
- [ ] App icons and splash screens updated
- [ ] API keys configured for production
- [ ] Firebase project configured
- [ ] Signing certificates configured
- [ ] Store listings updated

### Android Deployment Checklist

- [ ] App Bundle built successfully
- [ ] ProGuard/R8 optimization enabled
- [ ] Play Console configured
- [ ] Release track selected
- [ ] Staged rollout configured
- [ ] Store listing complete

### iOS Deployment Checklist

- [ ] IPA built successfully
- [ ] Code signing completed
- [ ] App Store Connect configured
- [ ] TestFlight testing completed
- [ ] App Store review submitted
- [ ] Phased release configured

### Post-Deployment Checklist

- [ ] Deployment verification
- [ ] Performance monitoring active
- [ ] Crash reporting configured
- [ ] User feedback monitoring
- [ ] Rollback plan ready

---

## 📋 Next Steps

Setelah memahami Deployment & CI/CD, lanjut ke:

1. **[Monitoring & Analytics](../deployment/monitoring.md)** - App monitoring dan crash reporting
2. **[Code Quality Guide](../guides/code-quality.md)** - Code quality standards dan best practices
3. **[Performance Optimization Deep Dive](../deployment/performance-optimization.md)** - Advanced performance techniques

---

_Deployment yang solid adalah kunci kesuksesan aplikasi. Implementasikan CI/CD pipeline ini secara bertahap untuk memastikan releases yang reliable dan automated._
