export default function PokemonCard({ name, number, types, image, onClick }) {
    return (
    <div 
        onClick={onClick}
        className="rounded-xl shadow-lg border border-gray-200 p-6 text-center bg-white transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer"
    >
        <div className="flex justify-center mb-4 relative">
            <div
            className="absolute w-40 h-40 rounded-full opacity-20"
            style={{ backgroundColor: getTypeColor(types[0]) }}
            ></div>
            <img
            src={image}
            alt={name}
            className="w-28 h-28 object-contain relative z-10"
            />
        </div>

        <p className="text-sm text-gray-500">#{number}</p>
        <h2 className="text-xl font-bold capitalize text-gray-800">{name}</h2>

        <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {types.map((type) => (
            <span
                key={type}
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: getTypeColor(type) }}
            >
                {type}
            </span>
            ))}
        </div>
    </div>
    );
}

function getTypeColor(type: string) {
    const colors: Record<string, string> = {
        grass: "#A8D5A2",
        fire: "#F5A97F",
        water: "#8EC5FC",
        poison: "#CBA0D9",
        flying: "#B5C7F2",
        bug: "#C6D57E",
        normal: "#D3CFCF",
        electric: "#F9E79F",
        ground: "#E0CDA9",
        fairy: "#F7C6D9",
        fighting: "#E59866",
        psychic: "#F5B7B1",
        rock: "#D5B895",
        ghost: "#B39CD0",
        ice: "#AED6F1",
        dragon: "#A29BFE",
        dark: "#A9A9A9",
        steel: "#BDC3C7",
    };
    return colors[type] || "#DDD";
}

