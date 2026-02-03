Write-Host "Starting Docker Compose..."
cd C:\Users\Artem\IdeaProjects\web-library
docker-compose up -d
Write-Host "Opening browser..."
Start-Process "http://localhost:3000"