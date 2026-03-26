# WebGamesPlatform

A modular web-based gaming platform that supports multiple games.

## Tech Stack

- **Backend API:** .NET 8 (C#)
- **Frontend:** React + TypeScript
- **Game Engine:** Go with WebSockets
- **Database:** MySQL 8.0
- **Infrastructure:** Docker + Docker Compose

## Project Structure

```
WebGamesPlatform/
├── api/PlatformApi/    # .NET Web API (auth, users, scores)
├── frontend/           # React application
├── engines/            # Game-specific services
├── db/                 # Database scripts
└── docker/             # Docker configurations
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- .NET 8 SDK (for local development)

### Run with Docker

```bash
docker compose up -d
```

The API will be available at `http://localhost:5000`

### Local Development

```bash
# Start MySQL and API in Docker
docker compose up -d

# Or run API locally
cd api/PlatformApi
dotnet run
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check | No |
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/games | List games | No |
| POST | /api/scores | Submit score | Yes |
| GET | /api/scores/{gameSlug} | Get leaderboard | No |

## Environment Variables

Create a `.env` file:

```env
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=webgames
```

## Games

### TypeRacer
Test your typing speed! Race against the clock and climb the leaderboard.

(Coming soon: multiplayer mode)
