import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PokeApi from "../composables/pokeApi";
import PokemonCard, { SkeletonCard } from "../baseComponents/baseCards.tsx";

export default function PokemonGrid({ searchQuery }: { searchQuery: string }) {
    const navigate = useNavigate();
    const [allPokemons, setAllPokemons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const perPage = 12;

    const api = PokeApi();

    useEffect(() => {
        const fetchBasicPokemons = async () => {
            try {
                setLoading(true);
                const basicList = await api.getPokemons(386); // Cambia a 649 o 1008 si quieres más generaciones

                const detailedPromises = basicList.map(async (p: any) => {
                    try {
                        const details = await fetch(p.url).then(res => res.json());
                        return {
                            id: details.id,
                            name: details.name,
                            types: details.types,
                            sprites: details.sprites
                        };
                    } catch (err) {
                        return null;
                    }
                });

                const results = await Promise.all(detailedPromises);
                const validPokemons = results.filter((p): p is any => p !== null);

                setAllPokemons(validPokemons);
            } catch (error) {
                console.error("Error fetching pokemons:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBasicPokemons();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const filteredAndPaginated = useMemo(() => {
        let filtered = allPokemons;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = allPokemons.filter(p => p.name.toLowerCase().includes(query));
        }

        const start = (page - 1) * perPage;
        const end = start + perPage;

        return {
            current: filtered.slice(start, end),
            totalPages: Math.ceil(filtered.length / perPage)
        };
    }, [allPokemons, searchQuery, page]);

    const { current, totalPages } = filteredAndPaginated;

    return (
        <div className="flex justify-center px-4 py-8">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <SkeletonCard count={12} />
                    ) : (
                        current.map((p) => (
                            <PokemonCard
                                key={p.id}
                                name={p.name}
                                number={p.id}
                                types={p.types.map((t: any) => t.type.name)}
                                image={p.sprites.other?.["official-artwork"]?.front_default}
                                onClick={() => navigate(`/pokemon/${p.id}`)}
                            />
                        ))
                    )}
                </div>

                {!searchQuery.trim() && totalPages > 1 && !loading && (
                    <div className="flex justify-center gap-4 mt-10 mb-6">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50"
                        >
                            Anterior
                        </button>

                        <span className="flex items-center px-6 font-medium text-gray-700">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))}
                            disabled={page === totalPages}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}