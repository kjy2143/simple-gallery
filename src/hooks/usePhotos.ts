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
