---
title: Development Environment Setup
description: Complete guide to setup development environment for Musafir Flutter application
---

# Development Environment Setup

Panduan lengkap untuk setup development environment aplikasi Musafir dari awal hingga siap development.

## 🔧 Prerequisites

### System Requirements

**Minimum Requirements:**

- **OS**: Windows 10/11, macOS 10.14+, atau Linux (Ubuntu 18.04+)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 10GB free space
- **Internet**: Stable connection untuk download dependencies

### Required Tools

1. **Flutter SDK** (versi stabil terbaru)
2. **Dart SDK** (included dengan Flutter)
3. **Android Studio** atau **VS Code** dengan Flutter extensions
4. **Git** untuk version control
5. **Node.js** (untuk tools pendukung)

## 📱 Platform Setup

### Android Development

#### 1. Install Android Studio

```bash
# Download dari: https://developer.android.com/studio
# Install dengan default settings
```

#### 2. Install Android SDK & Tools

```bash
# Buka Android Studio -> SDK Manager
# Install:
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android SDK Command-line Tools
- Android Emulator
- Android SDK Platform (API 34)
```

#### 3. Setup Android Environment Variables

```bash
# Windows (System Environment Variables)
ANDROID_HOME = C:\Users\[username]\AppData\Local\Android\Sdk
PATH += %ANDROID_HOME%\platform-tools
PATH += %ANDROID_HOME%\tools

# macOS/Linux (.bashrc atau .zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

### iOS Development (macOS only)

#### 1. Install Xcode

```bash
# Install dari App Store atau Developer Portal
# Minimum Xcode 12.0+
```

#### 2. Install Command Line Tools

```bash
sudo xcode-select --install
```

#### 3. Install CocoaPods

```bash
sudo gem install cocoapods
```

## 🔧 Flutter Installation

### 1. Download Flutter SDK

```bash
# Clone Flutter repository
git clone https://github.com/flutter/flutter.git -b stable

# Atau download zip dari: https://flutter.dev/docs/get-started/install
```

### 2. Setup Flutter Environment

```bash
# Windows
set PATH=%PATH%;C:\path\to\flutter\bin

# macOS/Linux
export PATH="$PATH:`pwd`/flutter/bin"
```

### 3. Verify Installation

```bash
flutter doctor
```

**Expected Output:**

```
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.16.0)
[✓] Android toolchain - develop for Android devices
[✓] Xcode - develop for iOS and macOS (macOS only)
[✓] Chrome - develop for the web
[✓] Android Studio
[✓] VS Code
[✓] Connected device (1 available)
[✓] Network resources
```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `musafir-app`
4. Enable Google Analytics (recommended)
5. Select analytics account or create new

### 2. Add Android App

```bash
# Dalam Firebase Console:
1. Click "Add app" -> Android
2. Android package name: com.example.musafir
3. App nickname: Musafir Android
4. Download google-services.json
5. Place in: android/app/google-services.json
```

### 3. Add iOS App (macOS only)

```bash
# Dalam Firebase Console:
1. Click "Add app" -> iOS
2. iOS bundle ID: com.example.musafir
3. App nickname: Musafir iOS
4. Download GoogleService-Info.plist
5. Place in: ios/Runner/GoogleService-Info.plist
```

### 4. Enable Firebase Services

```bash
# Dalam Firebase Console, enable:
- Authentication (Email/Password, Google, Facebook)
- Firestore Database
- Crashlytics
- Performance Monitoring
```

### 5. Firebase CLI Installation

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init
```

## 🗺️ Google Maps API Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau select existing
3. Enable billing (required for Maps API)

### 2. Enable Required APIs

```bash
# Enable di Google Cloud Console:
- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Geocoding API
- Geolocation API
```

### 3. Create API Keys

```bash
# Create API Key:
1. Go to Credentials -> Create Credentials -> API Key
2. Create 2 keys:
   - Android API Key (dengan package name restriction)
   - iOS API Key (dengan bundle ID restriction)
```

### 4. Configure API Keys

#### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application>
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="YOUR_ANDROID_API_KEY_HERE"/>
</application>
```

#### iOS Configuration

```xml
<!-- ios/Runner/Info.plist -->
<key>GOOGLE_MAPS_API_KEY</key>
<string>YOUR_IOS_API_KEY_HERE</string>
```

## 📦 Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/sayagaffy/musafir.git
cd musafir
```

### 2. Install Dependencies

```bash
# Install Flutter dependencies
flutter pub get

# iOS specific (macOS only)
cd ios && pod install && cd ..
```

### 3. Project Configuration

#### Environment Variables

Create `.env` file in root directory:

```env
# .env
GOOGLE_MAPS_API_KEY_ANDROID=your_android_api_key
GOOGLE_MAPS_API_KEY_IOS=your_ios_api_key
FIREBASE_PROJECT_ID=musafir-app
```

