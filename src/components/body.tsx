import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PokeApi from "../composables/pokeApi";
import PokemonCard, { SkeletonCard } from "../baseComponents/baseCards.tsx";

export default function PokemonGrid({ searchQuery }: { searchQuery: string }) {
    const navigate = useNavigate();
    
    const [pokemons, setPokemons] = useState<any[]>([]);        // Pokémon de la página actual
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    const perPage = 12;
    const api = PokeApi();

    // Cargar Pokémon según la página actual (12 en 12)
    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                setPokemons([]); // Limpiar mientras carga

                const offset = (page - 1) * perPage;
                
                // 1. Obtener lista paginada desde PokeAPI
                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon?limit=${perPage}&offset=${offset}`
                );
                const data = await response.json();

                setTotalCount(data.count);

                // 2. Obtener detalles de los 12 Pokémon
                const detailedPromises = data.results.map(async (p: any) => {
                    try {
                        const details = await fetch(p.url).then(res => res.json());
                        return {
                            id: details.id,
                            name: details.name,
                            types: details.types,
                            sprites: details.sprites
                        };
                    } catch (err) {
                        console.error(`Error loading ${p.name}`);
                        return null;
                    }
                });

                const results = await Promise.all(detailedPromises);
                const validPokemons = results.filter((p): p is any => p !== null);

                setPokemons(validPokemons);
            } catch (error) {
                console.error("Error fetching page:", error);
            } finally {
                setLoading(false);
            }
        };

        // Solo cargar si NO hay búsqueda activa
        if (!searchQuery.trim()) {
            fetchPage();
        }
    }, [page]); // ← Se ejecuta cada vez que cambia la página

    // Manejo de búsqueda (se hace en cliente porque es más rápido para pocas páginas)
    const filteredPokemons = useMemo(() => {
        if (!searchQuery.trim()) return pokemons;

        const query = searchQuery.toLowerCase().trim();
        return pokemons.filter(p => p.name.toLowerCase().includes(query));
    }, [pokemons, searchQuery]);

    // Resetear página al buscar
    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(totalCount / perPage);

    return (
        <div className="flex justify-center px-4 py-8">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <SkeletonCard count={12} />
                    ) : (
                        filteredPokemons.map((p) => (
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

                {/* Paginación - Solo se muestra cuando NO estás buscando */}
                {!searchQuery.trim() && totalPages > 1 && !loading && (
                    <div className="flex justify-center gap-4 mt-10 mb-6">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        <span className="flex items-center px-6 font-medium text-gray-700">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(prev => (prev < totalPages ? prev + 1 : prev))}
                            disabled={page === totalPages}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {searchQuery.trim() && filteredPokemons.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-lg">
                        No se encontraron Pokémon con "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}