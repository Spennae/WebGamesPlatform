import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gameService } from '../services';
import type { Game } from '../types';

export function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await gameService.getGames();
      setGames(data);
    } catch {
      setError('Failed to load games. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner spinner-lg"></div>
        <p className="text-text-secondary">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="page-header">
        <h1 className="page-title">Available Games</h1>
        <p className="page-subtitle">Choose a game and start playing</p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No games available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="flex items-start justify-between mb-3">
                <h2 className="game-card-title">{game.name}</h2>
                <span className="tag tag-blue">New</span>
              </div>
              <p className="game-card-description">{game.description}</p>
              <Link
                to={`/play/${game.slug}`}
                className="btn btn-primary w-full"
              >
                Play Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
