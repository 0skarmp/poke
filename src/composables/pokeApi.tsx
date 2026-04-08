
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

export default function PokeApi(): PokeApiType {
    const translateFromLanguage = (entries: any[], language: string = 'es', fallback: string = 'en') => {
        if (!Array.isArray(entries)) return ''
        const entry = entries.find((item: any) => item.language.name === language)
        if (entry) return entry.name
        const fallbackEntry = entries.find((item: any) => item.language.name === fallback)
        return fallbackEntry?.name || entries[0]?.name || ''
    }

    const typeSpanishMap: Record<string, string> = {
        normal: 'Normal', fighting: 'Lucha', flying: 'Volador', poison: 'Veneno', ground: 'Tierra', rock: 'Roca', bug: 'Bicho', ghost: 'Fantasma', steel: 'Acero', fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico', psychic: 'Psíquico', ice: 'Hielo', dragon: 'Dragón', dark: 'Siniestro', fairy: 'Hada', unknown: 'Desconocido', shadow: 'Sombra', fairy: 'Hada'
    }

    const gameSpanishMap: Record<string, string> = {
  red: 'Rojo',
  blue: 'Azul',
  yellow: 'Amarillo',
  gold: 'Oro',
  silver: 'Plata',
  crystal: 'Cristal',
  ruby: 'Rubí',
  sapphire: 'Zafiro',
  emerald: 'Esmeralda',
  "fire-red": 'Fuego Rojo',
  "leaf-green": 'Verde Hoja',
  diamond: 'Diamante',
  pearl: 'Perla',
  platinum: 'Platino',
  heartgold: 'Oro Corazón',
  soulsilver: 'Plata Alma',
  black: 'Negro',
  white: 'Blanco',
  "black-2": 'Negro 2',
  "white-2": 'Blanco 2',
  x: 'X',
  y: 'Y',
  "omega-ruby": 'Rubí Omega',
  "alpha-sapphire": 'Zafiro Alfa',
  sun: 'Sol',
  moon: 'Luna',
  "ultra-sun": 'Ultrasol',
  "ultra-moon": 'Ultraluna',
  sword: 'Espada',
  shield: 'Escudo',
  "lets-go-pikachu": 'Vamos, Pikachu',
  "lets-go-eevee": 'Vamos, Eevee',
  "brilliant-diamond": 'Diamante Brillante',
  "shining-pearl": 'Perla Reluciente',
  "legends-arceus": 'Leyendas: Arceus',
  scarlet: 'Escarlata',
  violet: 'Violeta'
}

  const eggGroupSpanishMap: Record<string, string> = {
  monster: 'Monstruo',
  water1: 'Acuático 1',
  bug: 'Bicho',
  flying: 'Volador',
  field: 'Campo',
  fairy: 'Hada',
  grass: 'Planta',
  humanlike: 'Humanoide',
  mineral: 'Mineral',
  amorphous: 'Amorfo',
  water3: 'Acuático 3',
  ditto: 'Ditto',
  dragon: 'Dragón',
  undiscovered: 'Desconocido',
  "no-eggs": 'Sin huevos' 
}

    const typeToSpanish = (typeName: string) => {
        return typeSpanishMap[typeName] || typeName.replace(/\b\w/g, (c) => c.toUpperCase())
    }

    const translateVersionName = (versionName: string) => {
        return gameSpanishMap[versionName] || versionName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }

    const translateEggGroup = (groupName: string) => {
        return eggGroupSpanishMap[groupName] || groupName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }

    const locationCache = new Map<string, string>()

    const translateLocationArea = async (locationAreaName: string) => {
        if (locationCache.has(locationAreaName)) {
            return locationCache.get(locationAreaName)!
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/location-area/${locationAreaName}`)
            if (!response.ok) throw new Error('Location area not found')
            const data = await response.json()
            const translatedName = translateFromLanguage(data.names, 'es', 'en') || locationAreaName.replace(/-/g, ' ')
            locationCache.set(locationAreaName, translatedName)
            return translatedName
        } catch (error) {
            const fallbackName = locationAreaName.replace(/-/g, ' ')
            locationCache.set(locationAreaName, fallbackName)
            return fallbackName
        }
    }

    const getPokemons = async (limit: number = 20) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=999`);
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results; 
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        return [];
    }
    };

const getPokemonById = async (id: number) => {
    try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
        return await response.json();
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        return null;
    }
};

const getEvolutionChain = async (id: number) => {
    try {
        // Obtener datos de la especie
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!speciesRes.ok) throw new Error('Species not found');
        const speciesData = await speciesRes.json();
        
        // Obtener la cadena evolutiva
        const chainRes = await fetch(speciesData.evolution_chain.url);
        if (!chainRes.ok) throw new Error('Evolution chain not found');
        const chainData = await chainRes.json();
        
        const evolutions: any[] = [];
        
        const processChain = async (chain: any, level: number = 0) => {
            const speciesName = chain.species.name;
            const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`);
            const speciesInfo = await speciesResponse.json();
            
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesName}`);
            const pokemonData = await pokemonRes.json();
            
            const speciesSpanishName = translateFromLanguage(speciesInfo.names, 'es', 'en') || speciesName
            evolutions.push({
                name: speciesSpanishName,
                level: chain.evolution_details && chain.evolution_details[0]?.min_level || 0,
                id: pokemonData.id,
                image: pokemonData.sprites.other['official-artwork'].front_default,
            });
            
            if (chain.evolves_to.length > 0) {
                for (const nextChain of chain.evolves_to) {
                    await processChain(nextChain, nextChain.evolution_details[0]?.min_level || 0);
                }
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
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
        if (!response.ok) throw new Error('Encounters not found');
        const encounters = await response.json();
        
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
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
        if (!response.ok) throw new Error('Type not found');
        const typeData = await response.json();
        
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
        const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`);
        if (!response.ok) throw new Error('Ability not found');
        const abilityData = await response.json();
        
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
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!response.ok) throw new Error('Species info not found');
        const speciesData = await response.json();
        
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
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error('Pokemon not found');
        const pokemonData = await response.json();
        
        const moves = {
            byLevel: [] as any[],
            byMachine: [] as any[],
            egg: [] as any[],
        };
        
        for (const moveData of pokemonData.moves) {
            const moveVersion = moveData.version_group_details[0];
            const moveRes = await fetch(moveData.move.url);
            const moveInfo = await moveRes.json();
            
            const moveObj = {
                name: translateFromLanguage(moveInfo.names, 'es', 'en') || moveData.move.name,
                type: moveInfo.type?.name || 'unknown',
                typeName: typeToSpanish(moveInfo.type?.name || 'unknown'),
                power: moveInfo.power || 0,
                accuracy: moveInfo.accuracy || 100,
                pp: moveInfo.pp || 0,
                level: moveVersion.level_learned_at || 0,
            };
            
            if (moveVersion.move_learn_method.name === 'level-up') {
                moves.byLevel.push(moveObj);
            } else if (moveVersion.move_learn_method.name === 'machine') {
                moves.byMachine.push(moveObj);
            } else if (moveVersion.move_learn_method.name === 'egg') {
                moves.egg.push(moveObj);
            }
        }
        
        moves.byLevel.sort((a, b) => a.level - b.level);
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
