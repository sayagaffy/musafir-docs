---
title: Authentication System
description: Complete guide to Musafir's authentication system - Firebase Auth, Google Sign-In, and UI implementation
---

# Authentication System

Dokumentasi lengkap sistem autentikasi aplikasi Musafir yang mengintegrasikan Firebase Authentication dengan berbagai provider login dan UI yang user-friendly.

## 🏗️ Arsitektur Authentication

### Overview

Sistem autentikasi Musafir menggunakan **Firebase Authentication** sebagai backend dengan support untuk:

- **Email/Password Authentication**
- **Google Sign-In**
- **Password Reset via Email**
- **Email Verification**

### Architecture Pattern

```
UI Layer (Pages) ↔ Controller Layer (AuthController) ↔ Firebase Auth Service
```

## 📂 Struktur File Authentication

```
lib/
├── controllers/
│   └── auth_controller.dart          # Business logic autentikasi
├── ui/pages/auth/
│   ├── sign_in_page.dart            # Halaman login
│   ├── sign_up_page.dart            # Halaman registrasi
│   └── reset_password.dart          # Reset password
├── routes/
│   └── routes_helper.dart           # Routing configuration
└── shared/
    └── theme.dart                   # UI styling constants
```

## 🎮 AuthController Deep Dive

### 1. Setup & Dependencies

```dart
class AuthController extends GetxService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  // Observable state
  bool _isLoading = false;
  String? _tokenGoogle;

  // Getters
  bool get isLoading => _isLoading;
  Stream<User?> get streamAuthStatus => _auth.authStateChanges();
}
```

### 2. Email/Password Authentication

#### Login Function

```dart
void logins(String emailAddress, String password, BuildContext context) async {
  try {
    showLoading(context);

    // Firebase sign in
    UserCredential myUser = await _auth.signInWithEmailAndPassword(
      email: emailAddress.toString(),
      password: password.toString(),
    );

    Get.back(closeOverlays: true);

    // Check email verification
    if (myUser.user!.emailVerified) {
      // Refresh home data if needed
      var homeC = Get.find<HomeController>();
      if (homeC.nearbyFood.isEmpty) {
        homeC.refreshHome();
      }
      Get.offNamed(RouteHelper.getInitial());
    } else {
      // Show verification dialog
      Get.defaultDialog(
        title: "Verifikasi Email",
        middleText: "Email kamu belum terverifikasi...",
        onConfirm: () async {
          await myUser.user!.sendEmailVerification();
          Get.back();
        },
        textConfirm: "kirim ulang",
        textCancel: "kembali",
      );
    }
  } on FirebaseAuthException catch (e) {
    Get.back(closeOverlays: true);
    _handleAuthError(e);
  }
}
```

#### Error Handling

```dart
void _handleAuthError(FirebaseAuthException e) {
  String message;
  switch (e.code) {
    case 'user-not-found':
      message = "No user found for that email.";
      break;
    case 'wrong-password':
      message = "Wrong password provided for that user.";
      break;
    case 'invalid-credential':
      message = "User tidak di temukan";
      break;
    default:
      message = e.code;
  }
  showCustomSnackBar(message, title: 'Login Failed');
}
```

### 3. Google Sign-In Implementation

#### Complete Google Sign-In Flow

```dart
void signInWithGoogle(context) async {
  try {
    showLoading(context);

    // Clear previous sign-in state
    await GoogleSignIn().signOut();

    // Initiate Google Sign-In
    GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();

    // Handle user cancellation
    if (googleUser == null) {
      Get.back(closeOverlays: true);
      showCustomSnackBar("Sign in was cancelled", title: "Cancelled");
      return;
    }

    // Get authentication details
    GoogleSignInAuthentication? googleAuth = await googleUser.authentication;

    // Validate tokens
    if (googleAuth.accessToken == null || googleAuth.idToken == null) {
      Get.back(closeOverlays: true);
      showCustomSnackBar("Failed to get authentication tokens",
                        title: "Authentication Error");
      return;
    }

    // Create Firebase credential
    OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    _tokenGoogle = googleAuth.accessToken;

    // Sign in to Firebase
    UserCredential userCredential = await _auth.signInWithCredential(credential);
    User? user = userCredential.user;

    Get.back(closeOverlays: true);

    if (user != null) {
      // Handle new user registration
      if (userCredential.additionalUserInfo!.isNewUser) {
        await UserStore().createUser(
          username: user.email?.split('@')[0] ?? 'user',
          firstName: user.displayName?.split(' ').first ?? '',
          lastName: user.displayName?.split(' ').last ?? '',
          provider: 'Google',
          photoURL: user.photoURL,
          phone: user.phoneNumber ?? '',
        );

        showCustomSnackBar(
          'Welcome to Musafir! Account created successfully.',
          isError: false,
          title: 'Welcome!',
          backgroundColor: kSuccessMain,
        );
      }

      // Navigate to main app
      Get.offNamed(RouteHelper.getInitial());
    }

  } catch (e) {
    Get.back(closeOverlays: true);
    String errorMessage = _getGoogleSignInError(e.toString());
    showCustomSnackBar(errorMessage, title: "Google Sign-In Failed");
  }
}
```

