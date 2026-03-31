using Microsoft.EntityFrameworkCore;
using PlatformApi.Models;

namespace PlatformApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Score> Scores { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
        });

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasOne(s => s.User)
                .WithMany(u => u.Scores)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Game)
                .WithMany(g => g.Scores)
                .HasForeignKey(s => s.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.GameId, e.Value });
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasOne(f => f.User)
                .WithMany(u => u.Feedbacks)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CreatedAt);
        });

        modelBuilder.Entity<Game>().HasData(
            new Game { Id = 1, Name = "TypeRacer", Slug = "typeracer", Description = "Test your typing speed!" }
        );
    }
}
