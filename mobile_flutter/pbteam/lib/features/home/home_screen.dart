import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../movies/providers/now_playing_provider.dart';
import '../movies/providers/top_rated_provider.dart';
import '../movies/widgets/movie_list.dart';
import '../root/widgets/yeemin_app_bar.dart';
import '../wishlist/widgets/wishlist_add_button.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nowPlaying = ref.watch(nowPlayingProvider);
    final topRated = ref.watch(topRatedProvider);

    return Scaffold(
      appBar: const YeeminAppBar(),
      body: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.all(12.0),
            child: Text('Now Playing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          SizedBox(
            height: 320,
            child: nowPlaying.when(
              data: (movies) => MovieList(
                movies: movies,
                onTap: (m) => context.go('/movie/${m.id}'),
                trailingBuilder: (m) => WishlistAddButton(movie: m),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(12.0),
            child: Text('Top Rated', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          SizedBox(
            height: 320,
            child: topRated.when(
              data: (movies) => MovieList(
                movies: movies,
                onTap: (m) => context.go('/movie/${m.id}'),
                trailingBuilder: (m) => WishlistAddButton(movie: m),
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
