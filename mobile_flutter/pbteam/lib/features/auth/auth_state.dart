import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/firebase_providers.dart';

enum AuthStatus { unknown, signedOut, signedIn }

class AuthStateNotifier extends StateNotifier<AuthStatus> {
  AuthStateNotifier(this._auth) : super(AuthStatus.unknown) {
    _sub = _auth.authStateChanges().listen((user) {
      state = user == null ? AuthStatus.signedOut : AuthStatus.signedIn;
    });
  }

  final FirebaseAuth _auth;
  StreamSubscription<User?>? _sub;

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  Future<void> signOut() => _auth.signOut();

  Future<UserCredential> signInWithGoogle() async {
    // Trigger the authentication flow
    final googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) {
      throw Exception('Google sign-in was cancelled');
    }
    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    return _auth.signInWithCredential(credential);
  }
}

final authStateProvider =
    StateNotifierProvider<AuthStateNotifier, AuthStatus>((ref) {
  final auth = ref.watch(firebaseAuthProvider);
  return AuthStateNotifier(auth);
});
