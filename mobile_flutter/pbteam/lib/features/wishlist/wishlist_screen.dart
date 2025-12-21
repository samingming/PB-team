import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../root/widgets/yeemin_app_bar.dart';
import 'data/wishlist_repository.dart';
import 'providers/wishlist_provider.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlist = ref.watch(wishlistStreamProvider);
    return Scaffold(
      appBar: const YeeminAppBar(),
      body: wishlist.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('No items yet'));
          }
          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (context, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                leading: item.posterUrl.isNotEmpty
                    ? Image.network(item.posterUrl, width: 50, fit: BoxFit.cover)
                    : const SizedBox(width: 50),
                title: Text(item.title),
                subtitle: Text('Movie ID: ${item.movieId}'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () {
                    ref.read(wishlistRepositoryProvider).remove(item.id);
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
