using System.ComponentModel.DataAnnotations;

namespace PlatformApi.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsAdmin { get; set; } = false;

    public ICollection<Score> Scores { get; set; } = new List<Score>();

    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}
