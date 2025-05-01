@echo off
setlocal EnableDelayedExpansion

REM Variables
set STACK_NAME=my_stack
set COMPOSE_FILE=docker-compose.yml
set NETWORK_NAME=preflow-network

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
echo Removing network %NETWORK_NAME% if exists...
docker network rm %NETWORK_NAME% 2>nul
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

REM Deployment
echo [4/5] Deploying stack %STACK_NAME%...
docker stack deploy -c %COMPOSE_FILE% %STACK_NAME%
if %errorlevel% neq 0 (
    echo ERROR: Stack deployment failed!
    exit /b 1
)

echo [5/5] Verifying services...
timeout /t 5 >nul
docker service ls | findstr /C:"%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: No services found after deployment
    exit /b 1
)

echo Deployment completed successfully!
exit /b 0
