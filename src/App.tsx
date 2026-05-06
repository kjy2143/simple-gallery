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

        {error ? (
          <div className="px-3 py-2">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        ) : null}

        {hasMore ? (
          <div className="px-3 pb-8">
            <Button
              className="w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '더 보기'}
            </Button>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default App
