import { useMemo, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import type { Auth } from "../types";

function getAuth(): Auth | null {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Auth;
  } catch {
    return null;
  }
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const auth = getAuth();

  const user = useMemo(() => {
    const u = auth?.user;
    return {
      name: u?.username ?? "Test User",
      username: u?.username ?? "test",
      role: (u?.role === 'admin' ? 'Owner' : 'Partner'),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.username ?? 'Test User')}&background=0D8ABC&color=fff`,
    };
  }, [auth]);

  const menus = useMemo(() => {
    const base = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Cv Lists", path: "/dashboard/cv-lists" },
      { label: "Selected Cvs", path: "/dashboard/selected-cvs" },
    ];
    const ownerOnly = [
      { label: "Add Partner", path: "/dashboard/add-partner" },
      { label: "Partner List", path: "/dashboard/partner-list" },
      { label: "Create Cv", path: "/dashboard/create-cv" },
      { label: "Inactive Cvs", path: "/dashboard/inactive-cvs" },
    ];
    return auth?.user?.role === 'admin' ? [...base, ...ownerOnly] : base;
  }, [auth]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col transform
          transition-transform duration-200
          overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        `}
      >
        <div className="flex flex-col items-center py-8 border-b">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="w-20 h-20 rounded-full mb-4 border-4 border-blue-600"
          />
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-sm text-gray-500">@{user.username}</div>
          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            {user.role}
          </div>
        </div>
        <nav className="flex-1 mt-6">
          <ul>
            {menus.map((menu) => (
              <li key={menu.label}>
                <NavLink
                  to={menu.path}
                  className={({ isActive }) =>
                    `block px-6 py-3 font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 hover:text-blue-700'}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {menu.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t">
          <button
            className="w-full bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition"
            onClick={() => {
              localStorage.removeItem("auth");
              localStorage.removeItem("loggedIn");
              navigate("/");
              setSidebarOpen(false);
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Hamburger Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded bg-white shadow lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 ml-0 lg:ml-64 transition-all duration-200 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}