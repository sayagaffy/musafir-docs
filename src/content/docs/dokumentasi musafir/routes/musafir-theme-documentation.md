---
title: "Theme Documentation"
description: "Penjelasan penggunaan warna dan theme di musafir app."
---

# Dokumentasi Theme.dart

## Lokasi File
```
lib/shared/theme/theme.dart
```

## Deskripsi Umum
File ini berisi konfigurasi tema global untuk aplikasi Musafir, termasuk warna, tipografi, dan konstanta desain yang digunakan di seluruh aplikasi.

## Konstanta Desain

### Margin dan Radius
```dart
double defaultMargin = 18.0;
double defaultRadius = 25.0;
```

Konstanta ini digunakan untuk menjaga konsistensi spacing dan rounded corners di seluruh aplikasi:
- `defaultMargin`: Digunakan untuk padding dan margin standar (18.0 pixels)
- `defaultRadius`: Digunakan untuk border radius standar (25.0 pixels)

### Sistem Warna

#### Warna Primer
```dart
Color kPrimarySurface = const Color(0xffDAE7F5);  // Biru muda untuk surface
Color kPrimaryColor = const Color(0xffFDB82C);     // Kuning untuk primary
Color kSecondaryMain = const Color(0xffFFC43A);    // Kuning lebih terang
```

#### Warna Status
```dart
Color kRedMain = const Color(0xffD03131);        // Merah untuk error/danger
Color kGreenHover = const Color(0xff209150);     // Hijau hover
Color kGreenColor = const Color(0xff0EC3AE);     // Hijau untuk success
Color kRedColor = const Color(0xffEB70A5);       // Merah muda untuk error/warning
```

#### Warna Netral
```dart
Color kBlackColor = const Color(0xff191D23);     // Hitam untuk teks utama
Color kWhiteColor = const Color(0xffFFFFFF);     // Putih
Color kGreyColor = const Color(0xff7B7B7B);      // Abu-abu untuk teks sekunder
```

#### Warna Background
```dart
Color kBackgroundColor = const Color(0xffFAFAFA); // Background aplikasi
Color kTransparentColor = Colors.transparent;     // Transparan
```

#### Warna Status Komponen
```dart
Color kInactiveColor = const Color(0xffDBD7EC);    // Komponen tidak aktif
Color kAvailableColor = const Color(0xffE0D9FF);   // Status tersedia
Color kUnavailableColor = const Color(0xffEBECF1);  // Status tidak tersedia
```

#### Sistem Warna Warning dan Success
```dart
Color kWarningMain = const Color(0xffEB8625);      // Warning utama
Color kSuccessSurface = const Color(0xffD4EFDF);   // Background success
Color kSuccessHover = const Color(0xff209150);     // Hover success
Color kSuccessMain = const Color(0xff27AE60);      // Success utama
```

#### Sistem Warna Biru
```dart
Color kBlueColor = const Color(0xff4789CE);        // Biru utama
Color kBlueSurface = const Color(0xffDAE7F5);      // Background biru
Color kBluePressed = const Color(0xff234467);      // Biru saat ditekan
Color kBlueColorHover = const Color(0xff3B72AB);   // Biru saat hover
```

#### Skala Warna Netral
```dart
Color kNeutral20 = const Color(0xffF6F6F6);  // Abu-abu sangat muda
Color kNeutral40 = const Color(0xffE3E4E5);  // Abu-abu muda
Color kNeutral50 = const Color(0xffC8C9CA);  // Abu-abu medium
Color kNeutral70 = const Color(0xff838588);  // Abu-abu tua
Color kNeutral90 = const Color(0xff53565A);  // Abu-abu sangat tua
```

## Sistem Tipografi

### Font Styles
Menggunakan Google Fonts dengan font family Manrope untuk seluruh aplikasi.

```dart
TextStyle blackTextStyle = GoogleFonts.manrope(color: kBlackColor);
TextStyle whiteTextStyle = GoogleFonts.manrope(color: kWhiteColor);
TextStyle greyTextStyle = GoogleFonts.manrope(color: kGreyColor);
TextStyle greenTextStyle = GoogleFonts.manrope(color: kGreenColor);
TextStyle redTextStyle = GoogleFonts.manrope(color: kRedColor);
TextStyle purpleTextStyle = GoogleFonts.manrope(color: kPrimaryColor);
TextStyle noColorTextStyle = GoogleFonts.manrope();
```

### Font Weights
```dart
FontWeight light = FontWeight.w300;
FontWeight regular = FontWeight.w400;
FontWeight medium = FontWeight.w500;
FontWeight semiBold = FontWeight.w600;
FontWeight bold = FontWeight.w700;
FontWeight extraBold = FontWeight.w800;
FontWeight black = FontWeight.w900;
```

## Contoh Penggunaan

### Menggunakan Margin dan Radius
```dart
Container(
  margin: EdgeInsets.all(defaultMargin),
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(defaultRadius),
  ),
)
```

### Menggunakan Warna
```dart
Container(
  color: kPrimaryColor,
  child: Text(
    'Hello World',
    style: TextStyle(color: kBlackColor),
  ),
)
```

### Menggunakan Text Style
```dart
Text(
  'Welcome',
  style: blackTextStyle.copyWith(
    fontSize: 24,
    fontWeight: semiBold,
  ),
)
```

### Menggunakan Warna Status
```dart
Container(
  color: isAvailable ? kAvailableColor : kUnavailableColor,
  child: Text(
    status,
    style: isAvailable ? greenTextStyle : redTextStyle,
  ),
)
```

## Best Practices

1. **Konsistensi Penamaan**
   - Selalu gunakan prefix 'k' untuk konstanta warna
   - Gunakan suffix yang jelas (Color, TextStyle, etc.)

2. **Penggunaan Warna**
   - Gunakan warna dari sistem warna yang telah didefinisikan
   - Hindari hard-coded colors
   - Gunakan warna status sesuai konteksnya

3. **Tipografi**
   - Selalu gunakan text style yang telah didefinisikan
   - Modifikasi menggunakan copyWith() untuk variasi
   - Konsisten dalam penggunaan font weight

4. **Spacing**
   - Gunakan defaultMargin untuk konsistensi spacing
   - Gunakan defaultRadius untuk rounded corners

## Catatan Penting
- File ini adalah sumber utama untuk styling aplikasi
- Semua warna dan style harus direferensikan dari file ini
- Jangan mendefinisikan warna atau style baru di file lain
- Perubahan pada file ini akan mempengaruhi seluruh aplikasi

## Struktur Hierarki Warna
```
Primary Colors
├── kPrimaryColor      (Kuning - Warna Utama)
├── kPrimarySurface    (Biru Muda - Background)
└── kSecondaryMain     (Kuning Terang - Aksen)

Status Colors
├── Success
│   ├── kGreenColor
│   ├── kSuccessMain
│   ├── kSuccessSurface
│   └── kSuccessHover
├── Error
│   ├── kRedMain
│   └── kRedColor
└── Warning
    └── kWarningMain

Neutral Colors
├── kNeutral20 (Paling Muda)
├── kNeutral40
├── kNeutral50
├── kNeutral70
└── kNeutral90 (Paling Tua)
```
