import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/firebase_providers.dart';

class WishlistItem {
  WishlistItem({
    required this.id,
    required this.movieId,
    required this.title,
    required this.posterUrl,
    required this.createdAt,
  });

  final String id;
  final int movieId;
  final String title;
  final String posterUrl;
  final DateTime createdAt;

  Map<String, dynamic> toJson() {
    return {
      // Align schema with web: wishlists/{uid} doc, items array
      'id': movieId,
      'title': title,
      'poster_path': _extractPosterPath(posterUrl),
      'poster': posterUrl,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }

  factory WishlistItem.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? {};
    return WishlistItem(
      id: doc.id,
      movieId: data['movieId'] as int,
      title: data['title'] as String? ?? '',
      posterUrl: data['posterUrl'] as String? ?? '',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  factory WishlistItem.fromMap(Map<String, dynamic> data) {
    final rawId = data['id'] ?? data['movieId'];
    final movieId = rawId is int
        ? rawId
        : rawId is num
            ? rawId.toInt()
            : int.tryParse(rawId?.toString() ?? '') ?? 0;
    final posterPath = data['poster_path'] as String?;
    final poster = data['poster'] as String?;
    final fallback = data['posterUrl'] as String? ?? '';
    final posterUrl = poster ??
        (posterPath != null && posterPath.isNotEmpty
            ? 'https://image.tmdb.org/t/p/w500$posterPath'
            : fallback);
    return WishlistItem(
      id: (data['id'] ?? data['docId'] ?? movieId.toString()).toString(),
      movieId: movieId,
      title: data['title'] as String? ?? '',
      posterUrl: posterUrl,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

class WishlistRepository {
  WishlistRepository(this._firestore, this._auth);

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  DocumentReference<Map<String, dynamic>> _docFor(String uid) =>
      _firestore.collection('wishlists').doc(uid);

  Stream<List<WishlistItem>> watchWishlist() {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return const Stream.empty();
    return _docFor(uid).snapshots().map((snap) {
      final items = (snap.data()?['items'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(WishlistItem.fromMap)
          .toList();
      items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return items;
    });
  }

  Future<void> add(int movieId, String title, String posterUrl) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw StateError('Not signed in');
    final item = WishlistItem(
      id: movieId.toString(),
      movieId: movieId,
      title: title,
      posterUrl: posterUrl,
      createdAt: DateTime.now(),
    ).toJson();
    await _docFor(uid).set(
      {
        'items': FieldValue.arrayUnion([item]),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> remove(String id) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw StateError('Not signed in');
    final doc = await _docFor(uid).get();
    final items = (doc.data()?['items'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .toList();
    final updated = items.where((e) {
      final rawId = e['id'] ?? e['movieId'];
      final match = (rawId ?? '').toString() == id;
      return !match;
    }).toList();
    await _docFor(uid).set({'items': updated}, SetOptions(merge: true));
  }
}

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  final firestore = ref.watch(firestoreProvider);
  final auth = ref.watch(firebaseAuthProvider);
  return WishlistRepository(firestore, auth);
});

String? _extractPosterPath(String? poster) {
  if (poster == null || poster.isEmpty) return null;
  final match = RegExp(r'image\.tmdb\.org\/t\/p\/[^/]+(\/.*)$').firstMatch(poster);
  if (match != null) return match.group(1);
  return null;
}
