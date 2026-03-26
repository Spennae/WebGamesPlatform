# AGENTS.md - AI Agent Guidelines

## Project Overview

WebGamesPlatform is a modular web-based gaming platform supporting multiple games. Each game runs as its own service, communicating with a central .NET API.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | .NET 8 (C#) |
| Frontend | React + TypeScript |
| Game Engine | Go + WebSockets |
| Database | MySQL 8.0 |
| Container | Docker Compose |

## Project Structure

```
api/PlatformApi/     # .NET Web API
├── Controllers/     # API endpoints
├── Models/          # Database entities (User, Game, Score)
├── DTOs/            # Request/Response objects
├── Data/            # EF Core DbContext
frontend/            # React application (future)
engines/             # Game services (future)
db/                  # Database scripts
```

## Conventions

### API Endpoints
- Use **Controllers** for API endpoints (not Minimal APIs)
- Name controllers: `[Resource]Controller.cs`
- All endpoints under `/api/` prefix

### DTOs
- Location: `/DTOs/`
- Naming: `[Action]Request.cs` or `[Action]Response.cs`
- Example: `RegisterRequest.cs`, `AuthResponse.cs`

### Models
- Location: `/Models/`
- Match database tables
- Include navigation properties for relationships
- Use Data Annotations for validation

### Configuration
- All settings in `appsettings.json`
- Environment-specific: `appsettings.Development.json`
- No hardcoded values

## Architecture Decisions

1. **Auth**: JWT tokens stored in localStorage on frontend
2. **Game Scores**: Engines submit scores through .NET API (not direct DB)
3. **Database**: Auto-creates tables on startup (EnsureCreated)
4. **Modularity**: Each game is an independent service

## Commands

### Build & Run
```bash
# Build API locally
dotnet build

# Run API locally
dotnet run

# Run with Docker
docker compose up -d

# Rebuild after changes
docker compose up -d --build
```

### Database
```bash
# View container logs
docker compose logs mysql

# Connect to MySQL
docker compose exec mysql mysql -u root -p
```

### Git
```bash
# Commit after each completed task
git add -A && git commit -m "description"

# Push to remote
git push
```

## Important Notes

- JWT tokens expire after 60 minutes (configurable)
- Game engines communicate via WebSockets
- Scores are stored through the API, not directly from engines
- The platform is designed to be extensible - new games can be added as separate services
