import { Link } from 'react-router-dom';

export function LeaderboardsPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Leaderboards</h1>
        <p className="text-text-secondary text-center mb-6">
          Coming Soon
        </p>
        <Link to="/" className="btn btn-primary w-full">
          Back to Games
        </Link>
      </div>
    </div>
  );
}
