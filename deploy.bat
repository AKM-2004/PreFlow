@echo off
setlocal EnableDelayedExpansion

REM ===== Variables =====
set STACK_NAME=my_stack
set COMPOSE_FILE=docker-compose.yml
set NETWORK_NAME=preflow-network
set PREFIXED_NETWORK=%NETWORK_NAME%

REM ===== Debug Information =====
echo [DEBUG] Current Docker networks:
docker network ls
echo.

REM ===== Step 1: Remove existing stack =====
echo [1/7] Checking for existing stack...
docker stack ls | findstr /C:"%STACK_NAME%" >nul
if %errorlevel% equ 0 (
    echo Removing stack %STACK_NAME%...
    docker stack rm %STACK_NAME%
    
    REM Wait for stack removal (max 60 seconds)
    set "counter=0"
    :retry_stack_removal
    docker stack ls | findstr /C:"%STACK_NAME%" >nul
    if %errorlevel% equ 0 (
        if !counter! lss 12 (
            echo Waiting for stack removal... !counter!/12
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

REM ===== Step 2: Force clean Docker networks =====
echo [2/7] Cleaning up networks...
echo Attempting to remove network %PREFIXED_NETWORK%...
docker network rm %PREFIXED_NETWORK% 2>nul

REM Wait for network removal to complete
set "counter=0"
:check_network_gone
docker network ls | findstr /C:"%PREFIXED_NETWORK%" >nul
if %errorlevel% equ 0 (
    if !counter! lss 6 (
        echo Network still exists, waiting... !counter!/6
        timeout /t 5 >nul
        set /a counter+=1
        goto check_network_gone
    )
    echo WARNING: Network %PREFIXED_NETWORK% still exists after multiple removal attempts.
    echo This may indicate the network is still in use by containers.
    
    REM List containers using the network
    echo Checking for containers using this network:
    for /f "tokens=*" %%i in ('docker network inspect -f "{{range .Containers}}{{.Name}} {{end}}" %PREFIXED_NETWORK% 2^>nul') do (
        echo Found containers: %%i
        echo Attempting to stop related containers...
        for %%j in (%%i) do docker container rm -f %%j 2>nul
    )
    
    REM Try removal again
    echo Attempting forced network removal again...
    docker network rm %PREFIXED_NETWORK% 2>nul
)

REM ===== Step 3: Prune Docker resources =====
echo [3/7] Pruning Docker resources...
echo Pruning networks...
docker network prune -f
echo Pruning containers...
docker container prune -f

REM ===== Step 4: Check Docker Swarm status =====
echo [4/7] Checking swarm status...
docker info --format "{{.Swarm.LocalNodeState}}" | findstr "active" >nul
if %errorlevel% equ 0 (
    echo Swarm is already active.
    echo Leaving existing swarm to start fresh...
    docker swarm leave --force
    timeout /t 5 >nul
)

REM ===== Step 5: Initialize new swarm =====
echo [5/7] Initializing new swarm...
docker swarm init --advertise-addr 127.0.0.1
if %errorlevel% neq 0 (
    echo ERROR: Swarm initialization failed
    exit /b 1
)

REM ===== Step 6: Create network explicitly =====
echo [6/7] Creating overlay network explicitly...
echo Creating network %NETWORK_NAME% as overlay network...
docker network create --driver overlay --attachable %NETWORK_NAME%
if %errorlevel% neq 0 (
    echo WARNING: Network creation returned non-zero exit code.
    echo Current networks:
    docker network ls
)

REM ===== Step 7: Deploy stack =====
echo [7/7] Deploying stack %STACK_NAME%...
echo Running: docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
docker stack deploy -c "%COMPOSE_FILE%" "%STACK_NAME%"
if %errorlevel% neq 0 (
    echo ERROR: Stack deployment failed!
    echo Checking networks again:
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
