import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PokemonCard, { SkeletonCard } from "../baseComponents/baseCards.tsx";

export default function PokemonGrid({ searchQuery }: { searchQuery: string }) {
    const navigate = useNavigate();

    const [pokemons, setPokemons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [allPokemons, setAllPokemons] = useState<any[]>([]);

    const perPage = 12;

    // 🔹 CARGAR LISTA COMPLETA (solo nombres)
    useEffect(() => {
        const loadAll = async () => {
            try {
                const res = await fetch(
                    "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"
                );
                const data = await res.json();
                setAllPokemons(data.results);
            } catch (error) {
                console.error(error);
            }
        };

        loadAll();
    }, []);

    // 🔹 PAGINACIÓN
    useEffect(() => {
        if (searchQuery.trim()) return;

        const loadPage = async () => {
            try {
                setLoading(true);

                const offset = (page - 1) * perPage;

                const res = await fetch(
                    `https://pokeapi.co/api/v2/pokemon?limit=${perPage}&offset=${offset}`
                );
                const data = await res.json();

                setTotalCount(data.count);

                const detailedPromises = data.results.map((p: any) =>
                    fetch(p.url).then(res => res.json())
                );

                const results = await Promise.all(detailedPromises);

                const formattedPokemons = results.map((details: any) => ({
                    id: details.id,
                    name: details.name,
                    types: details.types,
                    sprites: details.sprites
                }));

                setPokemons(formattedPokemons);
            } catch (error) {
                console.error("Error loading page:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [page, searchQuery]);

    // 🔹 SEARCH
    useEffect(() => {
        if (!searchQuery.trim()) return;

        const searchPokemon = async () => {
            try {
                setLoading(true);

                const filtered = allPokemons.filter((p: any) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                const results = await Promise.all(
                    filtered.slice(0, 20).map((p: any) =>
                        fetch(p.url).then(res => res.json())
                    )
                );

                const formatted = results.map((details: any) => ({
                    id: details.id,
                    name: details.name,
                    types: details.types,
                    sprites: details.sprites
                }));

                setPokemons(formatted);
            } catch (error) {
                console.error("Error searching:", error);
                setPokemons([]);
            } finally {
                setLoading(false);
            }
        };

        searchPokemon();
    }, [searchQuery, allPokemons]);

    // 🔹 RESET DE PÁGINA AL BUSCAR
    useEffect(() => {
        if (searchQuery.trim()) {
            setPage(1);
        }
    }, [searchQuery]);

    const totalPages = Math.ceil(totalCount / perPage);

    return (
        <div className="flex justify-center px-4 py-8">
            <div className="max-w-6xl w-full">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <SkeletonCard count={12} />
                    ) : (
                        pokemons.map((p) => (
                            <PokemonCard
                                key={p.id}
                                name={p.name}
                                number={p.id}
                                types={p.types.map((t: any) => t.type.name)}
                                image={
                                    p.sprites.other?.["official-artwork"]?.front_default
                                }
                                onClick={() => navigate(`/pokemon/${p.id}`)}
                            />
                        ))
                    )}
                </div>

                {/* 🔹 PAGINACIÓN */}
                {!searchQuery.trim() && totalPages > 1 && !loading && (
                    <div className="flex justify-center gap-4 mt-10 mb-6">
                        <button
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={page === 1}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        <span className="flex items-center px-6 font-medium text-gray-700">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    prev < totalPages ? prev + 1 : prev
                                )
                            }
                            disabled={page === totalPages}
                            className="px-6 py-2 bg-white rounded-xl border border-black font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {/* 🔹 SIN RESULTADOS */}
                {searchQuery.trim() && pokemons.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 text-lg">
                        No se encontraron Pokémon con "{searchQuery}"
                    </div>
                )}

            </div>
        </div>
    );
}