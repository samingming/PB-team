# PB Team — Web & Mobile

전체 서비스 개요, 배포, 실행 방법을 모았습니다. 상세한 스택·워크플로우는 각 디렉터리 README를 참고하세요.

## 구성
- `web/` : Vue 3 + TS + Vite (Pinia, Axios, TMDB API)
- `mobile_flutter/` : Flutter + Firebase Auth/Firestore (Riverpod, go_router)

## 배포
- Web: GitHub Pages (`gh-pages` 브랜치). URL 예) `https://<your-org>.github.io/PB-team/` (실제 도메인은 리포 소유자 설정 확인).
- Mobile: 스토어 배포 없음. 로컬/CI 빌드만 수행.

## 환경 변수 / 비밀 키
- Web: `web/.env` → `VITE_TMDB_API_KEY`
- Mobile: `mobile_flutter/lib/app_config.dart`에 기본 값 포함. 필요시 `--dart-define`으로 오버라이드 가능  
  - FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, TMDB_API_KEY, GITHUB_CLIENT_ID, GITHUB_TOKEN_ENDPOINT
- Firebase Android: 최신 `mobile_flutter/android/app/google-services.json` 사용 (SHA-1/256 등록 후 재다운로드)

## 빠른 실행
### Web (개발 서버)
```
cd web
npm install
npm run dev   # http://localhost:5173
```
`.env.example`를 복사해 `.env`를 만들고 TMDB 키를 채우세요.

### Mobile (에뮬레이터)
1) PATH 설정 (새 PowerShell 한 번만)
```
$env:PATH = 'C:\flutter\flutter\bin;C:\PB-team\tools\jdk17\jdk-17.0.13+11\bin;C:\Android\Sdk\platform-tools;C:\Android\Sdk\emulator;C:\Android\Sdk\cmdline-tools\latest\bin;' + $env:PATH
cd C:\PB-team\mobile_flutter
```
2) 의존성: `flutter pub get`
3) 에뮬레이터 실행: `emulator -avd Pixel33 -no-snapshot-load` (AVD 이름에 맞게)  
   - Play Store 이미지 + Google 계정 로그인 권장
4) 앱 실행: `flutter run -d emulator-5554`

## Google 로그인 팁
- 디버그 keystore 지문(SHA-1/256)을 Firebase `com.pbteam.app`에 등록 후 `google-services.json` 교체해야 합니다.  
  지문 추출:
  ```
  keytool -list -v -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore -storepass android -keypass android
  ```
- Play 서비스 최신 상태, 에뮬레이터에 Google 계정 로그인 필요. 보안 잠금(PIN/패턴) 요구 시 간단히 설정 후 진행.

## 위시리스트 동기화
- 웹/모바일 모두 Firestore `wishlists/{uid}` 문서의 `items` 배열 사용 → 같은 계정이면 자동 공유.

## 상세 내비게이션 (모바일)
- 홈/인기/검색/위시리스트 → 상세 이동은 `push`; 상세 AppBar의 X로 이전 화면 복귀.

## 추가 문서
- `web/README.md` : 웹 기술스택, 명령어, Git flow 등 상세
- `mobile_flutter/README.md` : 모바일 실행, 로그인 주의사항 상세
