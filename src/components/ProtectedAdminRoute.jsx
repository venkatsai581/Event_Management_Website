import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function ProtectedAdminRoute() {
  const { isAuthenticated } = useAdmin();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
