@echo off
setlocal EnableDelayedExpansion

REM Variables
set STACK_NAME=my_stack
set COMPOSE_FILE=docker-compose.yml

REM Function to clean up existing stack and swarm
echo Cleaning up existing stack and swarm...

REM Check and remove existing stack
for /f "delims=" %%i in ('docker stack ls ^| findstr /C:"%STACK_NAME%"') do (
    echo Removing existing stack...
    docker stack rm %STACK_NAME%
    timeout /t 10 >nul
)

REM Check if in swarm mode
for /f "delims=" %%i in ('docker info ^| findstr /C:"Swarm: active"') do (
    echo Leaving existing swarm...
    docker swarm leave --force
    timeout /t 5 >nul
)

REM Main deployment process
echo Starting deployment process...

REM Check if Swarm is initialized, and if not, initialize it
for /f "delims=" %%i in ('docker info ^| findstr /C:"Swarm: inactive"') do (
    echo Initializing new swarm...
    docker swarm init
    timeout /t 5 >nul
)

REM Deploy stack
echo Deploying stack "%STACK_NAME%"...
docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: Stack deployment failed!
    exit /b %errorlevel%
)

echo Deployment completed successfully!
