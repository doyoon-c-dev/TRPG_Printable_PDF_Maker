# TRPG Printable PDF Maker

TRPG 세션에서 사용할 지도 이미지를 인쇄 가능한 PDF로 만들어 주는 웹 애플리케이션입니다. 이미지를 업로드하고 격자, 배율, 용지 크기와 여백을 설정한 뒤, 여러 페이지로 나누어 출력할 수 있습니다.

## 프로젝트 소개

큰 지도를 일반 프린터로 출력하려면 이미지를 여러 장에 맞춰 나누고, 격자와 인쇄 여백을 고려해야 합니다. 이 프로젝트는 설정한 용지와 여백에 맞춰 페이지를 계산하고, 격자를 적용한 지도 PDF를 생성해 출력 준비 과정을 간단하게 합니다.

## 주요 기능

- 여러 이미지 업로드 및 이미지 미리보기
- 지도 이미지 확대·이동 및 편집 설정 미리보기
- 격자 표시 여부, 크기, 색상, 선 굵기 설정
- 용지 크기, 인쇄 배율, 상하좌우 여백 설정
- 인쇄 가능 영역에 맞춘 페이지 분할
- 페이지별 미리보기 및 PDF 생성
- 여러 PDF를 하나로 병합해 다운로드
- 이미지 업로드 및 페이지 계산, PDF 생성을 위한 백엔드 API

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React, TypeScript, Vite, Chakra UI |
| Backend | Java 21, Spring Boot, Gradle |
| Image / PDF | HTML Canvas, Apache PDFBox, pdf-lib |
| Infrastructure | AWS EC2 (백엔드) |

## 시스템 구성

```text
사용자 브라우저
  └─ React 애플리케이션 (프론트엔드 배포 환경)
       └─ /api 요청
            └─ Spring Boot API (AWS EC2)
```

프론트엔드에서 지도 편집 설정과 이미지 파일을 API로 전달합니다. 백엔드는 이미지 처리와 페이지 계산, PDF 생성을 수행하고 결과를 반환합니다. 생성된 PDF 병합 및 다운로드는 프론트엔드에서 처리합니다.

### API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/api/images/process` | 업로드 이미지 처리 |
| `POST` | `/api/pages/calculate` | 설정에 따른 페이지 분할 계산 |
| `POST` | `/api/pdfs/generate` | 설정을 적용한 PDF 생성 |

## 실행 방법

### 사전 요구 사항

- Node.js 22 이상 및 npm
- Java 21

### Backend

```bash
cd backend
./gradlew bootRun
```

Windows에서는 다음 명령을 사용할 수 있습니다.

```powershell
cd backend
.\gradlew.bat bootRun
```

백엔드 기본 주소는 `http://localhost:8080`입니다.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

프론트엔드 개발 서버는 `http://localhost:3000`에서 실행되며, `/api` 요청은 로컬 백엔드 `http://localhost:8080`으로 프록시됩니다.

프로덕션 빌드는 다음과 같이 생성합니다.

```bash
cd frontend
npm run build
```

## 배포

- **Backend:** AWS EC2

프론트엔드는 별도 배포 환경에서 제공하며, `/api` 요청은 EC2에서 실행 중인 Spring Boot 서버로 전달됩니다. 배포 환경의 API 주소와 서버 설정은 각 배포 환경에 맞게 관리합니다.

## 저장소 구조

```text
.
├── backend/   # Spring Boot API
└── frontend/  # React + TypeScript 웹 애플리케이션
```

## 향후 개선

- 토큰 제작 기능 구현
- 다양한 용지 규격 및 출력 옵션 추가
- 대용량 이미지 처리 성능 개선

## 문의 및 버그 제보

[GitHub Issues](https://github.com/doyoon-c-dev/TRPG_Printable_PDF_Maker/issues)에 의견이나 버그를 남겨 주세요.

## License

현재 개인 및 학습 목적으로 제작 중인 프로젝트입니다. 별도 라이선스 파일이 추가되기 전까지 사용 및 재배포 조건은 저장소 관리자에게 문의해 주세요.
