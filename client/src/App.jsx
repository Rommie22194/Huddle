import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import ManageRooms from "./pages/ManageRooms";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<ManageRooms />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="py-16">
                <p className="font-mono text-sm text-stone-400">404</p>
                <h1 className="mt-1 text-xl font-semibold">There's no page here.</h1>
                <Link to="/" className="mt-4 inline-block text-sm text-brand-700 hover:underline">Back to the start</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-stone-200 py-5 text-center text-xs text-stone-400">
        Huddle · Web Application Development project, 2026
      </footer>
    </div>
  );
}
