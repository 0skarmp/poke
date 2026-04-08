import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PokeApi from '../composables/pokeApi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faVolumeUp, faHome } from '@fortawesome/free-solid-svg-icons'

const typeSpanishMap: Record<string, string> = {
  normal: 'Normal', fighting: 'Lucha', flying: 'Volador', poison: 'Veneno', ground: 'Tierra', rock: 'Roca', bug: 'Bicho', ghost: 'Fantasma', steel: 'Acero', fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico', psychic: 'Psíquico', ice: 'Hielo', dragon: 'Dragón', dark: 'Siniestro', fairy: 'Hada', unknown: 'Desconocido', shadow: 'Sombra'
}

const translateTypeName = (typeName: string) => {
  return typeSpanishMap[typeName] || typeName.replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Evolution {
  name: string
  level: number
  id: number
  image: string
}

interface LocationEncounter {
  location: string
  games: string[]
  chance: number
}

export default function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [pokemon, setPokemon] = useState<any>(null)
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [locations, setLocations] = useState<LocationEncounter[]>([])
  const [typeEffectiveness, setTypeEffectiveness] = useState<any>(null)
  const [speciesInfo, setSpeciesInfo] = useState<any>(null)
  const [moves, setMoves] = useState<any>(null)
  const [abilityDescriptions, setAbilityDescriptions] = useState<any>({})
  const [shiny, setShiny] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('level')

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        const api = PokeApi()
        if (!id) return

        // Obtener detalles principales del Pokémon
        const pokemonData = await api.getPokemonById(parseInt(id))
        setPokemon(pokemonData)

        // Obtener cadena evolutiva
        const chainData = await api.getEvolutionChain(parseInt(id))
        setEvolutions(chainData)

        // Obtener localizaciones
        const locationData = await api.getPokemonEncounters(parseInt(id))
        setLocations(locationData)

        // Obtener tipo y efectividades
        if (pokemonData.types[0]) {
          const typeData = await api.getTypeEffectiveness(pokemonData.types[0].type.name)
          setTypeEffectiveness(typeData)
        }

        // Obtener información de la especie
        const speciesData = await api.getPokemonSpeciesInfo(parseInt(id))
        setSpeciesInfo(speciesData)

        // Obtener movimientos
        const movesData = await api.getPokemonMoves(parseInt(id))
        setMoves(movesData)

        // Obtener descripciones de habilidades
        const abilityDescriptionsMap: any = {}
        for (const ability of pokemonData.abilities) {
          const abilityDesc = await api.getAbilityDescription(ability.ability.name)
          if (abilityDesc) {
            abilityDescriptionsMap[ability.ability.name] = abilityDesc
          }
        }
        setAbilityDescriptions(abilityDescriptionsMap)
      } catch (error) {
        console.error('Error fetching Pokemon details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemonDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-2xl font-semibold text-gray-700">Cargando...</div>
      </div>
    )
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-2xl font-semibold text-gray-700">Pokémon no encontrado</div>
      </div>
    )
  }

  const rawTypes = pokemon.types.map((t: any) => t.type.name)
  const types = rawTypes.map((type: string) => translateTypeName(type))
  const stats = pokemon.stats
  const imageUrl = shiny 
    ? pokemon.sprites.other['official-artwork'].front_shiny
    : pokemon.sprites.other['official-artwork'].front_default

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Botones de Navegación */}
        <div className="mb-6 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-gray-700 shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            Regresar
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-gray-700 shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faHome} className="h-4 w-4" />
            Inicio
          </button>
        </div>

        {/* Header con imagen y info básica */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Imagen, Shiny Toggle y Cadena Evolutiva */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ backgroundColor: getTypeColor(rawTypes[0]) }}
                ></div>
                <img
                  src={imageUrl}
                  alt={speciesInfo?.name || pokemon.name}
                  className="relative h-64 w-64 object-contain"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shiny}
                  onChange={(e) => setShiny(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">Versión Shiny</span>
              </label>

              {/* Cadena Evolutiva */}
              {evolutions.length > 0 && (
                <div className="mt-8 w-full">
                  <h3 className="mb-4 text-lg font-bold text-gray-800 text-center">Cadena Evolutiva</h3>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {evolutions.map((evolution, index) => (
                      <div key={evolution.id} className="flex items-center gap-3">
                        <div
                          className="rounded-lg border-2 border-gray-200 p-2 text-center cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/pokemon/${evolution.id}`)}
                        >
                          <img
                            src={evolution.image}
                            alt={evolution.name}
                            className="h-16 w-16 object-contain"
                          />
                          <p className="mt-1 capitalize font-semibold text-gray-800 text-xs">
                            {evolution.name}
                          </p>
                          {evolution.level > 0 && (
                            <p className="text-xs text-gray-500">Nv {evolution.level}</p>
                          )}
                        </div>
                        {index < evolutions.length - 1 && (
                          <div className="text-xl text-gray-400">→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info básica */}
            <div>
              <p className="text-sm text-gray-500">#{pokemon.id}</p>
              <h1 className="mb-4 text-4xl font-bold capitalize text-gray-800">
                {speciesInfo?.name || pokemon.name}
              </h1>

              {/* Tipos */}
              <div className="mb-6 flex gap-2 flex-wrap">
                {types.map((type: string, index: number) => (
                  <span
                    key={rawTypes[index]}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: getTypeColor(rawTypes[index]) }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Altura y Peso */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Altura</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(pokemon.height / 10).toFixed(1)}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Peso</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {(pokemon.weight / 10).toFixed(1)}kg
                  </p>
                </div>
              </div>

              {/* Grito del Pokémon */}
              {pokemon.cries?.latest && (
                <div className="mb-4">
                  <button
                    onClick={() => new Audio(pokemon.cries.latest).play()}
                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white font-semibold hover:bg-blue-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faVolumeUp} />
                    Escuchar grito
                  </button>
                </div>
              )}

              {/* Habilidades */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-600 uppercase">
                  Habilidades
                </p>
                <div className="space-y-2">
                  {pokemon.abilities.map((ability: any) => (
                    <div key={ability.ability.name} className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 capitalize">
                          {abilityDescriptions[ability.ability.name]?.name || ability.ability.name.replace('-', ' ')}
                        </span>
                        {ability.is_hidden && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-semibold">
                            Oculta
                          </span>
                        )}
                      </div>
                      {abilityDescriptions[ability.ability.name] && (
                        <p className="mt-1 text-xs text-gray-600">
                          {abilityDescriptions[ability.ability.name].description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción de la Pokédex */}
        {speciesInfo?.description && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Pokédex</h2>
            <p className="text-gray-700 leading-relaxed italic">"{speciesInfo.description}"</p>
          </div>
        )}

        {/* Estadísticas Base */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Estadísticas Base</h2>
          <div className="space-y-4">
            {stats.map((stat: any) => (
              <div key={stat.stat.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 uppercase">
                    {stat.stat.name.replace('-', ' ')}
                  </span>
                  <span className="font-bold text-gray-800">{stat.base_stat}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((stat.base_stat / 150) * 100, 100)}%`,
                      backgroundColor: getStatColor(stat.base_stat),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efectividad de Combate */}
        {typeEffectiveness && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Efectividad en Combate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3 font-semibold text-gray-800">Recibe Daño x2 de:</h3>
                <div className="flex flex-wrap gap-2">
                  {typeEffectiveness.damageFrom.double.map((type: string) => (
                    <span
                      key={type}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {translateTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-gray-800">Recibe Daño x0.5 de:</h3>
                <div className="flex flex-wrap gap-2">
                  {typeEffectiveness.damageFrom.half.map((type: string) => (
                    <span
                      key={type}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white opacity-70"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {translateTypeName(type)}
                    </span>
                  ))}
                </div>
              </div>
              {typeEffectiveness.damageFrom.immune.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-800">Inmune a:</h3>
                  <div className="flex flex-wrap gap-2">
                    {typeEffectiveness.damageFrom.immune.map((type: string) => (
                      <span
                        key={type}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: getTypeColor(type) }}
                      >
                        {translateTypeName(type)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Movimientos */}
        {moves && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Movimientos</h2>
            
            {/* Tabs */}
            <div className="mb-6 flex border-b border-gray-200">
              {['level', 'machine', 'egg'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'level' && `Por Nivel (${moves.byLevel.length})`}
                  {tab === 'machine' && `MT/MO (${moves.byMachine.length})`}
                  {tab === 'egg' && `Huevo (${moves.egg.length})`}
                </button>
              ))}
            </div>

            {/* Movimientos por Nivel */}
            {activeTab === 'level' && (
              <div className="space-y-2">
                {moves.byLevel.length > 0 ? (
                  moves.byLevel.map((move: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800 capitalize">{move.name.replace('-', ' ')}</span>
                          {move.level > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Nivel {move.level}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="text-xs font-semibold text-white px-2 py-1 rounded"
                            style={{ backgroundColor: getTypeColor(move.type) }}
                          >
                            {move.typeName}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Poder: {move.power || '-'} | Precisión: {move.accuracy}% | PP: {move.pp}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No aprende movimientos por nivel</p>
                )}
              </div>
            )}

            {/* Movimientos por Máquina */}
            {activeTab === 'machine' && (
              <div className="space-y-2">
                {moves.byMachine.length > 0 ? (
                  moves.byMachine.map((move: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 capitalize">{move.name.replace('-', ' ')}</span>
                        <span
                          className="text-xs font-semibold text-white px-2 py-1 rounded"
                          style={{ backgroundColor: getTypeColor(move.type) }}
                        >
                          {move.typeName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Poder: {move.power || '-'} | Precisión: {move.accuracy}% | PP: {move.pp}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No puede aprender movimientos por máquina</p>
                )}
              </div>
            )}

            {/* Movimientos Huevo */}
            {activeTab === 'egg' && (
              <div className="space-y-2">
                {moves.egg.length > 0 ? (
                  moves.egg.map((move: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 capitalize">{move.name.replace('-', ' ')}</span>
                        <span
                          className="text-xs font-semibold text-white px-2 py-1 rounded"
                          style={{ backgroundColor: getTypeColor(move.type) }}
                        >
                          {move.typeName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Poder: {move.power || '-'} | Precisión: {move.accuracy}% | PP: {move.pp}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No hereda movimientos de huevo</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Información de Crianza y Captura */}
        {speciesInfo && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Ficha Técnica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Tasa de Captura</p>
                <div className="h-4 w-full rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${(speciesInfo.captureRate / 255) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{speciesInfo.captureRate}/255</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Dicha Base</p>
                <p className="text-lg font-bold text-gray-800">{speciesInfo.baseHappiness}/255</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Grupos de Huevo</p>
                <div className="flex flex-wrap gap-2">
                  {speciesInfo.eggGroups.map((group: string) => (
                    <span key={group} className="bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs font-semibold capitalize">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Ciclos de Huevo</p>
                <p className="text-lg font-bold text-gray-800">{speciesInfo.hatchCounter}</p>
              </div>
            </div>
          </div>
        )}

        {/* Localizaciones */}
        {locations.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Ubicaciones</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 bg-gray-50"
                >
                  <h3 className="mb-2 font-semibold text-gray-800 capitalize">
                    {location.location.replace('-', ' ')}
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {location.games.slice(0, 3).map((game) => (
                      <span
                        key={game}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 capitalize"
                      >
                        {game.replace('-', ' ')}
                      </span>
                    ))}
                    {location.games.length > 3 && (
                      <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                        +{location.games.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    grass: '#A8D5A2',
    fire: '#F5A97F',
    water: '#8EC5FC',
    poison: '#CBA0D9',
    flying: '#B5C7F2',
    bug: '#C6D57E',
    normal: '#D3CFCF',
    electric: '#F9E79F',
    ground: '#E0CDA9',
    fairy: '#F7C6D9',
    fighting: '#E59866',
    psychic: '#F5B7B1',
    rock: '#D5B895',
    ghost: '#B39CD0',
    ice: '#AED6F1',
    dragon: '#A29BFE',
    dark: '#A9A9A9',
    steel: '#BDC3C7',
  }
  return colors[type] || '#DDD'
}

function getStatColor(value: number): string {
  if (value >= 120) return '#10B981'
  if (value >= 100) return '#3B82F6'
  if (value >= 80) return '#F59E0B'
  if (value >= 60) return '#EF4444'
  return '#64748B'
}