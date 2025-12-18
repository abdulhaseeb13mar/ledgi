import { Link, Outlet } from "@tanstack/react-router";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b p-4">
        <nav className="flex gap-4">
          <Link to="/" className="text-blue-600">
            Home
          </Link>
          <Link to="/about" className="text-blue-600">
            About
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
