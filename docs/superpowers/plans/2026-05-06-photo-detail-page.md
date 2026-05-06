# Photo Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카드 클릭 시 `/photos/:id` URL로 이동하는 상세 페이지를 추가한다.

**Architecture:** react-router-dom의 `HashRouter`를 사용해 라우팅 설정 (gh-pages 호환). App.tsx는 라우터+라우트 선언만 담당하고, 갤러리 로직은 GalleryPage.tsx로 분리한다. PhotoDetailPage는 JSONPlaceholder `/photos/:id` 엔드포인트를 직접 fetch하며 카드형 레이아웃(이미지 + 정보 카드 패널)으로 표시한다.

**Tech Stack:** React 19, react-router-dom v7, TypeScript, Tailwind v4, shadcn/ui, Vitest + Testing Library

---

## File Map

| 상태 | 파일 | 역할 |
|------|------|------|
| 수정 | `src/lib/api.ts` | `normalizePhoto` 헬퍼 추출 |
| 수정 | `src/hooks/usePhotos.ts` | `normalizePhoto` 사용으로 교체 |
| 신규 | `src/pages/GalleryPage.tsx` | 기존 App.tsx 갤러리 내용 이동 |
| 수정 | `src/App.tsx` | HashRouter + Routes 선언으로 교체 |
| 수정 | `src/components/PhotoCard.tsx` | Link 래핑 추가 |
| 수정 | `src/components/PhotoCard.test.tsx` | MemoryRouter 래핑 + Link 테스트 |
| 신규 | `src/pages/PhotoDetailPage.tsx` | 상세 페이지 컴포넌트 |
| 신규 | `src/pages/PhotoDetailPage.test.tsx` | 상세 페이지 테스트 |

---

## Task 1: react-router-dom 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 패키지 설치**

```bash
npm install react-router-dom
```

Expected: `package.json`의 `dependencies`에 `react-router-dom` 추가됨

- [ ] **Step 2: 설치 확인**

```bash
npm ls react-router-dom
```

Expected: 버전 출력 (예: `react-router-dom@7.x.x`)

---

## Task 2: normalizePhoto 헬퍼 추출

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/hooks/usePhotos.ts`

현재 `usePhotos.ts`에 인라인으로 있는 via.placeholder.com → picsum 변환 로직을 공유 헬퍼로 분리한다. 상세 페이지에서도 동일한 정규화가 필요하기 때문이다.

- [ ] **Step 1: api.ts에 normalizePhoto 추가**

`src/lib/api.ts`를 다음으로 교체:

```ts
import type { Photo } from '../types/photo'

export const API_BASE = 'https://jsonplaceholder.typicode.com/photos'
export const PAGE_SIZE = 4
export const TOTAL_PHOTOS = 5000

export function normalizePhoto(photo: Photo): Photo {
  return {
    ...photo,
    thumbnailUrl: photo.thumbnailUrl.includes('via.placeholder.com')
      ? `https://picsum.photos/seed/${photo.id}/150`
      : photo.thumbnailUrl,
    url: photo.url.includes('via.placeholder.com')
      ? `https://picsum.photos/seed/${photo.id}/600`
      : photo.url,
  }
}
```

- [ ] **Step 2: usePhotos.ts에서 normalizePhoto 사용**

`src/hooks/usePhotos.ts`의 import 라인과 정규화 부분을 변경:

```ts
import { API_BASE, PAGE_SIZE, TOTAL_PHOTOS, normalizePhoto } from '../lib/api'
```

그리고 fetch 결과 처리 부분:

```ts
const data: Photo[] = await res.json()
if (signal?.aborted) return
setPhotos(prev => [...prev, ...data.map(normalizePhoto)])
```

(기존의 인라인 `const normalized = data.map(photo => ...)` 블록 전체를 위 한 줄로 교체)

- [ ] **Step 3: 기존 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add src/lib/api.ts src/hooks/usePhotos.ts
git commit -m "refactor: extract normalizePhoto helper to api.ts"
```

---

## Task 3: GalleryPage 분리

**Files:**
- Create: `src/pages/GalleryPage.tsx`

