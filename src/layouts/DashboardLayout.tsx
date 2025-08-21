import { Outlet, useNavigate } from "react-router-dom";

const user = {
  name: "Test User",
  username: "test",
  role: "Admin",
  avatar: "https://ui-avatars.com/api/?name=Test+User&background=0D8ABC&color=fff"
};

const menus = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Add Partner", path: "/dashboard/add-partner" },
  { label: "Create Cv", path: "/dashboard/create-cv" },
  { label: "Cv Lists", path: "/dashboard/cv-lists" },
  { label: "Selected Cvs", path: "/dashboard/selected-cvs" },
  { label: "Inactive Cvs", path: "/dashboard/inactive-cvs" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
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
                <button
                  className="w-full text-left px-6 py-3 hover:bg-blue-50 hover:text-blue-700 font-medium transition"
                  onClick={() => navigate(menu.path)}
                >
                  {menu.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t">
          <button
            className="w-full bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition"
            onClick={() => {
              // TODO: Add logout logic
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <Outlet />
      </main>
    </div>
  );
}