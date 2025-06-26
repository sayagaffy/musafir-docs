---
title: Monitoring & Analytics
description: Comprehensive monitoring, crash reporting, performance tracking, dan user analytics setup untuk Musafir app.
---

# 📊 Monitoring & Analytics - Phase 5

Comprehensive guide untuk monitoring, crash reporting, performance tracking, dan user analytics untuk memastikan Musafir app berjalan optimal dan memberikan insights yang valuable.

---

## 📋 **MONITORING OVERVIEW**

### Monitoring Stack

- **Firebase Crashlytics**: Crash reporting dan error tracking
- **Firebase Performance**: App performance monitoring
- **Firebase Analytics**: User behavior tracking
- **Google Analytics**: Advanced user insights
- **Custom Logging**: Application-specific monitoring

### Key Metrics to Track

- **Performance**: App startup time, screen load time, network requests
- **Stability**: Crash-free sessions, error rates
- **Usage**: User engagement, feature adoption, retention
- **Business**: Bookmarks created, travel plans made, places searched

---

## 🔥 **FIREBASE CRASHLYTICS SETUP**

### Implementation

#### 1. Dependencies Setup

**File Location:** `pubspec.yaml`

```yaml
dependencies:
  firebase_crashlytics: ^3.4.9
  firebase_analytics: ^10.7.4
  firebase_performance: ^0.9.3+3

dev_dependencies:
  firebase_crashlytics_platform_interface: ^3.6.28
```

#### 2. Crashlytics Configuration

**File Location:** `lib/services/crashlytics_service.dart`

```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CrashlyticsService {
  static final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;

  /// Initialize Crashlytics
  static Future<void> initialize() async {
    // Enable collection in release mode
    if (kReleaseMode) {
      await _crashlytics.setCrashlyticsCollectionEnabled(true);
    }

    // Set up automatic crash reporting
    FlutterError.onError = (errorDetails) {
      _crashlytics.recordFlutterFatalError(errorDetails);
    };

    // Handle async errors
    PlatformDispatcher.instance.onError = (error, stack) {
      _crashlytics.recordError(error, stack, fatal: true);
      return true;
    };

    // Set user information
    await setUserInfo();
  }

  /// Set user information for crash reports
  static Future<void> setUserInfo() async {
    try {
      // Get user info from authentication or storage
      final userEmail = Get.find<AuthController>().user?.email;
      final userId = Get.find<AuthController>().user?.uid;

      if (userId != null) {
        await _crashlytics.setUserIdentifier(userId);
      }

      if (userEmail != null) {
        await _crashlytics.setCustomKey('user_email', userEmail);
      }

      await _crashlytics.setCustomKey('app_version', '1.0.0');
      await _crashlytics.setCustomKey('build_number', '1');
    } catch (e) {
      debugPrint('Error setting user info for Crashlytics: $e');
    }
  }

  /// Log custom error
  static Future<void> logError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
    Map<String, dynamic>? customKeys,
    bool fatal = false,
  }) async {
    try {
      // Add custom keys if provided
      if (customKeys != null) {
        for (final entry in customKeys.entries) {
          await _crashlytics.setCustomKey(entry.key, entry.value);
        }
      }

      // Record the error
      await _crashlytics.recordError(
        exception,
        stackTrace,
        reason: reason,
        fatal: fatal,
      );

      if (kDebugMode) {
        print('Crashlytics Error: $exception');
        print('Reason: $reason');
        print('Stack: $stackTrace');
      }
    } catch (e) {
      debugPrint('Error logging to Crashlytics: $e');
    }
  }

  /// Log custom message
  static Future<void> log(String message) async {
    try {
      await _crashlytics.log(message);
      if (kDebugMode) {
        print('Crashlytics Log: $message');
      }
    } catch (e) {
      debugPrint('Error logging message to Crashlytics: $e');
    }
  }

  /// Record breadcrumb for debugging
  static Future<void> recordBreadcrumb(String message, {
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _crashlytics.log('Breadcrumb: $message');

      if (parameters != null) {
        for (final entry in parameters.entries) {
          await _crashlytics.setCustomKey(
            'breadcrumb_${entry.key}',
            entry.value
          );
        }
      }
    } catch (e) {
      debugPrint('Error recording breadcrumb: $e');
    }
  }

  /// Force a crash for testing (debug only)
  static void testCrash() {
    if (kDebugMode) {
      _crashlytics.crash();
    }
  }
}
```

#### 3. Enhanced Error Handling in Controllers

**File Location:** `lib/controller/base_controller.dart`

```dart
import 'package:get/get.dart';
import '../services/crashlytics_service.dart';

abstract class BaseController extends GetxController {
  final isLoading = false.obs;
  final errorMessage = ''.obs;

  /// Handle errors with Crashlytics logging
  Future<void> handleError(
    dynamic error,
    StackTrace stackTrace, {
    String? context,
    Map<String, dynamic>? additionalInfo,
    bool showToUser = true,
  }) async {
    // Log to Crashlytics for non-debug environments
    if (!kDebugMode && level.index >= LogLevel.warning.index) {
      CrashlyticsService.log(logMessage);
    }
  }

  static int _getLogLevel(LogLevel level) {
    switch (level) {
      case LogLevel.debug:
        return 500;
      case LogLevel.info:
        return 800;
      case LogLevel.warning:
        return 900;
      case LogLevel.error:
        return 1000;
      case LogLevel.critical:
        return 1200;
    }
  }
}
```

