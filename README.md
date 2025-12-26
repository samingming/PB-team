# PB Team — Web & Mobile

전체 프로젝트 개요와 각 앱 실행 방법을 한곳에 모았습니다.

## 구성
- `web/` : Vue 3 + TS + Vite 기반 TMDB 클라이언트 (Pinia, Axios)
- `mobile_flutter/` : Flutter 앱 (Firebase Auth/Firestore, Riverpod, go_router)

## 빠른 실행
### Web (개발 서버)
```
cd web
npm install
npm run dev   # http://localhost:5173
```
`.env.example` 복사 → `.env` 생성 후 `VITE_TMDB_API_KEY` 채워주세요.

### Mobile (에뮬레이터)
1) PATH 설정 (새 PowerShell 한 번만):
```
$env:PATH = 'C:\flutter\flutter\bin;C:\PB-team\tools\jdk17\jdk-17.0.13+11\bin;C:\Android\Sdk\platform-tools;C:\Android\Sdk\emulator;C:\Android\Sdk\cmdline-tools\latest\bin;' + $env:PATH
cd C:\PB-team\mobile_flutter
```
2) 의존성: `flutter pub get`
3) 에뮬레이터 실행: `emulator -avd Pixel33 -no-snapshot-load` (AVD 이름에 맞게)
4) 앱 실행: `flutter run -d emulator-5554`

`app_config.dart`에 기본 키가 포함되어 있어 dart-define 없이 실행됩니다. 필요 시 `--dart-define`으로 오버라이드 가능합니다.

## 인증/위시리스트 동기화
- 모바일/웹 모두 Firestore `wishlists/{uid}` 문서의 `items` 배열을 사용하므로 같은 계정이면 위시리스트가 공유됩니다.
- Google 로그인: 디버그 keystore SHA-1/256을 Firebase `com.pbteam.app`에 등록 후 최신 `android/app/google-services.json` 사용. Play Store 이미지 에뮬레이터에서 Google 계정 추가 및 Play 서비스 최신 상태 유지. 보안 잠금 요구 시 간단한 PIN/패턴 설정 후 진행.

## 상세 내비게이션 (모바일)
- 홈/인기/검색/위시리스트 → 상세 이동은 `push`로 열립니다. 상세 AppBar의 X 버튼으로 이전 화면으로 정상 복귀합니다.

## 추가 문서
- `web/README.md` : 웹 기술스택, 명령어, Git flow 등 상세
- `mobile_flutter/README.md` : 모바일 실행, 로그인 주의사항 상세
