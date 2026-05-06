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
