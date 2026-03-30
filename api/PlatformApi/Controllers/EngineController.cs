using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;

namespace PlatformApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EngineController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EngineController> _logger;

    public EngineController(IConfiguration configuration, ILogger<EngineController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("typeracer")]
    public async Task ProxyTyperacer()
    {
        var engineUrl = _configuration["EngineUrl:Typeracer"];
        if (string.IsNullOrEmpty(engineUrl))
        {
            engineUrl = "http://typeracer:8081";
        }

        var engineWsUrl = engineUrl.Replace("http://", "ws://").Replace("https://", "wss://") + "/ws";

        _logger.LogInformation("Proxying WebSocket connection to {Url}", engineWsUrl);

        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            HttpContext.Response.StatusCode = 400;
            await HttpContext.Response.WriteAsync("WebSocket upgrade required");
            return;
        }

        using var serverWs = await HttpContext.WebSockets.AcceptWebSocketAsync();
        _logger.LogInformation("Accepted browser WebSocket");

        using var clientWs = new ClientWebSocket();
        try
        {
            await clientWs.ConnectAsync(new Uri(engineWsUrl), CancellationToken.None);
            _logger.LogInformation("Connected to engine");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to engine at {Url}", engineWsUrl);
            await serverWs.CloseAsync(WebSocketCloseStatus.InternalServerError, "Engine unavailable", CancellationToken.None);
            return;
        }

        var clientToServer = ForwardMessages(serverWs, clientWs, "Client");
        var serverToClient = ForwardMessages(clientWs, serverWs, "Engine");

        await Task.WhenAll(clientToServer, serverToClient);
    }

    private async Task ForwardMessages(WebSocket source, WebSocket destination, string direction)
    {
        var buffer = new byte[4096];

        try
        {
            while (destination.State == WebSocketState.Open && source.State == WebSocketState.Open)
            {
                var result = await source.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await destination.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None);
                    break;
                }

                if (result.MessageType == WebSocketMessageType.Text || result.MessageType == WebSocketMessageType.Binary)
                {
                    await destination.SendAsync(
                        new ArraySegment<byte>(buffer, 0, result.Count),
                        result.MessageType,
                        result.EndOfMessage,
                        CancellationToken.None);
                }
            }
        }
        catch (WebSocketException)
        {
            // Connection closed
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error forwarding messages from {Direction}", direction);
        }
        finally
        {
            if (destination.State == WebSocketState.Open)
            {
                try
                {
                    await destination.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None);
                }
                catch { }
            }
        }
    }
}
