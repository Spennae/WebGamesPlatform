using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlatformApi.Data;
using PlatformApi.DTOs;
using PlatformApi.Models;

namespace PlatformApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScoresController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ScoreResponse>> SubmitScore([FromBody] ScoreRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token" });

        var game = await _context.Games.FirstOrDefaultAsync(g => g.Slug == request.GameSlug);

        if (game == null)
            return NotFound(new { message = "Game not found" });

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound(new { message = "User not found" });

        var score = new Score
        {
            UserId = userId,
            GameId = game.Id,
            Value = request.Value,
            RecordedAt = DateTime.UtcNow
        };

        _context.Scores.Add(score);
        await _context.SaveChangesAsync();

        return Ok(new ScoreResponse
        {
            Id = score.Id,
            UserId = userId,
            Username = user.Username,
            Value = score.Value,
            RecordedAt = score.RecordedAt
        });
    }

    [HttpGet("{gameSlug}")]
    public async Task<ActionResult<IEnumerable<ScoreResponse>>> GetScores(string gameSlug, [FromQuery] int limit = 10)
    {
        var game = await _context.Games.FirstOrDefaultAsync(g => g.Slug == gameSlug);

        if (game == null)
            return NotFound(new { message = "Game not found" });

        var scores = await _context.Scores
            .Where(s => s.GameId == game.Id)
            .Include(s => s.User)
            .OrderByDescending(s => s.Value)
            .Take(limit)
            .Select(s => new ScoreResponse
            {
                Id = s.Id,
                UserId = s.UserId,
                Username = s.User.Username,
                Value = s.Value,
                RecordedAt = s.RecordedAt
            })
            .ToListAsync();

        return Ok(scores);
    }
}
