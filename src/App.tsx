import { HashRouter, Routes, Route } from 'react-router-dom'
import { GalleryPage } from './pages/GalleryPage'
import { PhotoDetailPage } from './pages/PhotoDetailPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/photos/:id" element={<PhotoDetailPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