#### Google Sign-In Error Handling

```dart
String _getGoogleSignInError(String errorString) {
  if (errorString.contains('network_error')) {
    return "Please check your internet connection.";
  } else if (errorString.contains('cancelled')) {
    return "Sign in was cancelled.";
  } else if (errorString.contains('invalid')) {
    return "Invalid credentials. Please try again.";
  } else if (errorString.contains('disabled')) {
    return "Google Sign-In is temporarily disabled.";
  } else {
    return "Sign in failed. Please try again later.";
  }
}
```

### 4. User Registration

#### Sign Up Function

```dart
void signUp(String emailAddress, String password, String namaDepan,
           String namaBelakang, String phone, context) async {
  try {
    showLoading(context);

    // Create Firebase account
    UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
      email: emailAddress,
      password: password,
    );

    Get.back(closeOverlays: true);

    if (userCredential.additionalUserInfo!.isNewUser) {
      // Save user data to Firestore
      await UserStore().createUser(
        username: emailAddress.split('@')[0],
        firstName: namaDepan,
        lastName: namaBelakang,
        phone: phone,
        provider: 'email',
      );

      // Send email verification
      await userCredential.user!.sendEmailVerification();

      showCustomSnackBar(
        'Kami telah mengirimkan email verifikasi ke $emailAddress.',
        isError: false,
        title: 'Registration Success',
        backgroundColor: kSuccessMain,
      );
    }
  } on FirebaseAuthException catch (e) {
    Get.back(closeOverlays: true);
    _handleSignUpError(e);
  } catch (e) {
    Get.back(closeOverlays: true);
    showCustomSnackBar('Registration failed: ${e.toString()}');
  }
}
```

### 5. Password Reset

```dart
void resetPassword(String emailAddress, context) async {
  try {
    showLoading(context);

    await _auth.sendPasswordResetEmail(email: emailAddress);

    Get.back(closeOverlays: true);

    showCustomSnackBar(
      'Kami telah mengirimkan reset password ke $emailAddress.',
      isError: false,
      title: 'Password Reset Sent',
      backgroundColor: kSuccessMain,
    );
  } on FirebaseAuthException catch (e) {
    Get.back(closeOverlays: true);
    showCustomSnackBar('Failed to send reset email: ${e.message}');
  }
}
```

### 6. Logout Function

```dart
void logout() async {
  var homeC = Get.find<HomeController>();
  Get.defaultDialog(
    title: "Logout",
    middleText: "Apakah kamu ingin keluar?",
    onConfirm: () async {
      // Sign out from all providers
      final GoogleSignIn googleSignIn = GoogleSignIn();
      await googleSignIn.signOut();
      await FirebaseAuth.instance.signOut();

      // Clear app data
      homeC.clearList();

      Get.back();
      Get.offNamed(RouteHelper.getsigInPage());
    },
    textConfirm: "Sign out",
    textCancel: "Cancel",
    radius: 4,
    contentPadding: const EdgeInsets.only(bottom: 20),
    buttonColor: kBlueColor
  );
}
```

## 🎨 UI Implementation

### 1. Sign In Page (sign_in_page.dart)

#### Widget Structure

```dart
class SignInPage1 extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBackgroundColor,
      body: GetBuilder<AuthController>(
        builder: (authController) {
          return !authController.isLoading
              ? _buildSignInForm(authController)
              : CustomLoader();
        }
      ),
    );
  }
}
```

