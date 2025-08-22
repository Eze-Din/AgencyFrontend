import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}