#### 2. Logging Mixin for Controllers

**File Location:** `lib/mixins/logging_mixin.dart`

```dart
mixin LoggingMixin {
  String get logTag => runtimeType.toString();

  void logDebug(String message, {Map<String, dynamic>? data}) {
    LoggerService.debug(message, tag: logTag, data: data);
  }

  void logInfo(String message, {Map<String, dynamic>? data}) {
    LoggerService.info(message, tag: logTag, data: data);
  }

  void logWarning(String message, {Map<String, dynamic>? data}) {
    LoggerService.warning(message, tag: logTag, data: data);
  }

  void logError(String message, {
    dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    LoggerService.error(
      message,
      tag: logTag,
      error: error,
      stackTrace: stackTrace,
      data: data,
    );
  }

  void logCritical(String message, {
    dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    LoggerService.critical(
      message,
      tag: logTag,
      error: error,
      stackTrace: stackTrace,
      data: data,
    );
  }
}
```

---

## 📱 **USER BEHAVIOR TRACKING**

### Implementation

#### 1. User Session Tracking

**File Location:** `lib/services/session_service.dart`

```dart
import 'package:flutter/material.dart';
import 'analytics_service.dart';

class SessionService with WidgetsBindingObserver {
  static final SessionService _instance = SessionService._internal();
  factory SessionService() => _instance;
  SessionService._internal();

  DateTime? _sessionStart;
  DateTime? _lastActivity;
  String? _currentScreen;
  int _screenViews = 0;
  final List<String> _sessionEvents = [];

  /// Initialize session tracking
  void initialize() {
    WidgetsBinding.instance.addObserver(this);
    startSession();
  }

  /// Start new session
  void startSession() {
    _sessionStart = DateTime.now();
    _lastActivity = DateTime.now();
    _screenViews = 0;
    _sessionEvents.clear();

    logInfo('Session started');

    AnalyticsService.logEvent('session_start', {
      'timestamp': _sessionStart!.toIso8601String(),
    });
  }

  /// End current session
  void endSession() {
    if (_sessionStart != null) {
      final sessionDuration = DateTime.now().difference(_sessionStart!);

      logInfo('Session ended', data: {
        'duration_seconds': sessionDuration.inSeconds,
        'screen_views': _screenViews,
        'events_count': _sessionEvents.length,
      });

      AnalyticsService.logEvent('session_end', {
        'session_duration': sessionDuration.inSeconds,
        'screen_views': _screenViews,
        'events_count': _sessionEvents.length,
        'last_screen': _currentScreen,
      });

      _sessionStart = null;
    }
  }

  /// Track screen view
  void trackScreenView(String screenName) {
    _currentScreen = screenName;
    _screenViews++;
    _lastActivity = DateTime.now();

    _sessionEvents.add('screen_view:$screenName');

    AnalyticsService.logScreenView(
      screenName: screenName,
      parameters: {
        'session_screen_views': _screenViews,
      },
    );
  }

  /// Track user activity
  void trackActivity(String activity, {Map<String, dynamic>? data}) {
    _lastActivity = DateTime.now();
    _sessionEvents.add('activity:$activity');

    AnalyticsService.logUserEngagement(
      action: activity,
      category: 'user_activity',
    );
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        if (_sessionStart == null) {
          startSession();
        }
        break;
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
        endSession();
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
        // Don't end session for brief inactive states
        break;
    }
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    endSession();
  }
}
```

#### 2. Feature Usage Tracking

**File Location:** `lib/services/feature_tracking_service.dart`

```dart
class FeatureTrackingService {
  static final Map<String, int> _featureUsage = {};
  static final Map<String, DateTime> _lastUsed = {};

  /// Track feature usage
  static Future<void> trackFeature(String featureName, {
    Map<String, dynamic>? parameters,
  }) async {
    // Update usage count
    _featureUsage[featureName] = (_featureUsage[featureName] ?? 0) + 1;
    _lastUsed[featureName] = DateTime.now();

    // Log to analytics
    await AnalyticsService.logFeatureUsage(
      feature: featureName,
      parameters: {
        'usage_count': _featureUsage[featureName],
        'timestamp': DateTime.now().toIso8601String(),
        ...?parameters,
      },
    );

    // Log to custom logger
    LoggerService.info('Feature used: $featureName', data: {
      'usage_count': _featureUsage[featureName],
      'parameters': parameters,
    });
  }

  /// Get feature usage statistics
  static Map<String, dynamic> getUsageStats() {
    return {
      'feature_usage': Map.from(_featureUsage),
      'last_used': _lastUsed.map(
        (key, value) => MapEntry(key, value.toIso8601String()),
      ),
    };
  }

  /// Track specific Musafir features
  static Future<void> trackPlaceSearch(String query, String type) async {
    await trackFeature('place_search', parameters: {
      'search_query': query,
      'place_type': type,
    });
  }

  static Future<void> trackBookmarkAction(String action) async {
    await trackFeature('bookmark_$action');
  }

  static Future<void> trackTravelPlanCreation() async {
    await trackFeature('travel_plan_create');
  }

  static Future<void> trackDirectionsOpen() async {
    await trackFeature('directions_open');
  }

  static Future<void> trackSharePlace() async {
    await trackFeature('share_place');
  }
}
```

---

## 🔍 **REAL-TIME MONITORING DASHBOARD**

### Implementation

#### 1. Monitoring Dashboard Service

**File Location:** `lib/services/monitoring_dashboard.dart`