- [ ] **Step 1: GalleryPage.tsx 생성**

`src/pages/GalleryPage.tsx`:

```tsx
import { usePhotos } from '../hooks/usePhotos'
import { PhotoGrid } from '../components/PhotoGrid'
import { Button } from '@/components/ui/button'

export function GalleryPage() {
  const { photos, loading, error, hasMore, loadMore } = usePhotos()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="text-lg font-bold tracking-tight">Simple Gallery</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {photos.length === 0 && loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}

        {error ? (
          <div className="px-3 py-2">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        ) : null}

        {hasMore ? (
          <div className="px-3 pb-8">
            <Button
              className="w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '더 보기'}
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/pages/GalleryPage.tsx
git commit -m "refactor: extract GalleryPage from App"
```

---

## Task 4: App.tsx를 라우터로 교체

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: App.tsx를 HashRouter + Routes로 교체**

`src/App.tsx` 전체를 다음으로 교체:

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom'
import { GalleryPage } from './pages/GalleryPage'
import { PhotoDetailPage } from './pages/PhotoDetailPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/photos/:id" element={<PhotoDetailPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
```

> Note: `PhotoDetailPage`는 Task 6에서 만든다. 이 시점엔 빈 컴포넌트를 임시로 만든다.

- [ ] **Step 2: 임시 PhotoDetailPage 생성 (빌드 오류 방지)**

`src/pages/PhotoDetailPage.tsx`:

```tsx
export function PhotoDetailPage() {
  return <div>PhotoDetailPage</div>
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없이 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add src/App.tsx src/pages/PhotoDetailPage.tsx
git commit -m "feat: set up HashRouter with gallery and detail routes"
```

---

## Task 5: PhotoCard에 Link 추가

**Files:**
- Modify: `src/components/PhotoCard.tsx`
- Modify: `src/components/PhotoCard.test.tsx`

- [ ] **Step 1: 테스트에 MemoryRouter 래핑 추가**

`src/components/PhotoCard.test.tsx`를 다음으로 교체:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PhotoCard } from './PhotoCard'
import type { Photo } from '../types/photo'

const mockPhoto: Photo = {
  albumId: 3,
  id: 42,
  title: 'accusamus beatae ad facilis',
  url: 'https://via.placeholder.com/600/92c952',
  thumbnailUrl: 'https://via.placeholder.com/150/92c952',
}

function renderCard() {
  return render(
    <MemoryRouter>
      <PhotoCard photo={mockPhoto} />
    </MemoryRouter>
  )
}

describe('PhotoCard', () => {
  it('이미지를 렌더링한다', () => {
    renderCard()
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockPhoto.thumbnailUrl)
    expect(img).toHaveAttribute('alt', mockPhoto.title)
  })

  it('제목을 렌더링한다', () => {
    renderCard()
    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument()
  })

  it('Album 뱃지를 렌더링한다', () => {
    renderCard()
    expect(screen.getByText('Album 3')).toBeInTheDocument()
  })

  it('Photo ID 뱃지를 렌더링한다', () => {
    renderCard()
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('상세 페이지 링크를 가진다', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/photos/42')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm run test:run -- PhotoCard
```

Expected: `상세 페이지 링크를 가진다` 테스트 FAIL (Link 없음)

- [ ] **Step 3: PhotoCard에 Link 추가**

`src/components/PhotoCard.tsx` 전체를 다음으로 교체:

```tsx
import type { SyntheticEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Photo } from '../types/photo'

interface PhotoCardProps {
  photo: Photo
}

function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const id = e.currentTarget.dataset.photoId
  e.currentTarget.src = `https://picsum.photos/seed/${id}/150`
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Link to={`/photos/${photo.id}`} className="block">
      <Card className="overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 300px' }}>
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          className="w-full aspect-square object-cover"
          loading="lazy"
          data-photo-id={photo.id}
          onError={handleImgError}
        />
        <CardContent className="p-2">
          <div className="flex gap-1 mb-1 flex-wrap">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Album {photo.albumId}
            </Badge>
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              #{photo.id}
            </Badge>
          </div>
          <p className="text-xs font-medium leading-tight line-clamp-2">
            {photo.title}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- PhotoCard
```

Expected: 5개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/components/PhotoCard.tsx src/components/PhotoCard.test.tsx
git commit -m "feat: add Link to PhotoCard for detail page navigation"
```

---

## Task 6: PhotoDetailPage 구현

**Files:**
- Create: `src/pages/PhotoDetailPage.test.tsx`
- Modify: `src/pages/PhotoDetailPage.tsx`

- [ ] **Step 1: PhotoDetailPage 테스트 작성**

`src/pages/PhotoDetailPage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PhotoDetailPage } from './PhotoDetailPage'

const mockPhoto = {
  albumId: 3,
  id: 42,
  title: 'accusamus beatae ad facilis',
  url: 'https://picsum.photos/seed/42/600',
  thumbnailUrl: 'https://picsum.photos/seed/42/150',
}

function renderDetail(id = '42') {
  return render(
    <MemoryRouter initialEntries={[`/photos/${id}`]}>
      <Routes>
        <Route path="/photos/:id" element={<PhotoDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockPhoto,
  } as Response)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PhotoDetailPage', () => {
  it('로딩 중 텍스트를 보여준다', () => {
    renderDetail()
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('사진 로드 후 제목을 보여준다', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument()
    })
  })

  it('사진 로드 후 이미지를 보여준다', async () => {
    renderDetail()
    await waitFor(() => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', mockPhoto.url)
      expect(img).toHaveAttribute('alt', mockPhoto.title)
    })
  })

  it('Album 뱃지를 보여준다', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText('Album 3')).toBeInTheDocument()
    })
  })

  it('fetch 실패 시 에러 메시지를 보여준다', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
    } as Response)
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText(/HTTP 404/)).toBeInTheDocument()
    })
  })

  it('갤러리로 돌아가는 링크를 가진다', async () => {
    renderDetail()
    await waitFor(() => {
      expect(screen.getByText(mockPhoto.title)).toBeInTheDocument()
    })
    const backLink = screen.getByRole('link', { name: /Simple Gallery/ })
    expect(backLink).toHaveAttribute('href', '/')
  })
})
```

- [ ] **Step 2: 테스트 실행 (실패 확인)**

```bash
npm run test:run -- PhotoDetailPage
```

Expected: 여러 테스트 FAIL (임시 컴포넌트만 있으므로)

- [ ] **Step 3: PhotoDetailPage 구현**

`src/pages/PhotoDetailPage.tsx` 전체를 다음으로 교체:

```tsx
import type { SyntheticEvent } from 'react'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Photo } from '../types/photo'
import { API_BASE, normalizePhoto } from '../lib/api'

function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const id = e.currentTarget.dataset.photoId
  e.currentTarget.src = `https://picsum.photos/seed/${id}/600`
}

export function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Photo>
      })
      .then(data => {
        setPhoto(normalizePhoto(data))
        setLoading(false)
      })
      .catch(e => {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '불러오기 실패')
        setLoading(false)
      })

    return () => controller.abort()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <Link to="/" className="text-sm font-medium flex items-center gap-1">
            ← Simple Gallery
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : photo ? (
          <>
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full aspect-square object-cover"
              data-photo-id={photo.id}
              onError={handleImgError}
            />
            <Card className="m-3">
              <CardContent className="p-4">
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary">Album {photo.albumId}</Badge>
                  <Badge variant="outline">#{photo.id}</Badge>
                </div>
                <p className="font-medium text-sm leading-relaxed">{photo.title}</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/pages/PhotoDetailPage.tsx src/pages/PhotoDetailPage.test.tsx
git commit -m "feat: add PhotoDetailPage with card layout"
```

---

## 완료 확인

- [ ] `npm run test:run` — 전체 PASS
- [ ] `npm run build` — 빌드 성공
- [ ] 개발 서버에서 카드 클릭 → 상세 페이지 이동 확인
- [ ] 상세 페이지에서 뒤로가기 링크 동작 확인
