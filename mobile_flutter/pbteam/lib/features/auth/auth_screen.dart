import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth_state.dart';

class AuthScreen extends ConsumerWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            ElevatedButton(
              onPressed: () {
                auth.setSignedIn();
                context.go('/home');
              },
              child: const Text('Mock sign in'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                auth.setSignedOut();
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
