# PB Team — Flutter (mobile)

모바일 앱 실행/로그인/위시리스트 동기화용 정리입니다.

## 로컬 실행 (에뮬레이터)
1) 새 PowerShell을 열고 PATH 설정:
```
$env:PATH = 'C:\flutter\flutter\bin;C:\PB-team\tools\jdk17\jdk-17.0.13+11\bin;C:\Android\Sdk\platform-tools;C:\Android\Sdk\emulator;C:\Android\Sdk\cmdline-tools\latest\bin;' + $env:PATH
cd C:\PB-team\mobile_flutter
```
2) 의존성:
```
flutter pub get
```
3) 에뮬레이터(Play Store 이미지) 켜기:
```
emulator -avd Pixel33 -no-snapshot-load   # 이미 AVD가 있다면 이름만 맞춰서 실행
```
4) 앱 실행:
```
flutter run -d emulator-5554
```
`app_config.dart`에 기본 키가 있어 dart-define 없이도 실행됩니다. 필요한 경우 `--dart-define`으로 덮어쓸 수 있습니다.

## Google 로그인 (code 10/패턴 요청 대응)
- 디버그 키스토어 SHA-1/256을 Firebase 콘솔 `com.pbteam.app`에 등록 후 최신 `android/app/google-services.json`으로 교체해야 합니다.
- Play Store 지원 에뮬레이터에서 Google 계정 추가 및 Play 서비스 업데이트 필수.
- 로그인 중 보안 잠금(패턴/PIN) 요구가 뜨면 에뮬레이터 설정 > 보안에서 간단한 잠금 설정 후 진행하면 됩니다.

## 위시리스트 동기화
- 웹/모바일 모두 Firestore `wishlists/{uid}` 문서의 `items` 배열을 사용하므로 같은 계정이면 그대로 공유됩니다.

## 상세 화면 내비게이션
- 목록/탭에서 영화 상세 이동은 push로 열리며, 상세 AppBar X 버튼을 누르면 이전 화면으로 돌아갑니다.
