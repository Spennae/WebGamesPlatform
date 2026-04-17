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

### TypeRacer Multiplayer Room Management (Issue #27 - Complete)
The Go engine now supports multiplayer rooms for real-time racing:

#### Room Configuration
| Setting | Value |
|---------|-------|
| Room codes | 4-char alphanumeric (excludes 0, O, 1, I, L) |
| Player limit | 2-4 players per room |
| Room expiration | 90 seconds after last player leaves |
| Race start | All players must click "Ready" → 3-2-1 countdown |

#### WebSocket URL Format
```
ws://localhost:5000/api/engine/typeracer?room=X7K9&username=Sam
```
- No `room` param = create new room
- With `room` param = join existing room
- Username required for multiplayer

#### Room Message Protocol

**Client → Server:**
| Type | Payload | Description |
|------|---------|-------------|
| `join` | `{roomCode, username}` | Join/create room (via URL) |
| `leave` | - | Leave room (disconnect) |
| `ready` | - | Mark ready to race |
| `notReady` | - | Un-ready |
| `typing` | `{progress, errors}` | Live progress update |
| `finish` | `{progress, errors}` | Race finished |

**Server → Client:**
| Type | Payload | Description |
|------|---------|-------------|
| `roomCreated` | `{roomCode}` | New room created (first player) |
| `roomJoined` | `{roomCode, players}` | Joined room |
| `error` | `{text}` | Error joining room |
| `playerJoined` | `{username}` | New player in room |
| `playerLeft` | `{username}` | Player left room |
| `playerReady` | `{username}` | Player marked ready |
| `playerNotReady` | `{username}` | Player un-readied |
| `allReady` | `{count: 3}` | Countdown starting |
| `countdown` | `{count: 2/1}` | Countdown tick |
| `countdownCancelled` | - | Someone un-readied |
| `gameStart` | `{text, timeLimit}` | Race begins (same text for all) |
| `opponentProgress` | `{username, progress}` | Other player's progress |
| `gameEnd` | `{wpm, accuracy, count: placement}` | Results |

#### Room State Machine
```
WAITING (players join, set ready/unready)
    ↓ all players ready (min 2)
COUNTDOWN (3-2-1 timer, cancellable if someone un-readies)
    ↓ count reaches 0
RACING (all players type same text, progress broadcast)
    ↓ all finished or timeout
FINISHED (results sent to each player)
    ↓ cleanup, room stays for new race
```

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