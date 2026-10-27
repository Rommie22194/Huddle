import { Link } from "react-router-dom";

/** status = { free, text } from roomNow(), optional */
export default function RoomCard({ room, status }) {
  return (
    <Link to={`/rooms/${room.id}`} className="card group flex flex-col overflow-hidden transition-colors hover:border-stone-400">
      {room.imageUrl && <img src={room.imageUrl} alt="" className="h-32 w-full object-cover" />}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold group-hover:text-brand-700">{room.name}</h3>
          <span className="shrink-0 text-sm text-stone-500">{room.capacity} seats</span>
        </div>
        <p className="text-sm text-stone-500">{room.location}</p>
        {room.equipment.length > 0 && <p className="mt-3 text-xs text-stone-500">{room.equipment.join(" · ")}</p>}
        {status && (
          <p className={`mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium ${status.free ? "text-brand-700" : "text-amber-700"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.free ? "bg-brand-500" : "bg-amber-500"}`} />
            {status.text}
          </p>
        )}
      </div>
    </Link>
  );
}