```dart
class MonitoringDashboard {
  static final Map<String, dynamic> _metrics = {};
  static Timer? _metricsTimer;

  /// Initialize monitoring dashboard
  static void initialize() {
    _startMetricsCollection();
  }

  static void _startMetricsCollection() {
    _metricsTimer = Timer.periodic(
      const Duration(minutes: 5),
      (timer) => _collectMetrics(),
    );
  }

  static Future<void> _collectMetrics() async {
    final metrics = {
      'timestamp': DateTime.now().toIso8601String(),
      'app_state': _getAppState(),
      'memory_usage': await _getMemoryUsage(),
      'network_status': await _getNetworkStatus(),
      'feature_usage': FeatureTrackingService.getUsageStats(),
      'error_count': _getErrorCount(),
      'session_info': _getSessionInfo(),
    };

    _metrics['latest'] = metrics;
    _metrics['history'] = (_metrics['history'] as List? ?? [])..add(metrics);

    // Keep only last 24 hours of data
    final history = _metrics['history'] as List;
    final cutoff = DateTime.now().subtract(const Duration(hours: 24));
    history.removeWhere((m) =>
      DateTime.parse(m['timestamp']).isBefore(cutoff));

    // Send to analytics
    await AnalyticsService.logEvent('app_metrics', metrics);
  }

  static String _getAppState() {
    return WidgetsBinding.instance.lifecycleState?.name ?? 'unknown';
  }

  static Future<Map<String, dynamic>> _getMemoryUsage() async {
    // This would require platform-specific implementation
    return {
      'estimated_usage_mb': 0, // Placeholder
    };
  }

  static Future<Map<String, dynamic>> _getNetworkStatus() async {
    // Check connectivity
    return {
      'is_connected': true, // Placeholder
      'connection_type': 'wifi', // Placeholder
    };
  }

  static Map<String, dynamic> _getErrorCount() {
    // This would track errors from your error handling
    return {
      'total_errors': 0, // Placeholder
      'critical_errors': 0, // Placeholder
    };
  }

  static Map<String, dynamic> _getSessionInfo() {
    return {
      'session_duration': 0, // Placeholder
      'screen_views': 0, // Placeholder
    };
  }

  /// Get current metrics
  static Map<String, dynamic> getCurrentMetrics() {
    return Map.from(_metrics);
  }

  /// Export metrics for debugging
  static String exportMetrics() {
    return jsonEncode(_metrics);
  }

  static void dispose() {
    _metricsTimer?.cancel();
  }
}
```

---

## 🚨 **ALERTING SYSTEM**

### Implementation

#### 1. Alert Service

**File Location:** `lib/services/alert_service.dart`

```dart
class AlertService {
  static final List<Alert> _activeAlerts = [];
  static final Map<String, int> _alertCounts = {};

  /// Define alert thresholds
  static const Map<String, int> alertThresholds = {
    'error_rate_per_hour': 10,
    'crash_rate_per_hour': 5,
    'network_timeout_rate': 20,
    'memory_usage_mb': 500,
  };

  /// Check and trigger alerts
  static Future<void> checkAlerts() async {
    await _checkErrorRateAlert();
    await _checkCrashRateAlert();
    await _checkNetworkTimeoutAlert();
    await _checkMemoryUsageAlert();
  }

  static Future<void> _checkErrorRateAlert() async {
    final errorCount = _getErrorCountLastHour();
    if (errorCount > alertThresholds['error_rate_per_hour']!) {
      await _triggerAlert(Alert(
        type: AlertType.errorRate,
        message: 'High error rate detected: $errorCount errors in last hour',
        severity: AlertSeverity.warning,
        data: {'error_count': errorCount},
      ));
    }
  }

  static Future<void> _checkCrashRateAlert() async {
    final crashCount = _getCrashCountLastHour();
    if (crashCount > alertThresholds['crash_rate_per_hour']!) {
      await _triggerAlert(Alert(
        type: AlertType.crashRate,
        message: 'High crash rate detected: $crashCount crashes in last hour',
        severity: AlertSeverity.critical,
        data: {'crash_count': crashCount},
      ));
    }
  }

  static Future<void> _checkNetworkTimeoutAlert() async {
    final timeoutCount = _getNetworkTimeoutCountLastHour();
    if (timeoutCount > alertThresholds['network_timeout_rate']!) {
      await _triggerAlert(Alert(
        type: AlertType.networkTimeout,
        message: 'High network timeout rate: $timeoutCount timeouts in last hour',
        severity: AlertSeverity.warning,
        data: {'timeout_count': timeoutCount},
      ));
    }
  }

  static Future<void> _checkMemoryUsageAlert() async {
    final memoryUsage = await _getCurrentMemoryUsage();
    if (memoryUsage > alertThresholds['memory_usage_mb']!) {
      await _triggerAlert(Alert(
        type: AlertType.memoryUsage,
        message: 'High memory usage detected: ${memoryUsage}MB',
        severity: AlertSeverity.warning,
        data: {'memory_usage_mb': memoryUsage},
      ));
    }
  }

  static Future<void> _triggerAlert(Alert alert) async {
    _activeAlerts.add(alert);
    _alertCounts[alert.type.name] = (_alertCounts[alert.type.name] ?? 0) + 1;

    // Log to Crashlytics
    await CrashlyticsService.logError(
      Exception(alert.message),
      StackTrace.current,
      reason: 'Alert triggered',
      customKeys: {
        'alert_type': alert.type.name,
        'alert_severity': alert.severity.name,
        ...alert.data,
      },
    );

    // Log to Analytics
    await AnalyticsService.logEvent('alert_triggered', {
      'alert_type': alert.type.name,
      'alert_severity': alert.severity.name,
      'alert_message': alert.message,
      ...alert.data,
    });

    // In production, you might send this to external monitoring service
    if (kDebugMode) {
      print('ALERT: ${alert.message}');
    }
  }

  // Placeholder methods - implement based on your error tracking
  static int _getErrorCountLastHour() => 0;
  static int _getCrashCountLastHour() => 0;
  static int _getNetworkTimeoutCountLastHour() => 0;
  static Future<int> _getCurrentMemoryUsage() async => 0;

  /// Get active alerts
  static List<Alert> getActiveAlerts() => List.from(_activeAlerts);

  /// Clear resolved alerts
  static void clearAlert(Alert alert) {
    _activeAlerts.remove(alert);
  }
}

class Alert {
  final AlertType type;
  final String message;
  final AlertSeverity severity;
  final Map<String, dynamic> data;
  final DateTime timestamp;

  Alert({
    required this.type,
    required this.message,
    required this.severity,
    required this.data,
  }) : timestamp = DateTime.now();
}

enum AlertType {
  errorRate,
  crashRate,
  networkTimeout,
  memoryUsage,
  customEvent,
}

enum AlertSeverity {
  info,
  warning,
  critical,
}
```

