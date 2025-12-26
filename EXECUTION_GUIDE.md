# 실행 가이드 (Web & Mobile)

## 공통
- 리포지토리 클론: `git clone <repo-url>`
- 루트 기준 경로: `web/`, `mobile_flutter/`

## Web (Vue 3 + Vite)
1) 요구사항: Node.js 18+ / npm
2) 의존성 설치
```
cd web
npm install
```
3) 환경변수
- `.env.example` 복사 → `.env`
- `VITE_TMDB_API_KEY` 채우기
4) 실행
```
npm run dev   # http://localhost:5173
```

## Mobile (Flutter)
1) 요구사항
- Flutter SDK 설치 (PATH 포함)
- Android SDK/AVD 준비, Play Store 이미지 권장
2) PATH 예시 (PowerShell)
```
$env:PATH = 'C:\flutter\flutter\bin;C:\PB-team\tools\jdk17\jdk-17.0.13+11\bin;C:\Android\Sdk\platform-tools;C:\Android\Sdk\emulator;C:\Android\Sdk\cmdline-tools\latest\bin;' + $env:PATH
```
3) 의존성
```
cd C:\PB-team\mobile_flutter
flutter pub get
```
4) 환경/키
- `lib/app_config.dart`에 기본 키 포함 (dart-define 없이 실행 가능)
- `android/app/google-services.json` 최신본 필요 (Firebase SHA 등록 후 다운로드)
5) 에뮬레이터 실행
```
emulator -avd Pixel33 -no-snapshot-load   # AVD 이름에 맞게
```
6) 앱 실행
```
flutter run -d emulator-5554
```

## 흔한 이슈 메모
- Google 로그인 code 10: 디버그 keystore SHA-1/256을 Firebase에 등록 후 `google-services.json` 교체.
- 로그인 시 보안 잠금 요구: 에뮬레이터 설정에서 간단한 PIN/패턴 설정 후 재시도.
- 위시리스트 동기화: 웹/모바일 모두 Firestore `wishlists/{uid}` 문서의 `items` 배열 사용 → 같은 계정이면 자동 공유.
