# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["PlatformApi.csproj", "./"]
RUN dotnet restore "PlatformApi.csproj"

COPY . .
RUN dotnet build "PlatformApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "PlatformApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "PlatformApi.dll"]
