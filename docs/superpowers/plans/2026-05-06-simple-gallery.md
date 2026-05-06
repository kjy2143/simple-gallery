# Simple Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JSONPlaceholder API로 photo card를 2열 그리드로 보여주는 모바일 웹 갤러리 (초기 4개, 더보기 4개씩)

**Architecture:** `usePhotos` 커스텀 훅이 API 호출과 페이지네이션 state를 담당하고, App → PhotoGrid → PhotoCard 컴포넌트 트리가 렌더링을 담당. shadcn/ui Card, Badge, Button 컴포넌트 활용.

**Tech Stack:** React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS, Vitest, GitHub Pages

---

## File Map

| 파일 | 역할 |
|------|------|
| `src/types/photo.ts` | Photo 인터페이스 |
| `src/hooks/usePhotos.ts` | API fetch + 페이지네이션 state + 에러 처리 |
| `src/hooks/usePhotos.test.ts` | usePhotos 유닛 테스트 |
| `src/components/PhotoCard.tsx` | 카드 1장 (shadcn Card 기반) |
| `src/components/PhotoCard.test.tsx` | PhotoCard 렌더링 테스트 |
| `src/components/PhotoGrid.tsx` | 2열 그리드 레이아웃 |
| `src/App.tsx` | 헤더 + PhotoGrid + 더보기 버튼 |
| `src/test/setup.ts` | Vitest 글로벌 setup |
| `vite.config.ts` | Vite + Vitest 설정, base path |
| `package.json` | deploy 스크립트 |

---

## Task 1: Vite + React + TypeScript 프로젝트 초기화

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`, `index.html`

- [ ] **Step 1: Vite 프로젝트 생성**

```bash
cd /Users/honest/Sites/github/public/kjy2143/simple-gallery
npm create vite@latest . -- --template react-ts
```

`현재 디렉토리에 파일이 있습니다` 경고가 나오면 `y`로 진행.

- [ ] **Step 2: 의존성 설치**

```bash
npm install
```

- [ ] **Step 3: 개발 서버 동작 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열어 Vite 기본 페이지 확인. 확인 후 `Ctrl+C`.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: init vite react-ts project"
```

---

## Task 2: shadcn/ui + Tailwind 설정

**Files:**
- Modify: `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`
- Create: `components.json`, `src/lib/utils.ts`, `src/index.css`

- [ ] **Step 1: shadcn 초기화 (대화형)**

```bash
npx shadcn@latest init
```

아래와 같이 답변:
- Which style would you like to use? → **Default**
- Which color would you like to use as the base color? → **Neutral**
- Would you like to use CSS variables for colors? → **yes**

완료 후 `components.json`, `src/lib/utils.ts`, `src/index.css` 생성됨.

- [ ] **Step 2: 필요한 shadcn 컴포넌트 추가**

```bash
npx shadcn@latest add card badge button
```

`src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/button.tsx` 생성됨.

- [ ] **Step 3: Vitest + Testing Library 설치**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 4: gh-pages 설치**

```bash
npm install -D gh-pages
```

- [ ] **Step 5: `vite.config.ts` 업데이트**

`vite.config.ts`를 아래로 교체:

```ts
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/simple-gallery/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 6: `tsconfig.app.json`에 Vitest 타입 추가**

`tsconfig.app.json`의 `compilerOptions.types` 배열에 `"vitest/globals"` 추가:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

`compilerOptions`에 `types` 배열이 없으면 추가, 있으면 `"vitest/globals"`를 append.

- [ ] **Step 7: Vitest setup 파일 생성**

```
src/test/setup.ts
```

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: `package.json`에 test/deploy 스크립트 추가**

`package.json`의 `scripts`에 추가:

```json
"test": "vitest",
"test:run": "vitest run",
"deploy": "npm run build && gh-pages -d dist"
```

- [ ] **Step 9: 빌드 확인**

```bash
npm run build
```

`dist/` 디렉토리 생성되고 에러 없이 완료되어야 함.

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "chore: setup shadcn, tailwind, vitest, gh-pages"
```

---

## Task 3: Photo 타입 정의

**Files:**
- Create: `src/types/photo.ts`

- [ ] **Step 1: Photo 인터페이스 작성**

```
src/types/photo.ts
```

```ts
export interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}
```

- [ ] **Step 2: API 상수 파일 작성**

```
src/lib/api.ts
```

