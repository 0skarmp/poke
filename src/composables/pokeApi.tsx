// composables/pokeApi.ts

type PokeApiType = {
    getPokemons: (limit?: number) => Promise<any[]>
    getPokemonById: (id: number) => Promise<any>
    getEvolutionChain: (id: number) => Promise<any[]>
    getPokemonEncounters: (id: number) => Promise<any[]>
    getTypeEffectiveness: (typeName: string) => Promise<any>
    getAbilityDescription: (abilityName: string) => Promise<any>
    getPokemonSpeciesInfo: (id: number) => Promise<any>
    getPokemonMoves: (id: number) => Promise<any>
}

// ==================== CACHÉ GLOBAL ====================
const apiCache = new Map<string, any>();

const cachedFetch = async (url: string): Promise<any> => {
    if (apiCache.has(url)) {
        return apiCache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiCache.set(url, data);   // Guardamos en caché
    return data;
};

// ==================== FUNCIONES DE TRADUCCIÓN ====================
const translateFromLanguage = (entries: any[], language: string = 'es', fallback: string = 'en') => {
    if (!Array.isArray(entries)) return '';
    const entry = entries.find((item: any) => item.language.name === language);
    if (entry) return entry.name;
    const fallbackEntry = entries.find((item: any) => item.language.name === fallback);
    return fallbackEntry?.name || entries[0]?.name || '';
};

const typeSpanishMap: Record<string, string> = {
    normal: 'Normal', fighting: 'Lucha', flying: 'Volador', poison: 'Veneno', ground: 'Tierra',
    rock: 'Roca', bug: 'Bicho', ghost: 'Fantasma', steel: 'Acero', fire: 'Fuego', water: 'Agua',
    grass: 'Planta', electric: 'Eléctrico', psychic: 'Psíquico', ice: 'Hielo', dragon: 'Dragón',
    dark: 'Siniestro', unknown: 'Desconocido', shadow: 'Sombra', fairy: 'Hada'
};

const gameSpanishMap: Record<string, string> = {
    red: 'Rojo', blue: 'Azul', yellow: 'Amarillo', gold: 'Oro', silver: 'Plata', crystal: 'Cristal',
    ruby: 'Rubí', sapphire: 'Zafiro', emerald: 'Esmeralda', "fire-red": 'Fuego Rojo',
    "leaf-green": 'Verde Hoja', diamond: 'Diamante', pearl: 'Perla', platinum: 'Platino',
    heartgold: 'Oro Corazón', soulsilver: 'Plata Alma', black: 'Negro', white: 'Blanco',
    "black-2": 'Negro 2', "white-2": 'Blanco 2', x: 'X', y: 'Y',
    "omega-ruby": 'Rubí Omega', "alpha-sapphire": 'Zafiro Alfa', sun: 'Sol', moon: 'Luna',
    "ultra-sun": 'Ultrasol', "ultra-moon": 'Ultraluna', sword: 'Espada', shield: 'Escudo',
    "lets-go-pikachu": 'Vamos, Pikachu', "lets-go-eevee": 'Vamos, Eevee',
    "brilliant-diamond": 'Diamante Brillante', "shining-pearl": 'Perla Reluciente',
    "legends-arceus": 'Leyendas: Arceus', scarlet: 'Escarlata', violet: 'Violeta'
};

const eggGroupSpanishMap: Record<string, string> = {
    monster: 'Monstruo', water1: 'Acuático 1', bug: 'Bicho', flying: 'Volador', field: 'Campo',
    fairy: 'Hada', grass: 'Planta', humanlike: 'Humanoide', mineral: 'Mineral', amorphous: 'Amorfo',
    water3: 'Acuático 3', ditto: 'Ditto', dragon: 'Dragón', undiscovered: 'Desconocido',
    "no-eggs": 'Sin huevos'
};

const typeToSpanish = (typeName: string) =>
    typeSpanishMap[typeName] || typeName.replace(/\b\w/g, (c) => c.toUpperCase());

const translateVersionName = (versionName: string) =>
    gameSpanishMap[versionName] || versionName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const translateEggGroup = (groupName: string) =>
    eggGroupSpanishMap[groupName] || groupName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ==================== LOCATION CACHE ====================
const locationCache = new Map<string, string>();

const translateLocationArea = async (locationAreaName: string) => {
    if (locationCache.has(locationAreaName)) {
        return locationCache.get(locationAreaName)!;
    }

    try {
        const data = await cachedFetch(`https://pokeapi.co/api/v2/location-area/${locationAreaName}`);
        const translatedName = translateFromLanguage(data.names, 'es', 'en') ||
            locationAreaName.replace(/-/g, ' ');
        locationCache.set(locationAreaName, translatedName);
        return translatedName;
    } catch (error) {
        const fallbackName = locationAreaName.replace(/-/g, ' ');
        locationCache.set(locationAreaName, fallbackName);
        return fallbackName;
    }
};

// ==================== FUNCIONES PRINCIPALES ====================
export default function PokeApi(): PokeApiType {

    const getPokemons = async (limit = 999) => {
        try {
            const data = await cachedFetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
            return data.results;
        } catch (error) {
            console.error("Error fetching Pokémon list:", error);
            return [];
        }
    };

    const getPokemonById = async (id: number) => {
        try {
            return await cachedFetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        } catch (error) {
            console.error("Error fetching Pokémon by ID:", error);
            return null;
        }
    };

    const getEvolutionChain = async (id: number) => {
        try {
            const speciesData = await cachedFetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            const chainData = await cachedFetch(speciesData.evolution_chain.url);

            const evolutions: any[] = [];

            const processChain = async (chain: any) => {
                const speciesName = chain.species.name;

                const [speciesInfo, pokemonData] = await Promise.all([
                    cachedFetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`),
                    cachedFetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`)
                ]);

                evolutions.push({
                    name: translateFromLanguage(speciesInfo.names, 'es', 'en') || speciesName,
                    level: chain.evolution_details?.[0]?.min_level || 0,
                    id: pokemonData.id,
                    image: pokemonData.sprites.other?.['official-artwork']?.front_default,
                });

                for (const nextChain of chain.evolves_to || []) {
                    await processChain(nextChain);
                }
            };

            await processChain(chainData.chain);
            return evolutions;
        } catch (error) {
            console.error('Error fetching evolution chain:', error);
            return [];
        }
    };

    const getPokemonEncounters = async (id: number) => {
        try {
            const encounters = await cachedFetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
            const locationMap = new Map<string, { games: string[], chance: number }>();

            for (const encounter of encounters) {
                const locationName = await translateLocationArea(encounter.location_area.name);

                for (const versionDetail of encounter.version_details) {
                    const gameName = translateVersionName(versionDetail.version.name);
                    const chance = versionDetail.chance || 0;

                    if (!locationMap.has(locationName)) {
                        locationMap.set(locationName, { games: [], chance: 0 });
                    }

                    const existing = locationMap.get(locationName)!;
                    if (!existing.games.includes(gameName)) {
                        existing.games.push(gameName);
                    }
                    existing.chance = Math.max(existing.chance, chance);
                }
            }

            return Array.from(locationMap.entries()).map(([location, data]) => ({
                location,
                games: [...new Set(data.games)],
                chance: data.chance || 0,
            })).filter(loc => loc.games.length > 0);
        } catch (error) {
            console.error('Error fetching encounters:', error);
            return [];
        }
    };

    const getTypeEffectiveness = async (typeName: string) => {
        try {
            const typeData = await cachedFetch(`https://pokeapi.co/api/v2/type/${typeName}`);

            return {
                name: typeToSpanish(typeData.name),
                damageFrom: {
                    double: typeData.damage_relations.take_damage_from.map((t: any) => t.name),
                    half: typeData.damage_relations.take_damage_half_from.map((t: any) => t.name),
                    immune: typeData.damage_relations.no_damage_from.map((t: any) => t.name),
                },
                damageTo: {
                    double: typeData.damage_relations.damage_to.map((t: any) => t.name),
                    half: typeData.damage_relations.damage_to_half.map((t: any) => t.name),
                    immune: typeData.damage_relations.no_damage_to.map((t: any) => t.name),
                },
            };
        } catch (error) {
            console.error('Error fetching type effectiveness:', error);
            return null;
        }
    };

    const getAbilityDescription = async (abilityName: string) => {
        try {
            const abilityData = await cachedFetch(`https://pokeapi.co/api/v2/ability/${abilityName}`);

            const flavorText = abilityData.flavor_text_entries
                .find((entry: any) => entry.language.name === 'es')?.flavor_text
                || abilityData.flavor_text_entries.find((entry: any) => entry.language.name === 'en')?.flavor_text
                || 'Sin descripción disponible';

            return {
                name: translateFromLanguage(abilityData.names, 'es', 'en') || abilityData.name,
                description: flavorText.replace(/[\n\f]/g, ' '),
                isHidden: false,
            };
        } catch (error) {
            console.error('Error fetching ability:', error);
            return null;
        }
    };

    const getPokemonSpeciesInfo = async (id: number) => {
        try {
            const speciesData = await cachedFetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

            const flavorText = speciesData.flavor_text_entries
                .find((entry: any) => entry.language.name === 'es')?.flavor_text
                || speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'en')?.flavor_text
                || 'Sin descripción disponible';

            return {
                name: translateFromLanguage(speciesData.names, 'es', 'en') || speciesData.name,
                description: flavorText.replace(/[\n\f]/g, ' '),
                captureRate: speciesData.capture_rate,
                baseHappiness: speciesData.base_happiness,
                eggGroups: speciesData.egg_groups.map((g: any) => translateEggGroup(g.name)),
                genderRate: speciesData.gender_rate,
                hatchCounter: speciesData.hatch_counter,
                isBaby: speciesData.is_baby,
                isInitial: speciesData.is_main_series,
            };
        } catch (error) {
            console.error('Error fetching species info:', error);
            return null;
        }
    };

    const getPokemonMoves = async (id: number) => {
        try {
            const pokemonData = await cachedFetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

            const moves = {
                byLevel: [] as any[],
                byMachine: [] as any[],
                egg: [] as any[],
            };

            // ← OPTIMIZACIÓN CLAVE: Todas las peticiones de movimientos en paralelo
            const movePromises = pokemonData.moves.map(async (moveData: any) => {
                const moveInfo = await cachedFetch(moveData.move.url);
                const moveVersion = moveData.version_group_details[0] || {};

                return {
                    name: translateFromLanguage(moveInfo.names, 'es', 'en') || moveData.move.name,
                    type: moveInfo.type?.name || 'unknown',
                    typeName: typeToSpanish(moveInfo.type?.name || 'unknown'),
                    power: moveInfo.power || 0,
                    accuracy: moveInfo.accuracy || 100,
                    pp: moveInfo.pp || 0,
                    level: moveVersion.level_learned_at || 0,
                    learnMethod: moveVersion.move_learn_method?.name,
                };
            });

            const allMoves = await Promise.all(movePromises);

            allMoves.forEach((moveObj) => {
                if (moveObj.learnMethod === 'level-up') moves.byLevel.push(moveObj);
                else if (moveObj.learnMethod === 'machine') moves.byMachine.push(moveObj);
                else if (moveObj.learnMethod === 'egg') moves.egg.push(moveObj);
            });

            moves.byLevel.sort((a: any, b: any) => a.level - b.level);
            return moves;
        } catch (error) {
            console.error('Error fetching moves:', error);
            return null;
        }
    };

    return {
        getPokemons,
        getPokemonById,
        getEvolutionChain,
        getPokemonEncounters,
        getTypeEffectiveness,
        getAbilityDescription,
        getPokemonSpeciesInfo,
        getPokemonMoves,
    };
}