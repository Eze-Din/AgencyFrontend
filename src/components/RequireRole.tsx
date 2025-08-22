import { Navigate, useLocation } from "react-router-dom";

export default function RequireRole({ children, role }: { children: React.ReactNode, role: string }) {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  if (!isLoggedIn || userRole !== role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}