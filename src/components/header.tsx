import SearchBar from '../baseComponents/searchBar'
import pokedex from '../assets/pokedex.png'

export default function Header({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <section className="bg-gray-800 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <img src={pokedex} alt="Pokedex" className="h-14 w-auto" />
        
        </div>
        <div className="w-full max-w-sm">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
    </section>
  )
}
