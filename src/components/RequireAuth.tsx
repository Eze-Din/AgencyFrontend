import { Navigate, useLocation } from "react-router-dom";
import type { Role, Auth } from "../types";

type Props = { children: React.ReactNode; roles?: Role[] };

function getAuth(): Auth | null {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Auth;
  } catch {
    return null;
  }
}

export default function RequireAuth({ children, roles }: Props) {
  const location = useLocation();
  const auth = getAuth();
  const legacyLoggedIn = localStorage.getItem("loggedIn") === "true";
  const isLoggedIn = !!auth || legacyLoggedIn;

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && auth?.user?.role && !roles.includes(auth.user.role)) {
    // Role not permitted for this route
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}