#### Login Validation

```dart
void _login(AuthController _authController, context) {
  String email = emailController.text.trim();
  String password = passwordController.text.trim();

  // Validation checks
  if (password.isEmpty) {
    showCustomSnackBar("Type in your password", title: 'Password');
  } else if (email.isEmpty) {
    showCustomSnackBar("Type in your email address", title: 'Email Address');
  } else if (!GetUtils.isEmail(email)) {
    showCustomSnackBar("Type in a valid email address",
                      title: 'Valid email address');
  } else if (password.length < 6) {
    showCustomSnackBar("Password cannot be less than six characters",
                      title: 'Password');
  } else {
    // Proceed with login
    _authController.logins(email, password, context);

    // Update location after successful login
    locationC.determinePosition();
  }
}
```

#### Social Login UI

```dart
CustomButtonSosial(
  title: 'Masuk lewat Google',
  onPressed: () {
    var authController = Get.find<AuthController>();
    authController.signInWithGoogle(context);
    locationC.determinePosition();
  },
  icon: "assets/icon_google.png",
)
```

### 2. Sign Up Page (sign_up_page.dart)

#### Registration Form

```dart
Widget _buildRegistrationForm() {
  return Column(
    children: [
      TextFieldText(
        textController: namaDepanController,
        hintText: 'contoh: Budi',
        icon: Icons.person,
        label: 'Nama Depan',
      ),
      TextFieldText(
        textController: namaBelakangController,
        hintText: 'contoh: Santoso',
        icon: Icons.person,
        label: 'Nama Belakang',
      ),
      TextFieldText(
        textController: phoneController,
        hintText: 'contoh: 08123456789',
        icon: Icons.phone,
        label: 'Nomor HP',
        textInputType: TextInputType.phone,
      ),
      TextFieldText(
        textController: emailController,
        hintText: 'contoh: budi@gmail.com',
        icon: Icons.email,
        label: 'Email',
        textInputType: TextInputType.emailAddress,
      ),
      TextFieldPassword(
        textController: passwordController,
        hintText: 'masukkan password',
        icon: Icons.lock,
        label: 'Password',
      ),
      TextFieldPassword(
        textController: confirmPasswordController,
        hintText: 'konfirmasi password',
        icon: Icons.lock,
        label: 'Konfirmasi Password',
      ),
    ],
  );
}
```

#### Registration Validation

```dart
void _registration() {
  var authController = Get.find<AuthController>();

  String namaDepan = namaDepanController.text.trim();
  String namaBelakang = namaBelakangController.text.trim();
  String phone = phoneController.text.trim();
  String email = emailController.text.trim();
  String password = passwordController.text.trim();
  String confirmPassword = confirmPasswordController.text.trim();

  // Comprehensive validation
  if (namaDepan.isEmpty) {
    showCustomSnackBar("Nama depan tidak boleh kosong", title: 'Nama Depan');
  } else if (namaBelakang.isEmpty) {
    showCustomSnackBar("Nama belakang tidak boleh kosong", title: 'Nama Belakang');
  } else if (phone.isEmpty) {
    showCustomSnackBar("Nomor HP tidak boleh kosong", title: 'Nomor HP');
  } else if (email.isEmpty) {
    showCustomSnackBar("Email tidak boleh kosong", title: 'Email');
  } else if (!GetUtils.isEmail(email)) {
    showCustomSnackBar("Format email tidak valid", title: 'Email');
  } else if (password.isEmpty) {
    showCustomSnackBar("Password tidak boleh kosong", title: 'Password');
  } else if (password.length < 6) {
    showCustomSnackBar("Password minimal 6 karakter", title: 'Password');
  } else if (confirmPassword.isEmpty) {
    showCustomSnackBar("Konfirmasi password tidak boleh kosong",
                      title: 'Konfirmasi Password');
  } else if (password != confirmPassword) {
    showCustomSnackBar("Password dan konfirmasi password tidak sama",
                      title: 'Password Mismatch');
  } else {
    // Proceed with registration
    authController.signUp(email, password, namaDepan, namaBelakang, phone, context);
  }
}
```

### 3. Password Reset Page (reset_password.dart)

