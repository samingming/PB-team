import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../movies/providers/popular_provider.dart';
import '../movies/widgets/movie_list.dart';
import '../root/widgets/yeemin_app_bar.dart';
import '../wishlist/widgets/wishlist_add_button.dart';

class PopularScreen extends ConsumerWidget {
  const PopularScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final popularAsync = ref.watch(popularMoviesProvider);
    return Scaffold(
      appBar: const YeeminAppBar(),
      body: popularAsync.when(
        data: (movies) => MovieList(
          movies: movies,
          onTap: (m) => context.go('/movie/${m.id}'),
          trailingBuilder: (m) => WishlistAddButton(movie: m),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