#### Firebase Configuration Files

```bash
# Pastikan files berikut sudah ada:
android/app/google-services.json
ios/Runner/GoogleService-Info.plist
```

### 4. Verify Setup

```bash
# Check Flutter configuration
flutter doctor

# Run app in debug mode
flutter run

# Build APK untuk testing
flutter build apk --debug
```

## 🛠️ IDE Setup

### VS Code Extensions

```json
{
  "recommendations": [
    "dart-code.dart-code",
    "dart-code.flutter",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

### VS Code Settings

```json
{
  "dart.flutterSdkPath": "/path/to/flutter",
  "dart.previewFlutterUiGuides": true,
  "dart.previewFlutterUiGuidesCustomTracking": true,
  "[dart]": {
    "editor.formatOnSave": true,
    "editor.tabSize": 2
  }
}
```

### Android Studio Plugins

- Flutter
- Dart
- GitToolBox
- Rainbow Brackets

## 🔍 Testing Setup

### Device Testing

#### Android Emulator

```bash
# Create AVD (Android Virtual Device)
flutter emulators --launch android

# List available emulators
flutter emulators

# Run on specific device
flutter run -d emulator-5554
```

#### iOS Simulator (macOS only)

```bash
# Launch iOS Simulator
open -a Simulator

# List iOS simulators
flutter emulators

# Run on iOS
flutter run -d ios
```

#### Physical Device

```bash
# Enable Developer Options & USB Debugging on Android
# Connect device via USB

# Check connected devices
flutter devices

# Run on connected device
flutter run -d device_id
```

## 🔧 Build Configuration

### Debug Build

```bash
# Android Debug
flutter build apk --debug

# iOS Debug (macOS only)
flutter build ios --debug
```

### Release Build

```bash
# Android Release
flutter build apk --release

# iOS Release (macOS only)
flutter build ios --release
```

### Signing Configuration

#### Android Signing

Create `android/key.properties`:

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=your_key_alias
storeFile=path/to/keystore.jks
```

#### iOS Signing

- Configure dalam Xcode dengan Apple Developer Account
- Setup provisioning profiles
- Configure team signing

## 🐛 Troubleshooting

### Common Issues

#### 1. Flutter Doctor Issues

```bash
# Android license issues
flutter doctor --android-licenses

# iOS deployment issues (macOS)
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

#### 2. Build Issues

```bash
# Clean build cache
flutter clean
flutter pub get

# Rebuild iOS pods (macOS)
cd ios && pod deintegrate && pod install && cd ..
```

#### 3. Firebase Issues

```bash
# Verify Firebase configuration
firebase projects:list

# Re-download configuration files jika ada perubahan
```

#### 4. Google Maps Issues

```bash
# Verify API keys
# Check API restrictions
# Verify billing account
```

### Debugging Tools

#### Flutter Inspector

```bash
# Launch Flutter Inspector
flutter run --debug
# Press 'v' untuk toggle inspector
```

#### Firebase Debugger

```bash
# Enable Firebase debugging
firebase use --add
firebase serve --only hosting
```

## 📊 Performance Tools

### Flutter Performance

```bash
# Performance profiling
flutter run --profile

# Build size analysis
flutter build apk --analyze-size
```

### Memory Profiling

```bash
# Memory usage tracking
flutter run --profile --trace-startup
```

## 🚀 Deployment Preparation

### Pre-deployment Checklist

- [ ] All API keys configured
- [ ] Firebase services setup
- [ ] App signing configured
- [ ] App icons dan splash screen
- [ ] App permissions configured
- [ ] Testing pada real devices
- [ ] Performance optimization

### Environment Configurations

```dart
// lib/config/environment.dart
class Environment {
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');
  static const String baseUrl = isProduction
      ? 'https://api.musafir.com'
      : 'https://dev-api.musafir.com';
}
```

---

## ✅ Setup Verification

Jalankan checklist berikut untuk memastikan setup berhasil:

1. **Flutter Doctor**: Semua checkmarks hijau
2. **Firebase**: Authentication dan Firestore berjalan
3. **Google Maps**: Maps tampil dengan lokasi
4. **Build**: Debug build berhasil di Android/iOS
5. **Hot Reload**: Berfungsi dengan baik
6. **Device Testing**: App berjalan di physical device

Setelah semua setup berhasil, Anda siap untuk development!

---

## 📋 Next Steps

Lanjut ke dokumentasi:

1. **[Authentication System](./authentication-system.md)** - Implementation details
2. **[Main Navigation](./main-navigation.md)** - App navigation structure
3. **[Core Features](./core-features.md)** - Feature-specific documentation

---

_Jika mengalami kendala setup, silakan buat issue di repository atau hubungi tim development._
