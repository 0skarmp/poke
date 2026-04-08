import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <input
          type="search"
          aria-label="Buscar Pokémon"
          placeholder="Buscar Pokémon"
          onChange={(e) => onSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500"
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  )
}
