import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { getCurrentUser, getRoleName } = useAuth();
  const user = getCurrentUser();
  const role = getRoleName(user);

  return (
    <div className="navbar">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex align-items-center">
          <h4 className="mb-0">Welcome back!</h4>
        </div>

        <div className="d-flex align-items-center">
          <div className="navbar-user">
            <div
              className="d-flex align-items-center justify-content-center bg-primary text-white rounded-circle"
              style={{ width: "40px", height: "40px" }}
            >
              <User size={20} />
            </div>

            <div className="navbar-user-info ms-2">
              <div className="navbar-user-name">{user?.userName || "User"}</div>
              <div className="navbar-user-role">
                {getRoleName(user?.roleId)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
