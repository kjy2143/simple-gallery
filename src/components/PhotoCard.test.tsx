import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhotoCard } from './PhotoCard'
import type { Photo } from '../types/photo'

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
