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