```ts
export const API_BASE = 'https://jsonplaceholder.typicode.com/photos'
export const PAGE_SIZE = 4
export const TOTAL_PHOTOS = 5000
```

- [ ] **Step 3: 커밋**

```bash
git add src/types/photo.ts src/lib/api.ts
git commit -m "feat: add Photo type and API constants"
```

---

## Task 4: usePhotos 커스텀 훅 (TDD)

**Files:**
- Create: `src/hooks/usePhotos.ts`, `src/hooks/usePhotos.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```
src/hooks/usePhotos.test.ts
```

```ts
import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePhotos } from './usePhotos'
import { PAGE_SIZE } from '../lib/api'

const makeMockPhotos = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    albumId: 1,
    id: start + i + 1,
    title: `photo ${start + i + 1}`,
    url: `https://example.com/${start + i + 1}`,
    thumbnailUrl: `https://example.com/thumb/${start + i + 1}`,
  }))

beforeEach(() => {
  vi.resetAllMocks()
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(makeMockPhotos(0, PAGE_SIZE)),
  } as unknown as Response)
})

describe('usePhotos', () => {
  it('마운트 시 4개 사진을 로딩한다', async () => {
    const { result } = renderHook(() => usePhotos())

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.photos).toHaveLength(4)
    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/photos?_start=0&_limit=4'
    )
  })

  it('loadMore 호출 시 4개를 추가로 불러온다', async () => {
    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.photos).toHaveLength(4))

    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(makeMockPhotos(4, PAGE_SIZE)),
    } as unknown as Response)

    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.photos).toHaveLength(8))

    expect(fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/photos?_start=4&_limit=4'
    )
  })

  it('5000개 미만일 때 hasMore는 true이다', async () => {
    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(true)
  })

  it('로딩 중일 때 loading은 true이다', async () => {
    let resolveJson!: (v: unknown) => void
    global.fetch = vi.fn().mockResolvedValue({
      json: () => new Promise(res => { resolveJson = res }),
    } as unknown as Response)

    const { result } = renderHook(() => usePhotos())
    expect(result.current.loading).toBe(true)

    act(() => resolveJson(makeMockPhotos(0, PAGE_SIZE)))
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('API 실패 시 error 메시지를 반환한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve([]),
    } as unknown as Response)

    const { result } = renderHook(() => usePhotos())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('HTTP 500')
    expect(result.current.photos).toHaveLength(0)
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test:run -- src/hooks/usePhotos.test.ts
```

Expected: FAIL with `Cannot find module './usePhotos'`

- [ ] **Step 3: usePhotos 훅 구현**

```
src/hooks/usePhotos.ts
```

```ts
import { useState, useEffect } from 'react'
import { Photo } from '../types/photo'
import { API_BASE, PAGE_SIZE, TOTAL_PHOTOS } from '../lib/api'

interface UsePhotosResult {
  photos: Photo[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
}

export function usePhotos(): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [start, setStart] = useState(0)

  const fetchPhotos = async (startIndex: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}?_start=${startIndex}&_limit=${PAGE_SIZE}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Photo[] = await res.json()
      setPhotos(prev => [...prev, ...data])
      setStart(startIndex + data.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : '불러오기 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos(0)
  }, [])

  const loadMore = () => {
    if (!loading && start < TOTAL_PHOTOS) {
      fetchPhotos(start)
    }
  }

  return {
    photos,
    loading,
    error,
    hasMore: start < TOTAL_PHOTOS,
    loadMore,
  }
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test:run -- src/hooks/usePhotos.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add src/hooks/
git commit -m "feat: add usePhotos hook with pagination"
```

---

## Task 5: PhotoCard 컴포넌트 (TDD)

**Files:**
- Create: `src/components/PhotoCard.tsx`, `src/components/PhotoCard.test.tsx`

- [ ] **Step 1: 테스트 파일 작성**

```
src/components/PhotoCard.test.tsx
```

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhotoCard } from './PhotoCard'
import { Photo } from '../types/photo'

const mockPhoto: Photo = {
  albumId: 3,
  id: 42,
  title: 'accusamus beatae ad facilis',
  url: 'https://via.placeholder.com/600/92c952',
  thumbnailUrl: 'https://via.placeholder.com/150/92c952',
}

describe('PhotoCard', () => {
  it('이미지를 렌더링한다', () => {
    render(<PhotoCard photo={mockPhoto} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockPhoto.thumbnailUrl)
    expect(img).toHaveAttribute('alt', mockPhoto.title)
  })

  it('제목을 렌더링한다', () => {
    render(<PhotoCard photo={mockPhoto} />)
    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument()
  })

  it('Album 뱃지를 렌더링한다', () => {
    render(<PhotoCard photo={mockPhoto} />)
    expect(screen.getByText('Album 3')).toBeInTheDocument()
  })

  it('Photo ID 뱃지를 렌더링한다', () => {
    render(<PhotoCard photo={mockPhoto} />)
    expect(screen.getByText('#42')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npm run test:run -- src/components/PhotoCard.test.tsx
```

Expected: FAIL with `Cannot find module './PhotoCard'`

- [ ] **Step 3: PhotoCard 구현**

```
src/components/PhotoCard.tsx
```

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Photo } from '../types/photo'

