using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformApi.Data;
using PlatformApi.DTOs;

namespace PlatformApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _context;

    public GamesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameResponse>>> GetGames()
    {
        var games = await _context.Games
            .Select(g => new GameResponse
            {
                Id = g.Id,
                Name = g.Name,
                Slug = g.Slug,
                Description = g.Description,
                CreatedAt = g.CreatedAt
            })
            .ToListAsync();

        return Ok(games);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<GameResponse>> GetGame(string slug)
    {
        var game = await _context.Games
            .Where(g => g.Slug == slug)
            .Select(g => new GameResponse
            {
                Id = g.Id,
                Name = g.Name,
                Slug = g.Slug,
                Description = g.Description,
                CreatedAt = g.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (game == null)
            return NotFound(new { message = "Game not found" });

        return Ok(game);
    }
}
