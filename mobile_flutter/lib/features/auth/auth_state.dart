import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../core/providers/firebase_providers.dart';

enum AuthStatus { unknown, signedOut, signedIn }

class AuthStateNotifier extends Notifier<AuthStatus> {
  late final FirebaseAuth _auth;
  late final GoogleSignIn _googleSignIn;
  late final Future<void> _googleInit;
  StreamSubscription<User?>? _sub;

  @override
  AuthStatus build() {
    _auth = ref.read(firebaseAuthProvider);
    // Use singleton + explicit clientId to match Firebase web client (required for v7 API).
    _googleSignIn = GoogleSignIn.instance;
    _googleInit = _googleSignIn.initialize(
      clientId: '309869010872-mngfli8na798j5e7hgnu7qp4sn928fq1.apps.googleusercontent.com',
    );
    _sub = _auth.authStateChanges().listen((user) {
      state = user == null ? AuthStatus.signedOut : AuthStatus.signedIn;
    });
    ref.onDispose(() {
      _sub?.cancel();
    });
    return AuthStatus.unknown;
  }

  Future<void> signOut() async {
    await _googleInit;
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  Future<UserCredential> signInWithGoogle() async {
    await _googleInit;
    final googleUser = await _googleSignIn.authenticate();
    final googleAuth = googleUser.authentication;
    final idToken = googleAuth.idToken;
    if (idToken == null) {
      throw StateError('Google sign-in did not return an ID token.');
    }
    final credential = GoogleAuthProvider.credential(
      idToken: idToken,
    );
    return _auth.signInWithCredential(credential);
  }

  Future<UserCredential> signInWithEmail(String email, String password) {
    return _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<UserCredential> signUpWithEmail(String email, String password) {
    return _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
  }
}

final authStateProvider = NotifierProvider<AuthStateNotifier, AuthStatus>(
  AuthStateNotifier.new,
);
