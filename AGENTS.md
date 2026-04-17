# AGENTS.md - AI Agent Guidelines

> **Note:** Keep this file updated as project evolves.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | .NET 8 (C#), Controllers in `/api/PlatformApi/Controllers/` |
| Frontend | React 19 + TypeScript + Tailwind 4 + Vite |
| Game Engine | Go + WebSockets (`/engines/typeracer/`) |
| Database | MySQL 8.0 |

## Commands

```bash
# Docker (full stack)
docker compose up -d           # start
docker compose up -d --build   # rebuild
docker compose logs -f api     # watch logs

# Frontend
cd frontend && npm run dev     # dev server
npm run build                 # production build
npm run lint                 # lint

# Backend
cd api/PlatformApi && dotnet build && dotnet run

# Scripts
./scripts/start.sh            # Docker + frontend + browser
./scripts/stop.sh             # stop everything
```

## Conventions

### .NET API
- Controllers: `[Resource]Controller.cs` in `/Controllers/`
- DTOs: `/DTOs/` as `[Action]Request.cs` or `[Action]Response.cs`
- Models: `/Models/` with Data Annotations
- Protected endpoints: `[Authorize]` attribute
- Admin: check `user.IsAdmin` before access

### Frontend
- Components: `/components/` or `/pages/`, PascalCase
- Styling: Use `src/styles/design-tokens.css` - CSS variables only
- No raw hex colors; 90% neutral UI, 10% accent

### Git
- Branches: `feature/<issue>-description`
- Commit after each task, PR after testing

## Architecture

| Pattern | Implementation |
|---------|-----------------|
| Auth | JWT in localStorage, 60min expiry |
| Guest play | `isGuest: boolean` + `guestId` in sessionStorage |
| Game scores | Submit via API, not direct to DB |
| Modularity | Each game = separate service |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/users/me | Yes | Current user |
| GET | /api/games | No | List games |
| GET | /api/games/{slug} | No | Get game |
| POST | /api/scores | Yes | Submit score |
| GET | /api/scores/{gameSlug} | No | Leaderboard |
| POST | /api/feedback | Yes | Submit feedback |
| GET | /api/feedback | Yes (Admin) | List feedback |
| PATCH | /api/feedback/{id}/status | Yes (Admin) | Update status |

## TypeRacer Multiplayer

**WebSocket:** `ws://localhost:5000/api/engine/typeracer?room=CODE&username=NAME`
- No `room` = create new room (4-char code)
- `room` param = join existing
- Min 2, max 4 players

**Client → Server:**
- `join` / `leave` - room management
- `ready` / `notReady` - race start trigger
- `typing` / `finish` - progress updates

**Server → Client:**
- `roomCreated` / `roomJoined` / `error`
- `playerJoined` / `playerLeft` / `playerReady` / `playerNotReady`
- `allReady` → `countdown` (3-2-1) → `gameStart`
- `opponentProgress` - live race updates
- `gameEnd` - results with placement

**State:** WAITING → COUNTDOWN → RACING → FINISHED

## Guest Play Pattern

```tsx
// Redirect to login with return URL
navigate(`/login?returnUrl=${encodeURIComponent('/play/typeracer')}`);

// After login, restore pending score
useEffect(() => {
  const saved = sessionStorage.getItem('pendingScore');
  if (saved && !isGuest) {
    const { wpm, accuracy } = JSON.parse(saved);
    sessionStorage.removeItem('pendingScore');
    submitScore(wpm, accuracy);
  }
}, [isGuest]);
```

## Game Implementation

Rules page first, then gameplay:
```tsx
type GamePhase = 'rules' | 'playing';
const [phase, setPhase] = useState(sessionStorage.getItem('pendingScore') ? 'playing' : 'rules');
```

## Notes

- Database auto-creates tables on startup (EnsureCreated)
- CORS allows all origins (development)
- Game engines communicate via WebSockets
- Scores stored through API, not directly from engines

## Documentation

- [Style Guide](docs/style-guide.md) - Design tokens, component specs