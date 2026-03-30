import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useAuth();

  const isLoggedIn = isAuthenticated && !isGuest;

  return (
    <nav className="navbar-glass">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          WebGames
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-menu-item">Games</Link>
          <Link to="/leaderboards" className="nav-menu-item">Leaderboards</Link>
        </div>
      </div>

      <div className="nav-right">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        ) : (
          <>
            {user?.isAdmin && (
              <Link to="/admin/feedback" className="nav-menu-item">Admin</Link>
            )}
            <Link to="/feedback" className="nav-menu-item">Feedback</Link>
            <div className="user-chip">
              <div className="user-chip-avatar">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <span className="user-chip-name">{user?.username}</span>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}