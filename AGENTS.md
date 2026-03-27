# AGENTS.md - AI Agent Guidelines

> **Note:** Agents should keep this file updated as the project evolves.

## Project Overview

WebGamesPlatform is a modular web-based gaming platform supporting multiple games. Each game runs as its own service, communicating with a central .NET API.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | .NET 8 (C#) |
| Frontend | React + TypeScript + Tailwind CSS |
| Game Engine | Go + WebSockets |
| Database | MySQL 8.0 |
| Container | Docker Compose |

## Project Structure

```
WebGamesPlatform/
├── api/PlatformApi/     # .NET Web API
│   ├── Controllers/     # API endpoints
│   ├── Models/          # Database entities (User, Game, Score)
│   ├── DTOs/           # Request/Response objects
│   ├── Data/           # EF Core DbContext
│   └── Program.cs      # App entry point
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/    # API client services
│   │   └── types/      # TypeScript type definitions
│   └── package.json
├── engines/             # Game services (future)
├── db/                  # Database scripts
├── docker/              # Docker configurations
└── scripts/             # Utility scripts (start.sh, stop.sh)
```

## Conventions

### Git Workflow
- Work on **feature branches** per issue
- Branch naming: `feature/<issue-number>-description` or `fix/<issue-number>-description`
- Create PR and merge after testing
- Commit after each completed task

### API Endpoints (.NET)
- Use **Controllers** for API endpoints (not Minimal APIs)
- Name controllers: `[Resource]Controller.cs`
- All endpoints under `/api/` prefix
- Use `[Authorize]` attribute for protected endpoints

### DTOs
- Location: `/DTOs/`
- Naming: `[Action]Request.cs` or `[Action]Response.cs`
- Example: `RegisterRequest.cs`, `AuthResponse.cs`

### Models
- Location: `/Models/`
- Match database tables
- Include navigation properties for relationships
- Use Data Annotations for validation

### React Components
- Location: `/components/` or `/pages/`
- File naming: PascalCase (e.g., `LoginPage.tsx`)
- Use functional components with hooks
- Tailwind CSS for styling

### Styling
- **See [docs/style-guide.md](docs/style-guide.md)** for full styling conventions
- Use design tokens from `src/styles/design-tokens.css`
- Keep UI neutral (90%) with accents (10%)
- No raw hex colors - use CSS variables only

### Configuration
- All settings in `appsettings.json`
- Environment-specific: `appsettings.Development.json`
- No hardcoded values

## Architecture Decisions

1. **Auth**: JWT tokens stored in localStorage on frontend
2. **Game Scores**: Engines submit scores through .NET API (not direct DB)
3. **Database**: Auto-creates tables on startup (EnsureCreated)
4. **Modularity**: Each game is an independent service
5. **CORS**: API allows all origins for development

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/users/me | Yes | Get current user |
| GET | /api/games | No | List all games |
| GET | /api/games/{slug} | No | Get game by slug |
| POST | /api/scores | Yes | Submit score |
| GET | /api/scores/{gameSlug} | No | Get leaderboard |

## Commands

### Docker
```bash
# Start all services
docker compose up -d

# Rebuild after changes
docker compose up -d --build

# View logs
docker compose logs api
docker compose logs mysql

# Stop services
docker compose down
```

### Backend (.NET)
```bash
cd api/PlatformApi

# Build
dotnet build

# Run locally (requires MySQL running)
dotnet run

# Run tests
dotnet test
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Database
```bash
# Connect to MySQL
docker compose exec mysql mysql -u root -p
```

### Scripts
```bash
# Start everything (Docker + Frontend + opens browser)
./scripts/start.sh

# Stop everything
./scripts/stop.sh
```

### Git
```bash
# Create feature branch
git checkout -b feature/1-description

# Commit after task completion
git add -A && git commit -m "description"

# Push and create PR
git push -u origin feature/1-description
gh pr create --title "Title" --body "Description"

# Merge PR
gh pr merge <number> --squash --delete-branch
```

## Testing API

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get games (with token)
curl http://localhost:5000/api/games
```

## Important Notes

- JWT tokens expire after 60 minutes (configurable)
- Game engines communicate via WebSockets
- Scores are stored through the API, not directly from engines
- The platform is designed to be extensible - new games can be added as separate services
- Keep this file updated when project structure or conventions change
