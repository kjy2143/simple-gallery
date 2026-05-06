import { HashRouter, Routes, Route } from 'react-router-dom'
import { PhotosProvider } from './context/PhotosContext'
import { GalleryPage } from './pages/GalleryPage'
import { PhotoDetailPage } from './pages/PhotoDetailPage'

function App() {
  return (
    <HashRouter>
      <PhotosProvider>
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/photos/:id" element={<PhotoDetailPage />} />
        </Routes>
      </PhotosProvider>
    </HashRouter>
  )
}

export default App
