# Simple Gallery — Design Spec

**Date:** 2026-05-06  
**Status:** Approved

---

## Overview

JSONPlaceholder API를 이용해 photo card 목록을 보여주는 모바일 웹 갤러리.  
초기 4개 노출, 하단 "더 보기" 버튼으로 4개씩 추가 로딩. GitHub Pages에 정적 배포.

---

## Tech Stack

| 항목 | 선택 |
|------|------|
| 프레임워크 | React 18 + Vite |
| UI 라이브러리 | shadcn/ui |
| 스타일 | Tailwind CSS (shadcn 기본 포함) |
| 배포 | GitHub Pages (`gh-pages` 브랜치) |
| 언어 | JavaScript (JSX) |

---

## Features

### 카드 목록
- 2열 반응형 그리드, 뷰포트 풀너비
- 초기 렌더링 시 4개 표시
- 각 카드 구성:
  - `thumbnailUrl` 이미지 (150×150, 정사각형)
  - Album ID 뱃지 (파란색)
  - Photo ID 뱃지 (회색)
  - `title` 텍스트 (말줄임 처리)

### 더 보기
- 그리드 하단 "더 보기" 버튼
- 클릭 시 4개씩 추가 로딩 (`_start`, `_limit` 쿼리 파라미터 활용)
- 5000개(전체) 도달 시 버튼 숨김

### 로딩 / 에러
- 최초 로딩 중: 버튼 비활성화 + 로딩 텍스트
- 더 보기 로딩 중: 버튼 비활성화
- API 에러: 에러 메시지 표시

---

## Architecture

```
src/
  hooks/
    usePhotos.js       ← API 호출 + 페이지네이션 state 관리
  components/
    PhotoCard.jsx      ← 카드 1장 (shadcn Card 기반)
    PhotoGrid.jsx      ← 2열 그리드 레이아웃
  App.jsx              ← 헤더 + PhotoGrid + 더보기 버튼
  main.jsx
  index.css
```

### usePhotos Hook

```js
const { photos, loading, hasMore, loadMore } = usePhotos()
```

- `photos`: 현재까지 로딩된 photo 배열
- `loading`: API 호출 중 여부
- `hasMore`: 더 불러올 항목 존재 여부 (5000개 기준)
- `loadMore()`: 다음 4개 fetch 트리거

내부 동작:
1. 마운트 시 `_start=0&_limit=4` 로 초기 fetch
2. `loadMore()` 호출 시 `_start=현재개수&_limit=4` 로 추가 fetch
3. 응답 배열을 기존 `photos`에 append

### Data Flow

```
usePhotos
  └── App
        ├── PhotoGrid
        │     └── PhotoCard × N
        └── 더보기 버튼
```

---

## API

**Endpoint:** `https://jsonplaceholder.typicode.com/photos`

**Query params:**
- `_start`: 시작 인덱스 (0-based)
- `_limit`: 가져올 개수

**Response item:**
```json
{
  "albumId": 1,
  "id": 1,
  "title": "accusamus beatae ad facilis cum similique qui sunt",
  "url": "https://via.placeholder.com/600/92c952",
  "thumbnailUrl": "https://via.placeholder.com/150/92c952"
}
```

---

## Deployment

- Vite `base` 옵션을 GitHub repo 이름으로 설정: `base: '/simple-gallery/'`
- `npm run build` → `dist/` 생성
- `gh-pages` 패키지로 `dist/` → `gh-pages` 브랜치 자동 배포
- `package.json`에 `deploy` 스크립트 추가: `"deploy": "gh-pages -d dist"`

---

## Out of Scope

- 검색 / 필터
- 다크모드
- 상세 페이지 / 라우팅
- 이미지 클릭 확대
- 무한 스크롤 (Intersection Observer)
