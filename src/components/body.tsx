import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokeApi from "../composables/pokeApi";
import PokemonCard from "../baseComponents/baseCards.tsx";

export default function PokemonGrid({ searchQuery }: { searchQuery: string }) {
    const navigate = useNavigate();
    const [pokemons, setPokemons] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const perPage = 12; 

    useEffect(() => {
        const fetchData = async () => {
            const api = PokeApi();
            const list = await api.getPokemons(150);
            const detailed = await Promise.all(
                list.map(async (p: any) => {
                    const details = await fetch(p.url).then((res) => res.json());
                    return details;
                })
            );
            setPokemons(detailed);
        };
        fetchData();
    }, []);

    // Reset page when search query changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const filteredPokemons = searchQuery.trim()
        ? pokemons.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : pokemons;

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const currentPokemons = filteredPokemons.slice(start, end);
    const maxPages = Math.ceil(filteredPokemons.length / perPage);
    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="flex justify-center px-4 py-8">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {currentPokemons.map((p) => (
                        <PokemonCard
                            key={p.id}
                            name={p.name}
                            number={p.id}
                            types={p.types.map((t: any) => t.type.name)}
                            image={p.sprites.other["official-artwork"].front_default}
                            onClick={() => navigate(`/pokemon/${p.id}`)}
                        />
                    ))}
                </div>

                {!isSearching && (
                    <div className="flex justify-center gap-4 mt-8 mb-4">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Back
                        </button>
                        <span className="flex items-center px-4 font-medium text-gray-700">
                            Page {page} of {Math.max(1, maxPages)}
                        </span>
                        <button
                            onClick={() => setPage((prev) => (prev < maxPages ? prev + 1 : prev))}
                            disabled={page >= maxPages}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Next Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