---

## 📊 **REPORTING AND INSIGHTS**

### Implementation

#### 1. Report Generation Service

**File Location:** `lib/services/report_service.dart`

```dart
class ReportService {
  /// Generate daily usage report
  static Future<Map<String, dynamic>> generateDailyReport() async {
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));

    return {
      'date': today.toIso8601String().split('T')[0],
      'user_sessions': await _getUserSessionsCount(yesterday, today),
      'feature_usage': await _getFeatureUsageStats(yesterday, today),
      'error_summary': await _getErrorSummary(yesterday, today),
      'performance_metrics': await _getPerformanceMetrics(yesterday, today),
      'top_searched_places': await _getTopSearchedPlaces(yesterday, today),
      'bookmark_stats': await _getBookmarkStats(yesterday, today),
    };
  }

  /// Generate weekly insights
  static Future<Map<String, dynamic>> generateWeeklyInsights() async {
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));

    return {
      'week_ending': now.toIso8601String().split('T')[0],
      'user_retention': await _getUserRetentionRate(weekAgo, now),
      'most_used_features': await _getMostUsedFeatures(weekAgo, now),
      'geographic_usage': await _getGeographicUsage(weekAgo, now),
      'performance_trends': await _getPerformanceTrends(weekAgo, now),
      'crash_analysis': await _getCrashAnalysis(weekAgo, now),
    };
  }

  // Placeholder methods - implement based on your data storage
  static Future<int> _getUserSessionsCount(DateTime start, DateTime end) async => 0;
  static Future<Map<String, int>> _getFeatureUsageStats(DateTime start, DateTime end) async => {};
  static Future<Map<String, dynamic>> _getErrorSummary(DateTime start, DateTime end) async => {};
  static Future<Map<String, dynamic>> _getPerformanceMetrics(DateTime start, DateTime end) async => {};
  static Future<List<String>> _getTopSearchedPlaces(DateTime start, DateTime end) async => [];
  static Future<Map<String, int>> _getBookmarkStats(DateTime start, DateTime end) async => {};
  static Future<double> _getUserRetentionRate(DateTime start, DateTime end) async => 0.0;
  static Future<List<String>> _getMostUsedFeatures(DateTime start, DateTime end) async => [];
  static Future<Map<String, int>> _getGeographicUsage(DateTime start, DateTime end) async => {};
  static Future<Map<String, dynamic>> _getPerformanceTrends(DateTime start, DateTime end) async => {};
  static Future<Map<String, dynamic>> _getCrashAnalysis(DateTime start, DateTime end) async => {};
}
```

---

## 🛠️ **MONITORING SETUP IN MAIN.dart**

### Integration

**File Location:** `lib/main.dart` (Enhanced)

```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:get/get.dart';
import 'services/crashlytics_service.dart';
import 'services/analytics_service.dart';
import 'services/performance_service.dart';
import 'services/session_service.dart';
import 'services/monitoring_dashboard.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Initialize monitoring services
  await _initializeMonitoring();

  runApp(const MusafirApp());
}

Future<void> _initializeMonitoring() async {
  try {
    // Initialize Crashlytics
    await CrashlyticsService.initialize();

    // Initialize Performance Monitoring
    await PerformanceService.initialize();

    // Initialize Analytics
    await AnalyticsService.initialize();

    // Initialize Session Tracking
    SessionService().initialize();

    // Initialize Monitoring Dashboard
    MonitoringDashboard.initialize();

    LoggerService.info('All monitoring services initialized successfully');
  } catch (e, stackTrace) {
    LoggerService.critical(
      'Failed to initialize monitoring services',
      error: e,
      stackTrace: stackTrace,
    );
  }
}

class MusafirApp extends StatelessWidget {
  const MusafirApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Musafir',

      // Add Firebase Analytics observer
      navigatorObservers: [
        AnalyticsService.observer,
      ],

      // Global error handling
      builder: (context, widget) {
        ErrorWidget.builder = (FlutterErrorDetails errorDetails) {
          // Log widget errors
          CrashlyticsService.logError(
            errorDetails.exception,
            errorDetails.stack,
            reason: 'Widget Error',
            customKeys: {
              'widget_error': true,
              'library': errorDetails.library ?? 'unknown',
            },
          );

          // Return custom error widget
          return Material(
            child: Container(
              color: Colors.red.shade50,
              child: const Center(
                child: Text(
                  'Something went wrong',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ),
          );
        };

        return widget ?? const SizedBox.shrink();
      },

      home: const SplashScreen(),
    );
  }
}
```

