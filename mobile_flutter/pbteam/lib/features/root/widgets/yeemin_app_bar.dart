import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/auth_state.dart';
import '../../settings/ui_settings.dart';

const _accent = Color(0xFFE50914);

class YeeminAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const YeeminAppBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).colorScheme;
    final ui = ref.watch(uiSettingsProvider);
    final uiCtrl = ref.read(uiSettingsProvider.notifier);
    return AppBar(
      automaticallyImplyLeading: false,
      centerTitle: true,
      backgroundColor: colors.surface,
      surfaceTintColor: Colors.transparent,
      elevation: 1,
      toolbarHeight: kToolbarHeight + 4,
      title: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => context.go('/home'),
        child: Text(
          'YEEMIN',
          style: TextStyle(
            color: _accent,
            fontWeight: FontWeight.w800,
            fontSize: 22,
          ),
        ),
      ),
      actions: [
        _SettingsMenu(
          colors: colors,
          ui: ui,
          onThemeChange: uiCtrl.setThemeMode,
          onFontDown: uiCtrl.decreaseFont,
          onFontUp: uiCtrl.increaseFont,
          onToggleMotion: uiCtrl.toggleReduceMotion,
          onLogout: () async {
            await ref.read(authStateProvider.notifier).signOut();
            if (context.mounted) context.go('/auth');
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 4);
}

class _SettingsMenu extends StatelessWidget {
  const _SettingsMenu({
    required this.colors,
    required this.ui,
    required this.onThemeChange,
    required this.onFontDown,
    required this.onFontUp,
    required this.onToggleMotion,
    required this.onLogout,
  });

  final ColorScheme colors;
  final UiSettings ui;
  final ValueChanged<ThemeMode> onThemeChange;
  final VoidCallback onFontDown;
  final VoidCallback onFontUp;
  final VoidCallback onToggleMotion;
  final Future<void> Function() onLogout;

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<_SettingsAction>(
      tooltip: 'Settings',
      position: PopupMenuPosition.under,
      onSelected: (action) async {
        switch (action) {
          case _SettingsAction.themeLight:
            onThemeChange(ThemeMode.light);
            break;
          case _SettingsAction.themeDark:
            onThemeChange(ThemeMode.dark);
            break;
          case _SettingsAction.fontDown:
            onFontDown();
            break;
          case _SettingsAction.fontUp:
            onFontUp();
            break;
          case _SettingsAction.toggleMotion:
            onToggleMotion();
            break;
          case _SettingsAction.logout:
            await onLogout();
            break;
        }
      },
      itemBuilder: (context) => [
        const PopupMenuItem(
          enabled: false,
          child: Text(
            'Settings',
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
        ),
        CheckedPopupMenuItem(
          value: _SettingsAction.themeLight,
          checked: ui.themeMode == ThemeMode.light,
          child: const _MenuRow(
            icon: Icons.light_mode_outlined,
            label: '라이트 테마',
          ),
        ),
        CheckedPopupMenuItem(
          value: _SettingsAction.themeDark,
          checked: ui.themeMode == ThemeMode.dark,
          child: const _MenuRow(
            icon: Icons.dark_mode_outlined,
            label: '다크 테마',
          ),
        ),
        PopupMenuItem(
          enabled: false,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.text_fields, size: 18),
              const SizedBox(width: 10),
              Text('폰트 ${ui.fontLevel}/7'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: _SettingsAction.fontDown,
          child: _MenuRow(icon: Icons.remove, label: '폰트 작게'),
        ),
        const PopupMenuItem(
          value: _SettingsAction.fontUp,
          child: _MenuRow(icon: Icons.add, label: '폰트 크게'),
        ),
        CheckedPopupMenuItem(
          value: _SettingsAction.toggleMotion,
          checked: ui.reduceMotion,
          child: const _MenuRow(
            icon: Icons.motion_photos_off,
            label: '모션 줄이기',
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: _SettingsAction.logout,
          child: _MenuRow(icon: Icons.logout, label: 'Log out'),
        ),
      ],
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: colors.outlineVariant),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.settings_outlined, color: colors.onSurface, size: 18),
            const SizedBox(width: 6),
            Text(
              'Settings',
              style: TextStyle(
                color: colors.onSurface,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18),
        const SizedBox(width: 10),
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

enum _SettingsAction {
  themeLight,
  themeDark,
  fontDown,
  fontUp,
  toggleMotion,
  logout,
}
