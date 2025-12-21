import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth_errors.dart';
import 'auth_state.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  bool _busy = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _busy = true);
    final auth = ref.read(authStateProvider.notifier);
    try {
      await auth.signInWithGoogle();
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) showAuthError(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = ref.watch(authStateProvider);
    final auth = ref.read(authStateProvider.notifier);
    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Status: $status'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _busy ? null : _signInWithGoogle,
              icon: _busy
                  ? const SizedBox(
                      height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.login),
              label: const Text('Sign in with Google'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                auth.signOut();
                context.go('/auth');
              },
              child: const Text('Sign out'),
            ),
          ],
        ),
      ),
    );
  }
}
