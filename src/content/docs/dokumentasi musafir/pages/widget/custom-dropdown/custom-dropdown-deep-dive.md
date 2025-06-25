---
title: "Deep Dive Analysis - Custom Dropdown Widget"
description: "Analisis teknis mendalam tentang implementasi, arsitektur, dan logika bisnis dari Custom Dropdown Widget"
---

# Deep Dive Analysis - Custom Dropdown Widget
**Path**: `lib/ui/pages/home/custom.dart`

## 1. Arsitektur Internal

### 1.1 State Management
```dart
class _DropDownCustState extends State<DropDownCust> {
  final _formKey = GlobalKey<FormState>();
  final _openDropDownProgKey = GlobalKey<DropdownSearchState<int>>();
  final _multiKey = GlobalKey<DropdownSearchState<String>>();
  final _popupBuilderKey = GlobalKey<DropdownSearchState<String>>();
  final _popupCustomValidationKey = GlobalKey<DropdownSearchState<int>>();
  final _userEditTextController = TextEditingController(text: 'Mrs');
  bool? _popupBuilderSelection = false;
}
```

#### Analisis Mendalam:

1. **Global Keys**
   - `_formKey`: Digunakan untuk validasi form level atas
   - `_openDropDownProgKey`: Mengontrol dropdown programmatically untuk tipe integer
   - `_multiKey`: Mengontrol multiple selection untuk tipe string
   - `_popupBuilderKey`: Mengontrol tampilan popup kustom
   - `_popupCustomValidationKey`: Mengontrol validasi kustom

2. **TextEditingController**
   - Menginisialisasi dengan default value 'Mrs'
   - Digunakan untuk search functionality
   - Memory management: Controller perlu di-dispose

3. **Selection State**
   - `_popupBuilderSelection`: Nullable boolean untuk three-state selection
   - States: true (all selected), false (none selected), null (partial selection)

### 1.2 Data Model
```dart
class MultiLevelString {
  final String level1;
  final List<MultiLevelString> subLevel;
  bool isExpanded;

  MultiLevelString({
    this.level1 = "",
    this.subLevel = const [],
    this.isExpanded = false,
  });
}
```

#### Analisis Struktur Data:

1. **Immutability Pattern**
   - `level1` dan `subLevel` dideklarasikan sebagai final
   - Mendukung recursive data structure
   - Memory efficient karena menggunakan const untuk default subLevel

2. **State Management Internal**
   - `isExpanded` tidak final untuk mendukung UI state
   - Implementasi copy constructor untuk immutability

### 1.3 Network Layer

```dart
Future<List<UserMode>> getData(filter) async {
  var response = await Dio().get(
    "https://63c1210999c0a15d28e1ec1d.mockapi.io/users",
    queryParameters: {"filter": filter},
  );

  final data = response.data;
  if (data != null) {
    return UserMode.fromJsonList(data);
  }
  return [];
}
```

#### Analisis Networking:

1. **Error Handling**
   ```dart
   try {
     final response = await Dio().get(...);
     // Response processing
   } catch (e) {
     // Error handling yang seharusnya diimplementasikan
     return [];
   }
   ```

2. **Data Transformation**
   - Null safety handling dengan default empty list
   - JSON deserialization melalui `fromJsonList`
   - Filtering di server-side

## 2. Logika Bisnis Mendalam

### 2.1 Selection Logic

```dart
void _handleCheckBoxState({bool updateState = true}) {
  var selectedItem = _popupBuilderKey.currentState?.popupGetSelectedItems ?? [];
  var isAllSelected = _popupBuilderKey.currentState?.popupIsAllSelected ?? false;
  
  _popupBuilderSelection = selectedItem.isEmpty 
    ? false 
    : (isAllSelected ? true : null);

  if (updateState) setState(() {});
}
```

#### Komponen Logic:

1. **State Calculation**
   - Empty selection → false
   - All selected → true
   - Partial selection → null

2. **Performance Optimization**
   - Optional state update dengan parameter `updateState`
   - Lazy evaluation untuk selected items

### 2.2 Custom Validation

```dart
validator: (List<int>? items) {
  if (items == null || items.isEmpty)
    return 'required filed';
  else if (items.length > 3)
    return 'only 1 to 3 items are allowed';
  return null;
}
```

#### Validation Rules:

1. **Null Safety**
   - Explicit null check
   - Empty collection check

2. **Business Rules**
   - Maximum selection limit
   - Custom error messages
   - Extensible validation logic

## 3. UI/UX Deep Dive

### 3.1 Custom Item Builder

```dart
Widget _customPopupItemBuilderExample2(
    BuildContext context, 
    UserMode item, 
    bool isSelected) {
  return Container(
    margin: EdgeInsets.symmetric(horizontal: 8),
    decoration: !isSelected
        ? null
        : BoxDecoration(
            border: Border.all(color: Theme.of(context).primaryColor),
            borderRadius: BorderRadius.circular(5),
            color: Colors.white,
          ),
    child: ListTile(
      selected: isSelected,
      title: Text(item.name),
      subtitle: Text(item.createdAt.toString()),
      leading: CircleAvatar(
        backgroundImage: NetworkImage(item.avatar),
      ),
    ),
  );
}
```

#### UI Component Analysis:

1. **Visual Feedback**
   - Selected state indication
   - Theme-aware styling
   - Consistent spacing

2. **Performance Considerations**
   - Minimal widget tree depth
   - Efficient state management
   - Image caching potential

