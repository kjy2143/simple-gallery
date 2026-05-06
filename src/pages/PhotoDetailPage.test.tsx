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
