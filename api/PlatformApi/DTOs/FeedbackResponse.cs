using PlatformApi.Models;

namespace PlatformApi.DTOs;

public class FeedbackResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public FeedbackType Type { get; set; }
    public FeedbackStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
