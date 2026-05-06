import { useState, useEffect, useCallback, useRef } from 'react'
import type { Photo } from '../types/photo'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [start, setStart] = useState(0)
  const fetchingRef = useRef(false)

  const fetchPhotos = useCallback(async (startIndex: number, signal?: AbortSignal) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}?_start=${startIndex}&_limit=${PAGE_SIZE}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Photo[] = await res.json()
      setPhotos(prev => [...prev, ...data])
      setStart(startIndex + data.length)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : '불러오기 실패')
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchPhotos(0, controller.signal)
    return () => controller.abort()
  }, [fetchPhotos])

  const loadMore = useCallback(() => {
    if (!fetchingRef.current && start < TOTAL_PHOTOS) {
      fetchPhotos(start)
    }
  }, [fetchPhotos, start])

  return {
    photos,
    loading,
    error,
    hasMore: start < TOTAL_PHOTOS,
    loadMore,
  }
}
