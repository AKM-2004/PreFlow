@echo off
setlocal EnableDelayedExpansion

REM ===== Variables =====
set STACK_NAME=my_stack
set COMPOSE_FILE=docker-compose.yml
set NETWORK_NAME=my_stack_preflow-network

REM ===== Debug Information =====
echo [DEBUG] Current Docker networks:
docker network ls
echo.

REM ===== Step 1: Remove existing stack =====
echo [1/6] Checking for existing stack...
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
            echo Waiting for stack removal... !counter!/6
            timeout /t 5 >nul
            set /a counter+=1
            goto retry_stack_removal
        )
        echo WARNING: Stack removal is taking longer than expected. Continuing anyway.
    ) else (
        echo Stack %STACK_NAME% successfully removed.
    )
) else (
    echo No existing stack named %STACK_NAME% found.
)
echo.

REM ===== Step 2: Clean up resources =====
echo [2/6] Cleaning up Docker resources...
echo Pruning containers...
docker container prune -f
echo Pruning networks...
docker network prune -f

REM Force remove any network with our target name
echo Attempting to remove network %NETWORK_NAME% if it exists...
docker network rm %NETWORK_NAME% 2>nul
echo.

REM ===== Step 3: Check swarm status =====
echo [3/6] Checking swarm status...
docker info --format "{{.Swarm.LocalNodeState}}" | findstr "active" >nul
if %errorlevel% equ 0 (
    echo Swarm is already active.
    echo Leaving existing swarm to start fresh...
    docker swarm leave --force
    timeout /t 5 >nul
) else (
    echo No active swarm found.
)
echo.

REM ===== Step 4: Initialize new swarm =====
echo [4/6] Initializing new swarm...
docker swarm init --advertise-addr 127.0.0.1
if %errorlevel% neq 0 (
    echo ERROR: Swarm initialization failed
    exit /b 1
)
echo.

REM ===== Step 5: Create network explicitly =====
echo [5/6] Creating overlay network explicitly...
echo Creating network %NETWORK_NAME% as overlay network...
docker network create --driver overlay --attachable %NETWORK_NAME%
if %errorlevel% neq 0 (
    echo ERROR: Failed to create network %NETWORK_NAME%
    echo Current networks:
    docker network ls
    exit /b 1
)
echo Network created successfully.
echo Current networks:
docker network ls
echo.

REM ===== Step 6: Deploy stack =====
echo [6/6] Deploying stack %STACK_NAME%...
echo Running: docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: Stack deployment failed!
    echo Current networks:
    docker network ls
    exit /b 1
)

REM ===== Final verification =====
echo Verifying services...
timeout /t 5 >nul
docker service ls | findstr /C:"%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: No services found after deployment
    exit /b 1
)

echo Stack deployed successfully!
echo Current Docker networks:
docker network ls

exit /b 0
