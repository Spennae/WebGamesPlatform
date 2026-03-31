using System.ComponentModel.DataAnnotations;
using PlatformApi.Models;

namespace PlatformApi.DTOs;

public class UpdateFeedbackStatusRequest
{
    [Required]
    public FeedbackStatus Status { get; set; }
}
