# 🎨 Design Token Sync Server

Figma 디자인 토큰을 자동으로 CSS, SCSS, JavaScript 파일로 변환하고 GitHub PR을 생성하는 자동화 서버입니다.

## ✨ 주요 기능

- **🔄 자동화된 워크플로우**: 파일 업로드 → CSS 변환 → GitHub PR 생성까지 원클릭으로 처리
- **📁 다중 포맷 지원**: CSS Variables, SCSS Variables, JavaScript ES6 모듈 동시 생성
- **🚀 GitHub 통합**: 자동 브랜치 생성, PR 생성, 라벨 추가
- **📊 실시간 진행 상황**: 프로그레스 바와 단계별 상태 표시
- **🔒 안전한 업로드**: JSON 파일 검증 및 중복 업로드 방지

## 🏗️ 프로젝트 구조

```
design-token-sync2/
├── public/
│   └── index.html          # 웹 인터페이스
├── src/
│   ├── server.js           # Express 서버
│   ├── tokenProcessor.js   # Style Dictionary 처리
│   └── githubService.js    # GitHub API 연동
├── uploads/                # 업로드된 토큰 파일
├── output/                 # 생성된 CSS/SCSS/JS 파일
├── .github/workflows/
│   └── design-token-sync.yml # GitHub Actions 워크플로우
├── config.js               # Style Dictionary 설정
├── .env.example           # 환경변수 예시
└── package.json
```

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd design-token-sync2
npm install
```

### 2. 환경변수 설정

`.env.example`을 `.env`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env
```

```env
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main
```

#### GitHub Token 생성 방법:
1. GitHub Settings → Developer settings → Personal access tokens
2. "Generate new token" 클릭
3. 필요한 권한 선택:
   - `repo` (전체 저장소 접근)
   - `workflow` (GitHub Actions 수정)

### 3. 서버 실행

```bash
# 프로덕션 모드
npm start

# 개발 모드 (nodemon 사용)
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📋 사용 방법

### 웹 인터페이스 사용

1. **브라우저에서 `http://localhost:3000` 접속**
2. **Figma 토큰 JSON 파일 선택**
3. **"파일 업로드" 버튼 클릭**
4. **자동으로 처리되는 과정 확인**:
   - 30%: 파일 업로드 완료
   - 60%: CSS 변환 진행 중
   - 100%: GitHub PR 생성 완료

### API 엔드포인트

#### `POST /upload`
Figma 토큰 JSON 파일을 업로드합니다.

```bash
curl -X POST -F "tokens=@your-tokens.json" http://localhost:3000/upload
```

#### `POST /build-css`
업로드된 파일을 CSS/SCSS/JS로 변환하고 GitHub PR을 생성합니다.

```bash
curl -X POST -H "Content-Type: application/json" \
     -d '{"filename":"tokens-1234567890.json"}' \
     http://localhost:3000/build-css
```

#### `GET /status`
서버 상태를 확인합니다.

```bash
curl http://localhost:3000/status
```

## 🔧 기술 스택

- **Backend**: Node.js, Express.js
- **파일 업로드**: Multer
- **토큰 변환**: Style Dictionary
- **GitHub API**: Octokit
- **자동화**: GitHub Actions
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## 📦 생성되는 파일 형식

### CSS Variables (`output/tokens.css`)
```css
:root {
  --color-primary: #007bff;
  --size-spacing-md: 16px;
  --font-family-heading: 'Inter', sans-serif;
}
```

### SCSS Variables (`output/tokens.scss`)
```scss
$color-primary: #007bff;
$size-spacing-md: 16px;
$font-family-heading: 'Inter', sans-serif;
```

### JavaScript ES6 (`output/tokens.js`)
```javascript
export const colorPrimary = '#007bff';
export const sizeSpacingMd = '16px';
export const fontFamilyHeading = 'Inter, sans-serif';
```

## 🔄 GitHub Actions 워크플로우

프로젝트에는 자동화된 GitHub Actions 워크플로우가 포함되어 있습니다:

- **트리거**: `uploads/`, `output/` 폴더의 파일 변경 시
- **자동 처리**:
  1. 변경 사항 감지
  2. PR 생성 및 라벨 추가
  3. 자동 브랜치 정리

## 🛠️ 개발

### 로컬 개발 환경

```bash
# 개발 서버 실행 (파일 변경 시 자동 재시작)
npm run dev

# Style Dictionary 직접 실행
npm run build-tokens
```

### 프로젝트 확장

1. **새로운 출력 형식 추가**: `config.js`에서 새로운 플랫폼 정의
2. **커스텀 변환 규칙**: `src/tokenProcessor.js`에서 transform 함수 추가
3. **추가 GitHub 기능**: `src/githubService.js`에서 새로운 메서드 구현

## 🔍 트러블슈팅

### 일반적인 문제들

**Q: GitHub Token 권한 오류**
- GitHub Token에 `repo` 권한이 있는지 확인
- Token이 올바르게 `.env` 파일에 설정되었는지 확인

**Q: 파일 업로드 실패**
- JSON 파일 형식인지 확인
- 파일 크기 제한 확인 (기본값: 제한 없음)

**Q: GitHub Actions 실패**
- Repository Settings에서 Actions 권한 확인
- `GITHUB_TOKEN` 권한 범위 확인

### 로그 확인

서버 로그에서 상세한 오류 정보를 확인할 수 있습니다:

```bash
npm run dev  # 개발 모드에서 상세 로그 확인
```

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with ❤️ for Design System Teams**