```dart
void _reset(AuthController _authController, context) {
  String email = emailController.text.trim();

  if (email.isEmpty) {
    showCustomSnackBar("Email tidak boleh kosong", title: 'Email');
  } else if (!GetUtils.isEmail(email)) {
    showCustomSnackBar("Format email tidak valid", title: 'Email');
  } else {
    _authController.resetPassword(email, context);
  }
}
```

## 🔧 Route Configuration

### Route Helper Setup

```dart
class RouteHelper {
  // Authentication routes
  static const String sigIn = "/sign-in";
  static const String sigUp = "/sign-up";
  static const String resetPassword = "/resetpassword";

  // Getter methods
  static String getsigInPage() => sigIn;
  static String getsigUpPage() => sigUp;
  static String getResetPasswordPage() => resetPassword;

  // Route configuration
  static List<GetPage> routes = [
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
  ];
}
```

### Navigation Patterns

```dart
// Navigate to sign up
Get.toNamed(RouteHelper.getsigUpPage());

// Navigate to reset password
Get.toNamed(RouteHelper.getResetPasswordPage());

// Navigate to main app (clear stack)
Get.offAllNamed(RouteHelper.getInitial());

// Navigate back to sign in
Get.offNamed(RouteHelper.getsigInPage());
```

## 🔐 Security Best Practices

### 1. Input Validation

- Email format validation using `GetUtils.isEmail()`
- Password minimum 6 characters
- Trim whitespace from inputs
- Confirm password matching

### 2. Firebase Security

- Email verification required for full access
- Secure token handling for Google Sign-In
- Proper error handling for Firebase exceptions
- User data validation before Firestore storage

### 3. Session Management

```dart
// Stream-based auth state monitoring
Stream<User?> get streamAuthStatus => _auth.authStateChanges();

// Check auth state in main app
StreamBuilder<User?>(
  stream: authController.streamAuthStatus,
  builder: (context, snapshot) {
    if (snapshot.hasData && snapshot.data!.emailVerified) {
      return MainPage();
    }
    return SignInPage1();
  },
)
```

## 🎯 Integration Points

### 1. Location Services Integration

```dart
// Update location after successful authentication
var locationC = Get.find<LocationController>();
locationC.determinePosition();
```

### 2. Home Data Refresh

```dart
// Refresh home data after login
var homeC = Get.find<HomeController>();
if (homeC.nearbyFood.isEmpty) {
  homeC.refreshHome();
}
```

### 3. User Data Storage

```dart
// Save user data to Firestore
await UserStore().createUser(
  username: emailAddress.split('@')[0],
  firstName: namaDepan,
  lastName: namaBelakang,
  phone: phone,
  provider: 'email',
);
```

## 🧪 Testing & Debugging

### Test Scenarios

1. **Email/Password Login**

   - Valid credentials
   - Invalid email format
   - Wrong password
   - Unverified email

2. **Google Sign-In**

   - First-time user
   - Returning user
   - Cancelled sign-in
   - Network errors

3. **Registration**

   - All valid fields
   - Password mismatch
   - Existing email
   - Invalid input formats

4. **Password Reset**
   - Valid email
   - Invalid email
   - Non-existent email

### Debug Tools

```dart
// Enable Firebase Auth debugging
FirebaseAuth.instance.setSettings(
  appVerificationDisabledForTesting: true, // For testing
);

// Log authentication events
FirebaseAuth.instance.authStateChanges().listen((User? user) {
  print('Auth state changed: ${user?.email ?? 'No user'}');
});
```

## 📊 Performance Considerations

### 1. Loading States

- Show loading indicators during auth operations
- Disable buttons during processing
- Proper cleanup of loading states

### 2. Memory Management

```dart
@override
void dispose() {
  emailController.dispose();
  passwordController.dispose();
  // Dispose other controllers
  super.dispose();
}
```

### 3. Network Optimization

- Retry logic for network failures
- Timeout handling for auth operations
- Graceful fallback for connectivity issues

---

## 📋 Next Steps

Setelah memahami Authentication System, lanjut ke:

1. **[Main Navigation & UI Structure](./main-navigation.md)** - App navigation system
2. **[Home Module](./home-module.md)** - Core features implementation
3. **[Data Management](./data-management.md)** - Firebase integration details

---

_Dokumentasi ini mencakup semua aspek authentication system di Musafir. Untuk detail implementasi lebih lanjut, silakan merujuk ke source code atau hubungi tim development._