---

## ✅ **MONITORING CHECKLIST**

### Setup Checklist

- [ ] Firebase Crashlytics configured
- [ ] Firebase Performance Monitoring enabled
- [ ] Firebase Analytics integrated
- [ ] Custom logging system implemented
- [ ] Error handling enhanced in all controllers
- [ ] Session tracking active
- [ ] Feature usage tracking implemented
- [ ] Alert system configured

### Monitoring Coverage

- [ ] App crashes and errors
- [ ] Performance metrics (startup time, network requests)
- [ ] User engagement and retention
- [ ] Feature adoption rates
- [ ] Business metrics (bookmarks, travel plans)
- [ ] Geographic usage patterns
- [ ] Device and OS distribution

### Analytics Events

- [ ] Screen views
- [ ] User authentication
- [ ] Place searches
- [ ] Bookmark actions
- [ ] Travel plan creation
- [ ] Direction requests
- [ ] Share actions
- [ ] Error occurrences

### Performance Metrics

- [ ] App startup time
- [ ] Screen loading time
- [ ] API response times
- [ ] Network failure rates
- [ ] Memory usage
- [ ] Battery consumption
- [ ] Crash-free session rate

### Alerting Setup

- [ ] High error rate alerts
- [ ] Crash rate monitoring
- [ ] Performance degradation alerts
- [ ] Network timeout alerts
- [ ] Memory usage alerts
- [ ] Business metric anomalies

---

## 📋 Next Steps

Setelah memahami Monitoring & Analytics, lanjut ke:

1. **[Code Quality Guide](../guides/code-quality.md)** - Code quality standards dan best practices
2. **[Performance Optimization Deep Dive](../deployment/performance-optimization.md)** - Advanced performance techniques
3. **[Phase 5 Integration Guide](../guides/phase5-integration.md)** - Complete Phase 5 integration

---

\_Monitoring yang comprehensive adalah kunci untuk memahami bagaimana user menggunakan aplikasi dan memastikan performance yang optimal. Implementasikan sistem monitoring ini secara bertahap untuk mendapatkan insights yang valuable.\_lytics
await CrashlyticsService.logError(
error,
stackTrace,
reason: context ?? 'Controller Error',
customKeys: {
'controller': runtimeType.toString(),
'context': context ?? 'unknown',
...?additionalInfo,
},
);

    // Set error state
    isLoading.value = false;

    if (showToUser) {
      errorMessage.value = _getUserFriendlyMessage(error);

      // Show snackbar to user
      Get.snackbar(
        'Error',
        errorMessage.value,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }

    if (kDebugMode) {
      print('Error in ${runtimeType.toString()}: $error');
    }

}

String \_getUserFriendlyMessage(dynamic error) {
if (error.toString().contains('network')) {
return 'Network error. Please check your connection.';
} else if (error.toString().contains('timeout')) {
return 'Request timeout. Please try again.';
} else if (error.toString().contains('permission')) {
return 'Permission denied. Please check app permissions.';
}
return 'Something went wrong. Please try again.';
}

/// Safe execution with error handling
Future<T?> safeExecute<T>(
Future<T> Function() operation, {
String? context,
Map<String, dynamic>? additionalInfo,
bool showLoading = true,
}) async {
try {
if (showLoading) isLoading.value = true;

      final result = await operation();

      if (showLoading) isLoading.value = false;
      errorMessage.value = '';

      return result;
    } catch (error, stackTrace) {
      await handleError(
        error,
        stackTrace,
        context: context,
        additionalInfo: additionalInfo,
      );
      return null;
    }

}
}

````

#### 4. Enhanced HomeController with Monitoring

**File Location:** `lib/controller/home_controller.dart` (Enhanced)

```dart
class HomeController extends BaseController {
  final nearbyFood = <Map<String, dynamic>>[].obs;
  final searchResult = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    CrashlyticsService.log('HomeController initialized');
    _initializeHome();
  }

  Future<void> _initializeHome() async {
    await safeExecute(
      () async {
        await CrashlyticsService.recordBreadcrumb('Starting home initialization');

        // Track initialization time
        final stopwatch = Stopwatch()..start();

        await getNearbyPlace('restaurant');

        stopwatch.stop();

        // Log performance metrics
        await CrashlyticsService.recordBreadcrumb(
          'Home initialization completed',
          parameters: {
            'duration_ms': stopwatch.elapsedMilliseconds,
            'places_found': nearbyFood.length,
          },
        );
      },
      context: 'Home initialization',
      additionalInfo: {
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> getNearbyPlace(String type) async {
    await safeExecute(
      () async {
        await CrashlyticsService.recordBreadcrumb('Fetching nearby places',
          parameters: {'type': type});

        final locationC = Get.find<LocationController>();

        if (locationC.latitude == 0.0 || locationC.longitude == 0.0) {
          throw Exception('Location not available');
        }

        final response = await MusafirRepository().getNearbyPlace(
          lat: locationC.latitude,
          lng: locationC.longitude,
          type: type,
        );

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          final results = data['results'] as List;

          nearbyFood.value = results.cast<Map<String, dynamic>>();

          // Log success metrics
          await CrashlyticsService.recordBreadcrumb(
            'Nearby places fetched successfully',
            parameters: {
              'type': type,
              'count': results.length,
              'location': '${locationC.latitude},${locationC.longitude}',
            },
          );
        } else {
          throw Exception('API Error: ${response.statusCode}');
        }
      },
      context: 'Fetch nearby places',
      additionalInfo: {
        'place_type': type,
        'location_available': locationC.latitude != 0.0,
      },
    );
  }
}
````

---

## 📈 **FIREBASE PERFORMANCE MONITORING**

### Implementation

#### 1. Performance Service

**File Location:** `lib/services/performance_service.dart`

```dart
import 'package:firebase_performance/firebase_performance.dart';
import 'package:flutter/foundation.dart';

