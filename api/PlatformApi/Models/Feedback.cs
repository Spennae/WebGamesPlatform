using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlatformApi.Models;

public enum FeedbackType
{
    Bug,
    Feedback
}

public enum FeedbackStatus
{
    Open,
    InProgress,
    Resolved,
    Closed
}

public class Feedback
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    public FeedbackType Type { get; set; }

    [Required]
    public FeedbackStatus Status { get; set; } = FeedbackStatus.Open;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
