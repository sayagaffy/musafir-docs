---
title: "Auth Controller Deep dive"
description: "Penjelasan mendalam tentang Auth Controller"
---

# Deep Dive: Auth Controller

## Overview
AuthController adalah komponen inti yang menangani semua aspek autentikasi dalam aplikasi Musafir. Controller ini mengintegrasikan Firebase Authentication dengan fitur-fitur seperti email/password authentication, Google Sign-In, dan manajemen status autentikasi.

## Dependency Injection & Setup

```dart
class AuthController extends GetxController implements GetxService {
  final AuthRepo authRepo;
  
  AuthController({
    required this.authRepo,
  });
}
```

### Komponen Utama
1. **Firebase Instance**
```dart
final FirebaseAuth _auth = FirebaseAuth.instance;
FirebaseFirestore firestore = FirebaseFirestore.instance;
```
- `_auth`: Instance Firebase Authentication untuk operasi auth
- `firestore`: Instance Firestore untuk menyimpan data user

2. **State Management**
```dart
bool _isLoading = false;
String? _tokenGoogle;
```
- `_isLoading`: Status loading untuk UI feedback
- `_tokenGoogle`: Menyimpan token Google Sign-In

## Deep Dive: Authentication Methods

### 1. Email/Password Login
```dart
void logins(String emailAddress, String password, BuildContext context)
```

#### Proses Detail:
1. **Pre-authentication**
   ```dart
   showLoading(context);
   ```
   - Menampilkan loading indicator
   - Menggunakan dialog Flutter

2. **Authentication Process**
   ```dart
   UserCredential myUser = await _auth.signInWithEmailAndPassword(
     email: emailAddress.toString(),
     password: password.toString(),
   );
   ```
   - Mencoba login ke Firebase
   - Returns UserCredential object

3. **Post-authentication Checks**
   ```dart
   if (myUser.user!.emailVerified) {
     var homeC = Get.find<HomeController>();
     if (homeC.nearbyFood.isEmpty) {
       homeC.refreshHome();
     }
     Get.offNamed(RouteHelper.getInitial());
   }
   ```
   - Verifikasi email status
   - Memperbarui data home screen
   - Navigasi ke halaman utama

4. **Error Handling**
   ```dart
   on FirebaseAuthException catch (e) {
     if (e.code == 'user-not-found') {
       showCustomSnackBar("No user found for that email.");
     } else if (e.code == 'wrong-password') {
       showCustomSnackBar("Wrong password provided for that user.");
     }
   }
   ```
   - Handling specific Firebase errors
   - User feedback melalui SnackBar

### 2. Google Sign-In
```dart
void signInWithGoogle(context)
```

#### Proses Detail:
1. **Inisiasi Google Sign-In**
   ```dart
   GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
   ```
   - Memunculkan Google Sign-In dialog
   - Menunggu user selection

2. **Credential Processing**
   ```dart
   GoogleSignInAuthentication? googleAuth = await googleUser?.authentication;
   OAuthCredential credential = GoogleAuthProvider.credential(
     accessToken: googleAuth?.accessToken,
     idToken: googleAuth?.idToken,
   );
   ```
   - Mendapatkan token dari Google
   - Membuat Firebase credential

3. **Firebase Authentication**
   ```dart
   UserCredential userCredential = await _auth.signInWithCredential(credential);
   ```
   - Sign in ke Firebase dengan Google credential

4. **User Data Management**
   ```dart
   if (userCredential.additionalUserInfo!.isNewUser) {
     await UserStore().createUser(
       username: user.email?.split('@')[0],
       provider: 'Google',
       photoURL: user.photoURL,
     );
   }
   ```
   - Cek apakah user baru
   - Buat user record di Firestore jika baru

### 3. Sign Up Process
```dart
void signUp(String emailAddress, String password, String namaDepan, 
           String namaBelakang, String phone, context)
```

#### Proses Detail:
1. **Account Creation**
   ```dart
   UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
     email: emailAddress,
     password: password,
   );
   ```
   - Membuat akun Firebase baru

2. **User Data Storage**
   ```dart
   await UserStore().createUser(
     username: emailAddress.split('@')[0],
     firstName: namaDepan,
     lastName: namaBelakang,
     phone: phone,
     provider: 'email',
   );
   ```
   - Menyimpan data user di Firestore
   - Format username dari email

3. **Email Verification**
   ```dart
   await userCredential.user!.sendEmailVerification();
   ```
   - Mengirim email verifikasi
   - Notifikasi ke user

### 4. Password Reset
```dart
void resetPassword(String emailAddress, context)
```

#### Proses Detail:
1. **Reset Request**
   ```dart
   await _auth.sendPasswordResetEmail(email: emailAddress);
   ```
   - Mengirim email reset password
   - Handling success/error

## Event Streams & Listeners

### Auth State Changes
```dart
Stream<User?> get streamAuthStatus => _auth.authStateChanges();
```
- Memantau perubahan status auth
- Digunakan untuk auto-login/logout

## Security Considerations

1. **Email Verification**
   - Required untuk akses penuh
   - Verifikasi manual sebelum login

2. **Token Management**
   - Google token disimpan secara aman
   - Auto-refresh mechanism

3. **Error Handling**
   - Specific error messages
   - User-friendly notifications

## Best Practices Implementation

1. **State Management**
   - GetX untuk reactive state
   - Clean separation of concerns

2. **Code Organization**
   - Modular functions
   - Clear error handling

3. **User Experience**
   - Loading indicators
   - Clear feedback messages

## Integration Points

1. **Firebase Services**
   - Authentication
   - Firestore
   - Google Sign-In

2. **App Navigation**
   - Route management
   - Protected routes

3. **Data Flow**
   - User data persistence
   - Session management

## Testing Scenarios

1. **Authentication Flows**
   - Email/password login
   - Google Sign-In
   - Sign up process
   - Password reset

2. **Error Cases**
   - Invalid credentials
   - Network issues
   - Timeout handling

3. **State Management**
   - Auth state changes
   - Loading states
   - Error states

## Contoh Penggunaan Komprehensif

### Setup di GetX
```dart
void main() {
  Get.put(AuthController(authRepo: AuthRepo()));
}
```

### Login Implementation
```dart
// Di halaman login
ElevatedButton(
  onPressed: () {
    final authC = Get.find<AuthController>();
    authC.logins(emailController.text, passwordController.text, context);
  },
  child: Text('Login'),
)
```

### Google Sign-In Button
```dart
ElevatedButton(
  onPressed: () {
    final authC = Get.find<AuthController>();
    authC.signInWithGoogle(context);
  },
  child: Text('Login with Google'),
)
```

### Auth State Listener
```dart
GetX<AuthController>(
  builder: (controller) {
    return StreamBuilder<User?>(
      stream: controller.streamAuthStatus,
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return HomePage();
        }
        return LoginPage();
      },
    );
  },
)
```

## Tips dan Tricks

1. **Error Handling**
   ```dart
   try {
     await authController.logins(email, password, context);
   } catch (e) {
     showCustomSnackBar('Login gagal: ${e.toString()}');
   }
   ```

2. **Loading State**
   ```dart
   Obx(() => authController.isLoading 
     ? CircularProgressIndicator() 
     : LoginButton()
   )
   ```

3. **Auto Login Check**
   ```dart
   void checkAuth() {
     final authC = Get.find<AuthController>();
     authC.streamAuthStatus.listen((user) {
       if (user != null) {
         Get.offNamed(RouteHelper.getInitial());
       }
     });
   }
   ```