class PerformanceService {
  static final FirebasePerformance _performance = FirebasePerformance.instance;
  static final Map<String, Trace> _activeTraces = {};

  /// Initialize Performance Monitoring
  static Future<void> initialize() async {
    if (kReleaseMode) {
      await _performance.setPerformanceCollectionEnabled(true);
    }
  }

  /// Start a custom trace
  static Future<Trace> startTrace(String traceName) async {
    final trace = _performance.newTrace(traceName);
    await trace.start();
    _activeTraces[traceName] = trace;

    if (kDebugMode) {
      print('Performance trace started: $traceName');
    }

    return trace;
  }

  /// Stop a custom trace
  static Future<void> stopTrace(String traceName, {
    Map<String, String>? attributes,
    Map<String, int>? metrics,
  }) async {
    final trace = _activeTraces[traceName];
    if (trace != null) {
      // Add custom attributes
      if (attributes != null) {
        for (final entry in attributes.entries) {
          trace.putAttribute(entry.key, entry.value);
        }
      }

      // Add custom metrics
      if (metrics != null) {
        for (final entry in metrics.entries) {
          trace.putMetric(entry.key, entry.value);
        }
      }

      await trace.stop();
      _activeTraces.remove(traceName);

      if (kDebugMode) {
        print('Performance trace stopped: $traceName');
      }
    }
  }

  /// Track method execution time
  static Future<T> trackMethod<T>(
    String methodName,
    Future<T> Function() method, {
    Map<String, String>? attributes,
  }) async {
    final trace = await startTrace(methodName);
    final stopwatch = Stopwatch()..start();

    try {
      final result = await method();

      stopwatch.stop();

      await stopTrace(methodName,
        attributes: {
          'success': 'true',
          ...?attributes,
        },
        metrics: {
          'duration_ms': stopwatch.elapsedMilliseconds,
        },
      );

      return result;
    } catch (error) {
      stopwatch.stop();

      await stopTrace(methodName,
        attributes: {
          'success': 'false',
          'error': error.toString(),
          ...?attributes,
        },
        metrics: {
          'duration_ms': stopwatch.elapsedMilliseconds,
        },
      );

      rethrow;
    }
  }

  /// Track HTTP requests automatically
  static HttpMetric newHttpMetric(String url, HttpMethod method) {
    return _performance.newHttpMetric(url, method);
  }

  /// Track screen loading time
  static Future<void> trackScreenLoad(
    String screenName,
    Future<void> Function() loadMethod,
  ) async {
    await trackMethod(
      'screen_load_$screenName',
      loadMethod,
      attributes: {
        'screen_name': screenName,
      },
    );
  }
}
```

#### 2. Network Performance Tracking

**File Location:** `lib/repository/musafir_repository.dart` (Enhanced)

```dart
class MusafirRepository {
  final Dio _dio = Dio();

  MusafirRepository() {
    // Add performance interceptor
    _dio.interceptors.add(PerformanceInterceptor());
  }

  Future<Response> getNearbyPlace({
    required double lat,
    required double lng,
    required String type,
  }) async {
    final metric = PerformanceService.newHttpMetric(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      HttpMethod.Get,
    );

    try {
      await metric.start();

      final response = await _dio.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        queryParameters: {
          'location': '$lat,$lng',
          'radius': 1500,
          'type': type,
          'key': Environment.googleMapsApiKey,
        },
      );

      metric.putAttribute('place_type', type);
      metric.putAttribute('location', '$lat,$lng');
      metric.responseContentType = response.headers['content-type']?.first;
      metric.httpResponseCode = response.statusCode;
      metric.responsePayloadSize = response.data.toString().length;

      return response;
    } catch (error) {
      metric.putAttribute('error', error.toString());
      rethrow;
    } finally {
      await metric.stop();
    }
  }
}

class PerformanceInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.extra['start_time'] = DateTime.now().millisecondsSinceEpoch;
    super.onRequest(options, handler);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final startTime = response.requestOptions.extra['start_time'] as int?;
    if (startTime != null) {
      final duration = DateTime.now().millisecondsSinceEpoch - startTime;

      // Log network performance
      CrashlyticsService.recordBreadcrumb(
        'HTTP Request completed',
        parameters: {
          'url': response.requestOptions.uri.toString(),
          'method': response.requestOptions.method,
          'status_code': response.statusCode ?? 0,
          'duration_ms': duration,
          'response_size': response.data.toString().length,
        },
      );
    }

    super.onResponse(response, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final startTime = err.requestOptions.extra['start_time'] as int?;
    if (startTime != null) {
      final duration = DateTime.now().millisecondsSinceEpoch - startTime;

      // Log network errors
      CrashlyticsService.logError(
        err,
        err.stackTrace,
        reason: 'HTTP Request failed',
        customKeys: {
          'url': err.requestOptions.uri.toString(),
          'method': err.requestOptions.method,
          'status_code': err.response?.statusCode ?? 0,
          'duration_ms': duration,
          'error_type': err.type.toString(),
        },
      );
    }

    super.onError(err, handler);
  }
}
```

---

## 📊 **FIREBASE ANALYTICS**

### Implementation

#### 1. Analytics Service

**File Location:** `lib/services/analytics_service.dart`

```dart
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

class AnalyticsService {
  static final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  static final FirebaseAnalyticsObserver observer =
      FirebaseAnalyticsObserver(analytics: _analytics);

  /// Initialize Analytics
  static Future<void> initialize() async {
    if (kReleaseMode) {
      await _analytics.setAnalyticsCollectionEnabled(true);
    }
  }

