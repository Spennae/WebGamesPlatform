using System.ComponentModel.DataAnnotations;
using PlatformApi.Models;

namespace PlatformApi.DTOs;

public class SubmitFeedbackRequest
{
    [Required]
    public FeedbackType Type { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
}