interface PhotoCardProps {
  photo: Photo
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Card className="overflow-hidden">
      <img
        src={photo.thumbnailUrl}
        alt={photo.title}
        className="w-full aspect-square object-cover"
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
  )
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npm run test:run -- src/components/PhotoCard.test.tsx
```

Expected: 4 tests PASS

- [ ] **Step 5: 커밋**

```bash
git add src/components/PhotoCard.tsx src/components/PhotoCard.test.tsx
git commit -m "feat: add PhotoCard component"
```

---

## Task 6: PhotoGrid 컴포넌트

**Files:**
- Create: `src/components/PhotoGrid.tsx`

- [ ] **Step 1: PhotoGrid 구현**

```
src/components/PhotoGrid.tsx
```

```tsx
import { Photo } from '../types/photo'
import { PhotoCard } from './PhotoCard'

interface PhotoGridProps {
  photos: Photo[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      {photos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/PhotoGrid.tsx
git commit -m "feat: add PhotoGrid component"
```

---

## Task 7: App 조립 및 전체 통합

**Files:**
- Modify: `src/App.tsx`, `src/index.css`

- [ ] **Step 1: App.tsx 작성**

`src/App.tsx`를 아래로 교체:

```tsx
import { usePhotos } from './hooks/usePhotos'
import { PhotoGrid } from './components/PhotoGrid'
import { Button } from '@/components/ui/button'

function App() {
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

        {error && (
          <div className="px-3 py-2">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        {hasMore && (
          <div className="px-3 pb-8">
            <Button
              className="w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '더 보기'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 2: `src/index.css` 확인**

shadcn init이 생성한 `src/index.css`에 Tailwind directives가 포함되어 있는지 확인:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

없으면 파일 최상단에 추가.

- [ ] **Step 3: `src/main.tsx` 확인**

`src/main.tsx`에 `import './index.css'`가 있는지 확인. 없으면 추가:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: 개발 서버에서 동작 확인**

```bash
npm run dev
```

`http://localhost:5173/simple-gallery/` 에서:
1. 카드 4개가 2열 그리드로 표시되는지 확인
2. "더 보기" 버튼 클릭 시 4개 추가되는지 확인
3. 모바일 사이즈(375px)로 반응형 확인
4. 확인 후 `Ctrl+C`

- [ ] **Step 5: 전체 테스트 실행**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS

- [ ] **Step 6: 커밋**

```bash
git add src/App.tsx src/index.css src/main.tsx
git commit -m "feat: assemble app with header, grid, and load more"
```

---

## Task 8: GitHub Pages 배포

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 빌드 최종 확인**

```bash
npm run build
```

`dist/` 생성, 에러 없음 확인.

- [ ] **Step 2: GitHub remote 확인**

```bash
git remote -v
```

remote가 없으면 추가 (GitHub repo URL로):

```bash
git remote add origin https://github.com/kjy2143/simple-gallery.git
```

- [ ] **Step 3: main 브랜치 push**

```bash
git push -u origin main
```

- [ ] **Step 4: GitHub Pages 배포**

```bash
npm run deploy
```

`gh-pages` 브랜치에 `dist/` 내용이 push됨.

- [ ] **Step 5: GitHub Pages 설정 확인**

GitHub 저장소 → Settings → Pages → Source를 `gh-pages` 브랜치 `/root`로 설정.

- [ ] **Step 6: 배포 URL 접속 확인**

`https://kjy2143.github.io/simple-gallery/` 에서 앱 동작 확인.
(배포 후 1~2분 소요될 수 있음)
