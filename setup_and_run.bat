@echo off   
echo -------------------------------------
echo PSP-Dienstplan: System check und start
echo -------------------------------------

:: NEU: Ladefenster starten mit timeout
start /b powershell  -ExecutionPolicy Bypass -File "%~dp0gui.ps1"
timeout /t 2 /nobreak >nul

:: Docker Check & Start
docker info >nul 2>&1
if %errorlevel% neq 0 (
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto :wait_docker
)

:: Zertifikate & Container Start
if not exist "certs" mkdir certs
if exist "certs\cert.pem" if exist "certs\key.pem" goto :start_docker

:: OpenSSL Suche
set "OSSL=openssl"
where openssl >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files\Git\usr\bin\openssl.exe"
    ) else if exist "C:\Program Files (x86)\Git\usr\bin\openssl.exe" (
        set "OSSL=C:\Program Files (x86)\Git\usr\bin\openssl.exe"
    ) else (
        :: Abbruchbedingung: Falls OpenSSL fehlt
        powershell -Command "Stop-Process -Name 'powershell' -Force" >nul 2>&1
        msg * "FEHLER: OpenSSL wurde nicht gefunden! Bitte Git for Windows installieren."
        exit /b
    )
)

"%OSSL%" req -x509 -newkey rsa:4096 -keyout certs\key.pem -out certs\cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost" >nul 2>&1


:: Docker Container starten
:start_docker
docker compose up -d

:: NEU: curl ist schneller als ps (standard bei 10/11) NEU : Wartet bis Nginx wirklich antwortet!!!!! -_-
:loop
curl -k -s -o /dev/null -w "%%{http_code}" https://localhost | findstr "200" >nul 2>&1
if %errorlevel% neq 0 (
    :: Wenn nicht 200 (z.B. 502), dann warten und nochmal
    timeout /t 2 /nobreak >nul
    goto :loop
)

::  Ladefenster schließen und App öffnen
powershell -Command "Stop-Process -Name 'powershell' -Force" >nul 2>&1
:: NEU: Browser suche über Pfad (Nutzt nur vorhandenen)

:: Edge
set "EDGE_PATH="
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "EDGE_PATH=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if defined EDGE_PATH (
    start "" "%EDGE_PATH%" --app=https://localhost
    exit
)

:: Chrome
set "CHROME_PATH="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if defined CHROME_PATH (
    start "" "%CHROME_PATH%" --app=https://localhost
    exit
)

:: Mozilla (hat keine app Ansicht -> Kiosk alt +f4 um es zu beenden)
:: und Mozilla müssen die Pfade angegeben werden
:: häufigste Standard-Pfade sind....
set "FF_PATH="
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" set "FF_PATH=C:\Program Files\Mozilla Firefox\firefox.exe"
if exist "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" set "FF_PATH=C:\Program Files (x86)\Mozilla Firefox\firefox.exe"

if defined FF_PATH (
    start "" "%FF_PATH%" --new-window https://localhost
    exit
)

:: Fallback, wenn kein Browser gefunden wird. Standardbrowser (Setting)
start https://localhost
exit
