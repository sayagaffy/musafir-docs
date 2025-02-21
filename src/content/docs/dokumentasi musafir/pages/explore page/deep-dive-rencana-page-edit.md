---
title: Deep Dive: rencana_page_edit.dart
description: rencana_page_edit.dart adalah file yang menangani proses pengeditan rencana perjalanan yang sudah ada. File ini memiliki fungsionalitas yang mirip dengan rencana_page.dart namun dengan tambahan fitur untuk update dan delete rencana.
---


# Deep Dive: rencana_page_edit.dart

## Overview
`rencana_page_edit.dart` adalah file yang menangani proses pengeditan rencana perjalanan yang sudah ada. File ini memiliki fungsionalitas yang mirip dengan rencana_page.dart namun dengan tambahan fitur untuk update dan delete rencana.

## Struktur Kelas

### RencanaPageEdit (StatefulWidget)
```dart
class RencanaPageEdit extends StatefulWidget {
  const RencanaPageEdit({super.key});
  
  @override
  State<RencanaPageEdit> createState() => _RencanaPageEditState();
}
```

### _RencanaPageEditState
```dart
class _RencanaPageEditState extends State<RencanaPageEdit> {
  var exploreController = Get.find<ExploreController>();
  
  TextEditingController startDateTime = TextEditingController();
  TextEditingController endDateTime = TextEditingController();
  TextEditingController startFormat = TextEditingController();
  TextEditingController endFormat = TextEditingController();
}
```

## Core Functions

### clearAll()
```dart
void clearAll() {
  Get.offNamed(RouteHelper.getInitial());

  Future.delayed(const Duration(milliseconds: 2000), () {
    exploreController.searchPlace.clear();
    exploreController.placeIdX.value = '';
    exploreController.startDtTime.clear();
    exploreController.endDtTime.clear();
    exploreController.namePlan.clear();
    exploreController.selectedFood.clear();
    exploreController.selectedMosque.clear();
    exploreController.setLatLng();
    exploreController.idDocument = '';
  });
}
```

#### Cara Kerja:
1. Navigasi ke halaman utama
2. Menunggu 2 detik untuk animasi
3. Reset semua field dan state
4. Clear semua data yang dipilih

### deletePlan()
```dart
Future<void> deletePlan() async {
  await UserStore().exploreDelete(
    exploreController.idDocument,
  );

  clearAll();
}
```

#### Cara Kerja:
1. Menghapus dokumen dari Firestore
2. Membersihkan state dan navigasi ke home

### updatePlan()
```dart
Future<void> updatePlan() async {
  String tujuan = exploreController.searchPlace.text.trim();
  String nameplan = exploreController.namePlan.text.trim();
  String startdtTime = exploreController.startDtTime.text.trim();
  String enddtTime = exploreController.endDtTime.text.trim();

  if (!validateInputs(tujuan, nameplan, startdtTime, enddtTime)) return;

  await UserStore().explorePlanUpdates(
    exploreController.idDocument,
    exploreController.placeIdX.value,
    exploreController.searchPlace.text,
    exploreController.startDtTime.text,
    exploreController.endDtTime.text,
    exploreController.namePlan.text,
    exploreController.selectedFood,
    exploreController.selectedMosque,
    exploreController.latlng!.latitude,
    exploreController.latlng!.longitude,
  );

  clearAll();
}
```

## UI Components

### Form Components
```dart
Widget contentPlan(BuildContext context) {
  return Container(
    margin: const EdgeInsets.only(top: 34),
    padding: const EdgeInsets.all(18),
    child: Column(
      children: [
        TextFdCustom(
          textController: exploreController.searchPlace,
          labelText: 'Ketik Tujuanmu',
          icon: Icons.search_rounded,
          onTap: () => Get.offNamed(RouteHelper.getExploreSearch()),
          readOnly: true,
        ),
        
        // ... other form fields
        
        ActionButtons(),
      ],
    ),
  );
}
```

### Action Buttons
```dart
### Action Buttons
```dart
Widget buildActionButtons() {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      SizedBox(
        height: 40,
        width: 130,
        child: TextButton(
          onPressed: () => updatePlan(),
          style: TextButton.styleFrom(
            backgroundColor: kBlueColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          child: Text(
            'Perbaharui Plan',
            style: whiteTextStyle.copyWith(
              fontSize: 14,
              fontWeight: bold,
              letterSpacing: 0.7,
            ),
          ),
        ),
      ),
      SizedBox(
        height: 40,
        width: 100,
        child: TextButton(
          onPressed: () => showDeleteConfirmation(),
          style: TextButton.styleFrom(
            backgroundColor: kWarningMain,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          child: Text(
            'Hapus',
            style: whiteTextStyle.copyWith(
              fontSize: 14,
              fontWeight: bold,
              letterSpacing: 0.7,
            ),
          ),
        ),
      ),
    ],
  );
}
```

### Delete Confirmation Dialog
```dart
void showDeleteConfirmation() {
  Get.defaultDialog(
    title: "Hapus",
    middleText: "Apakah kamu ingin menghapus plan ini ?",
    onConfirm: () async {
      await deletePlan();
    },
    textConfirm: "Hapus",
    textCancel: "Cancel",
    radius: 4,
    contentPadding: const EdgeInsets.only(bottom: 20),
    buttonColor: kBlueColor,
  );
}
```

## Place Selection Components

### Resto Selection
```dart
Widget buildRestoSection() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      RestoHeader(),
      exploreController.selectedFood.isNotEmpty
          ? RestoList()
          : AddRestoButton(),
    ],
  );
}

