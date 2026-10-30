export default function ChromaCard({ chroma, onToggle }) {
  const color = chroma.colors?.[0] ?? '#7A8699'
  return (
    <li
      className="group relative w-[78px] rounded-lg overflow-hidden border-2 bg-[#0d1119]"
      style={{ borderColor: color }}
      title={chroma.fullName || `${chroma.skin.name} — ${chroma.name}`}
    >
      {chroma.image ? (
        <img
          src={chroma.image}
          alt={chroma.name}
          className="block w-full aspect-square object-cover bg-[#161d29]"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-square" style={{ background: color }} />
      )}
      <span className="block px-1 pt-0.5 pb-1 text-[10px] leading-tight text-text-h truncate">
        {chroma.name}
      </span>
      <button
        type="button"
        onClick={() => onToggle(chroma.id)}
        title="Убрать из имеющихся"
        className="absolute top-0.5 right-0.5 grid place-items-center w-5 h-5 rounded bg-[#1a2130] border border-[#2c3546] text-text-h text-xs opacity-60 hover:opacity-100 cursor-pointer"
      >
        ✕
      </button>
    </li>
  )
}