  /// Set user properties
  static Future<void> setUserProperties({
    String? userId,
    String? userType,
    String? location,
    bool? isPremium,
  }) async {
    try {
      if (userId != null) {
        await _analytics.setUserId(id: userId);
      }

      if (userType != null) {
        await _analytics.setUserProperty(
          name: 'user_type',
          value: userType,
        );
      }

      if (location != null) {
        await _analytics.setUserProperty(
          name: 'user_location',
          value: location,
        );
      }

      if (isPremium != null) {
        await _analytics.setUserProperty(
          name: 'is_premium',
          value: isPremium.toString(),
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error setting user properties: $e');
      }
    }
  }

  /// Track screen views
  static Future<void> logScreenView({
    required String screenName,
    String? screenClass,
    Map<String, dynamic>? parameters,
  }) async {
    try {
      await _analytics.logScreenView(
        screenName: screenName,
        screenClass: screenClass ?? screenName,
      );

      if (parameters != null) {
        await logEvent('screen_view_details', parameters);
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error logging screen view: $e');
      }
    }
  }

  /// Log custom events
  static Future<void> logEvent(
    String eventName,
    Map<String, dynamic>? parameters,
  ) async {
    try {
      await _analytics.logEvent(
        name: eventName,
        parameters: parameters,
      );
    } catch (e) {
      if (kDebugMode) {
        print('Error logging event: $e');
      }
    }
  }

  /// Track user engagement events
  static Future<void> logUserEngagement({
    required String action,
    String? category,
    String? label,
    int? value,
  }) async {
    await logEvent('user_engagement', {
      'action': action,
      if (category != null) 'category': category,
      if (label != null) 'label': label,
      if (value != null) 'value': value,
    });
  }

  /// Track business events
  static Future<void> logBusinessEvent({
    required String eventType,
    Map<String, dynamic>? parameters,
  }) async {
    await logEvent('business_event', {
      'event_type': eventType,
      'timestamp': DateTime.now().toIso8601String(),
      ...?parameters,
    });
  }

  // Predefined Events for Musafir App

  /// Track place search
  static Future<void> logPlaceSearch({
    required String searchQuery,
    required String placeType,
    int? resultsCount,
  }) async {
    await logEvent('search', {
      AnalyticsEventParameters.searchTerm: searchQuery,
      'place_type': placeType,
      'results_count': resultsCount,
    });
  }

  /// Track place view
  static Future<void> logPlaceView({
    required String placeId,
    required String placeName,
    required String placeType,
    double? rating,
  }) async {
    await logEvent('view_item', {
      AnalyticsEventParameters.itemId: placeId,
      AnalyticsEventParameters.itemName: placeName,
      AnalyticsEventParameters.itemCategory: placeType,
      if (rating != null) 'rating': rating,
    });
  }

  /// Track bookmark actions
  static Future<void> logBookmarkAction({
    required String action, // 'add' or 'remove'
    required String placeId,
    required String placeName,
    required String placeType,
  }) async {
    await logEvent('bookmark_$action', {
      AnalyticsEventParameters.itemId: placeId,
      AnalyticsEventParameters.itemName: placeName,
      AnalyticsEventParameters.itemCategory: placeType,
    });
  }

  /// Track travel plan actions
  static Future<void> logTravelPlanAction({
    required String action, // 'create', 'edit', 'delete', 'view'
    required String planId,
    String? planName,
    int? placesCount,
  }) async {
    await logEvent('travel_plan_$action', {
      'plan_id': planId,
      if (planName != null) 'plan_name': planName,
      if (placesCount != null) 'places_count': placesCount,
    });
  }

  /// Track authentication events
  static Future<void> logAuthEvent({
    required String method, // 'email', 'google', 'facebook'
    required String action, // 'sign_up', 'sign_in', 'sign_out'
  }) async {
    if (action == 'sign_up') {
      await _analytics.logSignUp(signUpMethod: method);
    } else if (action == 'sign_in') {
      await _analytics.logLogin(loginMethod: method);
    }

    await logEvent('auth_$action', {
      'method': method,
    });
  }

  /// Track app launch
  static Future<void> logAppLaunch() async {
    await logEvent('app_open', {
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Track feature usage
  static Future<void> logFeatureUsage({
    required String feature,
    Map<String, dynamic>? parameters,
  }) async {
    await logEvent('feature_usage', {
      'feature_name': feature,
      'timestamp': DateTime.now().toIso8601String(),
      ...?parameters,
    });
  }
}
```

#### 2. Analytics Integration in Controllers

**File Location:** `lib/controller/home_controller.dart` (Analytics Enhanced)

```dart
class HomeController extends BaseController {
  @override
  void onInit() {
    super.onInit();
    AnalyticsService.logScreenView(screenName: 'home');
    AnalyticsService.logAppLaunch();
  }

  Future<void> getSearchPlace(String query, String type) async {
    if (query.isEmpty) {
      searchResult.clear();
      return;
    }

    // Track search event
    await AnalyticsService.logPlaceSearch(
      searchQuery: query,
      placeType: type,
    );

    await safeExecute(
      () async {
        // Debouncing logic
        if (_debounceTimer?.isActive ?? false) _debounceTimer!.cancel();

        _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
          await _performSearch(query, type);
        });
      },
      context: 'Search places',
      additionalInfo: {
        'query': query,
        'type': type,
      },
    );
  }

  Future<void> _performSearch(String query, String type) async {
    final response = await MusafirRepository().getSearchPlace(
      query: query,
      type: type,
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final results = data['results'] as List;

      searchResult.value = results.cast<Map<String, dynamic>>();

      // Track search results
      await AnalyticsService.logPlaceSearch(
        searchQuery: query,
        placeType: type,
        resultsCount: results.length,
      );
    }
  }

  void viewPlaceDetail(Map<String, dynamic> place) {
    // Track place view
    AnalyticsService.logPlaceView(
      placeId: place['place_id'] ?? '',
      placeName: place['name'] ?? '',
      placeType: 'restaurant',
      rating: place['rating']?.toDouble(),
    );

    Get.toNamed(RouteHelper.getHomeDetailPage(), arguments: place);
  }

  Future<void> bookmarkPlace(Map<String, dynamic> place) async {
    try {
      await UserStore().bookmarkPlace(place);

      // Track bookmark action
      await AnalyticsService.logBookmarkAction(
        action: 'add',
        placeId: place['place_id'] ?? '',
        placeName: place['name'] ?? '',
        placeType: 'restaurant',
      );

      // Track business event
      await AnalyticsService.logBusinessEvent(
        eventType: 'bookmark_created',
        parameters: {
          'place_type': 'restaurant',
          'user_id': Get.find<AuthController>().user?.uid,
        },
      );

      Get.snackbar('Success', 'Place bookmarked successfully');
    } catch (e) {
      await handleError(e, StackTrace.current, context: 'Bookmark place');
    }
  }
}
```

---

## 🎯 **CUSTOM LOGGING SYSTEM**

### Implementation

#### 1. Custom Logger

**File Location:** `lib/services/logger_service.dart`

```dart
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'crashlytics_service.dart';

enum LogLevel {
  debug,
  info,
  warning,
  error,
  critical,
}

class LoggerService {
  static const String _loggerName = 'Musafir';

  /// Log debug message
  static void debug(String message, {
    String? tag,
    Map<String, dynamic>? data,
  }) {
    _log(LogLevel.debug, message, tag: tag, data: data);
  }

  /// Log info message
  static void info(String message, {
    String? tag,
    Map<String, dynamic>? data,
  }) {
    _log(LogLevel.info, message, tag: tag, data: data);
  }

  /// Log warning message
  static void warning(String message, {
    String? tag,
    Map<String, dynamic>? data,
  }) {
    _log(LogLevel.warning, message, tag: tag, data: data);
  }

  /// Log error message
  static void error(String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    _log(LogLevel.error, message,
      tag: tag,
      error: error,
      stackTrace: stackTrace,
      data: data,
    );

    // Also log to Crashlytics for errors
    if (error != null) {
      CrashlyticsService.logError(
        error,
        stackTrace,
        reason: message,
        customKeys: {
          'tag': tag ?? 'unknown',
          ...?data,
        },
      );
    }
  }

  /// Log critical error
  static void critical(String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    _log(LogLevel.critical, message,
      tag: tag,
      error: error,
      stackTrace: stackTrace,
      data: data,
    );

    // Always log critical errors to Crashlytics
    CrashlyticsService.logError(
      error ?? Exception(message),
      stackTrace ?? StackTrace.current,
      reason: message,
      customKeys: {
        'level': 'critical',
        'tag': tag ?? 'unknown',
        ...?data,
      },
      fatal: true,
    );
  }

  static void _log(
    LogLevel level,
    String message, {
    String? tag,
    dynamic error,
    StackTrace? stackTrace,
    Map<String, dynamic>? data,
  }) {
    final timestamp = DateTime.now().toIso8601String();
    final logTag = tag ?? _loggerName;
    final levelStr = level.name.toUpperCase();

    String logMessage = '[$timestamp] [$levelStr] [$logTag] $message';

    if (data != null && data.isNotEmpty) {
      logMessage += '\nData: ${data.toString()}';
    }

    if (error != null) {
      logMessage += '\nError: $error';
    }

    if (stackTrace != null) {
      logMessage += '\nStack: $stackTrace';
    }

    // Log to different outputs based on environment
    if (kDebugMode) {
      // Development: Print to console
      print(logMessage);
    } else {
      // Production: Log to developer console
      developer.log(
        message,
        name: logTag,
        level: _getLogLevel(level),
        error: error,
        stackTrace: stackTrace,
      );
    }

    // Log to Crash
```