Widget RestoHeader() {
  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(
        'Restoran Tujuan ${exploreController.selectedFood.length}',
        style: blackTextStyle.copyWith(
          fontSize: 14,
          fontWeight: bold,
        ),
      ),
      GestureDetector(
        onTap: () => addPlace('resto'),
        child: Text(
          'Tambahkan lainnya',
          style: blackTextStyle.copyWith(
            fontSize: 14,
            fontWeight: bold,
            color: kBlueColor,
          ),
        ),
      ),
    ],
  );
}
```

### Mosque Selection
```dart
Widget buildMosqueSection() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      MosqueHeader(),
      exploreController.selectedMosque.isNotEmpty
          ? MosqueList()
          : AddMosqueButton(),
    ],
  );
}
```

## List Item Components

### ContactItem Widget
```dart
Widget contactItem(String title, String address, String halalStatus,
    String destination, String photos, String placeId) {
  return Card(
    elevation: 1,
    shadowColor: kNeutral20,
    color: kBackgroundColor,
    child: ListTile(
      leading: ImageContainer(),
      title: TitleSection(title, address),
      subtitle: SubtitleSection(halalStatus, destination),
    ),
  );
}
```

## Error Handling

### Input Validation
```dart
bool validateInputs(String tujuan, String nameplan, String startTime, String endTime) {
  if (tujuan.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum memilih Tujuanmu", title: "Tujuanmu");
    return false;
  }
  
  if (nameplan.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum mengisi nama perjalananmu", 
        title: "Nama perjalanan");
    return false;
  }
  
  if (startTime.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum memilih Tanggal Berangkat",
        title: "Tanggal Berangkat");
    return false;
  }
  
  if (endTime.isEmpty) {
    DialogHelper.showSnackBar("Kamu belum memilih Tanggal Kembali",
        title: "Tanggal Kembali");
    return false;
  }
  
  return true;
}
```

### API Error Handling
```dart
Future<void> safeApiCall(Future<void> Function() apiCall) async {
  try {
    await apiCall();
  } catch (e) {
    if (e is FirebaseException) {
      DialogHelper.showSnackBar(
        "Terjadi kesalahan pada database",
        title: "Error",
      );
    } else {
      DialogHelper.showSnackBar(
        "Terjadi kesalahan tidak terduga",
        title: "Error",
      );
    }
  }
}
```

## State Management

### Controller Integration
```dart
// Menggunakan exploreController untuk state management
final exploreController = Get.find<ExploreController>();

// Mengupdate state
void updateState() {
  exploreController.updateLatLng(lat, lng);
  exploreController.setSelectedFood(foodList);
  exploreController.setSelectedMosque(mosqueList);
}

// Mendengarkan perubahan state
Obx(() => Text(exploreController.namePlan.value))
```

## Firebase Integration

### Update Operation
```dart
Future<void> updateInFirestore() async {
  await UserStore().explorePlanUpdates(
    documentId: exploreController.idDocument,
    placeId: exploreController.placeIdX.value,
    placeName: exploreController.searchPlace.text,
    startTime: exploreController.startDtTime.text,
    endTime: exploreController.endDtTime.text,
    namePlan: exploreController.namePlan.text,
    selectedFood: exploreController.selectedFood,
    selectedMosque: exploreController.selectedMosque,
    latitude: exploreController.latlng!.latitude,
    longitude: exploreController.latlng!.longitude,
  );
}
```

### Delete Operation
```dart
Future<void> deleteFromFirestore() async {
  await UserStore().exploreDelete(exploreController.idDocument);
}
```

## Navigation

### Route Management
```dart
void handleNavigation() {
  // Kembali ke halaman explore
  Get.offNamed(RouteHelper.getInitial());
  
  // Navigasi ke pencarian tempat
  Get.offNamed(RouteHelper.getExploreSearch());
  
  // Navigasi dengan parameter
  Get.offNamed(RouteHelper.getSearchPlaceExplore('edit'));
}
```

## Performance Optimization

### Image Loading
```dart
Widget buildImageContainer(String photos) {
  return Container(
    width: 70.0,
    height: 70.0,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(8),
      image: photos == 'none'
          ? const DecorationImage(
              fit: BoxFit.cover,
              image: AssetImage('assets/image_destination1.png'),
            )
          : DecorationImage(
              fit: BoxFit.cover,
              image: NetworkImage('${AppConstans.PLACE_PHOTO}$photos'),
            ),
    ),
  );
}
```

### List Optimization
```dart
Widget buildOptimizedList() {
  return ListView.builder(
    itemCount: dataList.length,
    itemBuilder: (context, index) {
      // Menggunakan const untuk widget yang tidak berubah
      return const ListItem();
    },
  );
}
```

## Testing Guidelines

### Widget Tests
```dart
void main() {
  testWidgets('RencanaPageEdit shows update and delete buttons', 
    (WidgetTester tester) async {
    await tester.pumpWidget(const RencanaPageEdit());
    
    expect(find.text('Perbaharui Plan'), findsOneWidget);
    expect(find.text('Hapus'), findsOneWidget);
  });
}
```

### Integration Tests
```dart
void main() {
  testWidgets('Can update plan details', (WidgetTester tester) async {
    await tester.pumpWidget(const RencanaPageEdit());
    
    // Fill form
    await tester.enterText(
      find.byType(TextFdCustom).first, 
      'Updated Plan Name'
    );
    
    // Tap update button
    await tester.tap(find.text('Perbaharui Plan'));
    await tester.pumpAndSettle();
    
    // Verify navigation
    expect(find.byType(ExplorePage), findsOneWidget);
  });
}
```
