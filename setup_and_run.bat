@echo off   
title Personal Staff Planner
echo -------------------------------------
echo PSP-Dienstplan: System check und start
echo -------------------------------------

::   Docker Status testen
echo Pruefe Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Desktop laeuft nicht... Starte Anwendung...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    goto :wait_docker
) else (
    echo Docker laeuft bereits.
    goto :check_certs
)

:wait_docker
echo Warte auf Docker Daemon (Check alle 5s)...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto :wait_docker
)
echo Docker ist nun bereit!

:check_certs
::  Existiert der certs ordner schon?
if not exist "certs" (
    echo erstelle Ordner fuer Zertifikate...
    mkdir certs
)

::  ..und ob Datei darin existiert
if exist "certs\cert.pem" (
    echo Zertifikate sind bereits vorhanden.
    goto :start_docker
)

::  OpenSSL an 3 Stellen suchen: System, Git-Standard, oder Git-x86
set "OSSL=openssl"
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files\Git\usr\bin\openssl.exe"
    ) else if exist "C:\Program Files (x86)\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files (x86)\Git\usr\bin\openssl.exe"
    ) else (
        echo FEHLER: openssl wurde nicht gefunden!
        echo Installiere bitte Git for Windows.
        pause
        exit /b
    )
)

echo Erstelle Zertifikate mit: %OSSL%
"%OSSL%" req -x509 -newkey rsa:4096 -keyout certs\key.pem -out certs\cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost"

if %errorlevel% neq 0 (
    echo FEHLER: OpenSSL fehlgeschlagen!
    pause
    exit /b
)
echo Zertifikate erfolgreich erstellt!

:start_docker
::  Docker ausfuehren
echo Starte Docker-container...
docker-compose up --build -d 

:: ...setTimeOut damit der Dienst verbindet wenn ALLE kontainer bereit sind
timeout /t 15 /nobreak >nul

echo -------------------------------------
echo System ist online!
echo Oeffne App unter https://localhost
echo -------------------------------------

:: Im Standard Browser mit URL-Input Tabs etc.
:: start https://localhost
:: App Modus Edge
start msedge --app=https://localhost

pause
