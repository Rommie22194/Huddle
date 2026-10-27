import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const steps = [
  ["Check the board", "See every room for the day on one screen, free slots included."],
  ["Pick a slot", "Click a free time, add a title and how many people are coming."],
  ["Done", "The slot is yours. Nobody else can book the same room at that time."],
];

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/schedule" replace />;

  return (
    <div className="grid gap-10 py-6 md:grid-cols-[1.1fr_1fr] md:py-14">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-brand-700">Meeting room booking</p>
        <h1 className="mt-3 text-3xl font-semibold leading-snug text-stone-900 sm:text-4xl">
          Book a meeting room
          <br />
          without asking around.
        </h1>
        <p className="mt-4 max-w-md text-stone-600">
          Huddle replaces the shared spreadsheet and the "is anyone using room 3?" messages. You can see which rooms are
          free and book one in under a minute.
        </p>
        <div className="mt-7 flex gap-3">
          <Link to="/register" className="btn-primary">Create an account</Link>
          <Link to="/login" className="btn-secondary">Log in</Link>
        </div>
      </div>

      <ol className="card divide-y divide-stone-200 self-start">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-4 p-5">
            <span className="font-mono text-sm text-stone-400">0{i + 1}</span>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-0.5 text-sm text-stone-500">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
