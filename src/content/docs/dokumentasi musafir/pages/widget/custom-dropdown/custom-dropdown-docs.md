---
title: "Dokumentasi Custom Dropdown Widget"
description: "Implementasi widget dropdown kustom dengan berbagai fitur seperti pencarian, multi-seleksi, dan tampilan yang dapat disesuaikan untuk aplikasi Flutter"
---

# Dokumentasi Custom Dropdown Widget
**Path**: `lib/ui/pages/home/custom.dart`

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Struktur Widget](#struktur-widget)
3. [Komponen Utama](#komponen-utama)
4. [Fitur-Fitur](#fitur-fitur)
5. [Detail Implementasi](#detail-implementasi)
6. [Contoh Penggunaan](#contoh-penggunaan)

## Gambaran Umum
Widget ini merupakan implementasi dropdown kustom yang menyediakan berbagai fitur canggih untuk menangani pemilihan data, baik single maupun multiple selection. Widget ini menggunakan package `dropdown_search` sebagai basis dan menambahkan fungsionalitas tambahan seperti pencarian, validasi, dan tampilan yang dapat disesuaikan.

## Struktur Widget

### Kelas Utama
```dart
class DropDownCust extends StatefulWidget
```

### State Management
```dart
class _DropDownCustState extends State<DropDownCust>
```

### Global Keys
Widget ini menggunakan beberapa GlobalKey untuk mengontrol berbagai instance DropdownSearch:
```dart
final _formKey = GlobalKey<FormState>();
final _openDropDownProgKey = GlobalKey<DropdownSearchState<int>>();
final _multiKey = GlobalKey<DropdownSearchState<String>>();
final _popupBuilderKey = GlobalKey<DropdownSearchState<String>>();
final _popupCustomValidationKey = GlobalKey<DropdownSearchState<int>>();
```

## Komponen Utama

### 1. Form Validation
Widget ini memiliki sistem validasi form yang terintegrasi:
```dart
Form(
  key: _formKey,
  autovalidateMode: AutovalidateMode.onUserInteraction,
  child: ListView(...)
)
```

### 2. Single Selection Dropdown
Implementasi dasar untuk pemilihan single item:
```dart
DropdownSearch<int>(
  items: [1, 2, 3, 4, 5, 6, 7],
  dropdownDecoratorProps: DropDownDecoratorProps(
    dropdownSearchDecoration: InputDecoration(
      labelText: "Single Selection",
      hintText: "Pilih angka"
    )
  )
)
```

### 3. Multi Selection Dropdown
Implementasi untuk pemilihan multiple items:
```dart
DropdownSearch<int>.multiSelection(
  items: [1, 2, 3, 4, 5, 6, 7],
  clearButtonProps: ClearButtonProps(isVisible: true)
)
```

## Fitur-Fitur

### 1. Pencarian Asynchronous
```dart
Future<List<UserMode>> getData(filter) async {
  var response = await Dio().get(
    "https://63c1210999c0a15d28e1ec1d.mockapi.io/users",
    queryParameters: {"filter": filter}
  );
  return UserMode.fromJsonList(response.data ?? []);
}
```

Fungsi ini digunakan untuk:
- Mengambil data dari API secara asynchronous
- Mendukung filtering berdasarkan input pencarian
- Mengkonversi response JSON ke objek UserMode

### 2. Custom Item Builder
```dart
Widget _customPopupItemBuilderExample2(
  BuildContext context, 
  UserMode item, 
  bool isSelected
) {
  // Implementasi tampilan kustom untuk setiap item
}
```

Fitur ini memungkinkan:
- Kustomisasi tampilan setiap item dalam dropdown
- Menampilkan informasi tambahan seperti avatar dan tanggal
- Styling khusus untuk item yang terpilih

### 3. Multi-Level Selection
```dart
class MultiLevelString {
  final String level1;
  final List<MultiLevelString> subLevel;
  bool isExpanded;
  
  // Constructor dan methods
}
```

Mendukung:
- Struktur data hierarkis
- Expandable/collapsible items
- Navigasi antar level

## Detail Implementasi

### 1. State Management
Widget menggunakan beberapa state untuk mengelola:
- Selection state (_popupBuilderSelection)
- Form validation state (_formKey)
- Text input state (_userEditTextController)

### 2. Popup Customization
```dart
PopupProps.menu(
  showSearchBox: true,
  title: Text('Custom Popup'),
  constraints: BoxConstraints(
    maxHeight: 300
  )
)
```

Opsi kustomisasi meliputi:
- Searchbox visibility
- Popup dimensions
- Layout constraints
- Styling

### 3. Validation Logic
```dart
validator: (int? i) {
  if (i == null) return 'required field';
  else if (i >= 5) return 'value should be < 5';
  return null;
}
```

Sistem validasi mendukung:
- Required field validation
- Custom validation rules
- Multi-selection validation
- Error message customization

## Contoh Penggunaan

### 1. Basic Single Selection
```dart
DropdownSearch<String>(
  items: ["Item 1", "Item 2", "Item 3"],
  dropdownDecoratorProps: DropDownDecoratorProps(
    dropdownSearchDecoration: InputDecoration(
      labelText: "Pilih Item",
      hintText: "Klik untuk memilih"
    )
  )
)
```

### 2. Multi Selection dengan Validasi
```dart
DropdownSearch<String>.multiSelection(
  items: ["Option A", "Option B", "Option C"],
  validator: (List<String>? items) {
    if (items == null || items.isEmpty) return 'Wajib dipilih';
    if (items.length > 3) return 'Maksimal 3 item';
    return null;
  },
  clearButtonProps: ClearButtonProps(isVisible: true)
)
```

### 3. Asynchronous Search
```dart
DropdownSearch<UserMode>(
  asyncItems: (String? filter) => getData(filter),
  popupProps: PopupProps.menu(
    showSearchBox: true,
    itemBuilder: _customPopupItemBuilderExample2
  )
)
```

## Best Practices

1. **Error Handling**
   - Selalu implementasikan error handling untuk operasi asynchronous
   - Gunakan try-catch block untuk menangani exceptions
   - Berikan feedback visual kepada user ketika terjadi error

2. **Performance**
   - Implementasikan debouncing untuk pencarian
   - Hindari rebuild yang tidak perlu
   - Gunakan const constructor ketika memungkinkan

3. **UI/UX**
   - Berikan feedback visual yang jelas
   - Pastikan ukuran touch target cukup besar
   - Implementasikan loading indicator untuk operasi async

4. **Maintenance**
   - Gunakan konstanta untuk magic numbers
   - Dokumentasikan fungsi-fungsi kompleks
   - Pisahkan logic bisnis dari UI

## Troubleshooting

### Masalah Umum dan Solusinya

1. **Dropdown tidak menutup setelah seleksi**
   ```dart
   // Tambahkan
   onChanged: (value) {
     setState(() {});
     Navigator.of(context).pop();
   }
   ```

2. **Data tidak ter-update setelah seleksi**
   ```dart
   // Pastikan menggunakan setState
   setState(() {
     selectedValue = value;
   });
   ```

3. **Validasi tidak berfungsi**
   ```dart
   // Pastikan form key sudah diset
   final _formKey = GlobalKey<FormState>();
   // Dan validate dipanggil
   if (_formKey.currentState?.validate() ?? false) {
     // Proses data
   }
   ```

## Kesimpulan

Widget Custom Dropdown ini menyediakan solusi komprehensif untuk berbagai kebutuhan seleksi data dalam aplikasi Flutter. Dengan fitur-fitur seperti async search, multi-selection, dan custom styling, widget ini dapat diadaptasi untuk berbagai use case.

Dokumentasi ini mencakup semua aspek penting dari implementasi dan penggunaan widget, namun selalu merujuk ke kode sumber untuk detail implementasi terbaru.
