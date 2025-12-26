/// Centralized config values pulled from --dart-define at runtime.
class AppConfig {
  // Defaults come from app_config.json so `flutter run` works without extra flags in local dev.
  static const firebaseApiKey = String.fromEnvironment(
    'FIREBASE_API_KEY',
    defaultValue: 'AIzaSyCS67E7GRIDcnRrFRpfobchPjpIztTk8PQ',
  );
  static const firebaseAuthDomain = String.fromEnvironment(
    'FIREBASE_AUTH_DOMAIN',
    defaultValue: 'pb-team.firebaseapp.com',
  );
  static const firebaseProjectId = String.fromEnvironment(
    'FIREBASE_PROJECT_ID',
    defaultValue: 'pb-team',
  );
  static const firebaseStorageBucket = String.fromEnvironment(
    'FIREBASE_STORAGE_BUCKET',
    defaultValue: 'pb-team.firebasestorage.app',
  );
  static const firebaseMessagingSenderId =
      String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID', defaultValue: '380986901872');
  static const firebaseAppId = String.fromEnvironment(
    'FIREBASE_APP_ID',
    defaultValue: '1:380986901872:web:99cbb839cf3067ad46f94d',
  );

  static const tmdbApiKey = String.fromEnvironment(
    'TMDB_API_KEY',
    defaultValue: '4949db1ffed8869c4dcc9946f367c2c8',
  );
  static const githubClientId = String.fromEnvironment(
    'GITHUB_CLIENT_ID',
    defaultValue: 'Ov23liywZGAnwIITN0wp',
  );
  static const githubTokenEndpoint = String.fromEnvironment(
    'GITHUB_TOKEN_ENDPOINT',
    defaultValue: 'http://localhost:3001/auth/github/token',
  );

  /// Handy helper in dev to warn when keys are missing.
  static void warnIfMissing() {
    final entries = <String, String?>{
      'FIREBASE_API_KEY': firebaseApiKey,
      'FIREBASE_AUTH_DOMAIN': firebaseAuthDomain,
      'FIREBASE_PROJECT_ID': firebaseProjectId,
      'FIREBASE_STORAGE_BUCKET': firebaseStorageBucket,
      'FIREBASE_MESSAGING_SENDER_ID': firebaseMessagingSenderId,
      'FIREBASE_APP_ID': firebaseAppId,
      'TMDB_API_KEY': tmdbApiKey,
      'GITHUB_CLIENT_ID': githubClientId,
      'GITHUB_TOKEN_ENDPOINT': githubTokenEndpoint,
    };
    final missing = entries.entries.where((e) => (e.value ?? '').isEmpty).map((e) => e.key);
    if (missing.isNotEmpty) {
      // ignore: avoid_print
      print('Missing --dart-define values: ${missing.join(', ')}');
    }
  }
}
