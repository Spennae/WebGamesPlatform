interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return <div className="text-text-secondary text-sm">No scores yet</div>;
  }

  return (
    <div className="leaderboard">
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className={`leaderboard-item ${currentUserId && entry.username === 'You' ? 'current-user' : ''}`}
        >
          <div className={`leaderboard-rank ${entry.rank <= 3 ? 'top-3' : ''}`}>
            {entry.rank}
          </div>
          <div className="leaderboard-name">{entry.username}</div>
          <div className="leaderboard-score" style={{ color: 'var(--accent-green)' }}>
            {(entry.value / 100).toFixed(2)} WPM
          </div>
        </div>
      ))}
    </div>
  );
}
