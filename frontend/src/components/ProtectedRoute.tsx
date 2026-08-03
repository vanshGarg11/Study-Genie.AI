import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/userContextValue";

function ProtectedRoute() {
  const location = useLocation();
  const { loading, user } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1116] text-[#ECEEF3] font-[Inter]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
