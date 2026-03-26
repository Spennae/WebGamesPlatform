using System.ComponentModel.DataAnnotations;

namespace PlatformApi.DTOs;

public class ScoreRequest
{
    [Required]
    public string GameSlug { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue)]
    public double Value { get; set; }
}
