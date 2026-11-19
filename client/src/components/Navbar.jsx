import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🔐</span>
        <span>CipherExam</span>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>

            <span className="user-role">{user.role}</span>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
