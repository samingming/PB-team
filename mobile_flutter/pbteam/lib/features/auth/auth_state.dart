import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AuthStatus { unknown, signedOut, signedIn }

class AuthStateNotifier extends StateNotifier<AuthStatus> {
  AuthStateNotifier() : super(AuthStatus.unknown) {
    // TODO: Wire Firebase auth stream and set state accordingly.
    state = AuthStatus.signedOut;
  }

  void setSignedIn() => state = AuthStatus.signedIn;
  void setSignedOut() => state = AuthStatus.signedOut;
}

final authStateProvider =
    StateNotifierProvider<AuthStateNotifier, AuthStatus>((ref) {
  return AuthStateNotifier();
});
