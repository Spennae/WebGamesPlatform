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
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _context;

    public FeedbackController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<FeedbackResponse>> SubmitFeedback([FromBody] SubmitFeedbackRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token" });

        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound(new { message = "User not found" });

        var feedback = new Feedback
        {
            UserId = userId,
            Type = request.Type,
            Title = request.Title,
            Description = request.Description,
            Status = FeedbackStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return Ok(new FeedbackResponse
        {
            Id = feedback.Id,
            UserId = userId,
            Username = user.Username,
            Type = feedback.Type,
            Status = feedback.Status,
            Title = feedback.Title,
            Description = feedback.Description,
            CreatedAt = feedback.CreatedAt
        });
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<FeedbackResponse>>> GetAllFeedback()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token" });

        var currentUser = await _context.Users.FindAsync(userId);

        if (currentUser == null || !currentUser.IsAdmin)
            return Forbid();

        var feedbacks = await _context.Feedbacks
            .Include(f => f.User)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FeedbackResponse
            {
                Id = f.Id,
                UserId = f.UserId,
                Username = f.User.Username,
                Type = f.Type,
                Status = f.Status,
                Title = f.Title,
                Description = f.Description,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(feedbacks);
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<ActionResult<FeedbackResponse>> UpdateFeedbackStatus(int id, [FromBody] UpdateFeedbackStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token" });

        var currentUser = await _context.Users.FindAsync(userId);

        if (currentUser == null || !currentUser.IsAdmin)
            return Forbid();

        var feedback = await _context.Feedbacks
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (feedback == null)
            return NotFound(new { message = "Feedback not found" });

        feedback.Status = request.Status;
        await _context.SaveChangesAsync();

        return Ok(new FeedbackResponse
        {
            Id = feedback.Id,
            UserId = feedback.UserId,
            Username = feedback.User.Username,
            Type = feedback.Type,
            Status = feedback.Status,
            Title = feedback.Title,
            Description = feedback.Description,
            CreatedAt = feedback.CreatedAt
        });
    }
}
