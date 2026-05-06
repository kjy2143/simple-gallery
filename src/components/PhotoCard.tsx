import type { SyntheticEvent } from 'react'
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
  )
}
