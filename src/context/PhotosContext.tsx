import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { usePhotos } from '../hooks/usePhotos'
import type { UsePhotosResult } from '../hooks/usePhotos'

const PhotosContext = createContext<UsePhotosResult | null>(null)

export function PhotosProvider({ children }: { children: ReactNode }) {
  const value = usePhotos()
  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>
}

export function usePhotosContext(): UsePhotosResult {
  const ctx = useContext(PhotosContext)
  if (!ctx) throw new Error('usePhotosContext must be used within PhotosProvider')
  return ctx
}
