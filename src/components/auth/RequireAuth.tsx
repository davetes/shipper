import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "@/lib/auth";

const RequireAuth = () => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
