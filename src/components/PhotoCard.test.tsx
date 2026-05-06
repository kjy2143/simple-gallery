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