### 3.2 Popup Customization

```dart
PopupProps.menu(
  fit: FlexFit.loose,
  menuProps: MenuProps(
    backgroundColor: Colors.transparent,
    elevation: 0,
  ),
  containerBuilder: (ctx, popupWidget) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Custom popup implementation
      ],
    );
  },
)
```

#### Design Patterns:

1. **Builder Pattern**
   - Flexible UI composition
   - Context-aware building
   - Custom styling options

2. **Layout Strategy**
   - Dynamic sizing
   - Responsive design
   - Cross-platform compatibility

## 4. Performance Optimizations

### 4.1 Memory Management

```dart
@override
void dispose() {
  _userEditTextController.dispose();
  super.dispose();
}
```

#### Resource Cleanup:

1. **Controller Disposal**
   - Proper cleanup of text controllers
   - Prevention of memory leaks
   - Resource management

2. **State Cleanup**
   - Clear callbacks
   - Release resources
   - Reset state

### 4.2 Render Optimization

```dart
const _CheckBoxWidget({
  required this.child,
  this.isSelected,
  this.onChanged
});
```

#### Widget Efficiency:

1. **Const Constructor**
   - Widget reuse
   - Build optimization
   - Memory efficiency

2. **Selective Rebuilds**
   - State isolation
   - Minimal widget tree updates
   - Performance monitoring

## 5. Extension Points

### 5.1 Custom Styling

```dart
dropdownDecoratorProps: DropDownDecoratorProps(
  dropdownSearchDecoration: InputDecoration(
    labelText: 'Users *',
    filled: true,
    fillColor: Theme.of(context).inputDecorationTheme.fillColor,
  ),
)
```

#### Customization Options:

1. **Theme Integration**
   - Theme-aware styling
   - Dynamic color schemes
   - Consistent branding

2. **Layout Customization**
   - Flexible positioning
   - Responsive design
   - Platform-specific adaptations

### 5.2 Data Integration

```dart
asyncItems: (String? filter) => getData(filter),
compareFn: (item, selectedItem) => item.id == selectedItem.id,
```

#### Integration Patterns:

1. **Data Fetching**
   - Async data loading
   - Search functionality
   - Pagination support

2. **Data Comparison**
   - Custom equality
   - Selection tracking
   - State persistence

## 6. Security Considerations

### 6.1 Input Validation

```dart
validator: (value) {
  if (value == null || value.isEmpty) {
    return 'Field tidak boleh kosong';
  }
  // Sanitasi input
  if (!RegExp(r'^[a-zA-Z0-9\s]+$').hasMatch(value)) {
    return 'Input mengandung karakter tidak valid';
  }
  return null;
}
```

#### Security Measures:

1. **Input Sanitization**
   - Character validation
   - Length restrictions
   - Pattern matching

2. **Data Protection**
   - Sensitive data handling
   - Secure storage
   - Access control

## 7. Testing Strategy

### 7.1 Unit Tests

```dart
void main() {
  group('DropDownCust Widget Tests', () {
    testWidgets('renders correctly', (WidgetTester tester) async {
      await tester.pumpWidget(MaterialApp(home: DropDownCust()));
      expect(find.byType(DropdownSearch), findsNWidgets(1));
    });
  });
}
```

#### Test Coverage:

1. **Widget Testing**
   - Render testing
   - Interaction testing
   - State management testing

2. **Integration Testing**
   - Network calls
   - Data transformation
   - Error scenarios

## 8. Maintenance dan Debugging

### 8.1 Logging Strategy

```dart
void _handleCheckBoxState({bool updateState = true}) {
  print('Current selection state: $_popupBuilderSelection');
  // Implementation
}
```

#### Debug Tooling:

1. **Error Tracking**
   - Error logging
   - State tracking
   - Performance monitoring

2. **Maintenance Tools**
   - Debug flags
   - State inspection
   - Performance profiling

## 9. Best Practices dan Rekomendasi

### 9.1 Code Organization

```dart
// Constants
const double ITEM_HEIGHT = 48.0;
const int MAX_ITEMS = 3;

// Enums
enum SelectionMode { single, multiple }

// Extensions
extension DropdownStateExtension on DropdownSearchState {
  void safeUpdate() {
    if (mounted) setState(() {});
  }
}
```

#### Coding Standards:

1. **Code Structure**
   - Logical grouping
   - Clear naming
   - Documentation

2. **Maintainability**
   - Modular design
   - Clear dependencies
   - Clean architecture

### 9.2 Performance Guidelines

1. **Optimization Tips**
   - Lazy loading untuk data besar
   - Caching untuk network requests
   - Widget tree optimization

2. **Memory Management**
   - Resource cleanup
   - State management
   - Cache invalidation

## Kesimpulan

Custom Dropdown Widget ini mendemonstrasikan implementasi kompleks yang menggabungkan berbagai aspek pengembangan Flutter modern:

1. **Arsitektur yang Solid**
   - Clean separation of concerns
   - Modular design
   - Extensible architecture

2. **Performance yang Dioptimasi**
   - Efficient resource usage
   - Minimal rebuilds
   - Memory management

3. **User Experience yang Baik**
   - Responsive design
   - Intuitive interactions
   - Visual feedback

4. **Maintainability**
   - Clear documentation
   - Testable code
   - Debugging support

Pengembangan lebih lanjut bisa fokus pada:
- Implementasi caching
- Optimisasi network calls
- Enhanced error handling
- Accessibility improvements
- Platform-specific optimizations

