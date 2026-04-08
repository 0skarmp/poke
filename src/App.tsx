import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Footer from './components/footer.tsx'
import Header from './components/header.tsx'
import PokemonGrid from './components/body.tsx'
import PokemonDetail from './pages/PokemonDetail.tsx'

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onSearch={setSearchQuery} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<PokemonGrid searchQuery={searchQuery} />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App
