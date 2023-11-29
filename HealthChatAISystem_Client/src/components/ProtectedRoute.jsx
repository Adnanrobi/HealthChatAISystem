import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ element: Component }) {
  const navigate = useNavigate();
  const { token } = useAuth();

  if (!token) {
    navigate("/login");
    return null;
  }

  return Component;
}

export default ProtectedRoute;
