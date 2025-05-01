@echo off
setlocal EnableDelayedExpansion
REM Variables
set STACK_NAME=my_stack
set COMPOSE_FILE=docker-compose.yml
set NETWORK_NAME=preflow-network
set PREFIXED_NETWORK=%NETWORK_NAME%

REM Cleanup existing stack and swarm
echo [1/5] Cleaning up existing stack and networks...
REM Remove stack with retry logic
echo Checking for existing stack...
docker stack ls | findstr /C:"%STACK_NAME%" >nul
if %errorlevel% equ 0 (
    echo Removing stack %STACK_NAME%...
    docker stack rm %STACK_NAME%
    
    REM Wait for stack removal (max 30 seconds)
    set "counter=0"
    :retry_stack_removal
    docker stack ls | findstr /C:"%STACK_NAME%" >nul
    if %errorlevel% equ 0 (
        if !counter! lss 6 (
            timeout /t 5 >nul
            set /a counter+=1
            goto retry_stack_removal
        )
        echo ERROR: Failed to remove stack after 30 seconds
        exit /b 1
    )
)

REM Cleanup networks
echo Removing network %PREFIXED_NETWORK% if exists...
docker network rm %PREFIXED_NETWORK% 2>nul
REM Check if network still exists (might be in use)
docker network ls | findstr /C:"%PREFIXED_NETWORK%" >nul
if %errorlevel% equ 0 (
    echo WARNING: Network %PREFIXED_NETWORK% still exists and may be in use.
    echo Will attempt to prune unused networks...
)
echo Pruning unused networks...
docker network prune -f

REM Swarm management
echo [2/5] Managing swarm state...
REM Check and leave swarm if active
docker info --format "{{.Swarm.LocalNodeState}}" | findstr "active" >nul
if %errorlevel% equ 0 (
    echo Leaving existing swarm...
    docker swarm leave --force
    timeout /t 5 >nul
)

echo [3/5] Initializing new swarm...
docker swarm init --advertise-addr 127.0.0.1
if %errorlevel% neq 0 (
    echo ERROR: Swarm initialization failed
    exit /b 1
)

REM Create required network before deployment
echo [4/5] Creating required network...
REM Skip manual network creation - let Docker Swarm handle it
REM Docker will create the network during stack deployment

REM Deployment
echo [5/5] Deploying stack %STACK_NAME%...
docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: Stack deployment failed!
    exit /b 1
)

echo [6/6] Verifying services...
timeout /t 5 >nul
docker service ls | findstr /C:"%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: No services found after deployment
    exit /b 1
)

echo Deployment completed successfully!
exit /b 0
